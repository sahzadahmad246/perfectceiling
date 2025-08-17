// app/api/business/route.ts
import {  NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { BusinessSettings } from "@/models/BusinessSettings";

// GET /api/business - Get business information
export async function GET( ) {
  try {
    await connectToDatabase();
    
    const businessInfo = await BusinessSettings.findOne({}).lean();
    
    if (!businessInfo) {
      // Return default business info if none exists
      return NextResponse.json({
        name: "Perfect Ceiling",
        phone: "+91 9876543210",
        email: "info@perfectceiling.com",
        address: "123 Business Street, City, State 12345",
        website: "www.perfectceiling.com",
        gst: "GST123456789",
        termsAndConditions: [
          "Payment terms: 50% advance, 50% on completion",
          "Material warranty: 1 year from date of installation",
          "Labor warranty: 6 months from date of completion",
          "Prices are valid for 30 days from quotation date",
          "Any changes to the scope of work will be charged extra",
          "Client to provide necessary permissions and clearances"
        ]
      });
    }
    
    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error('Error fetching business info:', error);
    return NextResponse.json({
      error: "Failed to fetch business information"
    }, { status: 500 });
  }
}