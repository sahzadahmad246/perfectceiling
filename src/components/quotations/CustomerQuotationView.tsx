"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useDownloadQuotationPdf } from "@/lib/quotations/pdf"
import { CustomerQuotationActions } from "./CustomerQuotationActions"
import {
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Receipt,
  Download
} from "lucide-react"
import type { QuotationListItem } from "@/types/quotation"

interface CustomerQuotationViewProps {
  quotation: QuotationListItem
  token?: string
}

export function CustomerQuotationView({ quotation, token }: CustomerQuotationViewProps) {
  const [currentQuotation, setCurrentQuotation] = useState(quotation)

  const handleStatusUpdate = (newStatus: "accepted" | "rejected") => {
    setCurrentQuotation(prev => ({ ...prev, status: newStatus }))
  }

  const { startDownload } = useDownloadQuotationPdf()
  const [downloading, setDownloading] = useState(false)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-400" />
      case "pending":
        return <Clock className="h-5 w-5 text-amber-400" />
      default:
        return <Clock className="h-5 w-5 text-white/60" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-400/20 text-green-100 border-green-300/30"
      case "rejected":
        return "bg-red-400/20 text-red-100 border-red-300/30"
      case "pending":
        return "bg-amber-400/20 text-amber-100 border-amber-300/30"
      default:
        return "bg-white/20 text-white border-white/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Your Quotation
            </h1>
            <p className="text-white/70">
              Quotation ID: #{quotation.id.slice(-8)}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(currentQuotation.status)}
                <div>
                  <p className="text-white font-medium">Status</p>
                  <p className="text-white/70 text-sm">Current quotation status</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge
                  className={`${getStatusColor(currentQuotation.status)} border font-medium rounded-full px-4 py-2 backdrop-blur-xl`}
                >
                  {currentQuotation.status.charAt(0).toUpperCase() + currentQuotation.status.slice(1)}
                </Badge>
                <Button
                  onClick={() => startDownload(quotation.id, undefined, setDownloading)}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download PDF"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentQuotation.status === "rejected" && currentQuotation.rejectionReason && (
          <Card className="bg-red-500/10 border-red-300/30 backdrop-blur-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-red-200">Rejection Reason</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-100">{currentQuotation.rejectionReason}</p>
            </CardContent>
          </Card>
        )}

        {/* Customer Information */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center text-base">
              <Building2 className="h-5 w-5 mr-2" />
              Customer Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <FileText className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-white/70 text-xs">Name</p>
                  <p className="text-white text-sm font-medium">{quotation.clientInfo.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
                <Phone className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-white/70 text-xs">Phone</p>
                  <p className="text-white text-sm font-medium">{quotation.clientInfo.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 px-3 py-2 rounded-lg backdrop-blur-sm border border-white/10">
              <MapPin className="h-5 w-5 text-white/70 mt-1" />
              <div>
                <p className="text-white/70 text-xs">Address</p>
                <p className="text-white text-sm font-medium">{quotation.clientInfo.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Work Details */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Work Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items */}
            <div className="space-y-4">
              <h3 className="text-white font-medium">Items</h3>
              <div className="space-y-3">
                {quotation.workDetails.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{item.description}</p>
                        {item.area && item.unit && item.rate && (
                          <p className="text-white/70 text-sm">
                            {item.area} {item.unit} × {formatCurrency(item.rate)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-white/20" />

            {/* Pricing Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Subtotal</span>
                <span className="text-white">{formatCurrency(quotation.workDetails.total)}</span>
              </div>
              {quotation.workDetails.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Discount</span>
                  <span className="text-green-400">-{formatCurrency(quotation.workDetails.discount)}</span>
                </div>
              )}
              <Separator className="bg-white/20" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span className="text-white">Total Amount</span>
                <span className="text-white">{formatCurrency(quotation.workDetails.grandTotal)}</span>
              </div>
            </div>

            {/* Notes */}
            {quotation.workDetails.notes && (
              <>
                <Separator className="bg-white/20" />
                <div>
                  <h3 className="text-white font-medium mb-2">Additional Notes</h3>
                  <div className="bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-white/80">{quotation.workDetails.notes}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Information */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-white/70 text-sm">Quotation Date</p>
                  <p className="text-white font-medium">{formatDate(quotation.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Valid for 30 days</p>
                <p className="text-white/60 text-xs">from quotation date</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Actions */}
        {token && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-6">
              <CustomerQuotationActions
                quotation={currentQuotation}
                token={token}
                onStatusUpdate={handleStatusUpdate}
              />
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <div className="text-center space-y-2">
          <p className="text-white/70 text-sm">
            Questions about this quotation?
          </p>
          <p className="text-white/60 text-xs">
            Please contact us for any clarifications or modifications.
          </p>
        </div>
      </div>
    </div>
  )
}