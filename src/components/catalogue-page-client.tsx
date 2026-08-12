"use client";

import { Images } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getCatalogueGroupById } from "@/app/admin/catalogue/actions";
import { CatalogueCard } from "@/components/catalogue-card";
import { CatalogueFormModal } from "@/components/catalogue-form-modal";
import { CataloguePageHeader } from "@/components/catalogue-page-header";
import { PageSpinner } from "@/components/page-spinner";
import { useAppRouter } from "@/hooks/use-app-router";
import type { CatalogueGroupItem } from "@/lib/catalogue";

type CataloguePageClientProps = {
  groups: CatalogueGroupItem[];
};

type ListParams = {
  create?: string;
  edit?: string;
};

type EditCache = {
  id: string;
  item: CatalogueGroupItem;
};

function buildCatalogueUrl({ create, edit }: ListParams) {
  const params = new URLSearchParams();

  if (create) {
    params.set("create", create);
  }

  if (edit) {
    params.set("edit", edit);
  }

  const query = params.toString();
  return query ? `/admin/catalogue?${query}` : "/admin/catalogue";
}

export function CataloguePageClient({ groups }: CataloguePageClientProps) {
  const router = useAppRouter();
  const searchParams = useSearchParams();
  const createParam = searchParams.get("create");
  const editId = searchParams.get("edit");

  const [editCache, setEditCache] = useState<EditCache | null>(null);

  const modalOpen = createParam === "1" || Boolean(editId);
  const editItem =
    editId && editCache?.id === editId ? editCache.item : null;
  const loadingEdit = Boolean(editId) && editCache?.id !== editId;

  const updateListParams = useCallback(
    (next: Partial<ListParams>) => {
      router.replace(
        buildCatalogueUrl({
          create: next.create,
          edit: next.edit,
        }),
        { scroll: false },
      );
    },
    [router],
  );

  useEffect(() => {
    if (!editId) {
      return;
    }

    let cancelled = false;

    getCatalogueGroupById(editId)
      .then((item) => {
        if (cancelled) {
          return;
        }

        if (item) {
          setEditCache({ id: editId, item });
        } else {
          setEditCache(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEditCache(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  function closeModal() {
    updateListParams({ create: undefined, edit: undefined });
  }

  function openCreateModal() {
    updateListParams({ create: "1", edit: undefined });
  }

  function openEditModal(id: string) {
    updateListParams({ create: undefined, edit: id });
  }

  function handleSaved() {
    router.refresh();
  }

  return (
    <>
      <CataloguePageHeader onAddImage={openCreateModal} />

      <section className="py-4">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-border-soft bg-surface-raised/60 px-5 py-10 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
              <Images size={19} />
            </div>
            <h2 className="mt-4 font-primary text-xl font-medium">
              No catalogue groups yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Add a group like “Moldings” with multiple design photos. Each
              photo can have its own subtitle.
            </p>
            <button
              className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
              onClick={openCreateModal}
              type="button"
            >
              Add first group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groups.map((item) => (
              <CatalogueCard
                item={item}
                key={item.id}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}
      </section>

      {loadingEdit ? (
        <div className="fixed inset-0 z-[9985] flex items-center justify-center bg-background/50">
          <PageSpinner label="Loading group..." />
        </div>
      ) : null}

      <CatalogueFormModal
        groupId={editId ?? undefined}
        initialItem={editId ? editItem : null}
        onClose={closeModal}
        onSaved={handleSaved}
        open={modalOpen && (!editId || Boolean(editItem))}
      />
    </>
  );
}
