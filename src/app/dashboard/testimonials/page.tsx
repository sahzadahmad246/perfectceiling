"use client";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TestimonialsPage() {
  const { data, mutate } = useSWR("/api/testimonials", fetcher);
  const [form, setForm] = useState({ authorName: "", content: "" });

  async function add() {
    if (!form.authorName.trim() || !form.content.trim()) return;
    await fetch("/api/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ authorName: "", content: "" });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Testimonials</h1>
      <div className="flex gap-2">
        <Input placeholder="Author Name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
        <Input className="flex-1" placeholder="Testimonial Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <Button onClick={add}>Add</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {(data?.testimonials ?? []).map((t: any) => (
          <Card key={t.id} className="p-3 flex items-start justify-between gap-3">
            <CardContent className="p-0">
              <CardTitle>{t.authorName}</CardTitle>
              <div className="text-sm text-gray-600 mt-1">{t.content}</div>
            </CardContent>
            <Button variant="destructive" onClick={() => remove(t.id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
