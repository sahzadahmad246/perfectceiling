"use client";

import { FileText, Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getQuotationEditData,
  type QuotationDefaults,
} from "@/app/admin/quotations/actions";
import { QuotationCard } from "@/components/quotation-card";
import { QuotationCreateModal } from "@/components/quotation-create-modal";
import {
  applyQuotationListFilter,
  QUOTATION_LIST_FILTERS,
  QUOTATION_LIST_PAGE_SIZE,
  type CreateQuotationInput,
  type QuotationListFilter,
  type QuotationListItem,
} from "@/lib/quotations";

type QuotationsPageClientProps = {
  quotations: QuotationListItem[];
  defaults: QuotationDefaults;
};

type QuotationsListParams = {
  q?: string;
  filter?: QuotationListFilter;
  create?: string;
  edit?: string;
};

function isListFilter(value: string | null): value is QuotationListFilter {
  return QUOTATION_LIST_FILTERS.some((option) => option.id === value);
}

function buildQuotationsUrl({
  q,
  filter = "all",
  create,
  edit,
}: QuotationsListParams) {
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

  const query = params.toString();

  return query ? `/admin/quotations?${query}` : "/admin/quotations";
}

function resolveListFilter(
  filterParam: string | null,
  legacyStatusParam: string | null,
  legacySortParam: string | null,
): QuotationListFilter {
  if (isListFilter(filterParam)) {
    return filterParam;
  }

  if (legacySortParam === "recent") {
    return "recent";
  }

  if (legacySortParam === "newest") {
    return "newest";
  }

  if (isListFilter(legacyStatusParam)) {
    return legacyStatusParam;
  }

  return "all";
}

export function QuotationsPageClient({
  quotations,
  defaults,
}: QuotationsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const urlQuery = searchParams.get("q") ?? "";
  const listFilter = resolveListFilter(
    searchParams.get("filter"),
    searchParams.get("status"),
    searchParams.get("sort"),
  );

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const modalOpen = createOpen || Boolean(editId);

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [applyingFilter, setApplyingFilter] = useState<QuotationListFilter | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(QUOTATION_LIST_PAGE_SIZE);
  const [editData, setEditData] = useState<CreateQuotationInput | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const isSearchPending = searchInput.trim() !== urlQuery.trim();
  const isFilterPending = applyingFilter !== null;

  const updateListParams = useCallback(
    (next: Partial<QuotationsListParams>) => {
      router.replace(
        buildQuotationsUrl({
          q: next.q ?? urlQuery,
          filter: next.filter ?? listFilter,
          create: next.create,
          edit: next.edit,
        }),
        { scroll: false },
      );
    },
    [listFilter, router, urlQuery],
  );

  const filteredQuotations = useMemo(
    () => applyQuotationListFilter(quotations, urlQuery, listFilter),
    [listFilter, quotations, urlQuery],
  );

  const visibleQuotations = useMemo(
    () => filteredQuotations.slice(0, visibleCount),
    [filteredQuotations, visibleCount],
  );

  const hasMore = visibleCount < filteredQuotations.length;

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setVisibleCount(QUOTATION_LIST_PAGE_SIZE);
  }, [urlQuery, listFilter]);

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
          setVisibleCount((current) => current + QUOTATION_LIST_PAGE_SIZE);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, filteredQuotations.length]);

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
          router.replace(buildQuotationsUrl({ q: urlQuery, filter: listFilter }));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingEdit(false);
          router.replace(buildQuotationsUrl({ q: urlQuery, filter: listFilter }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId, listFilter, router, urlQuery]);

  function closeModal() {
    router.replace(buildQuotationsUrl({ q: urlQuery, filter: listFilter }));
  }

  function handleEdit(id: string) {
    router.push(
      buildQuotationsUrl({
        q: urlQuery,
        filter: listFilter,
        edit: id,
      }),
    );
  }

  function handleFilterSelect(filter: QuotationListFilter) {
    if (filter === listFilter || isFilterPending) {
      return;
    }

    setApplyingFilter(filter);
    updateListParams({ filter });
  }

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
          placeholder="Search quotations..."
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
        {QUOTATION_LIST_FILTERS.map((option) => {
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
              : "Try a different search term or filter."}
          </p>
        </section>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleQuotations.map((quotation) => (
              <QuotationCard
                key={quotation.id}
                onEdit={handleEdit}
                quotation={quotation}
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