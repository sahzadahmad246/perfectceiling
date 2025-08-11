import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const terms = await prisma.term.findMany({ orderBy: { orderIndex: "asc" } });
  return Response.json({ terms });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const created = await prisma.term.create({ data });
  return Response.json({ term: created });
}


