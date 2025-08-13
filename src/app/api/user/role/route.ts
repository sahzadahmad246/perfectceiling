import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

// Allow promoting/demoting role; require current session to be admin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session as any)?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await connectToDatabase();
  const body = await req.json();
  const { userId, role } = body as { userId: string; role: "user" | "admin" };
  if (!userId || !role) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const user = await User.findByIdAndUpdate(userId, { $set: { role } }, { new: true }).lean();
  return NextResponse.json({ id: user?._id.toString(), role: user?.role });
}


