"use client";

import { ArrowUpRight, BookOpen, FolderKanban, Hammer, Home, Images, LayoutDashboard, LogIn, LogOut, Menu, Phone, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { signInWithGoogle, signOut } from "@/app/auth/actions";
import { BrandLogo } from "@/components/brand-logo";
import type { AuthProfile } from "@/lib/auth/profile";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Hammer },
  { href: "/catalogue", label: "Catalogue", icon: Images },
  { href: "/projects", label: "Our projects", icon: FolderKanban },
  { href: "/blog", label: "Journal", icon: BookOpen },
  { href: "/#contact", label: "Get in touch", icon: Phone },
] as const;

type SiteMenuDrawerProps = {
  profile?: AuthProfile | null;
  isAdmin?: boolean;
  overlay?: boolean;
  businessName?: string;
  logoUrl?: string | null;
  city?: string;
};

function getInitials(profile: AuthProfile) {
  return (profile.fullName || profile.email || "PC").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function SiteMenuDrawer({ profile = null, isAdmin = false, overlay = false, businessName = "Perfect Ceiling", logoUrl, city }: SiteMenuDrawerProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const id = useId();
  const pathname = usePathname();
  const shouldShowAvatar = Boolean(profile?.avatarUrl) && profile?.avatarUrl !== failedAvatarUrl;

  const visible = open || closing;
  const closeDrawer = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setClosing(false);
      return;
    }
    setClosing(true);
    closeTimerRef.current = setTimeout(() => setClosing(false), 380);
  }, []);

  function openDrawer() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setClosing(false);
    setOpen(true);
  }

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    closeButtonRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); closeDrawer(); return; }
      if (event.key !== "Tab") return;
      const elements = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]');
      if (!elements?.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      const outside = !drawerRef.current?.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || outside)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [visible, closeDrawer]);

  const drawer = visible ? (
    <div className="fixed inset-0 isolate z-[9990] overflow-hidden">
      <button aria-label="Close menu overlay" tabIndex={-1} data-state={open ? "open" : "closed"} className="site-menu-backdrop absolute inset-0 bg-[#292720]/35 backdrop-blur-[3px]" onClick={() => closeDrawer()} type="button" />
      <aside id={id} ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} data-state={open ? "open" : "closed"} onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === "transform" && closing) {
          if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
          setClosing(false);
        }
      }} className="site-menu-panel fixed inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col rounded-l-3xl bg-[#f3f0e9] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[#292720] shadow-[-12px_0_60px_rgba(41,39,32,0.15)]">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo businessName={businessName} logoUrl={logoUrl} href="" />
          <button aria-label="Close menu" className="flex size-11 items-center justify-center rounded-xl bg-[#e8e1d5] text-[#746e63] transition hover:bg-[#ddd4c5] focus-visible:outline-2 focus-visible:outline-[#91704a]" onClick={() => closeDrawer()} ref={closeButtonRef} type="button"><X aria-hidden size={19} strokeWidth={1.5} /></button>
        </div>
        <div className="mt-7"><p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#91704a]">Explore your space</p><h2 id={`${id}-title`} className="mt-2 font-primary text-2xl font-medium leading-tight tracking-[-0.035em]">{businessName}</h2>{city ? <p className="mt-2 text-xs text-[#827563]">Ceilings & interiors · {city}</p> : null}</div>
        <nav aria-label="Main navigation" className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : !href.includes("#") && (pathname === href || pathname?.startsWith(`${href}/`));
            return <Link href={href} key={href} aria-current={active ? "page" : undefined} onClick={() => closeDrawer()} className={cn("group flex min-h-14 items-center gap-3 rounded-xl px-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[#91704a]", active ? "bg-[#e8e1d5]" : "hover:bg-[#ece6dc]")}><Icon aria-hidden className="shrink-0 text-[#91704a]" size={18} strokeWidth={1.5} /><span className="flex-1">{label}</span><ArrowUpRight aria-hidden className="text-[#aa9d89] transition group-hover:text-[#91704a]" size={15} /></Link>;
          })}
          {profile && isAdmin ? <Link href="/admin" onClick={() => closeDrawer()} className="flex min-h-14 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-[#ece6dc]"><LayoutDashboard aria-hidden className="text-[#91704a]" size={18} strokeWidth={1.5} />Admin dashboard</Link> : null}
        </nav>
        <div className="mt-5 border-t border-[#ded5c8] pt-5">
          {profile ? <><p className="mb-3 truncate text-xs text-[#827563]">{profile.fullName || profile.email}</p><form action={signOut}><input name="next" type="hidden" value="/" /><button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#ccc4b7] text-xs font-medium hover:bg-[#e8e1d5]" type="submit"><LogOut aria-hidden size={15} />Sign out</button></form></> : <form action={signInWithGoogle}><input name="next" type="hidden" value="/" /><button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#292720] text-xs font-medium text-[#f3f0e9] transition hover:bg-[#4a4439]" type="submit"><LogIn aria-hidden size={16} />Continue with Google</button></form>}
        </div>
      </aside>
    </div>
  ) : null;

  return <>
    <button ref={triggerRef} aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" aria-label={profile ? "Open account menu" : "Open menu"} className={cn("inline-flex size-11 items-center justify-center overflow-hidden rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-4", overlay ? "border-white/30 bg-black/30 text-white backdrop-blur-sm hover:border-white/60" : "border-[#d8d0c3] bg-transparent text-[#514c43] hover:bg-[#e8e1d5]")} onClick={openDrawer} type="button">
      {profile ? shouldShowAvatar && profile.avatarUrl ? <Image alt={profile.fullName || profile.email || "User profile"} className="size-full object-cover" height={44} width={44} onError={() => setFailedAvatarUrl(profile.avatarUrl)} referrerPolicy="no-referrer" src={profile.avatarUrl} unoptimized /> : <span className="text-xs font-medium">{getInitials(profile)}</span> : <Menu aria-hidden size={20} strokeWidth={1.5} />}
    </button>
    {typeof document !== "undefined" ? createPortal(drawer, document.body) : null}
  </>;
}
