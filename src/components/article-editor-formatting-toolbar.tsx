"use client";

import type { BlockNoteEditor } from "@blocknote/core";
import { FormattingToolbarExtension } from "@blocknote/core/extensions";
import {
  ExperimentalMobileFormattingToolbarController,
  FormattingToolbarController,
  useBlockNoteEditor,
  useExtension,
} from "@blocknote/react";
import { useEffect, useState } from "react";

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");

    function update() {
      setIsCoarsePointer(media.matches);
    }

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return isCoarsePointer;
}

function hasFormattingSelection(editor: BlockNoteEditor) {
  return editor.transact((tr) => {
    if (tr.selection.empty) {
      return false;
    }

    const selectedText = tr.doc.textBetween(tr.selection.from, tr.selection.to);

    return selectedText.length > 0;
  });
}

export function ArticleEditorFormattingToolbar() {
  const editor = useBlockNoteEditor();
  const formattingToolbar = useExtension(FormattingToolbarExtension);
  const isCoarsePointer = useCoarsePointer();

  useEffect(() => {
    if (!isCoarsePointer) {
      return;
    }

    function syncToolbarFromSelection() {
      formattingToolbar.store.setState(hasFormattingSelection(editor));
    }

    const unsubscribeSelection = editor.onSelectionChange(syncToolbarFromSelection);
    const unsubscribeChange = editor.onChange(syncToolbarFromSelection);
    document.addEventListener("selectionchange", syncToolbarFromSelection);

    return () => {
      unsubscribeSelection();
      unsubscribeChange();
      document.removeEventListener("selectionchange", syncToolbarFromSelection);
    };
  }, [editor, formattingToolbar, isCoarsePointer]);

  useEffect(() => {
    const editorDom = editor.domElement ?? editor.prosemirrorView.dom;

    function preventNativeSelectionMenu(event: Event) {
      if (!editorDom.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();
    }

    editorDom.addEventListener("contextmenu", preventNativeSelectionMenu);
    return () => {
      editorDom.removeEventListener("contextmenu", preventNativeSelectionMenu);
    };
  }, [editor]);

  if (isCoarsePointer) {
    return <ExperimentalMobileFormattingToolbarController />;
  }

  return <FormattingToolbarController />;
}