"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { QuotationListItem } from "@/types/quotation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Search, Phone, MapPin, Calendar, FileText, Eye, Edit, Trash2, Share } from "lucide-react"

interface QuotationListProps {
  initialData?: QuotationListItem[]
}

const QuotationList = ({ initialData = [] }: QuotationListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [newStatus, setNewStatus] = useState<"accepted" | "pending" | "rejected">("pending")
  const queryClient = useQueryClient()

  // Fetch quotations
  const {
    data: quotations = initialData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quotations"],
    queryFn: async (): Promise<QuotationListItem[]> => {
      const response = await fetch("/api/quotations")
      if (!response.ok) {
        throw new Error("Failed to fetch quotations")
      }
      return response.json()
    },
    initialData,
  })

  // Update status mutation (modified to use PUT like the form)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "pending" | "rejected" }) => {
      // Fetch the full quotation to preserve other fields
      const response = await fetch(`/api/quotations/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch quotation for update")
      }
      const quotation = await response.json()

      // Update only the status field
      const updatedData = {
        ...quotation,
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
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      setDialogOpen(false) // Close dialog on success
      setSelectedQuotationId(null) // Reset selected quotation
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status")
    },
  })

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete quotation")
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success("Quotation deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quotation")
    },
  })

  const handleShare = async (quotation: QuotationListItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quotation for ${quotation.clientInfo.name}`,
          text: `Quotation #${quotation.id.slice(-8)} - ${formatCurrency(quotation.workDetails.grandTotal)}`,
          url: `${window.location.origin}/quotations/${quotation.id}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Quotation for ${quotation.clientInfo.name}\nAmount: ${formatCurrency(quotation.workDetails.grandTotal)}\nView: ${window.location.origin}/quotations/${quotation.id}`
      await navigator.clipboard.writeText(shareText)
      toast.success("Quotation details copied to clipboard!")
    }
  }

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientInfo.phone.includes(searchTerm) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="flex items-center justify-center min-h-[400px] relative z-10">
          <div className="text-center backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500/30 border-t-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-700 font-medium">Loading quotations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="flex items-center justify-center min-h-[400px] relative z-10">
          <div className="text-center backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <p className="text-red-600 mb-4 font-medium">Error loading quotations</p>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto py-8 px-4 space-y-8">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                Quotations
              </h1>
              <p className="text-slate-600 font-medium">{quotations.length} total quotations</p>
            </div>
            <Button
              onClick={() => (window.location.href = "/admin/quotations/new")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl px-8 py-3 font-semibold"
            >
              Create New Quotation
            </Button>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-5 w-5" />
              <Input
                placeholder="Search by name, phone, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/50 border-white/60 rounded-2xl h-12 text-slate-700 placeholder:text-slate-500 focus:bg-white/70 transition-all duration-300"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "pending" | "accepted" | "rejected") => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-48 bg-white/50 border-white/60 rounded-2xl h-12 text-slate-700 focus:bg-white/70 transition-all duration-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-white/60 rounded-2xl shadow-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredQuotations.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-12 shadow-2xl text-center">
            <FileText className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <p className="text-slate-700 text-xl mb-3 font-semibold">No quotations found</p>
            <p className="text-slate-500 font-medium">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first quotation to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredQuotations.map((quotation) => (
              <Card
                key={quotation.id}
                className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl shadow-2xl hover:shadow-3xl hover:bg-white/40 transition-all duration-500 overflow-hidden group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                        {quotation.clientInfo.name}
                      </CardTitle>
                      <p className="text-sm text-slate-500 font-medium">ID: {quotation.id.slice(-8)}</p>
                    </div>
                    <Badge
                      className={`${getStatusColor(quotation.status)} border-0 rounded-full px-3 py-1 font-semibold shadow-lg`}
                    >
                      {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-slate-500" />
                    <span>{quotation.clientInfo.phone}</span>
                  </div>

                  <div className="flex items-start text-sm text-slate-600 font-medium">
                    <MapPin className="h-4 w-4 mr-3 mt-0.5 flex-shrink-0 text-slate-500" />
                    <span className="line-clamp-2">{quotation.clientInfo.address}</span>
                  </div>

                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <Calendar className="h-4 w-4 mr-3 flex-shrink-0 text-slate-500" />
                    <span>{formatDate(quotation.createdAt)}</span>
                  </div>

                  <div className="pt-4 border-t border-white/40">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 font-medium">
                        {quotation.workDetails.items.length} item(s)
                      </span>
                      <span className="font-bold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        {formatCurrency(quotation.workDetails.grandTotal)}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-white/40 space-y-4">
                  {/* Status Update Dialog */}
                  <Dialog
                    open={dialogOpen && selectedQuotationId === quotation.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setSelectedQuotationId(quotation.id)
                        setNewStatus(quotation.status as "accepted" | "pending" | "rejected")
                      } else {
                        setSelectedQuotationId(null)
                      }
                      setDialogOpen(open)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
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

                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                      onClick={() => (window.location.href = `/admin/quotations/${quotation.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                      onClick={() => (window.location.href = `/admin/quotations/${quotation.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/50 border-white/60 rounded-2xl hover:bg-white/70 transition-all duration-300 font-semibold"
                      onClick={() => handleShare(quotation)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 bg-white/50 border-white/60 rounded-2xl hover:bg-red-50/70 transition-all duration-300"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete the quotation for ${quotation.clientInfo.name}?`,
                          )
                        ) {
                          deleteMutation.mutate(quotation.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuotationList
