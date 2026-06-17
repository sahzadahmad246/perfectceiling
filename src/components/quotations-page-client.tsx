"use client";

import { FileText, Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  getQuotationEditData,
  type QuotationDefaults,
} from "@/app/admin/quotations/actions";
import { QuotationCard } from "@/components/quotation-card";
import { QuotationCreateModal } from "@/components/quotation-create-modal";
import type { CreateQuotationInput, QuotationListItem } from "@/lib/quotations";

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
  const [editData, setEditData] = useState<CreateQuotationInput | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const modalOpen = createOpen || Boolean(editId);

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

  useEffect(() => {
    if (!editId) {
      setEditData(null);
      setLoadingEdit(false);
      return;
    }

    let cancelled = false;

    setLoadingEdit(true);
    setEditData(null);

    getQuotationEditData(editId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setEditData(data);
        setLoadingEdit(false);

        if (!data) {
          router.replace("/admin/quotations");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingEdit(false);
          router.replace("/admin/quotations");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId, router]);

  function closeModal() {
    router.replace("/admin/quotations");
  }

  function handleEdit(id: string) {
    router.push(`/admin/quotations?edit=${id}`);
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
        <section className="mt-8 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
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
            <QuotationCard
              key={quotation.id}
              onEdit={handleEdit}
              quotation={quotation}
            />
          ))}
        </div>
      )}

      {modalOpen && editId && (loadingEdit || !editData) ? (
        <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-[560px] flex-col items-center justify-center border-x border-border-soft bg-surface">
            <Loader2 className="animate-spin text-muted" size={28} />
            <p className="mt-3 text-sm text-muted">Loading quotation...</p>
          </div>
        </div>
      ) : (
        <QuotationCreateModal
          defaults={defaults}
          initialData={editData ?? undefined}
          onClose={closeModal}
          open={modalOpen && (!editId || Boolean(editData))}
          quotationId={editId ?? undefined}
        />
      )}
    </>
  );
}