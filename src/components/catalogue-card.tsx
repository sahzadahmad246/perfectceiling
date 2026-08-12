"use client";

import { Images, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { deleteCatalogueGroup } from "@/app/admin/catalogue/actions";
import { useAppRouter } from "@/hooks/use-app-router";
import { getCatalogueAdminPath } from "@/lib/admin-nav";
import {
  getCatalogueDisplayTitle,
  getCatalogueImageAlt,
  getCataloguePreviewImage,
  type CatalogueGroupItem,
} from "@/lib/catalogue";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const menuDropdownClass =
  "animate-menu-pop fixed z-[9990] w-44 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover";

type MenuPosition = {
  top?: number;
  bottom?: number;
  right: number;
};

type CatalogueCardProps = {
  item: CatalogueGroupItem;
  onEdit: (id: string) => void;
};

export function CatalogueCard({ item, onEdit }: CatalogueCardProps) {
  const router = useAppRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayTitle = getCatalogueDisplayTitle(item);
  const preview = getCataloguePreviewImage(item);
  const altText = getCatalogueImageAlt(
    { subtitle: preview?.subtitle },
    displayTitle,
  );
  const detailHref = getCatalogueAdminPath(item.id);
  const imageCount = item.images.length;

  function updateMenuPosition() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuHeight = 120;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < menuHeight + 8;

    setMenuPosition({
      right: window.innerWidth - rect.right,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    updateMenuPosition();

    function onPointerDown(event: PointerEvent) {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function onResize() {
      updateMenuPosition();
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menuOpen]);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCatalogueGroup(item.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Group deleted.");
      setConfirmOpen(false);
      setMenuOpen(false);
      router.refresh();
    });
  }

  const menu =
    menuOpen && menuPosition
      ? createPortal(
          <div
            className={menuDropdownClass}
            ref={menuRef}
            style={{
              right: menuPosition.right,
              top: menuPosition.top,
              bottom: menuPosition.bottom,
            }}
          >
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-surface-muted disabled:opacity-70"
              disabled={isPending}
              onClick={() => {
                setMenuOpen(false);
                onEdit(item.id);
              }}
              type="button"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-surface-muted disabled:opacity-70"
              disabled={isPending}
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              type="button"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition hover:border-border-strong">
        <Link className="block" href={detailHref}>
          <div className="relative aspect-[4/3] bg-surface-muted">
            {preview?.imageUrl ? (
              <Image
                alt={altText}
                className="object-cover"
                fill
                loading="eager"
                priority
                sizes="280px"
                src={preview.imageUrl}
                title={displayTitle}
                unoptimized={preview.imageUrl.startsWith("http")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                <Images size={28} strokeWidth={1.75} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-3 pt-10">
              <p className="line-clamp-2 text-sm font-medium text-white">
                {displayTitle}
              </p>
              {imageCount > 0 ? (
                <p className="mt-1 text-xs text-white/80">
                  {imageCount} {imageCount === 1 ? "photo" : "photos"}
                </p>
              ) : null}
            </div>
          </div>
        </Link>

        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <span
            className={
              item.published
                ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
                : "rounded-full border border-border-soft px-2 py-0.5 text-[11px] font-medium text-muted"
            }
          >
            {item.published ? "Published" : "Draft"}
          </span>

          <button
            aria-label="Catalogue group actions"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
            onClick={() => setMenuOpen((open) => !open)}
            ref={buttonRef}
            type="button"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </article>

      {menu}

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
