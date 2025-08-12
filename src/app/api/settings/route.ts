import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.businessProfile.findFirst();
  return Response.json({ settings });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = (await req.json()) as Partial<{
    businessName: string;
    address: string | null;
    primaryPhone: string | null;
    secondaryPhone: string | null;
    ownerName: string | null;
    managerName: string | null;
    about: string | null;
    logoUrl: string | null;
    openingTime: string | null;
    closingTime: string | null;
  }>;
  const updated = await prisma.businessProfile.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, businessName: data.businessName || "Perfect Ceiling", ...data },
  });
  return Response.json({ settings: updated });
}


