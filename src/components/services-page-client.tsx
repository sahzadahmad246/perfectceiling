"use client";

import { Hammer, Loader2, Plus, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getServiceById } from "@/app/admin/services/actions";
import { useAppRouter } from "@/hooks/use-app-router";
import { PageSpinner } from "@/components/page-spinner";
import { ServiceCard } from "@/components/service-card";
import { ServiceFormModal } from "@/components/service-form-modal";
import {
  applyServiceSearch,
  serviceDetailToForm,
  type ServiceFormInput,
  type ServiceListItem,
} from "@/lib/services";

type ServicesPageClientProps = {
  services: ServiceListItem[];
};

type ServicesListParams = {
  q?: string;
  create?: string;
  edit?: string;
};

function buildServicesUrl({ q, create, edit }: ServicesListParams) {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (create) {
    params.set("create", create);
  }

  if (edit) {
    params.set("edit", edit);
  }

  const query = params.toString();

  return query ? `/admin/services?${query}` : "/admin/services";
}

export function ServicesPageClient({ services }: ServicesPageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const createParam = searchParams.get("create");
  const editId = searchParams.get("edit");

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [editData, setEditData] = useState<ServiceFormInput | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const modalOpen = createParam === "1" || Boolean(editId);
  const isSearchPending = searchInput.trim() !== urlQuery.trim();

  const updateListParams = useCallback(
    (next: Partial<ServicesListParams>) => {
      router.replace(
        buildServicesUrl({
          q: next.q ?? urlQuery,
          create: next.create,
          edit: next.edit,
        }),
        { scroll: false },
      );
    },
    [router, urlQuery],
  );

  const filteredServices = useMemo(
    () => applyServiceSearch(services, urlQuery),
    [services, urlQuery],
  );

  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput.trim() !== urlQuery.trim()) {
        updateListParams({ q: searchInput });
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchInput, updateListParams, urlQuery]);

  useEffect(() => {
    if (!editId) {
      setEditData(null);
      setLoadingEdit(false);
      return;
    }

    let cancelled = false;
    setLoadingEdit(true);

    getServiceById(editId)
      .then((service) => {
        if (cancelled) {
          return;
        }

        setEditData(service ? serviceDetailToForm(service) : null);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingEdit(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  function openCreateModal() {
    updateListParams({ create: "1", edit: undefined });
  }

  function openEditModal(id: string) {
    updateListParams({ edit: id, create: undefined });
  }

  function closeModal() {
    updateListParams({ create: undefined, edit: undefined });
    setEditData(null);
    router.refresh();
  }

  return (
    <>
      <section className="mt-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Services</p>
          <h2 className="mt-2 text-2xl font-medium">Manage service pages</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Add SEO-ready services with pricing guidance. Public pages will use
            these later.
          </p>
        </div>
        <button
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-hover"
          onClick={openCreateModal}
          type="button"
        >
          <Plus size={18} />
        </button>
      </section>

      <div className="relative mt-5">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={16}
        />
        <input
          aria-busy={isSearchPending}
          className="h-11 w-full rounded-full border border-border-strong bg-surface px-10 pr-10 text-sm outline-none transition focus:border-primary"
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search services..."
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

      {filteredServices.length === 0 ? (
        <section className="mt-8 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
            <Hammer size={19} />
          </div>
          <h3 className="mt-5 text-xl font-medium">
            {services.length === 0 ? "No services yet" : "No matches found"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            {services.length === 0
              ? "Tap the plus button to add your first SEO service page."
              : "Try a different search term."}
          </p>
        </section>
      ) : (
        <div className="mt-5 space-y-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              onEdit={openEditModal}
              service={service}
            />
          ))}
        </div>
      )}

      {modalOpen && editId && (loadingEdit || !editData) ? (
        <div className="fixed inset-0 z-[9990] flex justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-[560px] flex-col items-center justify-center border-x border-border-soft bg-surface">
            <PageSpinner label="Loading service..." />
          </div>
        </div>
      ) : (
        <ServiceFormModal
          initialData={editData ?? undefined}
          onClose={closeModal}
          onSaved={() => router.refresh()}
          open={modalOpen && (!editId || Boolean(editData))}
          serviceId={editId ?? undefined}
        />
      )}
    </>
  );
}