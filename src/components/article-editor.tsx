"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const BlockNoteArticleEditor = dynamic(
  () =>
    import("@/components/blocknote-article-editor").then(
      (module) => module.BlockNoteArticleEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[320px] flex-1 items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={24} />
      </div>
    ),
  },
);

type ArticleEditorProps = {
  initialValue: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function ArticleEditor({
  initialValue,
  onChange,
  placeholder,
  className,
}: ArticleEditorProps) {
  return (
    <BlockNoteArticleEditor
      className={cn(className)}
      initialValue={initialValue}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}