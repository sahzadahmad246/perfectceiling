import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { orderIndex: "asc" } });
  return Response.json({ services });
}

export async function POST(req: Request) {
  const session = await (await import("next-auth")).getServerSession((await import("@/lib/auth")).authOptions as any);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const created = await prisma.service.create({ data });
  return Response.json({ service: created });
}


