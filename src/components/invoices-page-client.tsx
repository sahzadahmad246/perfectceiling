"use client";

import { Loader2, ReceiptText, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useAppRouter } from "@/hooks/use-app-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getInvoiceDataFromQuotation,
  getInvoiceEditData,
  type InvoiceDefaults,
} from "@/app/admin/invoices/actions";
import { InvoiceCard } from "@/components/invoice-card";
import { InvoiceCreateModal } from "@/components/invoice-create-modal";
import { PageSpinner } from "@/components/page-spinner";
import {
  applyInvoiceListFilter,
  INVOICE_LIST_FILTERS,
  INVOICE_LIST_PAGE_SIZE,
  type CreateInvoiceInput,
  type InvoiceListFilter,
  type InvoiceListItem,
} from "@/lib/invoices";

type InvoicesPageClientProps = {
  invoices: InvoiceListItem[];
  defaults: InvoiceDefaults;
};

type InvoicesListParams = {
  q?: string;
  filter?: InvoiceListFilter;
  create?: string;
  edit?: string;
  fromQuote?: string;
};

function isListFilter(value: string | null): value is InvoiceListFilter {
  return INVOICE_LIST_FILTERS.some((option) => option.id === value);
}

function buildInvoicesUrl({
  q,
  filter = "all",
  create,
  edit,
  fromQuote,
}: InvoicesListParams) {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (filter !== "all") {
    params.set("filter", filter);
  }

  if (create) {
    params.set("create", create);
  }

  if (edit) {
    params.set("edit", edit);
  }

  if (fromQuote) {
    params.set("fromQuote", fromQuote);
  }

  const query = params.toString();

  return query ? `/admin/invoices?${query}` : "/admin/invoices";
}

