"use client";

import { FolderKanban, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { deleteProject } from "@/app/admin/projects/actions";
import {
  getProjectPublicPath,
  getProjectStatusLabel,
  type ProjectListItem,
} from "@/lib/projects";
import Link from "next/link";

const confirmOverlayClass =
  "fixed inset-0 z-[9980] flex items-center justify-center bg-primary/45 p-4 backdrop-blur-sm";

const menuDropdownClass =
  "animate-menu-pop fixed z-[9990] w-44 rounded-xl border border-border-soft bg-surface-raised p-1.5 shadow-popover";

type MenuPosition = {
  top?: number;
  bottom?: number;
  right: number;
};

type ProjectCardProps = {
  project: ProjectListItem;
  onEdit: (id: string) => void;
};

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
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
      const result = await deleteProject(project.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Project deleted.");
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
                onEdit(project.id);
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

  const publicPath = getProjectPublicPath(project.slug);

  return (
    <>
      <article className="relative overflow-hidden rounded-2xl border border-border-soft bg-surface-raised/80 transition hover:border-border-strong">
        <Link href={publicPath} target="_blank" rel="noopener noreferrer">
          <div className="relative aspect-[16/10] bg-surface-muted">
            {project.imageUrl ? (
              <Image
                alt={project.title}
                className="object-cover"
                fill
                sizes="280px"
                src={project.imageUrl}
                unoptimized={project.imageUrl.startsWith("http")}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                <FolderKanban size={28} strokeWidth={1.75} />
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 pr-12">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-muted">
                  {getProjectStatusLabel(project.status)}
                </span>
                <span
                  className={
                    project.published
                      ? "rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
                      : "rounded-full border border-border-soft px-2 py-0.5 text-[11px] font-medium text-muted"
                  }
                >
                  {project.published ? "Published" : "Draft"}
                </span>
              </div>

              <h3 className="mt-2 font-primary text-[17px] font-medium leading-snug text-foreground">
                {project.title}
              </h3>

              {project.location ? (
                <p className="mt-1 text-sm text-muted">{project.location}</p>
              ) : null}

              {project.shortDescription ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                  {project.shortDescription}
                </p>
              ) : null}
            </div>
          </div>
        </Link>

        <button
          aria-label="Project actions"
          className="absolute bottom-4 right-4 z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border-soft bg-surface-raised text-muted transition hover:text-foreground"
          onClick={() => setMenuOpen((open) => !open)}
          ref={buttonRef}
          type="button"
        >
          <MoreVertical size={16} />
        </button>
      </article>

      {menu}

      {confirmOpen
        ? createPortal(
            <div className={confirmOverlayClass}>
              <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-surface-raised p-5 shadow-popover">
                <h3 className="font-primary text-lg font-medium">Delete project?</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This removes {project.title} from admin and the public site.
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
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
                    disabled={isPending}
                    onClick={handleDelete}
                    type="button"
                  >
                    {isPending ? <Loader2 className="animate-spin" size={16} /> : null}
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