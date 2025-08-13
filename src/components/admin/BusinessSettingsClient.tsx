"use client"

import type React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import Image from "next/image"
import { BUSINESS_STATUS_OPTIONS } from "@/constants/business"
import {
  Building2,
  Phone,
  PhoneCall,
  Clock,
  Upload,
  Edit3,
  Save,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

async function fetchSettings() {
  const res = await fetch("/api/business", { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch settings")
  return res.json()
}

async function upsertSettings(formData: FormData, method: "POST" | "PUT") {
  const res = await fetch("/api/business", { method, body: formData })
  if (!res.ok) throw new Error("Failed to save settings")
  return res.json()
}

export default function BusinessSettingsClient() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ["business-settings"], queryFn: fetchSettings })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [primaryPhone, setPrimaryPhone] = useState("")
  const [secondaryPhone, setSecondaryPhone] = useState("")
  const [status, setStatus] = useState<string>("open")
  const [terms, setTerms] = useState<string[]>([])
  const [termInput, setTermInput] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)

  const method: "POST" | "PUT" = data ? "PUT" : "POST"

  const saveMutation = useMutation({
    mutationFn: (payload: FormData) => upsertSettings(payload, method),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business-settings"] })
      setIsEditDialogOpen(false)
      setName("")
      setPrimaryPhone("")
      setSecondaryPhone("")
      setStatus("open")
      setTerms([])
      setTermInput("")
      setLogoFile(null)
      setLogoPreview(null)
    },
  })

  const filled = useMemo(() => data, [data])

  const onAddTerm = () => {
    const v = termInput.trim()
    if (!v) return
    setTerms((prev) => Array.from(new Set([...prev, v])))
    setTermInput("")
  }

  const onRemoveTerm = (t: string) => setTerms((prev) => prev.filter((x) => x !== t))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setIsImageLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
        setIsImageLoading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
  }

  const openEditDialog = () => {
    setName(filled?.name || "")
    setPrimaryPhone(filled?.primaryPhone || "")
    setSecondaryPhone(filled?.secondaryPhone || "")
    setStatus(filled?.status || "open")
    setTerms(filled?.terms || [])
    setLogoPreview(null)
    setLogoFile(null)
    setIsEditDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append("name", name || filled?.name || "")
    fd.append("primaryPhone", primaryPhone || filled?.primaryPhone || "")
    if (secondaryPhone || filled?.secondaryPhone)
      fd.append("secondaryPhone", secondaryPhone || filled?.secondaryPhone || "")
    fd.append("status", status || filled?.status || "open")
    ;(terms.length ? terms : filled?.terms || []).forEach((t: string) => fd.append("terms[]", t))
    if (logoFile) fd.append("logo", logoFile)
    saveMutation.mutate(fd)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-red-100 text-red-800 border-red-200"
      case "busy":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <X className="w-4 h-4" />
      case "busy":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-blue-600 text-white">
              <Skeleton className="h-6 w-48 bg-white/20" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">Business Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your business information and preferences</p>
        </div>

        <Card className="overflow-hidden shadow-sm border bg-white">
          <CardHeader className="bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Building2 className="w-6 h-6" />
                Business Information
              </CardTitle>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={openEditDialog}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <Edit3 className="w-5 h-5" />
                      Edit Business Settings
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="w-4 h-4" />
                        Business Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Perfect Ceiling"
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryPhone" className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="w-4 h-4" />
                          Primary Phone
                        </Label>
                        <Input
                          id="primaryPhone"
                          type="tel"
                          value={primaryPhone}
                          onChange={(e) => setPrimaryPhone(e.target.value)}
                          placeholder="e.g., +1 234 567 890"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryPhone" className="flex items-center gap-2 text-sm font-medium">
                          <PhoneCall className="w-4 h-4" />
                          Secondary Phone
                        </Label>
                        <Input
                          id="secondaryPhone"
                          type="tel"
                          value={secondaryPhone}
                          onChange={(e) => setSecondaryPhone(e.target.value)}
                          placeholder="Optional"
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status" className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          Business Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUSINESS_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Upload className="w-4 h-4" />
                          Business Logo
                        </Label>
                        <div className="space-y-3">
                          <Input type="file" accept="image/*" onChange={handleLogoChange} className="h-11" />

                          {(logoPreview || filled?.logoUrl) && (
                            <div className="relative">
                              <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                                {isImageLoading ? (
                                  <Skeleton className="w-20 h-20 rounded" />
                                ) : (
                                  <Image
                                    src={logoPreview || filled?.logoUrl}
                                    alt="Logo preview"
                                    width={80}
                                    height={80}
                                    className="rounded object-contain"
                                    onLoad={() => setIsImageLoading(false)}
                                  />
                                )}
                              </div>
                              {logoPreview && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                                  onClick={clearLogo}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Terms & Conditions
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={termInput}
                          onChange={(e) => setTermInput(e.target.value)}
                          placeholder="Add a term"
                          className="flex-1 h-11"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), onAddTerm())}
                        />
                        <Button type="button" onClick={onAddTerm} className="h-11 px-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {(terms.length > 0 || (filled?.terms && filled.terms.length > 0)) && (
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                          {(terms.length ? terms : filled?.terms || []).map((t: string) => (
                            <Badge key={t} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                              {t}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="w-4 h-4 p-0 hover:bg-red-100"
                                onClick={() => onRemoveTerm(t)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={saveMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {saveMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {data ? "Update Settings" : "Create Settings"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {filled ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Business Name</p>
                      <p className="font-semibold text-gray-900">{filled.name || "Not set"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Primary Phone</p>
                      <p className="font-semibold text-gray-900">{filled.primaryPhone || "Not set"}</p>
                    </div>
                  </div>

                  {filled.secondaryPhone && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                      <PhoneCall className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Secondary Phone</p>
                        <p className="font-semibold text-gray-900">{filled.secondaryPhone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    {getStatusIcon(filled.status)}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <Badge className={`${getStatusColor(filled.status)} font-medium`}>
                        {BUSINESS_STATUS_OPTIONS.find((opt) => opt.value === filled.status)?.label || filled.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {filled.logoUrl && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                      <Upload className="w-5 h-5 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Business Logo</p>
                        <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                          <Image
                            src={filled.logoUrl || "/placeholder.svg"}
                            alt="Business logo"
                            width={80}
                            height={80}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {filled.terms && filled.terms.length > 0 && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <p className="text-sm text-gray-600 font-medium">Terms & Conditions</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {filled.terms.map((term: string) => (
                          <Badge key={term} variant="outline" className="bg-white">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Business Settings</h3>
                <p className="text-gray-600 mb-4">Get started by creating your business profile</p>
                <Button onClick={openEditDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Business Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