export function InvoicesPageClient({
  invoices,
  defaults,
}: InvoicesPageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const urlQuery = searchParams.get("q") ?? "";
  const filterParam = searchParams.get("filter");
  const listFilter: InvoiceListFilter = isListFilter(filterParam)
    ? filterParam
    : searchParams.get("sort") === "recent"
      ? "recent"
      : "all";

  const createOpen = searchParams.get("create") === "1";
  const fromQuoteId = searchParams.get("fromQuote");
  const editId = searchParams.get("edit");
  const modalOpen = createOpen || Boolean(editId) || Boolean(fromQuoteId);

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [applyingFilter, setApplyingFilter] = useState<InvoiceListFilter | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(INVOICE_LIST_PAGE_SIZE);
  const [editData, setEditData] = useState<CreateInvoiceInput | null>(null);
  const [fromQuoteData, setFromQuoteData] = useState<CreateInvoiceInput | null>(
    null,
  );
  const [loadingModalData, setLoadingModalData] = useState(false);

  const isSearchPending = searchInput.trim() !== urlQuery.trim();
  const isFilterPending = applyingFilter !== null;

  const updateListParams = useCallback(
    (next: Partial<InvoicesListParams>) => {
      router.replace(
        buildInvoicesUrl({
          q: next.q ?? urlQuery,
          filter: next.filter ?? listFilter,
          create: next.create,
          edit: next.edit,
          fromQuote: next.fromQuote,
        }),
        { scroll: false },
      );
    },
    [listFilter, router, urlQuery],
  );

  const filteredInvoices = useMemo(
    () => applyInvoiceListFilter(invoices, urlQuery, listFilter),
    [invoices, listFilter, urlQuery],
  );

  const visibleInvoices = useMemo(
    () => filteredInvoices.slice(0, visibleCount),
    [filteredInvoices, visibleCount],
  );

  const hasMore = visibleCount < filteredInvoices.length;

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setVisibleCount(INVOICE_LIST_PAGE_SIZE);
  }, [listFilter, urlQuery]);

  useEffect(() => {
    if (applyingFilter === null || applyingFilter !== listFilter) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setApplyingFilter(null);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [applyingFilter, listFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = searchInput.trim();

      if (trimmed === urlQuery.trim()) {
        return;
      }

      updateListParams({ q: trimmed });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput, updateListParams, urlQuery]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => current + INVOICE_LIST_PAGE_SIZE);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [filteredInvoices.length, hasMore]);

  useEffect(() => {
    if (!editId && !fromQuoteId) {
      setEditData(null);
      setFromQuoteData(null);
      setLoadingModalData(false);
      return;
    }

    let cancelled = false;

    setLoadingModalData(true);
    setEditData(null);
    setFromQuoteData(null);

    const loadData = editId
      ? getInvoiceEditData(editId)
      : fromQuoteId
        ? getInvoiceDataFromQuotation(fromQuoteId)
        : Promise.resolve(null);

    loadData
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (editId) {
          setEditData(data);
        } else {
          setFromQuoteData(data);
        }

        setLoadingModalData(false);

        if (!data) {
          router.replace(buildInvoicesUrl({ q: urlQuery, filter: listFilter }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingModalData(false);
          router.replace(buildInvoicesUrl({ q: urlQuery, filter: listFilter }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId, fromQuoteId, listFilter, router, urlQuery]);

  function closeModal() {
    router.replace(buildInvoicesUrl({ q: urlQuery, filter: listFilter }));
  }

  function handleEdit(id: string) {
    router.push(
      buildInvoicesUrl({
        q: urlQuery,
        filter: listFilter,
        edit: id,
      }),
    );
  }

  function handleFilterSelect(filter: InvoiceListFilter) {
    if (filter === listFilter || isFilterPending) {
      return;
    }

    setApplyingFilter(filter);
    updateListParams({ filter });
  }

  const modalInitialData = editData ?? fromQuoteData ?? undefined;
  const modalReady =
    (createOpen && !editId && !fromQuoteId) ||
    (Boolean(editId) && Boolean(editData)) ||
    (Boolean(fromQuoteId) && Boolean(fromQuoteData));

  return (
    <>
      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
        <input
          aria-busy={isSearchPending}
          className="h-11 w-full rounded-full border border-border-strong bg-surface px-10 pr-10 text-sm outline-none transition focus:border-primary"
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search invoices..."
          type="search"
          value={searchInput}
        />
        {isSearchPending ? (
          <Loader2
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted"
          />
        ) : null}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {INVOICE_LIST_FILTERS.map((option) => {
          const isActive = listFilter === option.id;
          const isApplyingThisFilter = applyingFilter === option.id;

          return (
            <button
              aria-busy={isApplyingThisFilter}
              aria-label={option.label}
              className={`inline-flex h-7 shrink-0 items-center justify-center rounded-full border px-3.5 text-xs font-medium leading-none transition disabled:cursor-not-allowed disabled:opacity-70 ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-strong bg-surface text-muted hover:border-border-soft hover:text-foreground"
              }`}
              disabled={isFilterPending}
              key={option.id}
              onClick={() => handleFilterSelect(option.id)}
              type="button"
            >
              {isApplyingThisFilter ? (
                <Loader2 className="size-2.5 animate-spin" strokeWidth={2.5} />
              ) : (
                option.label
              )}
            </button>
          );
        })}
      </div>

      {filteredInvoices.length === 0 ? (
        <section className="mt-8 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
            <ReceiptText size={19} />
          </div>
          <h2 className="mt-5 text-xl font-medium">
            {invoices.length === 0 ? "No invoices yet" : "No matches found"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {invoices.length === 0
              ? "Tap Create in the bottom nav to add your first invoice."
              : "Try a different search term or filter."}
          </p>
        </section>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleInvoices.map((invoice) => (
              <InvoiceCard
                invoice={invoice}
                key={invoice.id}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {hasMore ? (
            <div
              aria-hidden
              className="flex items-center justify-center py-6"
              ref={sentinelRef}
            >
              <Loader2 className="animate-spin text-muted" size={20} />
            </div>
          ) : null}
        </>
      )}

      {modalOpen && (editId || fromQuoteId) && loadingModalData ? (
        <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-[560px] flex-col items-center justify-center border-x border-border-soft bg-surface">
            <PageSpinner label="Loading invoice..." />
          </div>
        </div>
      ) : (
        <InvoiceCreateModal
          defaults={defaults}
          initialData={modalInitialData}
          initialStep={fromQuoteId ? 3 : 1}
          invoiceId={editId ?? undefined}
          onClose={closeModal}
          open={modalOpen && modalReady}
          quotationId={fromQuoteId ?? undefined}
        />
      )}
    </>
  );
}