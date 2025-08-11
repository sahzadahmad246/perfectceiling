"use client";
import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function TermsPage() {
  const { data, mutate } = useSWR("/api/terms", fetcher);
  const [form, setForm] = useState({ content: "" });

  async function add() {
    if (!form.content.trim()) return;
    await fetch("/api/terms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ content: "" });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Terms & Conditions</h1>
      <div className="flex gap-2">
        <Input className="flex-1" placeholder="Term content" value={form.content} onChange={(e) => setForm({ content: e.target.value })} />
        <Button onClick={add}>Add</Button>
      </div>
      <div className="space-y-2">
        {(data?.terms ?? []).map((t: any) => (
          <Card key={t.id} className="p-3">
            <CardContent className="p-0">
              <div className="text-sm text-gray-600">{t.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
