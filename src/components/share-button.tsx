"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  className?: string;
  /** Full pill button (default), compact icon, or light icon for dark overlays. */
  variant?: "button" | "icon" | "icon-light";
  label?: string;
};

async function copyLink(url: string) {
  await navigator.clipboard.writeText(url);
}

/**
 * Prefer the OS/browser share sheet. If share is unavailable or not allowed,
 * copy the link and tell the user.
 */
export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "button",
  label = "Share",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function fallbackCopy(message: string) {
    try {
      await copyLink(url);
      setCopied(true);
      toast.success(message);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  async function handleShare() {
    const shareData: ShareData = {
      title,
      text,
      url,
    };

    const canUseShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function";

    if (!canUseShare) {
      await fallbackCopy("Sharing not allowed — link copied.");
      return;
    }

    if (
      typeof navigator.canShare === "function" &&
      !navigator.canShare(shareData)
    ) {
      const urlOnly: ShareData = { url, title };
      if (!navigator.canShare(urlOnly)) {
        await fallbackCopy("Sharing not allowed — link copied.");
        return;
      }

      try {
        await navigator.share(urlOnly);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        await fallbackCopy("Sharing not allowed — link copied.");
      }
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await navigator.share({ url, title });
      } catch (retryError) {
        if (
          retryError instanceof DOMException &&
          retryError.name === "AbortError"
        ) {
          return;
        }
        await fallbackCopy("Sharing not allowed — link copied.");
      }
    }
  }

  if (variant === "icon" || variant === "icon-light") {
    return (
      <button
        aria-label={copied ? "Link copied" : label}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full transition",
          variant === "icon-light"
            ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
            : "text-muted hover:bg-surface-muted hover:text-foreground",
          className,
        )}
        onClick={(event) => {
          event.stopPropagation();
          void handleShare();
        }}
        title={copied ? "Copied" : label}
        type="button"
      >
        {copied ? <Check size={18} /> : <Share2 size={18} />}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium transition hover:border-primary",
        className,
      )}
      onClick={() => void handleShare()}
      type="button"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Copied" : label}
    </button>
  );
}
