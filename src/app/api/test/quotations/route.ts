// app/api/test/quotations/route.ts
import {  NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/models/Quotation";

// GET /api/test/quotations - Check quotations structure
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get a sample quotation to check its structure
    const sampleQuotation = await Quotation.findOne({}).lean();
    
    if (!sampleQuotation) {
      return NextResponse.json({
        message: "No quotations found in database"
      });
    }
    
    return NextResponse.json({
      success: true,
      sampleQuotation: {
        id: sampleQuotation._id.toString(),
        hasSharing: !!sampleQuotation.sharing,
        sharing: sampleQuotation.sharing,
        clientInfo: sampleQuotation.clientInfo,
        status: sampleQuotation.status
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}