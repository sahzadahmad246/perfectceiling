"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type NavigationProgressContextValue = {
  begin: (href?: string) => void;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

const MIN_VISIBLE_MS = 280;

function currentRouteKey() {
  const search = window.location.search.replace(/^\?/, "");
  return search
    ? `${window.location.pathname}?${search}`
    : window.location.pathname;
}

function hrefToRouteKey(href: string) {
  try {
    const url = new URL(href, window.location.origin);
    const search = url.search.replace(/^\?/, "");
    return search ? `${url.pathname}?${search}` : url.pathname;
  } catch {
    return href;
  }
}

function isInternalNavigationLink(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");

  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function NavigationProgressBar({
  mounted,
  visible,
  width,
}: {
  mounted: boolean;
  visible: boolean;
  width: number;
}) {
  if (!mounted || !visible) {
    return null;
  }

  return createPortal(
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: 99999,
        height: 4,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "rgba(186, 230, 253, 0.65)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          width: `${width}%`,
          background: "linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #38bdf8 100%)",
          boxShadow: "0 0 12px rgba(59, 130, 246, 0.65)",
          transition: "width 180ms ease-out",
        }}
      >
        <span
          style={{
            position: "absolute",
            insetBlock: 0,
            right: 0,
            width: 64,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.45) 100%)",
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const startRouteRef = useRef<string | null>(null);
  const targetRouteRef = useRef<string | null>(null);
  const startedAtRef = useRef(0);
  const trickleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const finishingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (trickleTimerRef.current) {
      window.clearInterval(trickleTimerRef.current);
      trickleTimerRef.current = null;
    }

    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (finishingRef.current) {
      return;
    }

    finishingRef.current = true;
    clearTimers();

    const elapsed = Date.now() - startedAtRef.current;
    const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

    hideTimerRef.current = window.setTimeout(() => {
      setWidth(100);

      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
        startRouteRef.current = null;
        targetRouteRef.current = null;
        finishingRef.current = false;
      }, 240);
    }, wait);
  }, [clearTimers]);

  const hasReachedDestination = useCallback(() => {
    const current = currentRouteKey();

    if (targetRouteRef.current) {
      return current === targetRouteRef.current;
    }

    return (
      startRouteRef.current !== null && current !== startRouteRef.current
    );
  }, []);

  const begin = useCallback(
    (href?: string) => {
      const destination = href ? hrefToRouteKey(href) : null;

      if (destination && destination === currentRouteKey()) {
        return;
      }

      clearTimers();
      finishingRef.current = false;
      startedAtRef.current = Date.now();
      startRouteRef.current = currentRouteKey();
      targetRouteRef.current = destination;
      setVisible(true);
      setWidth(4);

      trickleTimerRef.current = window.setInterval(() => {
        setWidth((value) => {
          if (value >= 90) {
            return value;
          }

          return value + Math.max(0.8, (90 - value) * 0.12);
        });
      }, 80);
    },
    [clearTimers],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (hasReachedDestination()) {
      finish();
    }
  }, [finish, hasReachedDestination, pathname, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const poll = window.setInterval(() => {
      if (hasReachedDestination()) {
        finish();
      }
    }, 30);

    return () => {
      window.clearInterval(poll);
    };
  }, [finish, hasReachedDestination, visible]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");

      if (!anchor || !isInternalNavigationLink(anchor)) {
        return;
      }

      begin(anchor.getAttribute("href") ?? undefined);
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [begin]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <NavigationProgressContext.Provider value={{ begin }}>
      <NavigationProgressBar mounted={mounted} visible={visible} width={width} />
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const context = useContext(NavigationProgressContext);

  if (!context) {
    throw new Error(
      "useNavigationProgress must be used within NavigationProgressProvider",
    );
  }

  return context;
}