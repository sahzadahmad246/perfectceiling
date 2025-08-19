"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { QuotationWithSharing } from "@/types/quotation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Search,
  Phone,
  MapPin,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  DollarSign,
  User,
} from "lucide-react"
import { ShareQuotationButton } from "./ShareQuotationButton"
import { useDownloadQuotationPdf } from "@/lib/quotations/pdf"
import { ensureQuotationsSharing } from "@/lib/sharing/utils"

interface QuotationListProps {
  initialData?: QuotationWithSharing[]
}

const QuotationList = ({ initialData = [] }: QuotationListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [quotationToDelete, setQuotationToDelete] = useState<QuotationWithSharing | null>(null)
  const [newStatus, setNewStatus] = useState<"accepted" | "pending" | "rejected">("pending")
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    data: quotations = initialData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quotations"],
    queryFn: async (): Promise<QuotationWithSharing[]> => {
      const response = await fetch("/api/quotations")
      if (!response.ok) {
        throw new Error("Failed to fetch quotations")
      }
      const data = await response.json()
      return ensureQuotationsSharing(data)
    },
    initialData: initialData ? ensureQuotationsSharing(initialData) : [],
  })

  const filteredQuotations = quotations
    .filter((quotation) => {
      const matchesSearch =
        quotation.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.clientInfo.phone.includes(searchTerm) ||
        quotation.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || quotation.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  const handleShareStatusChange = (quotationId: string, shared: boolean) => {
    queryClient.setQueryData(["quotations"], (oldData: QuotationWithSharing[] | undefined) => {
      if (!oldData) return oldData

      return oldData.map((quotation) => {
        if (quotation.id === quotationId) {
          return {
            ...quotation,
            sharing: {
              ...quotation.sharing,
              isShared: shared,
              shareToken: shared ? quotation.sharing?.shareToken || null : null,
              sharedAt: shared ? quotation.sharing?.sharedAt || new Date().toISOString() : null,
            },
          }
        }
        return quotation
      })
    })
  }

  const handleDeleteClick = (quotation: QuotationWithSharing) => {
    setQuotationToDelete(quotation)
    setDeleteDialogOpen(true)
    setDropdownOpen(null)
  }

  const handleDeleteConfirm = () => {
    if (quotationToDelete) {
      deleteMutation.mutate(quotationToDelete.id)
      setDeleteDialogOpen(false)
      setQuotationToDelete(null)
    }
  }

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

  const { startDownload } = useDownloadQuotationPdf()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

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
      const quotation = await response.json()

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
      setDialogOpen(false)
      setSelectedQuotationId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status")
    },
  })

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-32 bg-slate-200" />
                <Skeleton className="h-6 w-10 bg-slate-200 rounded-full" />
              </div>
              <Skeleton className="h-10 w-10 bg-slate-200 rounded-xl" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-slate-200 rounded-xl" />
              <div className="flex flex-col sm:flex-row gap-3">
                <Skeleton className="h-11 flex-1 bg-slate-200 rounded-xl" />
                <Skeleton className="h-11 w-full sm:w-40 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 bg-slate-200" />
                        <Skeleton className="h-4 w-32 bg-slate-200" />
                      </div>
                      <Skeleton className="h-8 w-24 bg-slate-200 rounded-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Skeleton className="h-16 bg-slate-200 rounded-xl" />
                      <Skeleton className="h-16 bg-slate-200 rounded-xl" />
                      <Skeleton className="h-16 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Quotations
                </h1>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">(0)</span>
              </div>
              <Button
                size="sm"
                onClick={() => (window.location.href = "/admin/quotations/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Quotation
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Error Loading Quotations</h3>
              <p className="text-slate-600 mb-8 max-w-md">
                Something went wrong while fetching your quotations. Please try again.
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (quotations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Quotations
                </h1>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">(0)</span>
              </div>
              <Button
                size="sm"
                onClick={() => (window.location.href = "/admin/quotations/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Quotation
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">No Quotations Found</h3>
              <p className="text-slate-600 mb-8 max-w-md">
                Create your first quotation to get started with managing your business quotes.
              </p>
              <Button
                onClick={() => (window.location.href = "/admin/quotations/new")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-6 py-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Quotation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Quotations
              </h1>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                ({quotations.length})
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => (window.location.href = "/admin/quotations/new")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2 h-10"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Quotation</span>
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="space-y-4">
            {/* search + filters wrapper */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
              {/* search box (full width on mobile, 60% on desktop) */}
              <div className="relative w-full sm:w-3/5">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <Input
                  placeholder="Search by client name, phone, or quotation ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm text-slate-900 placeholder:text-slate-500"
                />
              </div>

              {/* filter + sort buttons */}
              <div className="flex flex-row gap-3 w-full sm:w-2/5 mt-3 sm:mt-0">
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                  className="flex-1 h-11 border-slate-200 hover:bg-white/80 bg-white/60 backdrop-blur-sm justify-start rounded-xl shadow-sm text-slate-700 hover:text-slate-900 transition-all duration-200"
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-slate-200 hover:bg-white/80 bg-white/60 backdrop-blur-sm justify-start rounded-xl shadow-sm text-slate-700 hover:text-slate-900 transition-all duration-200"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {statusFilter === "all"
                        ? "All Status"
                        : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl">
                    <DropdownMenuItem onClick={() => setStatusFilter("all")} className="rounded-lg">
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="rounded-lg">
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("accepted")} className="rounded-lg">
                      Accepted
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("rejected")} className="rounded-lg">
                      Rejected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence>
          {filteredQuotations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No matching quotations found</h3>
                  <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {filteredQuotations.map((quotation, index) => (
                <motion.div
                  key={quotation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm group p-0">
                    <CardContent className="p-0">
                      {/* HEADER — drop-in replacement */}
                      <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            {/* mobile: 2 items per row, opposite sides */}
                            <div className="sm:hidden space-y-2">
                              {/* row 1: name (left) + kebab (right) */}
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                  <User className="h-5 w-5 text-slate-600" />
                                  {quotation.clientInfo.name}
                                </h3>

                                {/* Removed duplicate mobile dropdown - now using single dropdown - now using single dropdown below */}
                              </div>

                              {/* row 2: id (left) + date (right) */}
                              <div className="flex items-center justify-between text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />#{quotation.id.slice(-8)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(quotation.createdAt)}
                                </span>
                              </div>

                              {/* row 3: total (left) + status (right) */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                                  <DollarSign className="h-6 w-6 text-emerald-600" />
                                  {formatCurrency(quotation.workDetails.grandTotal)}
                                </div>
                                {getStatusBadge(quotation.status)}
                              </div>
                            </div>

                            {/* desktop: keep your original left block */}
                            <div className="hidden sm:block">
                              <div className="flex sm:items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                  <User className="h-5 w-5 text-slate-600" />
                                  {quotation.clientInfo.name}
                                </h3>
                                {getStatusBadge(quotation.status)}
                              </div>
                              <div className="space-y-1 text-sm text-slate-600">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <FileText className="h-4 w-4" />#{quotation.id.slice(-8)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(quotation.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* right: desktop total + desktop menu */}
                          <div className="flex items-center justify-end">
                            <DropdownMenu
                              open={dropdownOpen === quotation.id}
                              onOpenChange={(open) => setDropdownOpen(open ? quotation.id : null)}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 w-9 p-0 border-slate-200 hover:bg-white/80 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="bg-white/95 backdrop-blur-sm border-slate-200 shadow-xl rounded-xl"
                              >
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDropdownOpen(null)
                                    window.location.href = `/admin/quotations/${quotation.id}`
                                  }}
                                  className="rounded-lg"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDropdownOpen(null)
                                    window.location.href = `/admin/quotations/${quotation.id}/edit`
                                  }}
                                  className="rounded-lg"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    setDownloadingId(quotation.id)
                                    setDropdownOpen(null)
                                    await startDownload(quotation.id, undefined, (d) => {
                                      if (!d) setDownloadingId(null)
                                    })
                                  }}
                                  className="rounded-lg"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <div className="px-2 py-1">
                                  <ShareQuotationButton
                                    quotationId={quotation.id}
                                    isShared={quotation.sharing.isShared}
                                    shareUrl={
                                      quotation.sharing.shareToken
                                        ? `${window.location.origin}/quotations/shared/${quotation.sharing.shareToken}`
                                        : undefined
                                    }
                                    onShareStatusChange={(shared) => {
                                      handleShareStatusChange(quotation.id, shared)
                                      setDropdownOpen(null)
                                    }}
                                    className="w-full justify-start text-slate-700 hover:text-slate-900 rounded-lg"
                                  />
                                </div>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedQuotationId(quotation.id)
                                    setNewStatus(quotation.status as "accepted" | "pending" | "rejected")
                                    setDialogOpen(true)
                                    setDropdownOpen(null)
                                  }}
                                  className="rounded-lg"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    handleDeleteClick(quotation)
                                    setDropdownOpen(null)
                                  }}
                                  className="text-red-600 focus:text-red-700 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Client Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Phone className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Contact</p>
                                <p className="font-semibold text-slate-900">{quotation.clientInfo.phone}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Address</p>
                                <p className="font-semibold text-slate-900 truncate">{quotation.clientInfo.address}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Items</p>
                                <p className="font-semibold text-slate-900">
                                  {quotation.workDetails.items.length} item(s)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rejection Reason */}
                        {quotation.status === "rejected" && quotation.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <XCircle className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                                  Rejection Reason
                                </p>
                                <p className="text-slate-900 font-medium">{quotation.rejectionReason}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Desktop Actions */}
                        <div className="hidden sm:flex flex-wrap gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              setDownloadingId(quotation.id)
                              await startDownload(quotation.id, undefined, (d) => {
                                if (!d) setDownloadingId(null)
                              })
                            }}
                            disabled={downloadingId === quotation.id}
                            className="border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {downloadingId === quotation.id ? "Generating..." : "Download PDF"}
                          </Button>

                          <ShareQuotationButton
                            quotationId={quotation.id}
                            isShared={quotation.sharing.isShared}
                            shareUrl={
                              quotation.sharing.shareToken
                                ? `${window.location.origin}/quotations/shared/${quotation.sharing.shareToken}`
                                : undefined
                            }
                            onShareStatusChange={(shared) => handleShareStatusChange(quotation.id, shared)}
                            className="border-slate-200 hover:bg-slate-50 bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuotationId(quotation.id)
                              setNewStatus(quotation.status as "accepted" | "pending" | "rejected")
                              setDialogOpen(true)
                            }}
                            className="border-slate-200 hover:bg-slate-50 bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Update Status
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(quotation)}
                            className="border-red-200 hover:bg-red-50 bg-white text-red-600 hover:text-red-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <Dialog
        open={dialogOpen && selectedQuotationId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedQuotationId(null)
          }
          setDialogOpen(open)
        }}
      >
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
                selectedQuotationId &&
                updateStatusMutation.mutate({
                  id: selectedQuotationId,
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to delete the quotation for{" "}
              <span className="font-semibold text-slate-900">{quotationToDelete?.clientInfo.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-200 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuotationList
