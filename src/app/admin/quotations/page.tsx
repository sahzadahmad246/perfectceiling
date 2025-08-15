// app/quotations/page.tsx
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import { QuotationListItem } from "@/types/quotation";
import QuotationList from "@/components/quotations/QuotationList";

// loading component with new styles
function QuotationListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* glowing circles background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* skeleton content */}
      <div className="relative z-10 container mx-auto py-8 px-4 space-y-8">
        {/* header skeleton */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="h-10 bg-white/40 rounded-2xl w-48 mb-2"></div>
              <div className="h-6 bg-white/40 rounded-2xl w-32"></div>
            </div>
            <div className="h-12 bg-white/40 rounded-2xl w-48"></div>
          </div>
        </div>

        {/* filters skeleton */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="h-12 bg-white/40 rounded-2xl flex-1 max-w-sm"></div>
            <div className="h-12 bg-white/40 rounded-2xl w-full sm:w-48"></div>
          </div>
        </div>

        {/* cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl p-6 animate-pulse"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="h-6 bg-white/40 rounded-2xl w-32 mb-2"></div>
                  <div className="h-4 bg-white/40 rounded-2xl w-24"></div>
                </div>
                <div className="h-6 bg-white/40 rounded-full w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-white/40 rounded-2xl w-full"></div>
                <div className="h-4 bg-white/40 rounded-2xl w-3/4"></div>
                <div className="h-4 bg-white/40 rounded-2xl w-1/2"></div>
                <div className="h-8 bg-white/40 rounded-2xl w-full"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-white/40 rounded-2xl flex-1"></div>
                  <div className="h-8 bg-white/40 rounded-2xl flex-1"></div>
                  <div className="h-8 bg-white/40 rounded-2xl w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// server-side data fetching
async function getQuotations(): Promise<QuotationListItem[]> {
  try {
    await connectToDatabase();
    const quotations = await Quotation.find({})
      .sort({ createdAt: -1 })
      .lean<IQuotation[]>();

    return quotations.map((q) => ({
      id: q._id.toString(),
      clientInfo: q.clientInfo,
      workDetails: {
        ...q.workDetails,
        items: q.workDetails.items.map((item) => ({
          description: item.description,
          area: item.area ?? 0,
          unit: item.unit ?? "sqft",
          rate: item.rate ?? 0,
          total: item.total,
        })),
        notes: q.workDetails.notes ?? "",
      },
      status: q.status,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("error fetching quotations:", error);
    return [];
  }
}

// main page component
export default async function QuotationsPage() {
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

// metadata
export const metadata = {
  title: "Quotations | Your App Name",
  description: "Manage and view all quotations",
};
