"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Copy, Share, Check, Loader2, X, ExternalLink } from "lucide-react"
import type { ShareUrlResponse, ErrorResponse } from "@/types/quotation"

interface ShareQuotationButtonProps {
  quotationId: string
  isShared: boolean
  shareUrl?: string
  onShareStatusChange: (shared: boolean, shareUrl?: string) => void
  className?: string
}

export function ShareQuotationButton({
  quotationId,
  isShared,
  shareUrl,
  onShareStatusChange,
  className = ""
}: ShareQuotationButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentShareUrl, setCurrentShareUrl] = useState(shareUrl || "")
  const queryClient = useQueryClient()

  // Generate share URL mutation
  const generateShareMutation = useMutation({
    mutationFn: async (): Promise<ShareUrlResponse> => {
      const response = await fetch(`/api/quotations/${quotationId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const error: ErrorResponse = await response.json()
        throw new Error(error.error || "Failed to generate share URL")
      }

      return response.json()
    },
    onSuccess: (data) => {
      setCurrentShareUrl(data.shareUrl)
      onShareStatusChange(true, data.shareUrl)
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      toast.success("Share URL generated successfully!")
      setDialogOpen(true)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate share URL")
    },
  })

  // Revoke share mutation
  const revokeShareMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/quotations/${quotationId}/share`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error: ErrorResponse = await response.json()
        throw new Error(error.error || "Failed to revoke share access")
      }

      return response.json()
    },
    onSuccess: () => {
      setCurrentShareUrl("")
      onShareStatusChange(false)
      queryClient.invalidateQueries({ queryKey: ["quotations"] })
      toast.success("Share access revoked successfully!")
      setDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke share access")
    },
  })

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentShareUrl)
      setCopied(true)
      toast.success("Share URL copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy URL to clipboard")
    }
  }

  const handleSystemShare = async () => {
    // Get quotation details for sharing text
    const quotationResponse = await fetch(`/api/quotations/${quotationId}`)
    const quotation = await quotationResponse.json()

    const shareText = `Dear ${quotation.clientInfo.name},

Here is your quotation from Perfect Ceiling for ${quotation.workDetails.items[0]?.description}${quotation.workDetails.items.length > 1 ? ' and more' : ''}.

Total Amount: ₹${quotation.workDetails.grandTotal.toLocaleString()}

Please click the link below to view your detailed quotation:
${currentShareUrl}

Thank you for choosing Perfect Ceiling!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quotation for ${quotation.clientInfo.name}`,
          text: shareText,
          url: currentShareUrl,
        })
      } catch (error) {
        console.log("Error sharing:", error)
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success("Share text copied to clipboard!")
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText)
      toast.success("Share text copied to clipboard!")
    }
  }

  const handleShare = () => {
    if (isShared && currentShareUrl) {
      setDialogOpen(true)
    } else {
      generateShareMutation.mutate()
    }
  }

  const handleRevoke = () => {
    revokeShareMutation.mutate()
  }

  const isLoading = generateShareMutation.isPending || revokeShareMutation.isPending

  return (
    <>
      <Button
        onClick={handleShare}
        disabled={isLoading}
        className={`${className} ${isShared
            ? "bg-green-300 hover:bg-green-400 text-black border-green-400/40"
            : "bg-white/10 hover:bg-white/15 text-white border-white/20"
          } backdrop-blur-xl rounded-xl transition-all duration-200`}
        style={{ filter: "url(#glass-button)" }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Share className="h-4 w-4 mr-2" />
        )}
        {isShared ? "Shared" : "Share"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-md bg-white/10 border-white/20 backdrop-blur-xs rounded-2xl"
          style={{ filter: "url(#glass-frosted)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <Share className="h-5 w-5 mr-2" />
              Share Quotation
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Share this secure link with your customer. They will need to verify their phone number to access the quotation.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shareUrl" className="text-white text-sm font-medium">
                Share URL
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="shareUrl"
                  value={currentShareUrl}
                  readOnly
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 backdrop-blur-xl rounded-xl flex-1"
                  style={{ filter: "url(#glass-primary)" }}
                />
                <Button
                  onClick={handleCopyToClipboard}
                  className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl px-3"
                  style={{ filter: "url(#glass-button)" }}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-300/20 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-amber-100 text-sm">
                <strong>Security Note:</strong> The customer will need to enter the last 4 digits of their phone number to access this quotation.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={handleSystemShare}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 border border-blue-300/30 backdrop-blur-xl rounded-xl"
              style={{ filter: "url(#glass-button)" }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Share via Apps
            </Button>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleRevoke}
              disabled={isLoading}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-100 border-red-300/30 backdrop-blur-xl rounded-xl"
              style={{ filter: "url(#glass-button)" }}
            >
              {revokeShareMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Revoke Access
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl"
              style={{ filter: "url(#glass-button)" }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}