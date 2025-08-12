import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = (await req.json()) as {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    enabled?: boolean;
    orderIndex?: number | null;
  };
  const { id } = await context.params;
  const updated = await prisma.service.update({ where: { id }, data });
  return Response.json({ service: updated });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  await prisma.service.delete({ where: { id } });
  return Response.json({ ok: true });
}


