"use client";

import { Loader2, Search, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppRouter } from "@/hooks/use-app-router";
import { CustomerCard } from "@/components/customer-card";
import {
  applyCustomerListFilter,
  CUSTOMER_LIST_FILTERS,
  CUSTOMER_LIST_PAGE_SIZE,
  type CustomerListFilter,
  type CustomerListItem,
} from "@/lib/customers";

type CustomersPageClientProps = {
  customers: CustomerListItem[];
};

type CustomersListParams = {
  q?: string;
  filter?: CustomerListFilter;
};

function isListFilter(value: string | null): value is CustomerListFilter {
  return CUSTOMER_LIST_FILTERS.some((option) => option.id === value);
}

function buildCustomersUrl({ q, filter = "all" }: CustomersListParams) {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (filter !== "all") {
    params.set("filter", filter);
  }

  const query = params.toString();

  return query ? `/admin/customers?${query}` : "/admin/customers";
}

export function CustomersPageClient({ customers }: CustomersPageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const urlQuery = searchParams.get("q") ?? "";
  const filterParam = searchParams.get("filter");
  const listFilter: CustomerListFilter = isListFilter(filterParam)
    ? filterParam
    : "all";

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [applyingFilter, setApplyingFilter] = useState<CustomerListFilter | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(CUSTOMER_LIST_PAGE_SIZE);

  const isSearchPending = searchInput.trim() !== urlQuery.trim();
  const isFilterPending = applyingFilter !== null;

  const updateListParams = useCallback(
    (next: Partial<CustomersListParams>) => {
      router.replace(
        buildCustomersUrl({
          q: next.q ?? urlQuery,
          filter: next.filter ?? listFilter,
        }),
        { scroll: false },
      );
    },
    [listFilter, router, urlQuery],
  );

  const filteredCustomers = useMemo(
    () => applyCustomerListFilter(customers, urlQuery, listFilter),
    [customers, listFilter, urlQuery],
  );

  const visibleCustomers = useMemo(
    () => filteredCustomers.slice(0, visibleCount),
    [filteredCustomers, visibleCount],
  );

  const hasMore = visibleCount < filteredCustomers.length;

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    setVisibleCount(CUSTOMER_LIST_PAGE_SIZE);
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
          setVisibleCount((current) => current + CUSTOMER_LIST_PAGE_SIZE);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [filteredCustomers.length, hasMore]);

  function handleFilterSelect(filter: CustomerListFilter) {
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
          placeholder="Search customers..."
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
        {CUSTOMER_LIST_FILTERS.map((option) => {
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

      {filteredCustomers.length === 0 ? (
        <section className="mt-8 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
            <Users size={19} />
          </div>
          <h2 className="mt-5 text-xl font-medium">
            {customers.length === 0 ? "No customers yet" : "No matches found"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {customers.length === 0
              ? "Customers appear here automatically when you create quotations with a mobile number."
              : "Try a different search term or filter."}
          </p>
        </section>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleCustomers.map((customer) => (
              <CustomerCard customer={customer} key={customer.phoneKey} />
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
    </>
  );
}