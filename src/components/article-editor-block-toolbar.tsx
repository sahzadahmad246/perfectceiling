"use client";

import type { BlockNoteEditor } from "@blocknote/core";
import { sideMenuPluginKey } from "@blocknote/core/extensions";
import { autoUpdate, flip, offset, shift } from "@floating-ui/react";
import {
  SideMenu,
  SideMenuController,
  useBlockNoteEditor,
  useEditorChange,
} from "@blocknote/react";
import { useCallback, useEffect, useRef } from "react";

type SideMenuViewLike = {
  state?: {
    show: boolean;
    block: { id: string };
    referencePos: DOMRect;
  };
  hoveredBlock: HTMLElement | null;
  menuFrozen: boolean;
  updateState: (state: {
    show: boolean;
    block: { id: string };
    referencePos: DOMRect;
  }) => void;
};

function getSideMenuView(editor: BlockNoteEditor): SideMenuViewLike | null {
  const pmView = editor.prosemirrorView;
  const pluginIndex = pmView.state.plugins.findIndex(
    (plugin) => plugin.spec.key === sideMenuPluginKey,
  );

  if (pluginIndex < 0) {
    return null;
  }

  const pluginViews = (
    pmView as unknown as { pluginViews: SideMenuViewLike[] }
  ).pluginViews;

  return pluginViews[pluginIndex] ?? null;
}

function isEventInsideEditor(editor: BlockNoteEditor, target: EventTarget | null) {
  if (!(target instanceof Node)) {
    return false;
  }

  const editorDom = editor.domElement ?? editor.prosemirrorView.dom;
  return editorDom.contains(target);
}

function getBlockIdFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return (
    target
      .closest('[data-node-type="blockOuter"]')
      ?.getAttribute("data-id") ?? null
  );
}

function getBlockOuterElement(editor: BlockNoteEditor, blockId: string) {
  return editor.domElement?.querySelector(
    `[data-node-type="blockOuter"][data-id="${CSS.escape(blockId)}"]`,
  );
}

function getBlockReferenceRect(editor: BlockNoteEditor, blockEl: HTMLElement) {
  const blockRect = blockEl.getBoundingClientRect();
  const pmView = editor.prosemirrorView;
  const column = blockEl.closest("[data-node-type=column]");
  const referenceX = column
    ? (column.firstElementChild as HTMLElement).getBoundingClientRect().x
    : (pmView.dom.firstChild as HTMLElement).getBoundingClientRect().x;

  return new DOMRect(referenceX, blockRect.y, blockRect.width, blockRect.height);
}

function hideSideMenu(editor: BlockNoteEditor) {
  const view = getSideMenuView(editor);

  if (!view?.state) {
    return;
  }

  view.menuFrozen = true;
  view.updateState({
    ...view.state,
    show: false,
  });
}

function showSideMenuForBlock(editor: BlockNoteEditor, blockId: string) {
  const view = getSideMenuView(editor);

  if (!view) {
    return false;
  }

  const block = editor.getBlock(blockId);

  if (!block) {
    return false;
  }

  const blockEl = getBlockOuterElement(editor, blockId);

  if (!(blockEl instanceof HTMLElement)) {
    return false;
  }

  view.hoveredBlock = blockEl;
  view.menuFrozen = true;
  view.updateState({
    show: true,
    referencePos: getBlockReferenceRect(editor, blockEl),
    block,
  });

  return true;
}

function scheduleShowMenuForBlock(editor: BlockNoteEditor, blockId: string) {
  requestAnimationFrame(() => {
    showSideMenuForBlock(editor, blockId);
  });
}

function ArticleEditorBlockToolbarMenu() {
  return (
    <div className="article-editor-block-toolbar-inner">
      <SideMenu />
    </div>
  );
}

