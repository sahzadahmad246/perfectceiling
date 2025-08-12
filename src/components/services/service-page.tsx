"use client"
import useSWR from "swr"
import type React from "react"
import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { CircularProgress } from "./circular-progress"
import { Upload, X, Edit3, Trash2, Plus, ImageIcon, Sparkles, Star, ArrowRight } from "lucide-react"

type Service = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  enabled: boolean
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ServicesPage() {
  const { data, mutate } = useSWR("/api/services", fetcher)

  const [showPopup, setShowPopup] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ title: string; description: string; imageUrl?: string | null }>({
    title: "",
    description: "",
    imageUrl: null,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const services: Service[] = useMemo(() => (data?.services as Service[]) ?? [], [data])

  const isEditing = editingId !== null

  function openCreatePopup() {
    setEditingId(null)
    setForm({ title: "", description: "", imageUrl: null })
    setShowPopup(true)
  }

  function openEditPopup(service: Service) {
    setEditingId(service.id)
    setForm({
      title: service.title ?? "",
      description: service.description ?? "",
      imageUrl: service.imageUrl ?? null,
    })
    setShowPopup(true)
  }

  function closePopup() {
    setShowPopup(false)
    setEditingId(null)
    setForm({ title: "", description: "", imageUrl: null })
  }

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Upload failed")
      const json = (await res.json()) as { url: string }

      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 500)

      return json.url
    } catch (error) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      throw error
    }
  }

  async function saveService() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (isEditing) {
        await fetch(`/api/services/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            imageUrl: form.imageUrl ?? null,
          }),
        })
      } else {
        await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim() || null,
            imageUrl: form.imageUrl ?? null,
          }),
        })
      }
      await mutate()
      closePopup()
    } finally {
      setSaving(false)
    }
  }

  async function removeService(id: string) {
    await fetch(`/api/services/${id}`, { method: "DELETE" })
    await mutate()
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } finally {
      setUploading(false)
      e.currentTarget.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-6">
              <nav className="text-sm text-gray-500 font-medium flex items-center gap-2">
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-gray-900 font-semibold">Services</span>
              </nav>
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 tracking-tight">Services</h1>
                <div className="flex items-center gap-3 text-gray-600">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-medium">Professional Portfolio</span>
                </div>
              </div>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Create and manage your service offerings with stunning visuals and compelling descriptions that convert
                visitors into clients.
              </p>
            </div>
            <Button
              onClick={openCreatePopup}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              New Service
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {services.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ready to showcase your services?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create your first service to start building a professional portfolio that attracts and converts your ideal
              clients.
            </p>
            <Button
              onClick={openCreatePopup}
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Service
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Your Services</h2>
                <p className="text-gray-600">
                  {services.length} {services.length === 1 ? "service" : "services"} ready to impress your clients
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{services.length} Total</span>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service, index) => (
                <Card
                  key={service.id}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {service.imageUrl ? (
                      <Image
                        src={service.imageUrl || "/placeholder.svg"}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-gray-700 transition-colors duration-200">
                      {service.title}
                    </CardTitle>

                    {service.description && (
                      <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm">{service.description}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => openEditPopup(service)}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition-all duration-200"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => removeService(service.id)}
                        className="bg-white hover:bg-red-50 text-gray-600 hover:text-red-600 border border-gray-200 hover:border-red-200 p-2 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {isEditing ? "Edit Service" : "Create New Service"}
                </h2>
                <p className="text-gray-600">
                  {isEditing ? "Update your service details" : "Add a new service to your portfolio"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Service Title *
                    </label>
                    <Input
                      placeholder="Enter a compelling service title..."
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="border border-gray-300 focus:border-gray-500 focus:ring-0 rounded-lg py-3 px-4 text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Description</label>
                    <Textarea
                      rows={8}
                      placeholder="Describe your service in detail. What makes it special? What problems does it solve?"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="border border-gray-300 focus:border-gray-500 focus:ring-0 rounded-lg py-3 px-4 resize-none"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Service Image</label>

                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                      />

                      <div
                        className={`
                        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
                        ${
                          uploading
                            ? "border-gray-400 bg-gray-50"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                        }
                      `}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center space-y-4">
                            <CircularProgress progress={uploadProgress} size={60} strokeWidth={4} />
                            <div>
                              <p className="font-semibold text-gray-900">Uploading your image...</p>
                              <p className="text-gray-600 text-sm">Please wait while we process your file</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Drop your image here</p>
                              <p className="text-gray-600 text-sm mb-1">or click to browse your files</p>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {form.imageUrl && (
                      <div className="relative mt-6">
                        <div className="relative h-48 w-full rounded-xl border border-gray-200 overflow-hidden">
                          <Image
                            src={form.imageUrl || "/placeholder.svg"}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                        <Button
                          onClick={() => setForm((p) => ({ ...p, imageUrl: null }))}
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 border border-gray-200 rounded-lg p-2 shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 mt-8 border-t border-gray-200">
                <Button
                  onClick={closePopup}
                  disabled={saving}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveService}
                  disabled={saving || !form.title.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : isEditing ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
