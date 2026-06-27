"use client";

import {
  BookOpen,
  FolderKanban,
  Hammer,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  PanelRightClose,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { signInWithGoogle, signOut } from "@/app/auth/actions";
import type { AuthProfile } from "@/lib/auth/profile";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/services", label: "Services", icon: Hammer },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/#contact", label: "Contact", icon: Phone },
] as const;

type SiteMenuDrawerProps = {
  profile?: AuthProfile | null;
  isAdmin?: boolean;
  overlay?: boolean;
};

function getInitials(profile: AuthProfile) {
  const source = profile.fullName || profile.email || "PC";

  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SiteMenuDrawer({
  profile = null,
  isAdmin = false,
  overlay = false,
}: SiteMenuDrawerProps) {
  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldShowAvatar =
    Boolean(profile?.avatarUrl) && profile?.avatarUrl !== failedAvatarUrl;

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
            {profile ? (
              <p className="mt-1 truncate text-sm text-muted">
                {profile.fullName || profile.email}
              </p>
            ) : null}
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

          {profile && isAdmin ? (
            <Link
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
              href="/admin"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard className="text-muted" size={18} />
              Admin dashboard
            </Link>
          ) : null}
        </nav>

        <div className="border-t border-border-soft pt-5">
          {profile ? (
            <form action={signOut}>
              <input name="next" type="hidden" value="/" />
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition hover:border-primary"
                type="submit"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          ) : (
            <form action={signInWithGoogle}>
              <input name="next" type="hidden" value="/" />
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                type="submit"
              >
                <LogIn size={16} />
                Login
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        aria-expanded={open}
        aria-label={profile ? "Open account menu" : "Open menu"}
        className={cn(
          "inline-flex size-10 items-center justify-center overflow-hidden rounded-full border transition duration-200",
          overlay
            ? "border-white/30 bg-black/30 text-white backdrop-blur-sm hover:border-white/60"
            : "border-border-strong bg-surface text-foreground hover:border-primary",
        )}
        onClick={() => setOpen(true)}
        type="button"
      >
        {profile ? (
          shouldShowAvatar && profile.avatarUrl ? (
            <Image
              alt={profile.fullName || profile.email || "User profile"}
              className="size-full rounded-full object-cover"
              height={40}
              onError={() => setFailedAvatarUrl(profile.avatarUrl)}
              referrerPolicy="no-referrer"
              src={profile.avatarUrl}
              unoptimized
              width={40}
            />
          ) : (
            <span className="text-sm font-medium">{getInitials(profile)}</span>
          )
        ) : (
          <Menu size={18} />
        )}
      </button>

      {typeof document !== "undefined"
        ? createPortal(drawer, document.body)
        : null}
    </>
  );
}