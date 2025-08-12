import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = (await req.json()) as Partial<{ authorName: string; content: string; rating: number; enabled: boolean }>;
  const { id } = await context.params;
  const updated = await prisma.testimonial.update({ where: { id }, data });
  return Response.json({ testimonial: updated });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await prisma.testimonial.delete({ where: { id } });
  return Response.json({ ok: true });
}


