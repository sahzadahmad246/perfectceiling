"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { QuotationListItem } from "@/types/quotation"
import Link from "next/link"
import { Button } from "../ui/button"
import { Edit, Share, Download, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface QuotationDetailsProps {
  quotation: QuotationListItem
}

export default function QuotationDetails({ quotation }: QuotationDetailsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<"accepted" | "pending" | "rejected">(
    quotation.status as "accepted" | "pending" | "rejected",
  )

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "pending" | "rejected" }) => {
      const response = await fetch(`/api/quotations/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quotation for update")
      }
      const quotationData = await response.json()

      const updatedData = {
        ...quotationData,
        status,
      }

      const putResponse = await fetch(`/api/quotations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      if (!putResponse.ok) {
        const error = await putResponse.json()
        throw new Error(error.error || "Failed to update status")
      }
      return putResponse.json()
    },
    onSuccess: () => {
      toast.success("Status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["quotation", quotation.id] })
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      setDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status")
    },
  })

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quotation for ${quotation.clientInfo.name}`,
          text: `Quotation #${quotation.id.slice(-8)} - $${quotation.workDetails.grandTotal.toFixed(2)}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      const shareText = `Quotation for ${quotation.clientInfo.name}\nAmount: $${quotation.workDetails.grandTotal.toFixed(2)}\nView: ${window.location.href}`
      await navigator.clipboard.writeText(shareText)
      toast.success("Quotation details copied to clipboard!")
    }
  }

  const handleDownloadPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Quotation - ${quotation.clientInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quotation</h1>
            <p>For: ${quotation.clientInfo.name}</p>
            <p>Date: ${new Date(quotation.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h3>Client Information</h3>
            <p><strong>Name:</strong> ${quotation.clientInfo.name}</p>
            <p><strong>Phone:</strong> ${quotation.clientInfo.phone}</p>
            <p><strong>Address:</strong> ${quotation.clientInfo.address}</p>
          </div>
          
          <div class="section">
            <h3>Work Details</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Area</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${quotation.workDetails.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.area}</td>
                    <td>${item.unit}</td>
                    <td>$${item.rate.toFixed(2)}</td>
                    <td>$${item.total.toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <p><strong>Subtotal:</strong> $${quotation.workDetails.total.toFixed(2)}</p>
            <p><strong>Discount:</strong> $${quotation.workDetails.discount.toFixed(2)}</p>
            <p class="total"><strong>Grand Total:</strong> $${quotation.workDetails.grandTotal.toFixed(2)}</p>
          </div>
          
          ${
            quotation.workDetails.notes
              ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${quotation.workDetails.notes}</p>
            </div>
          `
              : ""
          }
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300"
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300"
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-xl border-b border-white/40 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                  Quotation for {quotation.clientInfo.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-medium">Status:</span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(quotation.status)}`}
                  >
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                    >
                      Update Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="backdrop-blur-xl bg-white/95 border-white/60 rounded-3xl shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-slate-800 font-bold">Update Quotation Status</DialogTitle>
                      <DialogDescription className="text-slate-600">
                        Change the status for the quotation of {quotation.clientInfo.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select
                        value={newStatus}
                        onValueChange={(value: "accepted" | "pending" | "rejected") => setNewStatus(value)}
                      >
                        <SelectTrigger className="bg-white/70 border-white/60 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-xl border-white/60 rounded-2xl shadow-2xl">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateStatusMutation.mutate({ id: quotation.id, status: newStatus })}
                        disabled={updateStatusMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/quotations/${quotation.id}/edit`)}
                  className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>

                <Link
                  href="/quotations"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quotations
                </Link>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Client Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/30">
                    <span className="text-slate-600 font-medium">Name:</span>
                    <span className="text-slate-800 font-semibold">{quotation.clientInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/30">
                    <span className="text-slate-600 font-medium">Phone:</span>
                    <span className="text-slate-800 font-semibold">{quotation.clientInfo.phone}</span>
                  </div>
                  <div className="flex items-start justify-between py-3">
                    <span className="text-slate-600 font-medium">Address:</span>
                    <span className="text-slate-800 font-semibold text-right max-w-xs">
                      {quotation.clientInfo.address}
                    </span>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Quotation Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/30">
                    <span className="text-slate-600 font-medium">Created:</span>
                    <span className="text-slate-800 font-semibold">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-slate-600 font-medium">Updated:</span>
                    <span className="text-slate-800 font-semibold">
                      {new Date(quotation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Work Details</h2>
              <div className="overflow-hidden rounded-2xl border border-white/50">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 backdrop-blur-xl">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Area
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/30 backdrop-blur-xl divide-y divide-white/40">
                      {quotation.workDetails.items.map((item, index) => (
                        <tr key={index} className="hover:bg-white/40 transition-colors duration-200">
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.description}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.area}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.unit}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-semibold">${item.rate.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-semibold">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-8 backdrop-blur-xl bg-gradient-to-r from-white/50 to-white/30 border border-white/50 rounded-3xl p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-white/40 rounded-2xl border border-white/50">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Subtotal</p>
                    <p className="text-2xl font-bold text-slate-800">${quotation.workDetails.total.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-white/40 rounded-2xl border border-white/50">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Discount</p>
                    <p className="text-2xl font-bold text-slate-800">${quotation.workDetails.discount.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 rounded-2xl border border-blue-200/50">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Grand Total</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ${quotation.workDetails.grandTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {quotation.workDetails.notes && (
                <div className="mt-6 backdrop-blur-xl bg-white/40 border border-white/50 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Notes</h3>
                  <p className="text-slate-700 font-medium leading-relaxed">{quotation.workDetails.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
