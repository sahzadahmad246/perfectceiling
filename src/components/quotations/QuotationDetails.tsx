"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QuotationListItem } from "@/types/quotation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  IndianRupee,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QuotationDetailsProps {
  quotation: QuotationListItem;
}

export default function QuotationDetails({ quotation }: QuotationDetailsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "accepted" | "pending" | "rejected"
  >(quotation.status as "accepted" | "pending" | "rejected");

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "accepted" | "pending" | "rejected";
    }) => {
      const response = await fetch(`/api/quotations/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quotation for update");
      }
      const quotationData = await response.json();

      const updatedData = {
        ...quotationData,
        status,
      };

      const putResponse = await fetch(`/api/quotations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!putResponse.ok) {
        const error = await putResponse.json();
        throw new Error(error.error || "Failed to update status");
      }
      return putResponse.json();
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["quotation", quotation.id] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quotation for ${quotation.clientInfo.name}`,
          text: `Quotation #${quotation.id.slice(
            -8
          )} - $${quotation.workDetails.grandTotal.toFixed(2)}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const shareText = `Quotation for ${
        quotation.clientInfo.name
      }\nAmount: $${quotation.workDetails.grandTotal.toFixed(2)}\nView: ${
        window.location.href
      }`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Quotation details copied to clipboard!");
    }
  };

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
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <p><strong>Subtotal:</strong> $${quotation.workDetails.total.toFixed(
              2
            )}</p>
            <p><strong>Discount:</strong> $${quotation.workDetails.discount.toFixed(
              2
            )}</p>
            <p class="total"><strong>Grand Total:</strong> $${quotation.workDetails.grandTotal.toFixed(
              2
            )}</p>
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
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-400/20 text-emerald-100 border-emerald-300/30";
      case "rejected":
        return "bg-red-400/20 text-red-100 border-red-300/30";
      case "pending":
        return "bg-amber-400/20 text-amber-100 border-amber-300/30";
      default:
        return "bg-white/20 text-white border-white/30";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/quotations"
                className="text-white hover:text-white hover:bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl h-10 w-10 p-0 transition-all duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Quotation Details
                </h1>
                <p className="text-sm text-white/70">
                  ID: #{quotation.id.slice(-8)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                className={`${getStatusColor(
                  quotation.status
                )} border font-medium rounded-full px-3 py-1 backdrop-blur-xl`}
              >
                {quotation.status.charAt(0).toUpperCase() +
                  quotation.status.slice(1)}
              </Badge>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-xl font-medium backdrop-blur-xl border border-white/20 transition-all duration-200">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Update Quotation Status
                    </DialogTitle>
                    <DialogDescription className="text-white/80">
                      Change the status for this quotation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Select
                      value={newStatus}
                      onValueChange={(
                        value: "accepted" | "pending" | "rejected"
                      ) => setNewStatus(value)}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white backdrop-blur-xl rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 border-white/20 backdrop-blur-xl rounded-xl">
                        <SelectItem
                          value="pending"
                          className="text-white focus:bg-white/10 rounded-lg"
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                          value="accepted"
                          className="text-white focus:bg-white/10 rounded-lg"
                        >
                          Accepted
                        </SelectItem>
                        <SelectItem
                          value="rejected"
                          className="text-white focus:bg-white/10 rounded-lg"
                        >
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl text-white"
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
                      className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl text-white"
                    >
                      {updateStatusMutation.isPending
                        ? "Updating..."
                        : "Update Status"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Client Information & Work Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <Card className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl hover:bg-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white/70">
                      Name
                    </label>
                    <p className="text-white font-medium">
                      {quotation.clientInfo.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/70">
                      Phone
                    </label>
                    <p className="text-white font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {quotation.clientInfo.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">
                    Address
                  </label>
                  <p className="text-white font-medium flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {quotation.clientInfo.address}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70">
                    Created
                  </label>
                  <p className="text-white font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(quotation.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl hover:bg-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {quotation.workDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">
                          {item.description}
                        </h4>
                        <span className="text-white font-bold">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-white/70">
                        <div>
                          Area: {item.area} {item.unit}
                        </div>
                        <div>Rate: {formatCurrency(item.rate)}</div>
                        <div>Unit: {item.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(quotation.workDetails.total)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Discount</span>
                    <span>
                      {formatCurrency(quotation.workDetails.discount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white border-t border-white/20 pt-2">
                    <span>Grand Total</span>
                    <span className="flex items-center">
                      <IndianRupee className="h-5 w-5 mr-1" />
                      {formatCurrency(quotation.workDetails.grandTotal)}
                    </span>
                  </div>
                </div>

                {quotation.workDetails.notes && (
                  <div className="border-t border-white/20 pt-4">
                    <label className="text-sm font-medium text-white/70 block mb-2">
                      Notes
                    </label>
                    <p className="text-white font-medium leading-relaxed">
                      {quotation.workDetails.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/5 border border-white/20 backdrop-blur-xl rounded-2xl hover:bg-white/10 transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() =>
                    router.push(`/admin/quotations/${quotation.id}/edit`)
                  }
                  className="w-full bg-white/10 hover:bg-white/15 text-white backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quotation
                </Button>
                <Button
                  onClick={handleShare}
                  className="w-full bg-white/10 hover:bg-white/15 text-white backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-200"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  className="w-full bg-white/10 hover:bg-white/15 text-white backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
