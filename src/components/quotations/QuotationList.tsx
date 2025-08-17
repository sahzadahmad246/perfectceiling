"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { QuotationWithSharing } from "@/types/quotation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Search,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  MoreVertical,
  Filter,
  Download,
} from "lucide-react"
import { ShareQuotationButton } from "./ShareQuotationButton"
import { ShareStatusIndicator } from "./ShareStatusIndicator"
import { ensureQuotationsSharing } from "@/lib/sharing/utils"

interface QuotationListProps {
  initialData?: QuotationWithSharing[]
}

const GlassBackground = ({
  children,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "enhanced" | "frosted" | "subtle"
}) => {
  const getGlassStyles = () => {
    switch (variant) {
      case "enhanced":
        return "before:backdrop-blur-md before:bg-white/[0.08] before:border before:border-white/20"
      case "frosted":
        return "before:backdrop-blur-xl before:bg-white/[0.12] before:border before:border-white/25"
      case "subtle":
        return "before:backdrop-blur-sm before:bg-white/[0.05] before:border before:border-white/15"
      default:
        return "before:backdrop-blur-lg before:bg-white/[0.06] before:border before:border-white/20"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 rounded-inherit ${getGlassStyles()} before:absolute before:inset-0 before:rounded-inherit`}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

const QuotationList = ({ initialData = [] }: QuotationListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null)
  const [quotationToDelete, setQuotationToDelete] = useState<QuotationWithSharing | null>(null)
  const [newStatus, setNewStatus] = useState<"accepted" | "pending" | "rejected">("pending")
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch quotations
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
      console.log("data",data)
    },
    initialData: initialData ? ensureQuotationsSharing(initialData) : [],
  })

  // Update status mutation (modified to use PUT like the form)
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: "accepted" | "pending" | "rejected"
    }) => {
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
      setDialogOpen(false)
      setSelectedQuotationId(null)
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

  const handleShareStatusChange = (quotationId: string, shared: boolean, ) => {
    // Update the quotation in the local state
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
console.log(quotations)
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
        return "bg-emerald-400/20 text-emerald-100 border-emerald-300/30"
      case "rejected":
        return "bg-red-400/20 text-red-100 border-red-300/30"
      case "pending":
        return "bg-amber-400/20 text-amber-100 border-amber-300/30"
      default:
        return "bg-white/20 text-white border-white/30"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 relative">
        <div className="flex items-center justify-center min-h-[400px]">
          <GlassBackground variant="enhanced" className="text-center rounded-3xl p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white/60 mx-auto mb-4"></div>
            <p className="text-white">Loading quotations...</p>
          </GlassBackground>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 relative">
        <div className="flex items-center justify-center min-h-[400px]">
          <GlassBackground variant="enhanced" className="text-center rounded-3xl p-8">
            <p className="text-white/60 mb-4">Error loading quotations</p>
            <Button
              onClick={() => refetch()}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl transition-all duration-200"
            >
              Try Again
            </Button>
          </GlassBackground>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 relative">
      <header className="sticky top-0 z-50">
        <GlassBackground variant="primary" className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-white">Quotations</h1>
                <GlassBackground variant="subtle" className="ml-3 rounded-full">
                  <span className="text-sm text-white/90 px-3 py-1.5 block">{quotations.length}</span>
                </GlassBackground>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-white hover:text-white hover:bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl h-10 w-10 p-0 transition-all duration-200 hover:scale-105"
                  title="Search & Filter"
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => (window.location.href = "/admin/quotations/new")}
                  className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl font-medium backdrop-blur-xl border border-white/20 transition-all duration-200 hover:scale-105"
                  title="Add New Quotation"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </div>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-white/10">
              <GlassBackground variant="enhanced" className="">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Search & Filter
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchOpen(false)}
                      className="text-white hover:text-white hover:bg-white/10 rounded-lg h-8 w-8 p-0 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/10 border-white/20 focus:border-white/30 focus:ring-white/20 text-white placeholder:text-white/60 backdrop-blur-xl rounded-xl"
                      />
                    </div>
                    <div className="sm:w-48">
                      <Select
                        value={statusFilter}
                        onValueChange={(value: "all" | "pending" | "accepted" | "rejected") => setStatusFilter(value)}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 focus:border-white/30 focus:ring-white/20 text-white backdrop-blur-xl rounded-xl">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <GlassBackground variant="frosted" className="bg-slate-900/95 border-white/20 rounded-xl">
                            <SelectItem value="all" className="text-white focus:bg-white/10 rounded-lg">
                              All Status
                            </SelectItem>
                            <SelectItem value="pending" className="text-white focus:bg-white/10 rounded-lg">
                              Pending
                            </SelectItem>
                            <SelectItem value="accepted" className="text-white focus:bg-white/10 rounded-lg">
                              Accepted
                            </SelectItem>
                            <SelectItem value="rejected" className="text-white focus:bg-white/10 rounded-lg">
                              Rejected
                            </SelectItem>
                          </GlassBackground>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </GlassBackground>
            </div>
          )}
        </GlassBackground>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12">
            <GlassBackground variant="enhanced" className="rounded-3xl p-12 inline-block">
              <FileText className="h-12 w-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No quotations found</h3>
              <p className="text-white/60">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first quotation to get started"}
              </p>
            </GlassBackground>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="border-0 bg-transparent mb-6">
                <GlassBackground
                  variant="enhanced"
                  className="hover:before:bg-white/[0.12] transition-all duration-300 rounded-2xl hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
                >
                  <CardHeader className="pb-6 px-8 pt-8">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-white mb-1">
                          {quotation.clientInfo.name}
                        </CardTitle>
                        <p className="text-sm text-white/70">ID: #{quotation.id.slice(-8)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${getStatusColor(quotation.status)} border font-medium rounded-full px-3 py-1 backdrop-blur-xl`}
                          >
                            {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                          </Badge>
                          
                          <ShareStatusIndicator quotation={quotation} />
                        </div>
                        <DropdownMenu
                          open={dropdownOpen === quotation.id}
                          onOpenChange={(open) => setDropdownOpen(open ? quotation.id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/10 rounded-lg backdrop-blur-xl border border-white/20 transition-all duration-200 hover:scale-110"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 border-0 bg-transparent p-0">
                            <GlassBackground variant="frosted" className="rounded-xl">
                              <div className="p-1">
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = `/admin/quotations/${quotation.id}`
                                    setDropdownOpen(null)
                                  }}
                                  className="text-white focus:bg-white/10 focus:text-white rounded-lg transition-all duration-200"
                                >
                                  <Eye className="h-4 w-4 mr-2 text-white" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    window.location.href = `/admin/quotations/${quotation.id}/edit`
                                    setDropdownOpen(null)
                                  }}
                                  className="text-white focus:bg-white/10 focus:text-white rounded-lg transition-all duration-200"
                                >
                                  <Edit className="h-4 w-4 mr-2 text-white" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(`/api/quotations/${quotation.id}/pdf`)
                                      if (!response.ok) throw new Error('Failed to generate PDF')
                                      
                                      const blob = await response.blob()
                                      const url = window.URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.style.display = 'none'
                                      a.href = url
                                      a.download = `quotation-${quotation.id.slice(-8)}.pdf`
                                      document.body.appendChild(a)
                                      a.click()
                                      window.URL.revokeObjectURL(url)
                                      toast.success("PDF downloaded successfully!")
                                    } catch  {
                                      toast.error("Failed to download PDF")
                                    }
                                    setDropdownOpen(null)
                                  }}
                                  className="text-white focus:bg-white/10 focus:text-white rounded-lg transition-all duration-200"
                                >
                                  <Download className="h-4 w-4 mr-2 text-white" />
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
                                    onShareStatusChange={(shared) =>
                                      handleShareStatusChange(quotation.id, shared)
                                    }
                                    className="w-full justify-start"
                                  />
                                </div>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedQuotationId(quotation.id)
                                    setNewStatus(quotation.status as "accepted" | "pending" | "rejected")
                                    setDialogOpen(true)
                                    setDropdownOpen(null)
                                  }}
                                  className="text-white focus:bg-white/10 focus:text-white rounded-lg transition-all duration-200"
                                >
                                  <FileText className="h-4 w-4 mr-2 text-white" />
                                  Update Status
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/20" />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(quotation)}
                                  className="text-red-300 focus:text-red-200 focus:bg-red-500/20 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="h-4 w-4 mr-2 text-red-300" />
                                  Delete
                                </DropdownMenuItem>
                              </div>
                            </GlassBackground>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <GlassBackground variant="primary" className="rounded-xl">
                          <div className="flex items-center text-sm text-white/90 p-3">
                            <Phone className="h-4 w-4 mr-3 text-white/70" />
                            <span>{quotation.clientInfo.phone}</span>
                          </div>
                        </GlassBackground>
                        <GlassBackground variant="primary" className="rounded-xl">
                          <div className="flex items-start text-sm text-white/90 p-3">
                            <MapPin className="h-4 w-4 mr-3 mt-0.5 text-white/70 flex-shrink-0" />
                            <span className="line-clamp-2">{quotation.clientInfo.address}</span>
                          </div>
                        </GlassBackground>
                      </div>
                      <div className="space-y-4">
                        <GlassBackground variant="primary" className="rounded-xl">
                          <div className="flex items-center text-sm text-white/90 p-3">
                            <Calendar className="h-4 w-4 mr-3 text-white/70" />
                            <span>{formatDate(quotation.createdAt)}</span>
                          </div>
                        </GlassBackground>
                        <GlassBackground variant="primary" className="rounded-xl">
                          <div className="flex items-center text-sm text-white/90 p-3">
                            <FileText className="h-4 w-4 mr-3 text-white/70" />
                            <span>{quotation.workDetails.items.length} item(s)</span>
                          </div>
                        </GlassBackground>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <GlassBackground variant="enhanced" className="rounded-xl">
                        <div className="flex justify-between items-center p-4">
                          <span className="text-sm font-medium text-white/90">Total Amount</span>
                          <span className="text-2xl font-bold text-white">
                            {formatCurrency(quotation.workDetails.grandTotal)}
                          </span>
                        </div>
                      </GlassBackground>
                    </div>
                  </CardContent>
                </GlassBackground>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog
        open={dialogOpen && selectedQuotationId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedQuotationId(null)
          }
          setDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md border-0 bg-transparent">
          <GlassBackground variant="frosted" className="rounded-2xl">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-white">Update Quotation Status</DialogTitle>
                <DialogDescription className="text-white/80">Change the status for this quotation.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select
                  value={newStatus}
                  onValueChange={(value: "accepted" | "pending" | "rejected") => setNewStatus(value)}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-0 bg-transparent">
                    <GlassBackground variant="frosted" className="rounded-xl">
                      <SelectItem value="pending" className="text-white focus:bg-white/10 rounded-lg">
                        Pending
                      </SelectItem>
                      <SelectItem value="accepted" className="text-white focus:bg-white/10 rounded-lg">
                        Accepted
                      </SelectItem>
                      <SelectItem value="rejected" className="text-white focus:bg-white/10 rounded-lg">
                        Rejected
                      </SelectItem>
                    </GlassBackground>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10 backdrop-blur-xl rounded-xl transition-all duration-200"
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
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl text-white transition-all duration-200"
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </div>
          </GlassBackground>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-transparent">
          <GlassBackground variant="frosted" className="rounded-2xl">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-white">Delete Quotation</DialogTitle>
                <DialogDescription className="text-white/80">
                  Are you sure you want to delete the quotation for{" "}
                  <span className="font-medium text-white">{quotationToDelete?.clientInfo.name}</span>? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="bg-white/10 hover:bg-white/15 text-white backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="bg-red-400/20 hover:bg-red-400/30 text-red-100 backdrop-blur-xl border border-red-300/30 rounded-xl transition-all duration-200"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </div>
          </GlassBackground>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuotationList
