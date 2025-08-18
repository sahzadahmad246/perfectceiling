"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CategoryDTO, SubcategoryDTO, ServiceDTO } from "@/types/services"

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
  const [activeTab, setActiveTab] = useState<"categories" | "subcategories" | "services">("categories")

  // Dialog states
  const [openCat, setOpenCat] = useState(false)
  const [openSub, setOpenSub] = useState(false)
  const [openSrv, setOpenSrv] = useState(false)

  const [editingCat, setEditingCat] = useState<CategoryDTO | null>(null)
  const [editingSub, setEditingSub] = useState<SubcategoryDTO | null>(null)
  const [editingSrv, setEditingSrv] = useState<ServiceDTO | null>(null)

  // Form states (Category)
  const [catName, setCatName] = useState("")
  const [catSlug, setCatSlug] = useState("")
  const [catDesc, setCatDesc] = useState("")

  // Form states (Subcategory)
  const [subCategoryId, setSubCategoryId] = useState("")
  const [subName, setSubName] = useState("")
  const [subSlug, setSubSlug] = useState("")
  const [subDesc, setSubDesc] = useState("")

  // Form states (Service)
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

  // Mutations
  const createCategory = useMutation({
    mutationFn: async (payload: { name: string; slug: string; description?: string }) => {
      const r = await fetch("/api/services/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to create category")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      toast.success("Category saved")
      setOpenCat(false)
      setEditingCat(null)
      setCatName(""); setCatSlug(""); setCatDesc("")
    },
    onError: () => toast.error("Failed to save category"),
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; name: string; slug: string; description?: string }) => {
      const r = await fetch(`/api/services/categories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to update category")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "categories"] })
      toast.success("Category updated")
      setOpenCat(false); setEditingCat(null)
    },
    onError: () => toast.error("Failed to update category"),
  })

  const createSubcategory = useMutation({
    mutationFn: async (payload: { categoryId: string; name: string; slug: string; description?: string }) => {
      const r = await fetch("/api/services/subcategories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to create subcategory")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "subcategories"] })
      toast.success("Subcategory saved")
      setOpenSub(false)
      setEditingSub(null)
      setSubCategoryId(""); setSubName(""); setSubSlug(""); setSubDesc("")
    },
    onError: () => toast.error("Failed to save subcategory"),
  })

  const updateSubcategory = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; categoryId: string; name: string; slug: string; description?: string }) => {
      const r = await fetch(`/api/services/subcategories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to update subcategory")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "subcategories"] })
      toast.success("Subcategory updated")
      setOpenSub(false); setEditingSub(null)
    },
    onError: () => toast.error("Failed to update subcategory"),
  })

  const createService = useMutation({
    mutationFn: async (payload: Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">) => {
      const r = await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to create service")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      toast.success("Service saved")
      setOpenSrv(false)
      setEditingSrv(null)
      setSrvCategoryId(""); setSrvSubcategoryId(""); setSrvTitle(""); setSrvSlug(""); setSrvSummary(""); setSrvDescription(""); setSrvContent(""); setSrvPriceRange(""); setSrvTags(""); setSrvStatus("active")
    },
    onError: () => toast.error("Failed to save service"),
  })

  const updateService = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Omit<ServiceDTO, "id" | "createdAt" | "updatedAt">) => {
      const r = await fetch(`/api/services/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error("Failed to update service")
      return r.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["svc", "services"] })
      toast.success("Service updated")
      setOpenSrv(false); setEditingSrv(null)
    },
    onError: () => toast.error("Failed to update service"),
  })

  

  // Helpers to open dialogs for create/edit
  const openCreate = (type: typeof activeTab) => {
    if (type === "categories") { setEditingCat(null); setOpenCat(true) }
    if (type === "subcategories") { setEditingSub(null); setOpenSub(true) }
    if (type === "services") { setEditingSrv(null); setOpenSrv(true) }
  }

  const openEditCategory = (c: CategoryDTO) => { setEditingCat(c); setCatName(c.name); setCatSlug(c.slug); setCatDesc(c.description || ""); setOpenCat(true) }
  const openEditSubcategory = (s: SubcategoryDTO) => { setEditingSub(s); setSubCategoryId(s.categoryId); setSubName(s.name); setSubSlug(s.slug); setSubDesc(s.description || ""); setOpenSub(true) }
  const openEditService = (s: ServiceDTO) => { setEditingSrv(s); setSrvCategoryId(s.categoryId); setSrvSubcategoryId(s.subcategoryId); setSrvTitle(s.title); setSrvSlug(s.slug); setSrvSummary(s.summary || ""); setSrvDescription(s.description || ""); setSrvContent(s.content || ""); setSrvPriceRange(s.priceRange || ""); setSrvTags((s.tags || []).join(", ")); setSrvStatus(s.status) ; setOpenSrv(true) }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-1">Manage categories, subcategories, and services</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openCreate(activeTab)}>Add {activeTab === "categories" ? "Category" : activeTab === "subcategories" ? "Subcategory" : "Service"}</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {(["categories","subcategories","services"] as const).map(tab => (
              <button key={tab} className={`whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium ${activeTab===tab?"border-gray-900 text-gray-900":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`} onClick={()=>setActiveTab(tab)}>
                {tab.charAt(0).toUpperCase()+tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Lists under active tab */}
        {activeTab === "categories" && (
          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {(categories.data || []).map(c => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">/{c.slug}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={()=>openEditCategory(c)}>Edit</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {activeTab === "subcategories" && (
          <Card>
            <CardHeader><CardTitle>Subcategories</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {(subcategories.data || []).map(s => (
                  <li key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">/{s.slug}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={()=>openEditSubcategory(s)}>Edit</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {activeTab === "services" && (
          <Card>
            <CardHeader><CardTitle>Services</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {(services.data || []).map(s => (
                  <li key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500">/{s.slug}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={()=>openEditService(s)}>Edit</Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Separator />
      </div>

      {/* Category Dialog */}
      <Dialog open={openCat} onOpenChange={(o)=>{ setOpenCat(o); if (!o) { setEditingCat(null); setCatName(""); setCatSlug(""); setCatDesc("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCat?"Edit Category":"Add Category"}</DialogTitle>
            <DialogDescription>Define top-level grouping for services.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={catName} onChange={e=>setCatName(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={catSlug} onChange={e=>setCatSlug(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={catDesc} onChange={e=>setCatDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenCat(false)}>Cancel</Button>
            <Button onClick={()=> editingCat ? updateCategory.mutate({ id: editingCat.id, name: catName, slug: catSlug, description: catDesc }) : createCategory.mutate({ name: catName, slug: catSlug, description: catDesc })} disabled={createCategory.isPending || updateCategory.isPending}>
              {createCategory.isPending || updateCategory.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={openSub} onOpenChange={(o)=>{ setOpenSub(o); if (!o) { setEditingSub(null); setSubCategoryId(""); setSubName(""); setSubSlug(""); setSubDesc("") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSub?"Edit Subcategory":"Add Subcategory"}</DialogTitle>
            <DialogDescription>Group related services within a category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Category</Label>
              <select className="w-full border rounded px-3 py-2" value={subCategoryId} onChange={e=>setSubCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {(categories.data||[]).map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={subName} onChange={e=>setSubName(e.target.value)} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={subSlug} onChange={e=>setSubSlug(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={subDesc} onChange={e=>setSubDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenSub(false)}>Cancel</Button>
            <Button onClick={()=> editingSub ? updateSubcategory.mutate({ id: editingSub.id, categoryId: subCategoryId, name: subName, slug: subSlug, description: subDesc }) : createSubcategory.mutate({ categoryId: subCategoryId, name: subName, slug: subSlug, description: subDesc })} disabled={createSubcategory.isPending || updateSubcategory.isPending}>
              {createSubcategory.isPending || updateSubcategory.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Dialog */}
      <Dialog open={openSrv} onOpenChange={(o)=>{ setOpenSrv(o); if (!o) { setEditingSrv(null); setSrvCategoryId(""); setSrvSubcategoryId(""); setSrvTitle(""); setSrvSlug(""); setSrvSummary(""); setSrvDescription(""); setSrvContent(""); setSrvPriceRange(""); setSrvTags(""); setSrvStatus("active") } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSrv?"Edit Service":"Add Service"}</DialogTitle>
            <DialogDescription>Define a customer-facing service with details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <select className="w-full border rounded px-3 py-2" value={srvCategoryId} onChange={e=>setSrvCategoryId(e.target.value)}>
                  <option value="">Select category</option>
                  {(categories.data||[]).map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Subcategory</Label>
                <select className="w-full border rounded px-3 py-2" value={srvSubcategoryId} onChange={e=>setSrvSubcategoryId(e.target.value)}>
                  <option value="">Select subcategory</option>
                  {useMemo(()=> (subcategories.data||[]).filter(s=> s.categoryId === srvCategoryId), [subcategories.data, srvCategoryId]).map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Title</Label>
                <Input value={srvTitle} onChange={e=>setSrvTitle(e.target.value)} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={srvSlug} onChange={e=>setSrvSlug(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea value={srvSummary} onChange={e=>setSrvSummary(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={srvDescription} onChange={e=>setSrvDescription(e.target.value)} />
            </div>
            <div>
              <Label>Content (HTML)</Label>
              <Textarea value={srvContent} onChange={e=>setSrvContent(e.target.value)} className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Price Range</Label>
                <Input value={srvPriceRange} onChange={e=>setSrvPriceRange(e.target.value)} />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input value={srvTags} onChange={e=>setSrvTags(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <select className="w-full border rounded px-3 py-2" value={srvStatus} onChange={e=>setSrvStatus(e.target.value as "active"|"inactive")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setOpenSrv(false)}>Cancel</Button>
            <Button onClick={()=> editingSrv ? updateService.mutate({ id: editingSrv.id, categoryId: srvCategoryId, subcategoryId: srvSubcategoryId, title: srvTitle, slug: srvSlug, summary: srvSummary, description: srvDescription, content: srvContent, priceRange: srvPriceRange, tags: srvTags.split(",").map(t=>t.trim()).filter(Boolean), status: srvStatus }) : createService.mutate({ categoryId: srvCategoryId, subcategoryId: srvSubcategoryId, title: srvTitle, slug: srvSlug, summary: srvSummary, description: srvDescription, content: srvContent, priceRange: srvPriceRange, tags: srvTags.split(",").map(t=>t.trim()).filter(Boolean), status: srvStatus })} disabled={createService.isPending || updateService.isPending}>
              {createService.isPending || updateService.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


