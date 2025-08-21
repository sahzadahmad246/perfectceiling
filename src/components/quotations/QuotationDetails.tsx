"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { QuotationListItem } from "@/types/quotation"
import Link from "next/link"
import { Button } from "../ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Edit,
  Share,
  Download,
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  MoreVertical,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,

} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useDownloadQuotationPdf } from "@/lib/quotations/pdf"

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
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: "accepted" | "pending" | "rejected"
    }) => {
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
          text: `Quotation #${quotation.id.slice(-8)} - ${formatCurrency(quotation.workDetails.grandTotal)}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      const shareText = `Quotation for ${quotation.clientInfo.name
        }\nAmount: ${formatCurrency(quotation.workDetails.grandTotal)}\nView: ${window.location.href}`
      await navigator.clipboard.writeText(shareText)
      toast.success("Quotation details copied to clipboard!")
    }
  }

  const { startDownload } = useDownloadQuotationPdf()
  const [downloading, setDownloading] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 px-3 py-1 font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1.5 px-3 py-1 font-medium">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1.5 px-3 py-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </Badge>
        )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/quotations"
                className="   h-10 w-10 p-0 transition-all duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Details
                </h1>
                <p className="text-sm text-slate-500">ID: #{quotation.id.slice(-8)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusBadge(quotation.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>

                  <MoreVertical className="h-4 w-4 mr-2" />


                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl"
                >
                  <DropdownMenuItem onClick={() => setDialogOpen(true)} className="rounded-lg">
                    <Edit className="h-4 w-4 mr-2" /> Update Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/quotations/${quotation.id}/edit`)}
                    className="rounded-lg"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => startDownload(quotation.id, undefined, setDownloading)}
                    className="rounded-lg"
                  >
                    <Download className="h-4 w-4 mr-2" /> {downloading ? "Downloading..." : "Download PDF"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="rounded-lg">
                    <Share className="h-4 w-4 mr-2" /> Share
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information & Work Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rejection Reason Alert */}
            {quotation.status === "rejected" && quotation.rejectionReason && (
              <Card className="border-0 shadow-lg bg-red-50 ">
                <CardContent className="flex flex-col gap-1">
                  <div className="text-red-800 flex items-center gap-2 font-semibold">
                    <XCircle className="h-5 w-5" />
                    Rejection Reason
                  </div>
                  <span className="text-red-700 font-medium pl-7">{quotation.rejectionReason}</span>
                </CardContent>
              </Card>


            )}

            {/* Client Information */}
            <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm p-0 ">
              <CardHeader className=" m-0 p-0">
                <CardTitle className=" rounded-t-xl text-slate-900 flex items-center bg-gradient-to-r from-slate-100 to-blue-50 p-4">
                  <User className="h-5 w-5 text-slate-600" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Client Name</p>
                        <p className="font-bold text-slate-900 text-lg">{quotation.clientInfo.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Phone</p>
                        <p className="font-bold text-slate-900 text-lg">{quotation.clientInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Address</p>
                        <p className="font-bold text-slate-900 text-lg leading-relaxed">
                          {quotation.clientInfo.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Created</p>
                        <p className="font-bold text-slate-900 text-lg">{formatDate(quotation.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Quotation ID</p>
                        <p className="font-bold text-slate-900 text-lg">#{quotation.id.slice(-8)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm p-0">
              <CardHeader className="m-0 p-0">
                <CardTitle className="rounded-t-xl px-4 py-3 text-slate-900 flex items-center gap-2 bg-gradient-to-r from-slate-100 to-blue-50">
                  <Building className="h-5 w-5 text-slate-600" />
                  Work Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* items */}
                <div className="space-y-2">
                  <h3 className="text-slate-900 font-medium">Items</h3>
                  <div className="space-y-2">
                    {quotation.workDetails.items.map((item, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-slate-900 font-medium">{item.description}</p>
                            {item.area && item.unit && item.rate && (
                              <p className="text-slate-600 text-sm">
                                {item.area} {item.unit} × {formatCurrency(item.rate)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-slate-900 font-medium">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-sm">Subtotal</span>
                  <span className="text-slate-900 text-sm">{formatCurrency(quotation.workDetails.total)}</span>
                </div>

                {/* discount (optional) */}
                {quotation.workDetails.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Discount</span>
                    <span className="text-green-600 text-sm">-{formatCurrency(quotation.workDetails.discount)}</span>
                  </div>
                )}

                <Separator className="bg-slate-200" />

                {/* total */}
                <div className="flex justify-between items-center text-base font-semibold">
                  <span className="text-slate-900">Total Amount</span>
                  <span className="text-slate-900">{formatCurrency(quotation.workDetails.grandTotal)}</span>
                </div>

                {/* notes */}
                {quotation.workDetails.notes && (
                  <>
                    <Separator className="bg-slate-200" />
                    <div className="mb-4">
                      <h3 className="text-slate-900 font-medium mb-1">Additional Notes</h3>
                      <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <p className="text-slate-700 text-sm">{quotation.workDetails.notes}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>


          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm p-0">
              <CardHeader className="m-0 p-0 ">
                <CardTitle className=" rounded-t-xl p-4 bg-gradient-to-r from-slate-100 to-blue-50 text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pb-6 space-y-3">
                <Button
                  onClick={() => router.push(`/admin/quotations/${quotation.id}/edit`)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quotation
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={() => startDownload(quotation.id, undefined, setDownloading)}
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </Button>
                <Button
                  onClick={() => setDialogOpen(true)}
                  variant="outline"
                  className="w-full border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm p-0">
              <CardHeader className="m-0 p-0">
                <CardTitle className=" p-4 rounded-t-xl bg-gradient-to-r from-slate-100 to-blue-50 text-slate-900">Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Current Status</span>
                    {getStatusBadge(quotation.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Total Amount</span>
                    <span className="font-bold text-slate-900 text-lg flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      {formatCurrency(quotation.workDetails.grandTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Items Count</span>
                    <span className="font-bold text-slate-900">{quotation.workDetails.items.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">Update Quotation Status</DialogTitle>
            <DialogDescription className="text-slate-600">Change the status for this quotation.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={newStatus}
              onValueChange={(value: "accepted" | "pending" | "rejected") => setNewStatus(value)}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-900 rounded-xl h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                <SelectItem value="pending" className="rounded-lg">
                  Pending
                </SelectItem>
                <SelectItem value="accepted" className="rounded-lg">
                  Accepted
                </SelectItem>
                <SelectItem value="rejected" className="rounded-lg">
                  Rejected
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-slate-200 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                updateStatusMutation.mutate({
                  id: quotation.id,
                  status: newStatus,
                })
              }
              disabled={updateStatusMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
