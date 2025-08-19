"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { CategoryDTO, SubcategoryDTO, ServiceDTO, ImageRef } from "@/types/services"
import { Plus, Edit, Settings, Layers, Briefcase } from "lucide-react"
import { RichTextEditor } from "./RichTextEditor"
import { useRef } from "react"

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

  const subcategories = useQuery<SubcategoryDTO[]>({
    queryKey: ["svc", "subcategories"],
    queryFn: async () => {
      const r = await fetch("/api/services/subcategories")
      if (!r.ok) throw new Error("Failed to load subcategories")
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

  return { categories, subcategories, services, queryClient }
}

export default function AdminServicesClient() {
  const { categories, subcategories, services, queryClient } = useServicesData()
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "services">("services")

  const [openCat, setOpenCat] = useState(false)
  const [openSub, setOpenSub] = useState(false)
  const [openSrv, setOpenSrv] = useState(false)

  const [editingCat, setEditingCat] = useState<CategoryDTO | null>(null)
  const [editingSub, setEditingSub] = useState<SubcategoryDTO | null>(null)
  const [editingSrv, setEditingSrv] = useState<ServiceDTO | null>(null)

  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [catDesc, setCatDesc] = useState("")
  const [catImages, setCatImages] = useState<Array<{ url: string; publicId: string }>>([])

  const [subCategoryId, setSubCategoryId] = useState("")
  const [subName, setSubName] = useState("")
  const [subSlug, setSubSlug] = useState("")
  const [subDesc, setSubDesc] = useState("")
  const [subImage, setSubImage] = useState<{ url: string; publicId: string } | null>(null)

  const [srvCategoryId, setSrvCategoryId] = useState("")
  const [srvSubcategoryId, setSrvSubcategoryId] = useState("")
  const [srvTitle, setSrvTitle] = useState("")
  const [srvSlug, setSrvSlug] = useState("")
  const [srvSummary, setSrvSummary] = useState("")
  const [srvDescription, setSrvDescription] = useState("")
  const [srvContent, setSrvContent] = useState("")
  const [srvPriceRange, setSrvPriceRange] = useState("")
  const [srvTags, setSrvTags] = useState("")
  const [srvStatus, setSrvStatus] = useState<"active" | "inactive">("active")
  const [srvImages, setSrvImages] = useState<Array<{ url: string; publicId: string }>>([])
  const catFileRef = useRef<HTMLInputElement>(null)
  const subFileRef = useRef<HTMLInputElement>(null)
  const srvFilesRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File, folder: string) {
    const form = new FormData()
    form.append("file", file)
    form.append("folder", folder)
    const res = await fetch("/api/uploads/image", { method: "POST", body: form })
    if (!res.ok) throw new Error("Upload failed")
    return res.json() as Promise<{ url: string; publicId: string }>
  }

  const createCategory = useMutation({
    mutationFn: async (payload: { name: string; slug: string; description?: string; images?: ImageRef[] }) => {
      const r = await fetch("/api/services/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to create category")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      toast.success("Category saved")
      setOpenCat(false)
      setEditingCat(null)
      setCatName("")
      setCatSlug("")
      setCatDesc("")
      setCatImages([])
    },
    onError: () => toast.error("Failed to save category"),
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; slug: string; description?: string; images?: ImageRef[] }) => {
      const r = await fetch(`/api/services/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to update category")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      toast.success("Category updated")
      setOpenCat(false)
      setEditingCat(null)
    },
    onError: () => toast.error("Failed to update category"),
  })

  const createSubcategory = useMutation({
    mutationFn: async (payload: { categoryId: string; name: string; slug: string; description?: string; image?: ImageRef }) => {
      const r = await fetch("/api/services/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to create subcategory")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "subcategories"] })
      toast.success("Subcategory saved")
      setOpenSub(false)
      setEditingSub(null)
      setSubCategoryId("")
      setSubName("")
      setSubSlug("")
      setSubDesc("")
      setSubImage(null)
    },
    onError: () => toast.error("Failed to save subcategory"),
  })

  const updateSubcategory = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string; categoryId: string; name: string; slug: string; description?: string; image?: ImageRef }) => {
      const r = await fetch(`/api/services/subcategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to update subcategory")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "subcategories"] })
      toast.success("Subcategory updated")
      setOpenSub(false)
      setEditingSub(null)
    },
    onError: () => toast.error("Failed to update subcategory"),
  })

  const createService = useMutation({
    mutationFn: async (payload: Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">) => {
      const r = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to create service")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      toast.success("Service saved")
      setOpenSrv(false)
      setEditingSrv(null)
      setSrvCategoryId("")
      setSrvSubcategoryId("")
      setSrvTitle("")
      setSrvSlug("")
      setSrvSummary("")
      setSrvDescription("")
      setSrvContent("")
      setSrvPriceRange("")
      setSrvTags("")
      setSrvStatus("active")
      setSrvImages([])
    },
    onError: () => toast.error("Failed to save service"),
  })

  const updateService = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">) => {
      const r = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error("Failed to update service")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      toast.success("Service updated")
      setOpenSrv(false)
      setEditingSrv(null)
    },
    onError: () => toast.error("Failed to update service"),
  })

  const openCreate = (type: typeof activeTab) => {
    if (type === "categories") {
      setEditingCat(null)
      setOpenCat(true)
    }
    if (type === "subcategories") {
      setEditingSub(null)
      setOpenSub(true)
    }
    if (type === "services") {
      setEditingSrv(null)
      setOpenSrv(true)
    }
  }

  const openEditCategory = (c: CategoryDTO) => {
    setEditingCat(c)
    setCatName(c.name)
    setCatSlug(c.slug)
    setCatDesc(c.description || "")
    setCatImages(Array.isArray(c.images) ? c.images : [])
    setOpenCat(true)
  }
  const openEditSubcategory = (s: SubcategoryDTO) => {
    setEditingSub(s)
    setSubCategoryId(s.categoryId)
    setSubName(s.name)
    setSubSlug(s.slug)
    setSubDesc(s.description || "")
    setSubImage((s as unknown as { image?: { url: string; publicId: string } }).image || null)
    setOpenSub(true)
  }
  const openEditService = (s: ServiceDTO) => {
    setEditingSrv(s)
    setSrvCategoryId(s.categoryId)
    setSrvSubcategoryId(s.subcategoryId)
    setSrvTitle(s.title)
    setSrvSlug(s.slug)
    setSrvSummary(s.summary || "")
    setSrvDescription(s.description || "")
    setSrvContent(s.content || "")
    setSrvPriceRange(s.priceRange || "")
    setSrvTags((s.tags || []).join(", "))
    setSrvStatus(s.status)
    setSrvImages((s as unknown as { images?: { url: string; publicId: string }[] }).images || [])
    setOpenSrv(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Services Management
              </h1>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                (
                {activeTab === "categories"
                  ? categories.data?.length || 0
                  : activeTab === "subcategories"
                    ? subcategories.data?.length || 0
                    : services.data?.length || 0}
                )
              </span>
            </div>
            <Button
              onClick={() => openCreate(activeTab)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl px-4 py-2 h-10"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                Add{" "}
                {activeTab === "categories" ? "Category" : activeTab === "subcategories" ? "Subcategory" : "Service"}
              </span>
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="border-b border-slate-200/60">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {(["services", "categories", "subcategories"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-white/50 rounded-t-lg"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "services" && <Briefcase className="h-4 w-4" />}
                  {tab === "categories" && <Layers className="h-4 w-4" />}
                  {tab === "subcategories" && <Settings className="h-4 w-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        {Array.isArray((s as unknown as { images?: { url: string }[] }).images) && (s as unknown as { images?: { url: string }[] }).images!.length > 0 ? (
                          <img src={(s as unknown as { images: { url: string }[] }).images[0].url} alt={s.title} className="w-12 h-12 rounded-xl object-cover border" />
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
                      {Array.isArray((c as unknown as { images?: { url: string }[] }).images) && (c as unknown as { images?: { url: string }[] }).images!.length > 0 ? (
                        <img src={(c as unknown as { images: { url: string }[] }).images[0].url} alt={c.name} className="w-10 h-10 rounded-lg object-cover border" />
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

        {activeTab === "subcategories" && (
          <div className="grid gap-4">
            {(subcategories.data || []).map((s) => (
              <Card
                key={s.id}
                className="border-slate-200 shadow-lg bg-white/80 backdrop-blur-sm rounded-xl hover:shadow-xl transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {(s as unknown as { image?: { url: string } }).image?.url ? (
                        <img src={(s as unknown as { image?: { url: string } }).image!.url} alt={s.name} className="w-10 h-10 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Settings className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {s.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-mono">/{s.slug}</p>
                        {s.description && (
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.description}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSubcategory(s)}
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
                  <img key={img.publicId} src={img.url} alt="cat" className="h-16 w-16 rounded object-cover border" />
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
        open={openSub}
        onOpenChange={(o) => {
          setOpenSub(o)
          if (!o) {
            setEditingSub(null)
            setSubCategoryId("")
            setSubName("")
            setSubSlug("")
            setSubDesc("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-bold">
              {editingSub ? "Edit Subcategory" : "Add Subcategory"}
            </DialogTitle>
            <DialogDescription className="text-slate-600">Group related services within a category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700 font-medium">Category</Label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-slate-900"
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {(categories.data || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-slate-700 font-medium">Name</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-medium">Slug</Label>
              <Input
                value={subSlug}
                onChange={(e) => setSubSlug(e.target.value)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-medium">Description</Label>
              <Textarea
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white rounded-xl"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-medium">Image</Label>
              <input ref={subFileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                const up = await uploadFile(f, "perfectceiling/subcategories")
                setSubImage(up)
              }} />
              <div className="flex items-center gap-3 mt-2">
                <Button type="button" variant="outline" onClick={() => subFileRef.current?.click()}>Upload</Button>
                {subImage && <img src={subImage.url} alt="sub" className="h-16 w-16 rounded object-cover border" />}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setOpenSub(false)}
              className="border-slate-200 hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingSub
                  ? updateSubcategory.mutate({
                      id: editingSub.id,
                      categoryId: subCategoryId,
                      name: subName,
                      slug: subSlug,
                      description: subDesc,
                      image: subImage || undefined,
                    })
                  : createSubcategory.mutate({
                      categoryId: subCategoryId,
                      name: subName,
                      slug: subSlug,
                      description: subDesc,
                      image: subImage || undefined,
                    })
              }
              disabled={createSubcategory.isPending || updateSubcategory.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {createSubcategory.isPending || updateSubcategory.isPending ? "Saving..." : "Save"}
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
            setSrvSubcategoryId("")
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
                <div>
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
                <div>
                  <Label className="text-slate-700 font-medium">Subcategory</Label>
                  <select
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:border-blue-500 focus:ring-blue-500/20 text-slate-900"
                    value={srvSubcategoryId}
                    onChange={(e) => setSrvSubcategoryId(e.target.value)}
                  >
                    <option value="">Select subcategory</option>
                    {useMemo(
                      () => (subcategories.data || []).filter((s) => s.categoryId === srvCategoryId),
                      [subcategories.data, srvCategoryId],
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
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
                    <img key={img.publicId} src={img.url} alt="srv" className="h-16 w-16 rounded object-cover border" />
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
                        subcategoryId: srvSubcategoryId,
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
                        subcategoryId: srvSubcategoryId,
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
  )
}
