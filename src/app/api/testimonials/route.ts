import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ testimonials });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as NextAuthOptions);
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const data = (await req.json()) as { authorName: string; content: string; rating?: number; enabled?: boolean };
  const created = await prisma.testimonial.create({ data });
  return Response.json({ testimonial: created });
}


