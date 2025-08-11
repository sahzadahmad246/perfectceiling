"use client";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ServicesPage() {
  const { data, mutate } = useSWR("/api/services", fetcher);
  const [form, setForm] = useState({ title: "", description: "" });

  async function add() {
    if (!form.title.trim()) return;
    await fetch("/api/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", description: "" });
    mutate();
  }

  async function remove(id: string) {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Services</h1>
      <div className="flex gap-2">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input className="flex-1" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Button onClick={add}>Add</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {(data?.services ?? []).map((s: any) => (
          <Card key={s.id} className="p-3 flex items-start justify-between gap-3">
            <CardContent className="p-0">
              <CardTitle>{s.title}</CardTitle>
              {s.description && <div className="text-sm text-gray-600 mt-1">{s.description}</div>}
            </CardContent>
            <Button variant="destructive" onClick={() => remove(s.id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
