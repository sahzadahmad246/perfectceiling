"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function NewQuotation() {
  const router = useRouter();
  const [type, setType] = useState<"DETAILED" | "LUMPSUM">("DETAILED");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    items: [{ description: "", area: "", rate: "", total: "" }],
    subtotal: "0",
    discount: "0",
    total: "0",
    notes: "",
  });

  // Recalculate subtotal and total whenever items or discount change
  useEffect(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0
    );
    const discount = Number(form.discount) || 0;
    const total = subtotal - discount;
    setForm((prevForm) => ({
      ...prevForm,
      subtotal: subtotal.toString(),
      total: total.toString(),
    }));
  }, [form.items, form.discount]);

  function addItem() {
    setForm({
      ...form,
      items: [...form.items, { description: "", area: "", rate: "", total: "" }],
    });
  }

  function removeItem(index: number) {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  }

  function updateItem(index: number, field: string, value: string) {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (type === "DETAILED" && (field === "area" || field === "rate")) {
      const area = Number(newItems[index].area) || 0;
      const rate = Number(newItems[index].rate) || 0;
      newItems[index].total = (area * rate).toString();
    }

    setForm({ ...form, items: newItems });
  }

  async function create() {
    const formattedItems = form.items
      .filter((item) => item.description.trim())
      .map((item) => ({
        description: item.description,
        areaSqft: item.area ? Number(item.area) : null,
        ratePerSqft: item.rate ? Number(item.rate) : null,
        quantity: 1,
        amount: Number(item.total) || 0,
      }));

    const response = await fetch("/api/quotations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress || null,
        items: formattedItems,
        discountAmount: Number(form.discount) || 0,
        notes: form.notes || null,
      }),
    });

    if (response.ok) {
      toast.success("Quotation created successfully!");
      router.push("/dashboard/quotations");
    } else {
      const data = await response.json();
      const errors = data.error?.fieldErrors ?? data.error?.formErrors ?? null;

      if (errors) {
        // Show validation errors with sonner toast
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          } else {
            toast.error(`${field}: ${messages}`);
          }
        });
      } else {
        toast.error("Failed to create quotation");
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and type toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Quotation</h1>
        <div className="flex gap-2">
          <Button
            variant={type === "DETAILED" ? "default" : "outline"}
            onClick={() => setType("DETAILED")}
          >
            Detailed
          </Button>
          <Button
            variant={type === "LUMPSUM" ? "default" : "outline"}
            onClick={() => setType("LUMPSUM")}
          >
            Lump Sum
          </Button>
        </div>
      </div>

      {/* Customer Details Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle>Customer Details</CardTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              placeholder="Customer Name"
              value={form.customerName}
              onChange={(e) =>
                setForm({ ...form, customerName: e.target.value })
              }
            />
            <Input
              placeholder="Phone Number"
              value={form.customerPhone}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
            />
          </div>
          <Input
            placeholder="Address"
            value={form.customerAddress}
            onChange={(e) =>
              setForm({ ...form, customerAddress: e.target.value })
            }
          />
        </CardContent>
      </Card>

      {/* Work Items Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>Work Items</CardTitle>
            <Button onClick={addItem}>Add Item</Button>
          </div>
          {form.items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-4 gap-4 items-end">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
              {type === "DETAILED" && (
                <>
                  <Input
                    placeholder="Area (sq ft)"
                    value={item.area}
                    onChange={(e) => updateItem(index, "area", e.target.value)}
                  />
                  <Input
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", e.target.value)}
                  />
                </>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Total"
                  value={item.total}
                  onChange={(e) => updateItem(index, "total", e.target.value)}
                />
                <Button variant="destructive" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <CardTitle>Summary</CardTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtotal
              </label>
              <Input
                value={form.subtotal}
                onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount
              </label>
              <Input
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total
              </label>
              <Input value={form.total} readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={create} className="w-full">
            Create Quotation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
