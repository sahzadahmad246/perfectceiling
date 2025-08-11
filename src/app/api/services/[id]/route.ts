import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const updated = await prisma.service.update({ where: { id: params.id }, data });
  return Response.json({ service: updated });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.service.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}


