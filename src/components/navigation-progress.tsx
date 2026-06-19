"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type NavigationProgressContextValue = {
  begin: (href?: string) => void;
};

const NavigationProgressContext =
  createContext<NavigationProgressContextValue | null>(null);

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

  return true;
}

function NavigationProgressBar({
  visible,
  width,
}: {
  visible: boolean;
  width: number;
}) {
  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px] overflow-hidden bg-sky-100/70"
    >
      <div
        className="relative h-full bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 shadow-[0_0_10px_rgba(59,130,246,0.55)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      >
        <span className="absolute inset-y-0 right-0 w-16 bg-gradient-to-r from-transparent to-white/45" />
      </div>
    </div>
  );
}

function NavigationProgressRouteWatcher({
  active,
  hasReachedDestination,
  onArrived,
}: {
  active: boolean;
  hasReachedDestination: () => boolean;
  onArrived: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const routeKey = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  useEffect(() => {
    if (!active || !hasReachedDestination()) {
      return;
    }

    onArrived();
  }, [active, hasReachedDestination, onArrived, routeKey]);

  return null;
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const startRouteRef = useRef<string | null>(null);
  const targetRouteRef = useRef<string | null>(null);
  const trickleTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

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
    clearTimers();
    setWidth(100);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
      startRouteRef.current = null;
      targetRouteRef.current = null;
    }, 320);
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
      if (href && hrefToRouteKey(href) === currentRouteKey()) {
        return;
      }

      clearTimers();
      startRouteRef.current = currentRouteKey();
      targetRouteRef.current = href ? hrefToRouteKey(href) : null;
      setVisible(true);
      setWidth(0);

      window.requestAnimationFrame(() => {
        setWidth(8);
      });

      trickleTimerRef.current = window.setInterval(() => {
        setWidth((value) => {
          if (value >= 92) {
            return value;
          }

          return value + Math.max(0.6, (92 - value) * 0.11);
        });
      }, 90);
    },
    [clearTimers],
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    const poll = window.setInterval(() => {
      if (hasReachedDestination()) {
        finish();
      }
    }, 40);

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

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [begin]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <NavigationProgressContext.Provider value={{ begin }}>
      <NavigationProgressBar visible={visible} width={width} />
      <Suspense fallback={null}>
        <NavigationProgressRouteWatcher
          active={visible}
          hasReachedDestination={hasReachedDestination}
          onArrived={finish}
        />
      </Suspense>
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