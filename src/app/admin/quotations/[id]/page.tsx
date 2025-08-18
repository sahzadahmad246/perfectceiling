import { Suspense } from "react"
import { connectToDatabase } from "@/lib/db"
import { Quotation, type IQuotation } from "@/models/Quotation"
import QuotationDetails from "@/components/quotations/QuotationDetails"

function QuotationDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl overflow-hidden animate-pulse">
          <div className="bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-xl border-b border-white/40 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="h-10 bg-white/40 rounded-2xl w-96 mb-4"></div>
                <div className="h-6 bg-white/40 rounded-2xl w-32"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-12 bg-white/40 rounded-2xl w-32"></div>
                <div className="h-12 bg-white/40 rounded-2xl w-24"></div>
                <div className="h-12 bg-white/40 rounded-2xl w-28"></div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-6">
                <div className="h-8 bg-white/40 rounded-2xl w-48 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-white/40 rounded-2xl w-full"></div>
                  <div className="h-6 bg-white/40 rounded-2xl w-3/4"></div>
                  <div className="h-6 bg-white/40 rounded-2xl w-5/6"></div>
                </div>
              </div>
              <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-6">
                <div className="h-8 bg-white/40 rounded-2xl w-48 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-white/40 rounded-2xl w-full"></div>
                  <div className="h-6 bg-white/40 rounded-2xl w-3/4"></div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8">
              <div className="h-8 bg-white/40 rounded-2xl w-32 mb-6"></div>
              <div className="space-y-4">
                <div className="h-6 bg-white/40 rounded-2xl w-full"></div>
                <div className="h-6 bg-white/40 rounded-2xl w-3/4"></div>
                <div className="h-6 bg-white/40 rounded-2xl w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

async function getQuotation(id: string) {
  try {
    await connectToDatabase()
    const quotation = await Quotation.findById(id).lean<IQuotation>()
    if (!quotation) {
      return null
    }
    return {
      id: quotation._id.toString(),
      clientInfo: quotation.clientInfo,
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
      rejectionReason: quotation.rejectionReason ?? "",
      customerNote: quotation.customerNote ?? "",
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Error fetching quotation:", error)
    return null
  }
}

export default async function QuotationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const quotation = await getQuotation(id)

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 container mx-auto py-8 px-4">
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Quotation Not Found</h1>
            <p className="text-slate-600 font-medium">The requested quotation could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <Suspense fallback={<QuotationDetailsSkeleton />}>
          <QuotationDetails quotation={quotation} />
        </Suspense>
      </div>
    </div>
  )
}

export const metadata = {
  title: "Quotation Details | Your App Name",
  description: "View details of a specific quotation",
}