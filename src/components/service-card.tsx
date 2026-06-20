"use client";

import { Hammer, Link2, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { deleteService } from "@/app/admin/services/actions";
import {
  formatServiceRate,
  getServicePublicPath,
  type ServiceListItem,
} from "@/lib/services";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const menuDropdownClass =
  "animate-menu-pop fixed z-[9990] w-44 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover";

type MenuPosition = {
  top?: number;
  bottom?: number;
  right: number;
};

type ServiceCardProps = {
  service: ServiceListItem;
  onEdit: (id: string) => void;
};

export function ServiceCard({ service, onEdit }: ServiceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function updateMenuPosition() {
    const button = buttonRef.current;

    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const menuHeight = 160;
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
      const result = await deleteService(service.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Service deleted.");
      setConfirmOpen(false);
      setMenuOpen(false);
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
                onEdit(service.id);
              }}
              type="button"
            >
              <Pencil size={15} />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-700 transition hover:bg-surface-muted disabled:opacity-70"
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

  const confirmDialog = confirmOpen
    ? createPortal(
        <div className={confirmOverlayClass}>
          <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-surface-raised p-5 shadow-popover">
            <h3 className="font-primary text-lg font-medium">Delete service?</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {service.title} will be removed from admin and the public website.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-border-strong px-4 text-sm font-medium"
                disabled={isPending}
                onClick={() => setConfirmOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-70"
                disabled={isPending}
                onClick={handleDelete}
                type="button"
              >
                {isPending ? <Loader2 className="animate-spin" size={14} /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <article className="flex overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition hover:border-border-strong">
        <div className="relative w-[6.25rem] shrink-0 self-stretch bg-surface-muted">
          {service.imageUrl ? (
            <Image
              alt={service.title}
              className="object-cover"
              fill
              sizes="100px"
              src={service.imageUrl}
              unoptimized={service.imageUrl.startsWith("http")}
            />
          ) : (
            <div className="flex h-full min-h-[6.25rem] items-center justify-center text-muted">
              <Hammer size={22} strokeWidth={1.75} />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 flex-1 truncate font-primary text-base font-medium text-foreground">
                {service.title}
              </h3>

              <button
                aria-expanded={menuOpen}
                aria-label={`Actions for ${service.title}`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground"
                onClick={() => setMenuOpen((current) => !current)}
                ref={buttonRef}
                type="button"
              >
                <MoreVertical size={17} />
              </button>
            </div>

            <p className="mt-1 line-clamp-1 text-sm leading-5 text-muted">
              {service.shortDescription}
            </p>

            <p className="mt-2 text-sm font-medium text-foreground">
              {formatServiceRate(service.startingPrice, service.rateUnit)}
            </p>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <p className="inline-flex min-w-0 flex-1 items-center gap-1 text-xs text-muted">
              <Link2 className="shrink-0" size={12} />
              <span className="truncate">{getServicePublicPath(service.slug)}</span>
            </p>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                service.published
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-border-strong bg-surface-muted text-muted"
              }`}
            >
              {service.published ? "Live" : "Draft"}
            </span>
          </div>
        </div>
      </article>

      {menu}
      {confirmDialog}
    </>
  );
}