// app/api/test/migrate/route.ts
import {  NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";

// GET /api/test/migrate - Run sharing field migration (for testing)
export async function GET() {
  try {
    await connectToDatabase();
    
    // Update all quotations that don't have the sharing field
    const result = await Quotation.updateMany(
      { sharing: { $exists: false } },
      {
        $set: {
          sharing: {
            isShared: false,
            shareToken: null,
            sharedAt: null,
            sharedBy: null,
            accessCount: 0,
            lastAccessedAt: null,
          }
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: Updated ${result.modifiedCount} quotations with sharing field`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      error: "Migration failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}