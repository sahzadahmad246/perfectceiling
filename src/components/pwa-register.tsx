"use client";

import { useEffect } from "react";

function isChunkLoadError(reason: unknown) {
  if (!reason || typeof reason !== "object") {
    return false;
  }

  const error = reason as { name?: string; message?: string };

  return (
    error.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk \d+ failed/i.test(error.message ?? "")
  );
}

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleChunkLoadFailure = (event: PromiseRejectionEvent) => {
      if (!isChunkLoadError(event.reason)) {
        return;
      }

      const reloadKey = "chunk-reload";
      if (sessionStorage.getItem(reloadKey)) {
        return;
      }

      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    };

    window.addEventListener("unhandledrejection", handleChunkLoadFailure);

    if (!("serviceWorker" in navigator)) {
      return () => {
        window.removeEventListener("unhandledrejection", handleChunkLoadFailure);
      };
    }

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          void registration.unregister();
        });
      });

      return () => {
        window.removeEventListener("unhandledrejection", handleChunkLoadFailure);
      };
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration is best-effort for installability.
    });

    return () => {
      window.removeEventListener("unhandledrejection", handleChunkLoadFailure);
    };
  }, []);

  return null;
}