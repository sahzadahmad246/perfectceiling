"use client";

import { Images, Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import {
  deleteCatalogueImage,
  getCatalogueImageById,
} from "@/app/admin/catalogue/actions";
import { CatalogueDetailHeader } from "@/components/catalogue-detail-header";
import { CatalogueFormModal } from "@/components/catalogue-form-modal";
import { ImageLightbox } from "@/components/image-lightbox";
import { ShareButton } from "@/components/share-button";
import { useAppRouter } from "@/hooks/use-app-router";
import {
  getCatalogueAltText,
  getCatalogueDisplayTitle,
  type CatalogueImageItem,
} from "@/lib/catalogue";
import { getCataloguePageUrl } from "@/lib/catalogue-seo";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

type CatalogueDetailViewProps = {
  item: CatalogueImageItem;
};

function DetailRow({
  label,
  value,
  empty = "—",
}: {
  label: string;
  value: string | null | undefined;
  empty?: string;
}) {
  const display = value?.trim() ? value.trim() : empty;

  return (
    <div className="border-b border-border-soft py-3 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm leading-6 whitespace-pre-wrap text-foreground">
        {display}
      </p>
    </div>
  );
}

export function CatalogueDetailView({ item }: CatalogueDetailViewProps) {
  const router = useAppRouter();
  const [current, setCurrent] = useState(item);
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayTitle = getCatalogueDisplayTitle(current);
  const altText = getCatalogueAltText(current);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCatalogueImage(current.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Image deleted.");
      setConfirmOpen(false);
      router.push("/admin/catalogue");
      router.refresh();
    });
  }

  async function handleSaved() {
    setEditOpen(false);
    const fresh = await getCatalogueImageById(current.id);

    if (fresh) {
      setCurrent(fresh);
    }

    router.refresh();
  }

  return (
    <>
      <CatalogueDetailHeader
        caption={displayTitle}
        publicUrl={getCataloguePageUrl(current.id)}
      />

      <section className="py-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80">
          <button
            className="relative block aspect-[4/3] w-full cursor-zoom-in bg-surface-muted text-left"
            onClick={() => {
              if (current.imageUrl) {
                setLightboxOpen(true);
              }
            }}
            type="button"
          >
            {current.imageUrl ? (
              <Image
                alt={altText}
                className="object-cover"
                fill
                priority
                sizes="560px"
                src={current.imageUrl}
                title={displayTitle}
                unoptimized={current.imageUrl.startsWith("http")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                <Images size={32} strokeWidth={1.75} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-4 pt-12">
              <p className="text-base font-medium leading-snug text-white">
                {current.caption}
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center gap-2 border-b border-border-soft px-4 py-3">
            <span
              className={
                current.published
                  ? "rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700"
                  : "rounded-full border border-border-soft px-2.5 py-0.5 text-[11px] font-medium text-muted"
              }
            >
              {current.published ? "Published" : "Draft"}
            </span>
            <span className="rounded-full border border-border-soft px-2.5 py-0.5 text-[11px] font-medium text-muted">
              Order {current.sortOrder}
            </span>
          </div>

          <div className="px-4">
            <DetailRow label="Caption" value={current.caption} />
            <DetailRow
              empty="Same as caption"
              label="Alt text"
              value={current.altText}
            />
            <DetailRow
              empty="Not set"
              label="SEO description"
              value={current.seoDescription}
            />
            <DetailRow
              label="Display order"
              value={String(current.sortOrder)}
            />
            <DetailRow
              label="Status"
              value={
                current.published ? "Live on homepage" : "Hidden (draft)"
              }
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ShareButton
            className="w-full px-3"
            label="Share"
            text={
              current.seoDescription?.trim() ||
              current.caption ||
              "Ceiling design from Perfect Ceiling"
            }
            title={displayTitle}
            url={getCataloguePageUrl(current.id)}
          />
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-strong text-sm font-medium transition hover:border-primary"
            onClick={() => setEditOpen(true)}
            type="button"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 text-sm font-medium text-red-700 transition hover:border-red-300"
            onClick={() => setConfirmOpen(true)}
            type="button"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </section>

      <CatalogueFormModal
        imageId={current.id}
        initialItem={current}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
        open={editOpen}
      />

      {current.imageUrl ? (
        <ImageLightbox
          alt={altText}
          onClose={() => setLightboxOpen(false)}
          open={lightboxOpen}
          src={current.imageUrl}
        />
      ) : null}

      {confirmOpen
        ? createPortal(
            <div className={confirmOverlayClass}>
              <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-surface-raised p-5 shadow-popover">
                <h3 className="font-primary text-lg font-medium">
                  Delete image?
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This removes “{current.caption}” from the catalogue and
                  homepage.
                </p>
                <div className="mt-5 flex gap-2">
                  <button
                    className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
                    disabled={isPending}
                    onClick={() => setConfirmOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-medium text-white disabled:opacity-70"
                    disabled={isPending}
                    onClick={handleDelete}
                    type="button"
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : null}
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
