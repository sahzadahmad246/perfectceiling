"use client"

import { useState, useRef } from "react"
import { DashboardPageWrapper } from "@/components/admin/DashboardPageWrapper"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CategoryDTO, ServiceDTO, ImageRef } from "@/types/services"
import { Plus, Edit, Layers, Briefcase } from "lucide-react"
import { RichTextEditor } from "./RichTextEditor"

function useServicesData() {
  const queryClient = useQueryClient()
  const commonOpts = { staleTime: 120000, refetchOnWindowFocus: false, refetchOnMount: false as const }

  const categories = useQuery<CategoryDTO[]>({
    queryKey: ["svc", "categories"],
    queryFn: async () => {
      const r = await fetch("/api/services/categories")
      if (!r.ok) throw new Error("Failed to load categories")
      return r.json()
    },
    ...commonOpts,
  })

  const services = useQuery<ServiceDTO[]>({
    queryKey: ["svc", "services"],
    queryFn: async () => {
      const r = await fetch("/api/services")
      if (!r.ok) throw new Error("Failed to load services")
      return r.json()
    },
    ...commonOpts,
  })

  return { categories, services, queryClient }
}

export default function AdminServicesClient() {
  const { categories, services, queryClient } = useServicesData()
  const [activeTab, setActiveTab] = useState<"services" | "categories">("services")

  // --- Category State ---
  const [openCat, setOpenCat] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryDTO | null>(null)
  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [catDesc, setCatDesc] = useState("")
  const [catImages, setCatImages] = useState<ImageRef[]>([])
  const catFileRef = useRef<HTMLInputElement>(null)

  // --- Service State ---
  const [openSrv, setOpenSrv] = useState(false)
  const [editingSrv, setEditingSrv] = useState<ServiceDTO | null>(null)
  const [srvCategoryId, setSrvCategoryId] = useState("")
  const [srvTitle, setSrvTitle] = useState("")
  const [srvSlug, setSrvSlug] = useState("")
  const [srvSummary, setSrvSummary] = useState("")
  const [srvDescription, setSrvDescription] = useState("")
  const [srvContent, setSrvContent] = useState("")
  const [srvPriceRange, setSrvPriceRange] = useState("")
  const [srvTags, setSrvTags] = useState("")
  const [srvStatus, setSrvStatus] = useState<"active" | "inactive">("active")
  const [srvImages, setSrvImages] = useState<ImageRef[]>([])
  const srvFilesRef = useRef<HTMLInputElement>(null)

  // --- Helpers ---
  async function uploadFile(file: File, folder: string) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) throw new Error("Upload failed")
    const data = await res.json()
    return { url: data.data.url, publicId: data.data.publicId }
  }

  // --- Mutations ---
  const createCategory = useMutation({
    mutationFn: async (data: Partial<CategoryDTO>) => {
      const res = await fetch("/api/services/categories", {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create category")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Category created")
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      setOpenCat(false)
    },
  })

  const updateCategory = useMutation({
    mutationFn: async (data: Partial<CategoryDTO>) => {
      const res = await fetch("/api/services/categories", {
        method: "PUT",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update category")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Category updated")
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      setOpenCat(false)
    },
  })

  const createService = useMutation({
    mutationFn: async (data: Partial<ServiceDTO>) => {
      const res = await fetch("/api/services", {
        method: "POST",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create service")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Service created")
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      setOpenSrv(false)
    },
  })

  const updateService = useMutation({
    mutationFn: async (data: Partial<ServiceDTO>) => {
      const res = await fetch("/api/services", {
        method: "PUT",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update service")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Service updated")
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      setOpenSrv(false)
    },
  })

  // --- Handlers ---
  const openCreate = (tab: "services" | "categories") => {
    if (tab === "categories") {
      setEditingCat(null)
      setCatName("")
      setCatSlug("")
      setCatDesc("")
      setCatImages([])
      setOpenCat(true)
    } else {
      setEditingSrv(null)
      setSrvCategoryId("")
      setSrvTitle("")
      setSrvSlug("")
      setSrvSummary("")
      setSrvDescription("")
      setSrvContent("")
      setSrvPriceRange("")
      setSrvTags("")
      setSrvStatus("active")
      setSrvImages([])
      setOpenSrv(true)
    }
  }

  const openEditCategory = (c: CategoryDTO) => {
    setEditingCat(c)
    setCatName(c.name)
    setCatSlug(c.slug)
    setCatDesc(c.description || "")
    setCatImages(c.images || [])
    setOpenCat(true)
  }

  const openEditService = (s: ServiceDTO) => {
    setEditingSrv(s)
    setSrvCategoryId(s.categoryId)
    setSrvTitle(s.title)
    setSrvSlug(s.slug)
    setSrvSummary(s.summary || "")
    setSrvDescription(s.description || "")
    setSrvContent(s.content || "")
    setSrvPriceRange(s.priceRange || "")
    setSrvTags(s.tags?.join(", ") || "")
    setSrvStatus(s.status)
    setSrvImages(s.images || [])
    setOpenSrv(true)
  }

  return (
    <DashboardPageWrapper title="Services">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              {(["services", "categories"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-500 font-medium px-3 py-1 bg-slate-100 rounded-full">
              {activeTab === "categories"
                ? categories.data?.length || 0
                : services.data?.length || 0} Items
            </span>
          </div>

          <Button
            onClick={() => openCreate(activeTab)}
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all duration-200 rounded-lg px-4 py-2"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              Add {activeTab === "categories" ? "Category" : "Service"}
            </span>
          </Button>
        </div>

        <div className="py-4">
          {activeTab === "services" && (
            <div className="grid gap-6">
              {(services.data || []).map((s) => (
                <Card
                  key={s.id}
                  className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {Array.isArray(s.images) && s.images.length > 0 ? (
                            <Image src={s.images[0].url} alt={s.title} width={48} height={48} className="w-12 h-12 rounded-xl object-cover border" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                              <Briefcase className="h-6 w-6 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                              {s.title}
                            </h3>
                            <p className="text-sm text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md inline-block">
                              /{s.slug}
                            </p>
                          </div>
                        </div>

                        {s.summary && (
                          <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border-l-4 border-blue-200">
                            {s.summary}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {s.status === "active" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              Inactive
                            </span>
                          )}
                          {s.priceRange && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {s.priceRange}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditService(s)}
                        className="border-slate-200 hover:bg-white/80 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm text-slate-700 hover:text-slate-900 hover:border-blue-300 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!services.data || services.data.length === 0) && (
                <Card className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
                    <p className="text-slate-500 mb-4">Create your first service to get started.</p>
                    <Button
                      onClick={() => openCreate("services")}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "categories" && (
            <div className="grid gap-4">
              {(categories.data || []).map((c) => (
                <Card
                  key={c.id}
                  className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {Array.isArray(c.images) && c.images.length > 0 ? (
                          <Image src={c.images[0].url} alt={c.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-md">
                            <Layers className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {c.name}
                          </h3>
                          <p className="text-sm text-slate-500 font-mono">/{c.slug}</p>
                          {c.description && (
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{c.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditCategory(c)}
                        className="border-slate-200 hover:bg-white/80 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm text-slate-700 hover:text-slate-900 hover:border-blue-300 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog
          open={openCat}
          onOpenChange={(o) => {
            setOpenCat(o)
            if (!o) {
              setEditingCat(null)
              setCatName("")
              setCatSlug("")
              setCatDesc("")
            }
          }}
        >
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl font-bold">
                {editingCat ? "Edit Category" : "Add Category"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">Define top-level grouping for services.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 font-medium">Name</Label>
                <Input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium">Slug</Label>
                <Input
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium">Description</Label>
                <Textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium">Images (single)</Label>
                <input ref={catFileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  const up = await uploadFile(f, "perfectceiling/categories")
                  setCatImages([up])
                }} />
                <div className="flex items-center gap-3 mt-2">
                  <Button type="button" variant="outline" onClick={() => catFileRef.current?.click()}>Upload</Button>
                  {catImages.map((img) => (
                    <Image key={img.publicId} src={img.url} alt="cat" width={64} height={64} className="h-16 w-16 rounded object-cover border" />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenCat(false)}
                className="border-slate-200 hover:bg-slate-50 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  editingCat
                    ? updateCategory.mutate({ id: editingCat.id, name: catName, slug: catSlug, description: catDesc, images: catImages })
                    : createCategory.mutate({ name: catName, slug: catSlug, description: catDesc, images: catImages })
                }
                disabled={createCategory.isPending || updateCategory.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {createCategory.isPending || updateCategory.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={openSrv}
          onOpenChange={(o) => {
            setOpenSrv(o)
            if (!o) {
              setEditingSrv(null)
              setSrvCategoryId("")
              setSrvTitle("")
              setSrvSlug("")
              setSrvSummary("")
              setSrvDescription("")
              setSrvContent("")
              setSrvPriceRange("")
              setSrvTags("")
              setSrvStatus("active")
            }
          }}
        >
          <DialogContent className="sm:max-w-4xl max-h-[95vh] bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 px-6 pt-6">
              <DialogTitle className="text-slate-900 text-xl font-bold">
                {editingSrv ? "Edit Service" : "Add Service"}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Define a customer-facing service with rich content and details.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-slate-700 font-medium">Category</Label>
                    <select
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-slate-900"
                      value={srvCategoryId}
                      onChange={(e) => setSrvCategoryId(e.target.value)}
                    >
                      <option value="">Select category</option>
                      {(categories.data || []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">Title</Label>
                    <Input
                      value={srvTitle}
                      onChange={(e) => setSrvTitle(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Slug</Label>
                    <Input
                      value={srvSlug}
                      onChange={(e) => setSrvSlug(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Summary</Label>
                  <Textarea
                    value={srvSummary}
                    onChange={(e) => setSrvSummary(e.target.value)}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                    placeholder="Brief summary of the service..."
                  />
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Description</Label>
                  <Textarea
                    value={srvDescription}
                    onChange={(e) => setSrvDescription(e.target.value)}
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                    placeholder="Detailed description of the service..."
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 rounded-xl border border-blue-100">
                  <RichTextEditor
                    label="Content (Rich Text)"
                    value={srvContent}
                    onChange={setSrvContent}
                    placeholder="Enter detailed service content with HTML formatting. Use the toolbar to add headings, paragraphs, lists, and more..."
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 font-medium">Price Range</Label>
                    <Input
                      value={srvPriceRange}
                      onChange={(e) => setSrvPriceRange(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                      placeholder="e.g., $100-$500"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Tags (comma separated)</Label>
                    <Input
                      value={srvTags}
                      onChange={(e) => setSrvTags(e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
                      placeholder="web design, responsive, modern"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Status</Label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-slate-900"
                    value={srvStatus}
                    onChange={(e) => setSrvStatus(e.target.value as "active" | "inactive")}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <Label className="text-slate-700 font-medium">Images</Label>
                  <input ref={srvFilesRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                    const files = Array.from(e.target.files || [])
                    const uploaded: Array<{ url: string; publicId: string }> = []
                    for (const f of files) {
                      const up = await uploadFile(f, "perfectceiling/services")
                      uploaded.push(up)
                    }
                    setSrvImages((prev) => [...prev, ...uploaded])
                  }} />
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <Button type="button" variant="outline" onClick={() => srvFilesRef.current?.click()}>Upload</Button>
                    {srvImages.map((img) => (
                      <Image key={img.publicId} src={img.url} alt="srv" width={64} height={64} className="h-16 w-16 rounded object-cover border" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
              <div className="flex gap-3 w-full justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpenSrv(false)}
                  className="border-slate-200 hover:bg-slate-50 rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    editingSrv
                      ? updateService.mutate({
                        id: editingSrv.id,
                        categoryId: srvCategoryId,
                        title: srvTitle,
                        slug: srvSlug,
                        summary: srvSummary,
                        description: srvDescription,
                        content: srvContent,
                        priceRange: srvPriceRange,
                        tags: srvTags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        status: srvStatus,
                        images: srvImages,
                      })
                      : createService.mutate({
                        categoryId: srvCategoryId,
                        title: srvTitle,
                        slug: srvSlug,
                        summary: srvSummary,
                        description: srvDescription,
                        content: srvContent,
                        priceRange: srvPriceRange,
                        tags: srvTags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                        status: srvStatus,
                        images: srvImages,
                      })
                  }
                  disabled={createService.isPending || updateService.isPending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                >
                  {createService.isPending || updateService.isPending ? "Saving..." : "Save Service"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardPageWrapper>
  )
}
