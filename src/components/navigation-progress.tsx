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

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const startRouteRef = useRef<string | null>(null);
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
    }, 280);
  }, [clearTimers]);

  const begin = useCallback(
    (href?: string) => {
      if (href && hrefToRouteKey(href) === currentRouteKey()) {
        return;
      }

      clearTimers();
      startRouteRef.current = currentRouteKey();
      setVisible(true);
      setWidth(12);

      trickleTimerRef.current = window.setInterval(() => {
        setWidth((value) => {
          if (value >= 88) {
            return value;
          }

          return value + Math.max(0.8, (88 - value) * 0.12);
        });
      }, 100);
    },
    [clearTimers],
  );

  useEffect(() => {
    if (!visible || !startRouteRef.current) {
      return;
    }

    if (currentRouteKey() !== startRouteRef.current) {
      finish();
      return;
    }

    const poll = window.setInterval(() => {
      if (
        startRouteRef.current &&
        currentRouteKey() !== startRouteRef.current
      ) {
        finish();
      }
    }, 50);

    return () => {
      window.clearInterval(poll);
    };
  }, [finish, pathname, visible]);

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
      {visible ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 overflow-hidden bg-sky-200/80"
        >
          <div
            className="h-full bg-sky-500 transition-[width] duration-200 ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
      ) : null}
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