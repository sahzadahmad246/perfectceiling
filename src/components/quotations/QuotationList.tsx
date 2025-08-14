// components/QuotationList.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuotationListItem } from "@/types/quotation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Phone, MapPin, Calendar, FileText, Eye, Edit, Trash2 } from "lucide-react";

interface QuotationListProps {
  initialData?: QuotationListItem[];
}

const QuotationList = ({ initialData = [] }: QuotationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const queryClient = useQueryClient();

  // Fetch quotations
  const { data: quotations = initialData, isLoading, error, refetch } = useQuery({
    queryKey: ["quotations"],
    queryFn: async (): Promise<QuotationListItem[]> => {
      const response = await fetch("/api/quotations");
      if (!response.ok) {
        throw new Error("Failed to fetch quotations");
      }
      return response.json();
    },
    initialData,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "pending" | "rejected" }) => {
      const response = await fetch(`/api/quotations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Delete quotation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quotations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete quotation");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Quotation deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete quotation");
    },
  });

  // Filter quotations
  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch = 
      quotation.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.clientInfo.phone.includes(searchTerm) ||
      quotation.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading quotations</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600">{quotations.length} total quotations</p>
        </div>
        <Button onClick={() => window.location.href = "/quotations/new"}>
          Create New Quotation
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={(value: "all" | "pending" | "accepted" | "rejected") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Grid */}
      {filteredQuotations.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No quotations found</p>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your filters" 
              : "Create your first quotation to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {quotation.clientInfo.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">ID: {quotation.id.slice(-8)}</p>
                  </div>
                  <Badge className={`${getStatusColor(quotation.status)} border`}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{quotation.clientInfo.phone}</span>
                </div>
                
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{quotation.clientInfo.address}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{formatDate(quotation.createdAt)}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {quotation.workDetails.items.length} item(s)
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      {formatCurrency(quotation.workDetails.grandTotal)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t space-y-3">
                {/* Status Update */}
                <div className="w-full">
                  <Select
                    value={quotation.status}
                    onValueChange={(value: "accepted" | "pending" | "rejected") =>
                      updateStatusMutation.mutate({ id: quotation.id, status: value })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/quotations/${quotation.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.location.href = `/quotations/${quotation.id}/edit`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete the quotation for ${quotation.clientInfo.name}?`)) {
                        deleteMutation.mutate(quotation.id);
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
  );
};

export default QuotationList;