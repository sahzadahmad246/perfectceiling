import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.businessProfile.findFirst();
  return Response.json({ settings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const updated = await prisma.businessProfile.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, businessName: data.businessName || "Perfect Ceiling", ...data },
  });
  return Response.json({ settings: updated });
}


