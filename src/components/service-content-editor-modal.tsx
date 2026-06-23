"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { ArticleEditor } from "@/components/article-editor";

type ServiceContentEditorModalProps = {
  open: boolean;
  title: string;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => void;
};

export function ServiceContentEditorModal({
  open,
  title,
  initialContent,
  onClose,
  onSave,
}: ServiceContentEditorModalProps) {
  const [content, setContent] = useState(initialContent);
  const [editorKey, setEditorKey] = useState(0);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setEditorKey((current) => current + 1);
    }
  }, [initialContent, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-[560px] flex-col border-x border-border-soft bg-surface shadow-popover">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border-soft bg-surface px-4 py-3 sm:px-8">
          <div>
            <p className="text-xs text-muted">Page content</p>
            <h2 className="font-primary text-lg font-medium">
              {title.trim() || "Write your service page"}
            </h2>
          </div>
          <button
            aria-label="Close content editor"
            className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
            onClick={onClose}
            type="button"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </header>

        <div className="service-content-editor-scroll min-h-0 flex-1 overflow-y-auto px-1.5 py-3 sm:px-2">
          <ArticleEditor
            key={editorKey}
            className="min-h-[320px]"
            initialValue={initialContent}
            onChange={setContent}
            placeholder="Write the full service page — benefits, process, materials, and what customers can expect. Type / for headings, lists, images, tables, and more."
          />
        </div>

        <footer className="shrink-0 border-t border-border-soft bg-surface px-4 py-3 sm:px-8">
          <div className="flex gap-2">
            <button
              className="h-11 flex-1 rounded-full border border-border-strong text-sm font-medium"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground"
              onClick={() => {
                onSave(content);
                onClose();
              }}
              type="button"
            >
              Save content
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}