export function ArticleEditorBlockToolbar() {
  const editor = useBlockNoteEditor();
  const activeBlockIdRef = useRef<string | null>(null);

  const syncActiveBlockMenu = useCallback(() => {
    if (!editor.isFocused() || !activeBlockIdRef.current) {
      return;
    }

    showSideMenuForBlock(editor, activeBlockIdRef.current);
  }, [editor]);

  useEditorChange(syncActiveBlockMenu, editor);

  useEffect(() => {
    const editorDom = editor.domElement ?? editor.prosemirrorView.dom;
    const pmRoot = editor.prosemirrorView.root;
    const sideMenuView = getSideMenuView(editor);

    hideSideMenu(editor);

    const originalUpdateState = sideMenuView?.updateState;

    if (sideMenuView && originalUpdateState) {
      sideMenuView.updateState = (state) => {
        sideMenuView.menuFrozen = true;

        if (!activeBlockIdRef.current) {
          originalUpdateState.call(sideMenuView, { ...state, show: false });
          return;
        }

        if (state.show && state.block.id !== activeBlockIdRef.current) {
          const block = editor.getBlock(activeBlockIdRef.current);
          const blockEl = getBlockOuterElement(editor, activeBlockIdRef.current);

          if (block && blockEl instanceof HTMLElement) {
            sideMenuView.hoveredBlock = blockEl;
            originalUpdateState.call(sideMenuView, {
              show: true,
              block,
              referencePos: getBlockReferenceRect(editor, blockEl),
            });
          } else {
            originalUpdateState.call(sideMenuView, { ...state, show: false });
          }

          return;
        }

        originalUpdateState.call(sideMenuView, state);
      };
    }

    function suppressHoverMenu(event: Event) {
      if (!isEventInsideEditor(editor, event.target)) {
        return;
      }

      const view = getSideMenuView(editor);

      if (!view) {
        return;
      }

      view.menuFrozen = true;

      if (!activeBlockIdRef.current) {
        if (view.state?.show) {
          hideSideMenu(editor);
        }
        return;
      }

      if (
        view.state?.block?.id !== activeBlockIdRef.current ||
        !view.state.show
      ) {
        showSideMenuForBlock(editor, activeBlockIdRef.current);
      }
    }

    function handlePointerDown(event: PointerEvent) {
      if (!isEventInsideEditor(editor, event.target)) {
        return;
      }

      const blockId = getBlockIdFromTarget(event.target);

      if (!blockId) {
        activeBlockIdRef.current = null;
        hideSideMenu(editor);
        return;
      }

      activeBlockIdRef.current = blockId;
      scheduleShowMenuForBlock(editor, blockId);
    }

    function handleFocusOut(event: FocusEvent) {
      const shell = editorDom.closest(".article-editor-shell");
      const relatedTarget = event.relatedTarget;

      if (
        shell instanceof HTMLElement &&
        relatedTarget instanceof Node &&
        shell.contains(relatedTarget)
      ) {
        return;
      }

      activeBlockIdRef.current = null;
      hideSideMenu(editor);
    }

    // BlockNote listens on pmRoot (document) in capture phase — register after
    // so we run second and cancel any hover-triggered menu.
    pmRoot.addEventListener("mousemove", suppressHoverMenu, true);
    editorDom.addEventListener("pointerdown", handlePointerDown, true);
    editorDom.addEventListener("focusout", handleFocusOut);

    return () => {
      if (sideMenuView && originalUpdateState) {
        sideMenuView.updateState = originalUpdateState;
      }

      pmRoot.removeEventListener("mousemove", suppressHoverMenu, true);
      editorDom.removeEventListener("pointerdown", handlePointerDown, true);
      editorDom.removeEventListener("focusout", handleFocusOut);
    };
  }, [editor]);

  return (
    <SideMenuController
      floatingUIOptions={{
        useFloatingOptions: {
          placement: "left-start",
          strategy: "absolute",
          middleware: [
            offset(-10),
            flip({ padding: { top: 8, right: 8, bottom: 8, left: 14 } }),
            shift({ padding: { top: 8, right: 8, bottom: 8, left: 14 } }),
          ],
          whileElementsMounted: (reference, floating, update) =>
            autoUpdate(reference, floating, update),
        },
        elementProps: {
          className: "article-editor-block-toolbar",
          style: {
            border: "none",
            boxShadow: "none",
            outline: "none",
          },
        },
      }}
      sideMenu={ArticleEditorBlockToolbarMenu}
    />
  );
}