"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { ArticleEditorBlockToolbar } from "@/components/article-editor-block-toolbar";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadEditorImage } from "@/app/admin/editor/actions";
import { cn } from "@/lib/utils";

type BlockNoteArticleEditorProps = {
  initialValue: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function BlockNoteArticleEditor({
  initialValue,
  onChange,
  placeholder = "Start writing, or type / for commands…",
  className,
}: BlockNoteArticleEditorProps) {
  const [ready, setReady] = useState(false);
  const hydratingRef = useRef(false);
  const lastEmittedHtmlRef = useRef(initialValue);

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadEditorImage(formData);

    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    return result.url;
  }, []);

  const editor = useCreateBlockNote(
    {
      uploadFile,
      placeholders: {
        default: placeholder,
        emptyDocument: placeholder,
      },
    },
    [placeholder, uploadFile],
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateEditor() {
      hydratingRef.current = true;

      try {
        const html = initialValue.trim();

        if (html) {
          const blocks = editor.tryParseHTMLToBlocks(html);
          editor.replaceBlocks(editor.document, blocks);
        } else {
          editor.replaceBlocks(editor.document, [
            {
              type: "paragraph",
            },
          ]);
        }

        lastEmittedHtmlRef.current = editor.blocksToHTMLLossy(editor.document);
      } catch {
        toast.error("Could not load existing content.");
      } finally {
        if (!cancelled) {
          hydratingRef.current = false;
          setReady(true);
        }
      }
    }

    setReady(false);
    void hydrateEditor();

    return () => {
      cancelled = true;
    };
  }, [editor, initialValue]);

  function handleChange() {
    if (hydratingRef.current) {
      return;
    }

    const html = editor.blocksToHTMLLossy(editor.document);

    if (html === lastEmittedHtmlRef.current) {
      return;
    }

    lastEmittedHtmlRef.current = html;
    onChange(html);
  }

  return (
    <div className={cn("article-editor-shell flex flex-col", className)}>
      {!ready ? (
        <div className="flex min-h-[320px] flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-muted" size={24} />
        </div>
      ) : (
        <BlockNoteView editor={editor} onChange={handleChange} sideMenu={false} theme="light">
          <ArticleEditorBlockToolbar />
        </BlockNoteView>
      )}
    </div>
  );
}