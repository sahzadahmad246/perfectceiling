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
  /** Full pill button (default) or compact icon for headers. */
  variant?: "button" | "icon";
  label?: string;
};

export function ShareButton({
  title,
  text,
  url,
  className,
  variant = "button",
  label = "Share",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  }

  if (variant === "icon") {
    return (
      <button
        aria-label={copied ? "Link copied" : label}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-muted hover:text-foreground",
          className,
        )}
        onClick={handleShare}
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
      onClick={handleShare}
      type="button"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Copied" : label}
    </button>
  );
}
