// app/quotations/page.tsx
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import { QuotationListItem } from "@/types/quotation";
import QuotationList from "@/components/quotations/QuotationList";

// Loading component
function QuotationListSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 bg-gray-200 rounded flex-1 max-w-sm animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-full sm:w-48 animate-pulse"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Server-side data fetching
async function getQuotations(): Promise<QuotationListItem[]> {
  try {
    await connectToDatabase();
    const quotations = await Quotation.find({})
      .sort({ createdAt: -1 })
      .lean<IQuotation[]>();

    // Transform to match the API response format with proper type handling
    return quotations.map((q) => ({
      id: q._id.toString(),
      clientInfo: q.clientInfo,
      workDetails: {
        ...q.workDetails,
        items: q.workDetails.items.map(item => ({
          description: item.description,
          area: item.area ?? 0,           // Handle undefined with default
          unit: item.unit ?? "sqft",      // Handle undefined with default
          rate: item.rate ?? 0,           // Handle undefined with default
          total: item.total,
        })),
        notes: q.workDetails.notes ?? "", // Handle undefined with default
      },
      status: q.status,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching quotations:", error);
    // Return empty array on error, let the client component handle the error state
    return [];
  }
}

// Main page component
export default async function QuotationsPage() {
  // Fetch initial data on the server
  const initialQuotations = await getQuotations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Suspense fallback={<QuotationListSkeleton />}>
          <QuotationList initialData={initialQuotations} />
        </Suspense>
      </div>
    </div>
  );
}

// Optional: Add metadata
export const metadata = {
  title: "Quotations | Your App Name",
  description: "Manage and view all quotations",
};