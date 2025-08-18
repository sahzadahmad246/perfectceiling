"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react"
import type { QuotationListItem } from "@/types/quotation"

interface CustomerQuotationActionsProps {
  quotation: QuotationListItem
  token: string
  onStatusUpdate: (newStatus: "accepted" | "rejected") => void
}

const rejectionReasons = [
  "Price is too high",
  "Timeline doesn't work for us",
  "Found a better alternative",
  "Project has been cancelled",
  "Need to discuss with family/team",
  "Other (please specify)"
]

export function CustomerQuotationActions({ 
  quotation, 
  token, 
  onStatusUpdate 
}: CustomerQuotationActionsProps) {
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotations/shared/${token}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "accepted",
          customerNote: "Quotation accepted by customer"
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to accept quotation")
      }

      try {
        const storageKey = `quotation_verification_${token}`
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          localStorage.setItem(storageKey, JSON.stringify({
            ...parsed,
            quotation: { ...quotation, status: "accepted" }
          }))
        }
      } catch {}

      toast.success("Quotation accepted successfully!")
      onStatusUpdate("accepted")
      setAcceptDialogOpen(false)
    } catch  {
      toast.error("Failed to accept quotation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    const reason = selectedReason === "Other (please specify)" ? customReason : selectedReason
    
    if (!reason.trim()) {
      toast.error("Please select or provide a reason for rejection")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotations/shared/${token}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "rejected",
          customerNote: `Quotation rejected: ${reason}`
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject quotation")
      }

      try {
        const storageKey = `quotation_verification_${token}`
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          localStorage.setItem(storageKey, JSON.stringify({
            ...parsed,
            quotation: { ...quotation, status: "rejected", rejectionReason: reason }
          }))
        }
      } catch {}

      toast.success("Thank you for your feedback. We'll be in touch soon.")
      onStatusUpdate("rejected")
      setRejectDialogOpen(false)
    } catch {
      toast.error("Failed to submit rejection. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (quotation.status !== "pending") {
    return (
      <div className="text-center p-6">
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
          quotation.status === "accepted" 
            ? "bg-green-400/20 text-green-100 border border-green-300/30" 
            : "bg-red-400/20 text-red-100 border border-red-300/30"
        } backdrop-blur-xl`}>
          {quotation.status === "accepted" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium">
            Quotation {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
          </span>
        </div>
        <p className="text-white/70 text-sm mt-2">
          {quotation.status === "accepted" 
            ? "Thank you for accepting our quotation. We'll contact you soon to proceed."
            : "This quotation has been declined. Please contact us if you have any questions."
          }
        </p>
        {quotation.status === 'rejected' && quotation.rejectionReason && (
          <div className="mt-3 text-red-200 text-sm">Reason: {quotation.rejectionReason}</div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setAcceptDialogOpen(true)}
          className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-300/30 backdrop-blur-xl rounded-xl px-8 py-3 font-medium transition-all duration-200 hover:scale-105"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Accept Quotation
        </Button>
        <Button
          onClick={() => setRejectDialogOpen(true)}
          variant="outline"
          className="bg-red-500/10 hover:bg-red-500/20 text-red-100 border border-red-300/30 backdrop-blur-xl rounded-xl px-8 py-3 font-medium transition-all duration-200 hover:scale-105"
        >
          <XCircle className="h-5 w-5 mr-2" />
          Decline Quotation
        </Button>
      </div>

      {/* Accept Confirmation Dialog */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
              Accept Quotation
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Are you sure you want to accept this quotation? This will notify Perfect Ceiling that you&apos;re ready to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAcceptDialogOpen(false)}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-100 border border-green-300/30 backdrop-blur-xl rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Yes, Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-amber-400" />
              Decline Quotation
            </DialogTitle>
            <DialogDescription className="text-white/80">
              We&apos;d appreciate your feedback. Please let us know why you&apos;re declining this quotation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white text-sm font-medium">Reason for declining:</Label>
              <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="mt-2">
                {rejectionReasons.map((reason) => (
                  <div key={reason} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={reason} 
                      id={reason}
                      className="border-white/30 text-white"
                    />
                    <Label htmlFor={reason} className="text-white/90 text-sm cursor-pointer">
                      {reason}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {selectedReason === "Other (please specify)" && (
              <div>
                <Label htmlFor="customReason" className="text-white text-sm font-medium">
                  Please specify:
                </Label>
                <Textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please tell us your reason..."
                  className="mt-2 bg-white/10 border-white/20 focus:border-white/30 focus:ring-white/20 text-white placeholder:text-white/60 backdrop-blur-xl rounded-xl"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-300/30 backdrop-blur-xl rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}