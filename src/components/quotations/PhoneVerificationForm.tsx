"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Phone, AlertCircle, CheckCircle } from "lucide-react"
import type { VerificationResponse, ErrorResponse } from "@/types/quotation"

interface PhoneVerificationFormProps {
    token: string
    clientName: string
    remainingAttempts: number
    onVerificationSuccess: (quotation: unknown) => void
    onVerificationError: (error: string, remainingAttempts?: number) => void
}

export function PhoneVerificationForm({
    token,
    clientName,
    remainingAttempts: initialRemainingAttempts,
    onVerificationSuccess,
    onVerificationError,
}: PhoneVerificationFormProps) {
    const [phoneDigits, setPhoneDigits] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [remainingAttempts, setRemainingAttempts] = useState(initialRemainingAttempts)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4)
        setPhoneDigits(value)
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (phoneDigits.length !== 4) {
            setError("Please enter exactly 4 digits")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const response = await fetch(`/api/quotations/shared/${token}/verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneDigits }),
            })

            const data: VerificationResponse | ErrorResponse = await response.json()

            if (response.ok && "success" in data && data.success) {
                onVerificationSuccess(data.quotation)
            } else {
                const errorData = data as VerificationResponse
                const errorMessage = errorData.error || "Verification failed"
                setError(errorMessage)

                if (errorData.remainingAttempts !== undefined) {
                    setRemainingAttempts(errorData.remainingAttempts)
                }

                onVerificationError(errorMessage, errorData.remainingAttempts)
            }
        } catch  {
            const errorMessage = "Unable to verify. Please check your connection and try again."
            setError(errorMessage)
            onVerificationError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const getAttemptWarningColor = () => {
        if (remainingAttempts <= 1) return "text-red-400"
        if (remainingAttempts <= 2) return "text-amber-400"
        return "text-white/70"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl rounded-2xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-white mb-2">
                            Secure Access
                        </CardTitle>
                        <CardDescription className="text-white/80">
                            Quotation for <strong className="text-white">{clientName}</strong>
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-300/20 rounded-xl p-4 backdrop-blur-sm">
                        <div className="flex items-start space-x-3">
                            <Phone className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">
                                    Phone Verification Required
                                </p>
                                <p className="text-blue-200/80 text-sm">
                                    Please enter the last 4 digits of your phone number to access your quotation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phoneDigits" className="text-white text-sm font-medium">
                                Last 4 digits of your phone number
                            </Label>
                            <Input
                                id="phoneDigits"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={4}
                                value={phoneDigits}
                                onChange={handleInputChange}
                                placeholder="1234"
                                className="bg-white/10 border-white/20 focus:border-white/30 focus:ring-white/20 text-white placeholder:text-white/50 backdrop-blur-xl rounded-xl text-center text-lg font-mono tracking-widest"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                        </div>

                        {error && (
                            <Alert className="bg-red-500/10 border-red-300/20 rounded-xl">
                                <AlertCircle className="h-4 w-4 text-red-300" />
                                <AlertDescription className="text-red-200">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <span className={`${getAttemptWarningColor()} flex items-center space-x-1`}>
                                <AlertCircle className="h-4 w-4" />
                                <span>
                                    {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                                </span>
                            </span>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading || phoneDigits.length !== 4 || remainingAttempts <= 0}
                            className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-xl rounded-xl py-3 font-medium transition-all duration-200 hover:scale-[1.02]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify & Access Quotation
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <p className="text-white/60 text-xs">
                            This verification helps protect your quotation from unauthorized access.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}