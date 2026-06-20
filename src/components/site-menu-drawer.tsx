"use client";

import {
  BookOpen,
  FolderKanban,
  Hammer,
  LogIn,
  Menu,
  PanelRightClose,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { signInWithGoogle } from "@/app/auth/actions";

const menuItems = [
  { href: "/services", label: "Services", icon: Hammer },
  { href: "/#projects", label: "Projects", icon: FolderKanban },
  { href: "/", label: "About", icon: BookOpen },
  { href: "/#contact", label: "Contact", icon: Phone },
] as const;

export function SiteMenuDrawer() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const drawer = open ? (
    <div className="fixed inset-0 isolate" style={{ zIndex: 9990 }}>
      <button
        aria-label="Close menu overlay"
        className="fixed inset-0 bg-primary/55"
        onClick={() => setOpen(false)}
        style={{ zIndex: 9991 }}
        type="button"
      />
      <aside
        className="animate-drawer-in fixed bottom-0 right-0 top-0 flex w-[min(88vw,360px)] flex-col overflow-hidden border-l border-border-strong bg-surface p-5 shadow-popover"
        style={{ zIndex: 9992 }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-soft pb-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Menu
            </p>
            <p className="mt-2 font-primary text-lg font-medium">Perfect Ceiling</p>
          </div>
          <button
            aria-label="Close menu"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
            onClick={() => setOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        <nav className="mt-5 flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon className="text-muted" size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signInWithGoogle} className="border-t border-border-soft pt-5">
          <input name="next" type="hidden" value="/" />
          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            type="submit"
          >
            <LogIn size={16} />
            Login
          </button>
        </form>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition duration-200 hover:border-primary"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu size={18} />
      </button>

      {typeof document !== "undefined"
        ? createPortal(drawer, document.body)
        : null}
    </>
  );
}