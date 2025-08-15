import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicUrl: user.profilePicUrl,
    profilePicPublicId: user.profilePicPublicId,
    createdAt: user.createdAt,
  });
}


