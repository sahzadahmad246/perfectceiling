"use client";

import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/app/auth/actions";
import type { AuthProfile } from "@/lib/auth/profile";

function getInitials(profile: AuthProfile) {
  const source = profile.fullName || profile.email || "PC";
  return source
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu({ profile }: { profile: AuthProfile }) {
  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const shouldShowAvatar =
    Boolean(profile.avatarUrl) && profile.avatarUrl !== failedAvatarUrl;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-raised text-sm font-medium text-foreground transition hover:border-primary"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {profile.avatarUrl && shouldShowAvatar ? (
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
          getInitials(profile)
        )}
      </button>

      {open ? (
        <div className="animate-menu-pop absolute right-0 top-12 z-30 w-64 rounded-md border border-border-soft bg-surface-raised p-2 shadow-popover">
          <div className="border-b border-border-soft px-3 py-3">
            <p className="truncate text-sm font-medium">
              {profile.fullName || "Signed in"}
            </p>
            <p className="mt-1 truncate text-xs text-muted">
              {profile.email}
            </p>
          </div>

          <Link
            className="mt-2 flex items-center gap-2 rounded px-3 py-2 text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
            href="/admin"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={16} />
            Admin dashboard
          </Link>

          <div className="flex items-center gap-2 rounded px-3 py-2 text-sm text-muted">
            <UserRound size={16} />
            Google account
          </div>

          <form action={signOut}>
            <input name="next" type="hidden" value="/" />
            <button
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-muted transition hover:bg-surface-muted hover:text-foreground"
              type="submit"
            >
              <LogOut size={16} />
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
