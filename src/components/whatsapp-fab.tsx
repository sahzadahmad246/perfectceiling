"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

type WhatsAppFabProps = { href: string; label?: string };

export function WhatsAppFab({ href, label = "Message us on WhatsApp" }: WhatsAppFabProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    linkRef.current?.focus({ preventScroll: true });
    function dismiss(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus({ preventScroll: true }); }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-3 sm:right-[max(1rem,calc(50%-280px+1rem))]">
      {open ? <div id={id} role="dialog" aria-labelledby={`${id}-title`} className="w-[min(280px,calc(100vw-2rem))] rounded-2xl border border-[#ded5c8] bg-[#f7f3eb] p-4 shadow-[0_8px_32px_rgba(41,39,32,0.14)] motion-safe:animate-menu-pop">
        <p id={`${id}-title`} className="font-primary text-sm font-medium text-[#292720]">Have a ceiling project in mind?</p>
        <p className="mt-2 text-xs leading-5 text-[#746e63]">Send us your ideas or room photos.</p>
        <a ref={linkRef} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[#315b40] px-3 text-xs font-medium text-white transition hover:bg-[#254a32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315b40]">{label}<ArrowUpRight aria-hidden size={16} /></a>
      </div> : null}
      <button ref={triggerRef} type="button" aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"} aria-expanded={open} aria-controls={open ? id : undefined} aria-haspopup="dialog" onClick={() => setOpen((current) => !current)} className="flex size-12 items-center justify-center rounded-full bg-[#315b40] text-white shadow-[0_4px_16px_rgba(41,39,32,0.18)] transition hover:bg-[#254a32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#315b40]">{open ? <X aria-hidden size={20} strokeWidth={1.6} /> : <FaWhatsapp aria-hidden size={25} />}</button>
    </div>
  );
}
