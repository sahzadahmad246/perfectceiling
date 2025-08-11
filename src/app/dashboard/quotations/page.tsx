"use client";

import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, Thead, Trow, Th, Td } from "@/components/ui/table";

type Quotation = {
  id: string;
  customerName: string;
  type: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  total: number;
  customerPhone: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function QuotationsList() {
  const { data, isLoading, mutate } = useSWR<{ quotations: Quotation[] }>("/api/quotations", fetcher);
  const quotations = data?.quotations ?? [];

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    mutate();
  }

  async function remove(id: string) {
    if (!confirm("Delete this quotation?")) return;
    await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Quotations</h1>
        <Link href="/dashboard/quotations/new">
          <Button size="sm">New Quotation</Button>
        </Link>
      </div>
      <div className="rounded-lg border">
        <Table>
          <Thead>
            <Trow>
              <Th>Customer</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th className="text-right">Total</Th>
              <Th className="text-right">Actions</Th>
            </Trow>
          </Thead>
          <tbody>
            {isLoading ? (
              <Trow>
                <Td colSpan={5}>Loading...</Td>
              </Trow>
            ) : quotations.length === 0 ? (
              <Trow>
                <Td colSpan={5}>No quotations.</Td>
              </Trow>
            ) : (
              quotations.map((q) => (
                <Trow key={q.id}>
                  <Td>{q.customerName}</Td>
                  <Td>{q.type}</Td>
                  <Td>
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={q.status}
                      onChange={(e) => updateStatus(q.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </Td>
                  <td className="text-right">₹ {Number(q.total).toFixed(2)}</td>

                  <Td className="text-right space-x-2">
                    <a
                      className="underline text-blue-600"
                      href={`/api/quotations/${q.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </a>
                    <a
                      className="underline text-green-700"
                      href={`https://wa.me/${encodeURIComponent(
                        q.customerPhone
                      )}?text=${encodeURIComponent(
                        `Quotation link: ${window.location.origin}/api/quotations/${q.id}/pdf`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                    <button className="text-red-600" onClick={() => remove(q.id)}>
                      Delete
                    </button>
                  </Td>
                </Trow>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
