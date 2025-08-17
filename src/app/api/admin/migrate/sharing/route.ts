// app/api/admin/migrate/sharing/route.ts
import {  NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { addSharingFieldMigration } from "@/lib/migrations/addSharingField";

// POST /api/admin/migrate/sharing - Run sharing field migration
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await addSharingFieldMigration();

    return NextResponse.json({
      success: true,
      message: "Sharing field migration completed successfully"
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: "Migration failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}