"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
  className?: string;
};

export function ShareButton({
  title,
  text,
  url,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // User cancelled or share failed — fall through to copy.
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

  return (
    <button
      className={
        className ??
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium transition hover:border-primary"
      }
      onClick={handleShare}
      type="button"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
