// app/api/business/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { connectToDatabase } from "@/lib/db";
import { BusinessSettings } from "@/models/BusinessSettings";
import { BusinessSettingsSchema } from "@/lib/validators/business";

// GET /api/business - Get business information
export async function GET() {
  try {
    await connectToDatabase();

    const businessInfo = await BusinessSettings.findOne({}).lean();

    if (!businessInfo) {
      // Return default business info if none exists
      return NextResponse.json({
        name: "Perfect Ceiling",
        primaryPhone: "+91 9876543210",
        phone: "+91 9876543210", // Fallback for legacy
        email: "info@perfectceiling.com",
        address: "123 Business Street, City, State 12345",
        status: "open",
        terms: [
          "Payment terms: 50% advance, 50% on completion",
          "Material warranty: 1 year from date of installation",
          "Labor warranty: 6 months from date of completion",
          "Prices are valid for 30 days from quotation date",
          "Any changes to the scope of work will be charged extra",
          "Client to provide necessary permissions and clearances",
        ],
      });
    }

    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error("Error fetching business info:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch business information",
      },
      { status: 500 }
    );
  }
}

// PUT /api/business - Update business information
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    // Fetch existing settings to support partial updates
    const existingSettings = await BusinessSettings.findOne({}).lean() || {};
    
    // Merge existing data with updates
    // We convert Mongoose doc to object and merge
    const mergedData = {
      ...existingSettings,
      ...body,
      // Ensure we don't accidentally merge internal mongoose fields if they exist in body (unlikely but safe)
    };
    
    // Remove _id and __v from merge if they cause validation issues, though Zod .safeParse usually ignores unknown keys unless strict() is used.
    // Our schema is not strict(), so extra keys are fine, but for clean data we focus on schema fields.

    // Validate the MERGED result
    const parsed = BusinessSettingsSchema.safeParse(mergedData);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Update settings
    // We use findOneAndUpdate with upsert
    const settings = await BusinessSettings.findOneAndUpdate(
      {},
      {
        ...data,
        updatedByUserId: session.user.id,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error updating business info:", error);
    return NextResponse.json(
      { error: "Failed to update business information" },
      { status: 500 }
    );
  }
}