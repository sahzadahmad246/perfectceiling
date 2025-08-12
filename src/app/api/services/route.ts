import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { orderIndex: "asc" } });
  return Response.json({ services });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = (await req.json()) as {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    enabled?: boolean;
    orderIndex?: number | null;
  };
  const created = await prisma.service.create({ data });
  return Response.json({ service: created });
}


