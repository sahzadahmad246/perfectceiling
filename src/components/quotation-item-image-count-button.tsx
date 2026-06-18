"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { QuotationItemImageViewer } from "@/components/quotation-item-image-viewer";
import type { QuotationLineItemImageDraft } from "@/lib/quotations";

type QuotationItemImageCountButtonProps = {
  images: QuotationLineItemImageDraft[];
  itemName: string;
};

export function QuotationItemImageCountButton({
  images,
  itemName,
}: QuotationItemImageCountButtonProps) {
  const [viewerOpen, setViewerOpen] = useState(false);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-surface px-2 py-0.5 text-[11px] font-medium text-foreground transition hover:border-primary hover:text-primary"
        onClick={() => setViewerOpen(true)}
        type="button"
      >
        <ImageIcon size={11} />
        {images.length} image{images.length === 1 ? "" : "s"}
      </button>

      <QuotationItemImageViewer
        images={images}
        onClose={() => setViewerOpen(false)}
        open={viewerOpen}
        title={itemName}
      />
    </>
  );
}