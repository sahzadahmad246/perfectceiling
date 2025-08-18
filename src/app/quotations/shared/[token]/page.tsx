"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { PhoneVerificationForm } from "@/components/quotations/PhoneVerificationForm"
import { CustomerQuotationView } from "@/components/quotations/CustomerQuotationView"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, XCircle } from "lucide-react"
import type { QuotationListItem, ErrorResponse } from "@/types/quotation"

interface TokenValidationResponse {
  success: boolean
  requiresVerification: boolean
  clientName: string
  remainingAttempts: number
}

export default function SharedQuotationPage() {
  const params = useParams()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenData, setTokenData] = useState<TokenValidationResponse | null>(null)
  const [quotation, setQuotation] = useState<QuotationListItem | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState(5)

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const storageKey = `quotation_verification_${token}`
        const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { quotation?: QuotationListItem }
            if (parsed?.quotation) {
              setQuotation(parsed.quotation)
              setIsLoading(false)
              return
            }
          } catch {}
        }
      } catch {}

      try {
        const response = await fetch(`/api/quotations/shared/${token}`)
        
        if (!response.ok) {
          const errorData: ErrorResponse = await response.json()
          
          if (response.status === 429) {
            setError("Too many attempts. Please try again later.")
          } else if (response.status === 404) {
            setError("This quotation link is no longer valid or has been revoked.")
          } else {
            setError(errorData.error || "Invalid quotation link.")
          }
          return
        }

        const data: TokenValidationResponse = await response.json()
        setTokenData(data)
        setRemainingAttempts(data.remainingAttempts)
      } catch {
        setError("Unable to load quotation. Please check your connection and try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      validateToken()
    }
  }, [token])

  const handleVerificationSuccess = (quotationData: QuotationListItem) => {
    setQuotation(quotationData)
    setError(null)
  }

  const handleVerificationError = (errorMessage: string, newRemainingAttempts?: number) => {
    setError(errorMessage)
    if (newRemainingAttempts !== undefined) {
      setRemainingAttempts(newRemainingAttempts)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <Loader2 className="h-8 w-8 text-white mx-auto animate-spin" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Loading Quotation</h2>
              <p className="text-white/70">Please wait while we verify your access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-red-300/20">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
              <p className="text-white/70 mb-4">{error}</p>
            </div>
            <Alert className="bg-red-500/10 border-red-300/20 rounded-xl text-left">
              <AlertCircle className="h-4 w-4 text-red-300" />
              <AlertDescription className="text-red-200">
                If you believe this is an error, please contact the person who shared this quotation with you.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show quotation if verification was successful
  if (quotation) {
    return <CustomerQuotationView quotation={quotation} token={token} />
  }

  // Show verification form
  if (tokenData) {
    return (
      <PhoneVerificationForm
        token={token}
        clientName={tokenData.clientName}
        remainingAttempts={remainingAttempts}
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationError={handleVerificationError}
      />
    )
  }

  // Fallback error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-red-300/20">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/70">Unable to load the quotation. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}