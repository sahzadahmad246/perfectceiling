// app/admin/quotations/[id]/edit/page.tsx
import { Suspense } from "react";
import { connectToDatabase } from "@/lib/db";
import { Quotation, IQuotation } from "@/models/Quotation";
import QuotationForm from "@/components/quotations/QuotationForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

// Loading component
function QuotationEditSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="flex justify-end gap-4">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side data fetching
async function getQuotation(id: string) {
  try {
    await connectToDatabase();
    const quotation = await Quotation.findById(id).lean<IQuotation>();
    if (!quotation) {
      return null;
    }
    return {
      id: quotation._id.toString(),
      clientInfo: {
        name: quotation.clientInfo.name,
        phone: quotation.clientInfo.phone,
        address: quotation.clientInfo.address,
      },
      workDetails: {
        items: quotation.workDetails.items.map((item) => ({
          description: item.description,
          area: item.area ?? 0,
          unit: item.unit ?? "sqft",
          rate: item.rate ?? 0,
          total: item.total,
        })),
        total: quotation.workDetails.total ?? 0,
        discount: quotation.workDetails.discount ?? 0,
        grandTotal: quotation.workDetails.grandTotal ?? 0,
        notes: quotation.workDetails.notes ?? "",
      },
      status: quotation.status,
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return null;
  }
}

// Main page component
export default async function QuotationEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    redirect("/api/auth/signin"); // Redirect to sign-in if not admin
  }

  const { id } = await params;
  const quotation = await getQuotation(id);

  if (!quotation) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg border p-6">
          <h1 className="text-2xl font-bold text-red-600">Quotation Not Found</h1>
          <p className="text-gray-600">The requested quotation could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <Suspense fallback={<QuotationEditSkeleton />}>
          <QuotationForm initialData={quotation} />
        </Suspense>
      </div>
    </div>
  );
}

// Optional: Add metadata
export const metadata = {
  title: "Edit Quotation | Your App Name",
  description: "Edit an existing quotation",
};