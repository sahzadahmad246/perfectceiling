"use client";

import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import type { QuotationDefaults } from "@/app/admin/quotations/actions";
import { QuotationCreateModal } from "@/components/quotation-create-modal";
import { formatCurrency, type QuotationListItem } from "@/lib/quotations";

type QuotationsPageClientProps = {
  quotations: QuotationListItem[];
  defaults: QuotationDefaults;
};

export function QuotationsPageClient({
  quotations,
  defaults,
}: QuotationsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const createOpen = searchParams.get("create") === "1";

  const filteredQuotations = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return quotations;
    }

    return quotations.filter((quotation) => {
      const haystack = [
        quotation.quotationNumber,
        quotation.customerName,
        quotation.customerPhone,
        quotation.workTitle ?? "",
        quotation.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query, quotations]);

  function closeCreateModal() {
    router.replace("/admin/quotations");
  }

  return (
    <>
      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
        <input
          className="h-11 w-full rounded-full border border-border-strong bg-surface px-10 text-sm outline-none transition focus:border-primary"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search quotations..."
          type="search"
          value={query}
        />
      </div>

      {filteredQuotations.length === 0 ? (
        <section className="mt-8 rounded-md border border-border-soft bg-surface-raised/60 p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
            <FileText size={19} />
          </div>
          <h2 className="mt-5 text-xl font-medium">
            {quotations.length === 0 ? "No quotations yet" : "No matches found"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {quotations.length === 0
              ? "Tap Create in the bottom nav to add your first quotation."
              : "Try a different search term."}
          </p>
        </section>
      ) : (
        <div className="mt-5 space-y-3">
          {filteredQuotations.map((quotation) => (
            <Link
              className="block rounded-md border border-border-soft bg-surface-raised/60 p-4 transition hover:border-border-strong"
              href={`/admin/quotations/${quotation.id}`}
              key={quotation.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {quotation.quotationNumber}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {quotation.customerName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-border-soft px-2.5 py-1 text-[11px] font-medium capitalize text-muted">
                  {quotation.status}
                </span>
              </div>
              {quotation.workTitle ? (
                <p className="mt-3 text-sm text-foreground">
                  {quotation.workTitle}
                </p>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted">{quotation.date}</span>
                <span className="font-medium">
                  {formatCurrency(quotation.grandTotal)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <QuotationCreateModal
        defaults={defaults}
        onClose={closeCreateModal}
        open={createOpen}
      />
    </>
  );
}