import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Types } from "mongoose";

interface UpdateRolePayload {
  userId: string;
  role: "user" | "admin";
}

// Allow promoting/demoting role; require current session to be admin
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  await connectToDatabase();
  const body = await req.json() as UpdateRolePayload;
  const { userId, role } = body;
  
  if (!userId || !role) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  
  const user = await User.findByIdAndUpdate(
    userId, 
    { $set: { role } }, 
    { new: true }
  ).lean();
  
  return NextResponse.json({ 
    id: user ? (user._id as Types.ObjectId).toString() : null, 
    role: user?.role 
  });
}