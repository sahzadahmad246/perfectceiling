"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

type Testimonial = {
  id: string
  authorName: string
  message: string
  subcategoryId: string
  status: "published" | "hidden"
}

type Subcategory = { id: string; name: string; slug: string; categoryId: string }

export default function AdminTestimonialsClient() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<{ id?: string; authorName: string; message: string; subcategoryId: string; status: "published" | "hidden" }>({ authorName: "", message: "", subcategoryId: "", status: "published" })

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const [tRes, sRes] = await Promise.all([
          fetch("/api/testimonials?status=published"),
          fetch("/api/services/subcategories"),
        ])
        const [t, s] = await Promise.all([tRes.json(), sRes.json()])
        setItems(t)
        setSubcategories(s)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const subcategoryMap = useMemo(() => new Map(subcategories.map((s) => [s.id, s])), [subcategories])

  async function handleSubmit() {
    const method = form.id ? "PUT" : "POST"
    const url = form.id ? `/api/testimonials/${form.id}` : "/api/testimonials"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: form.authorName,
        message: form.message,
        subcategoryId: form.subcategoryId,
        status: form.status,
      }),
    })
    if (res.ok) {
      const list = await fetch("/api/testimonials?status=published").then((r) => r.json())
      setItems(list)
      setForm({ authorName: "", message: "", subcategoryId: "", status: "published" })
      setFormOpen(false)
    }
  }

  async function handleEdit(item: Testimonial) {
    setForm({ ...item })
    setFormOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-2">Manage customer testimonials and reviews</p>
          <div className="mt-4">
            <Button onClick={() => { setForm({ authorName: "", message: "", subcategoryId: "", status: "published" }); setFormOpen(true) }}>Add Testimonial</Button>
          </div>
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Author Name</label>
                <Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subcategory</label>
                <Select value={form.subcategoryId} onValueChange={(v) => setForm((f) => ({ ...f, subcategoryId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea rows={4} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={(v: "published" | "hidden") => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{form.id ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="bg-white border rounded-xl">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Existing Testimonials</h3>
          </div>
          <div className="divide-y">
            {items.map((it) => (
              <div key={it.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{it.authorName}</div>
                  <div className="text-sm text-gray-600">{it.message}</div>
                  <div className="text-xs text-gray-500 mt-1">Subcategory: {subcategoryMap.get(it.subcategoryId)?.name || it.subcategoryId}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEdit(it)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(it.id)}>Delete</Button>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="px-6 py-8 text-gray-500">No testimonials yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}


