"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
const Toaster = dynamic(() => import("sonner").then(module => module.Toaster), { ssr: false });

export function DeferredToaster() {
  const pathname = usePathname();
  const immediate = pathname.startsWith("/admin") || pathname.startsWith("/login");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (immediate) return;
    let cancelled = false;
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const activate = () => { if (!cancelled) setReady(true); };
    const schedule = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(activate, { timeout: 2500 });
      else timer = setTimeout(activate, 1000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    window.addEventListener("pointerdown", activate, { once: true });
    window.addEventListener("keydown", activate, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [immediate]);
  return immediate || ready ? <Toaster closeButton position="top-center" richColors /> : null;
}
