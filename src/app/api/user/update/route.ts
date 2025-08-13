import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { uploadImageBuffer } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // handled via file APIs; run on Node runtime
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();

  const formData = await req.formData();
  const name = formData.get("name") as string | null;
  const file = formData.get("file") as File | null;

  const update: any = {};
  if (name !== null && name !== undefined) update.name = name;

  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadImageBuffer(buffer);
    update.profilePicUrl = uploaded.secureUrl;
    update.profilePicPublicId = uploaded.publicId;
  }

  const user = await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: update },
    { new: true }
  ).lean();

  return NextResponse.json({
    id: user?._id.toString(),
    name: user?.name,
    email: user?.email,
    role: user?.role,
    profilePicUrl: user?.profilePicUrl,
    profilePicPublicId: user?.profilePicPublicId,
  });
}


