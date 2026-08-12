"use client";

import { Images, Loader2, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import {
  deleteCatalogueGroup,
  getCatalogueGroupById,
} from "@/app/admin/catalogue/actions";
import { CatalogueDetailHeader } from "@/components/catalogue-detail-header";
import { CatalogueFormModal } from "@/components/catalogue-form-modal";
import { ImageLightbox } from "@/components/image-lightbox";
import { ShareButton } from "@/components/share-button";
import { useAppRouter } from "@/hooks/use-app-router";
import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  type CatalogueGroupItem,
} from "@/lib/catalogue";
import {
  getCatalogueImageShareUrl,
  getCataloguePageUrl,
} from "@/lib/catalogue-seo";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

type CatalogueDetailViewProps = {
  item: CatalogueGroupItem;
};

export function CatalogueDetailView({ item }: CatalogueDetailViewProps) {
  const router = useAppRouter();
  const [current, setCurrent] = useState(item);
  const [editOpen, setEditOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayTitle = getCatalogueDisplayTitle(current);
  const lightboxImage =
    lightboxIndex !== null ? current.images[lightboxIndex] : null;
  const publicUrl = getCataloguePageUrl(current.id);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCatalogueGroup(current.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Group deleted.");
      setConfirmOpen(false);
      router.push("/admin/catalogue");
      router.refresh();
    });
  }

  async function handleSaved() {
    setEditOpen(false);
    const fresh = await getCatalogueGroupById(current.id);

    if (fresh) {
      setCurrent(fresh);
    }

    router.refresh();
  }

  return (
    <>
      <CatalogueDetailHeader
        caption={displayTitle}
        publicUrl={publicUrl}
      />

      <section className="py-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80">
          <div className="border-b border-border-soft px-4 py-4">
            {current.description?.trim() ? (
              <p className="text-sm leading-6 text-muted">
                {current.description}
              </p>
            ) : null}
            <div
              className={
                current.description?.trim()
                  ? "mt-3 flex flex-wrap items-center gap-2"
                  : "flex flex-wrap items-center gap-2"
              }
            >
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
              <span className="rounded-full border border-border-soft px-2.5 py-0.5 text-[11px] font-medium text-muted">
                {current.images.length}{" "}
                {current.images.length === 1 ? "photo" : "photos"}
              </span>
            </div>
          </div>

          {current.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
              {current.images.map((image, index) => {
                const alt = getCatalogueImageAlt(image, displayTitle);

                return (
                  <button
                    className="relative aspect-square overflow-hidden rounded-xl border border-border-soft bg-surface-muted text-left transition hover:border-border-strong"
                    key={image.id}
                    onClick={() => setLightboxIndex(index)}
                    type="button"
                  >
                    <Image
                      alt={alt}
                      className="object-cover"
                      fill
                      loading="eager"
                      priority={index === 0}
                      sizes="180px"
                      src={image.imageUrl}
                      unoptimized={image.imageUrl.startsWith("http")}
                    />
                    {image.isThumbnail ? (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                        Thumbnail
                      </span>
                    ) : null}
                    {image.subtitle?.trim() ? (
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-6">
                        <span className="line-clamp-2 text-[11px] font-medium text-white">
                          {image.subtitle}
                        </span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-muted">
              <Images size={32} strokeWidth={1.75} />
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ShareButton
            className="w-full px-3"
            label="Share all"
            text={
              current.description?.trim() ||
              current.title ||
              "Ceiling design from Perfect Ceiling"
            }
            title={displayTitle}
            url={publicUrl}
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
        groupId={current.id}
        initialItem={current}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
        open={editOpen}
      />

      {lightboxImage ? (
        <ImageLightbox
          alt={getCatalogueImageAlt(lightboxImage, displayTitle)}
          caption={lightboxImage.subtitle}
          downloadName={lightboxImage.subtitle?.trim() || displayTitle}
          onClose={() => setLightboxIndex(null)}
          open={lightboxIndex !== null}
          share={{
            title: lightboxImage.subtitle?.trim() || displayTitle,
            text:
              lightboxImage.subtitle?.trim()
                ? `${lightboxImage.subtitle.trim()} — ${displayTitle}`
                : displayTitle,
            url: getCatalogueImageShareUrl(current.id, lightboxImage.id),
          }}
          src={lightboxImage.imageUrl}
        />
      ) : null}

      {confirmOpen
        ? createPortal(
            <div className={confirmOverlayClass}>
              <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-surface-raised p-5 shadow-popover">
                <h3 className="font-primary text-lg font-medium">
                  Delete group?
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This removes “{displayTitle}” and all of its photos from the
                  catalogue.
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
