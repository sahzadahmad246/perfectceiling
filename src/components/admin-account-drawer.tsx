"use client";

import {
  BookOpenText,
  FolderKanban,
  Hammer,
  Home,
  LogOut,
  PanelRightClose,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { signOut } from "@/app/auth/actions";
import type { AuthProfile } from "@/lib/auth/profile";

const drawerItems = [
  { href: "/", label: "Back to website", icon: Home },
  { href: "/admin/services", label: "Services", icon: Hammer },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/blog", label: "Blogs", icon: BookOpenText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function getInitials(profile: AuthProfile) {
  const source = profile.fullName || profile.email || "PC";
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminAccountDrawer({ profile }: { profile: AuthProfile }) {
  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldShowAvatar =
    Boolean(profile.avatarUrl) && profile.avatarUrl !== failedAvatarUrl;

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    }
  }, [open]);

  const drawer = open ? (
    <div className="fixed inset-0 isolate" style={{ zIndex: 9990 }}>
      <button
        aria-label="Close admin menu overlay"
        className="fixed inset-0 bg-primary/55"
        onClick={() => setOpen(false)}
        style={{ zIndex: 9991 }}
        type="button"
      />
      <aside
        className="animate-drawer-in fixed bottom-0 right-0 top-0 flex w-[min(88vw,360px)] flex-col overflow-hidden border-l border-border-strong p-5 shadow-popover"
        style={{ backgroundColor: "#ffffff", zIndex: 9992 }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: "#ffffff", zIndex: 0 }}
        />
        <div className="relative z-10 flex items-start justify-between gap-4 border-b border-border-soft pb-5">
          <div className="min-w-0">
            <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-raised text-sm font-medium">
              {profile.avatarUrl && shouldShowAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={profile.fullName || profile.email || "Admin profile"}
                  className="size-full rounded-full object-cover"
                  onError={() => setFailedAvatarUrl(profile.avatarUrl)}
                  referrerPolicy="no-referrer"
                  src={profile.avatarUrl}
                />
              ) : (
                getInitials(profile)
              )}
            </div>
            <p className="mt-4 truncate font-medium">
              {profile.fullName || "Admin"}
            </p>
            <p className="mt-1 truncate text-sm text-muted">
              {profile.email}
            </p>
          </div>
          <button
            aria-label="Close admin menu"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition hover:border-primary hover:text-foreground"
            onClick={() => setOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            <PanelRightClose size={18} />
          </button>
        </div>

        <nav className="relative z-10 mt-4 space-y-1">
          {drawerItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex h-11 items-center gap-3 rounded-md px-3 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
          <div className="flex h-11 items-center gap-3 rounded-md px-3 text-sm text-muted">
            <UserRound size={17} />
            Google account
          </div>
        </nav>

        <form
          action={signOut}
          className="relative z-10 mt-auto border-t border-border-soft pt-4"
        >
          <input name="next" type="hidden" value="/login" />
          <button
            className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
            type="submit"
          >
            <LogOut size={17} />
            Logout
          </button>
        </form>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        aria-label="Open admin menu"
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-raised text-sm font-medium text-foreground transition hover:border-primary"
        onClick={() => setOpen(true)}
        type="button"
      >
        {profile.avatarUrl && shouldShowAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={profile.fullName || profile.email || "Admin profile"}
            className="size-full rounded-full object-cover"
            onError={() => setFailedAvatarUrl(profile.avatarUrl)}
            referrerPolicy="no-referrer"
            src={profile.avatarUrl}
          />
        ) : (
          getInitials(profile)
        )}
      </button>

      {typeof document !== "undefined"
        ? createPortal(drawer, document.body)
        : null}
    </>
  );
}
