"use client";

import { SideMenuExtension } from "@blocknote/core/extensions";
import { autoUpdate, flip, offset, shift } from "@floating-ui/react";
import {
  SideMenu,
  SideMenuController,
  useBlockNoteEditor,
  useExtension,
  useExtensionState,
} from "@blocknote/react";
import { useEffect, useLayoutEffect } from "react";

function ArticleEditorBlockToolbarMenu() {
  return (
    <div className="article-editor-block-toolbar-inner">
      <SideMenu />
    </div>
  );
}

export function ArticleEditorBlockToolbar() {
  const editor = useBlockNoteEditor();
  const sideMenu = useExtension(SideMenuExtension);
  const menuState = useExtensionState(SideMenuExtension, {
    selector: (state) =>
      state?.show && state.block?.id
        ? { blockId: state.block.id, show: state.show }
        : undefined,
  });

  useLayoutEffect(() => {
    if (!menuState?.show || !menuState.blockId) {
      return;
    }

    sideMenu.freezeMenu();
  }, [menuState?.blockId, menuState?.show, sideMenu]);

  useEffect(() => {
    const root = editor.domElement ?? editor.prosemirrorView.dom;

    function handleMouseMove(event: MouseEvent) {
      if (!menuState?.blockId) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const blockOuter = target.closest('[data-node-type="blockOuter"]');
      const hoveredId = blockOuter?.getAttribute("data-id");

      if (hoveredId && hoveredId !== menuState.blockId) {
        sideMenu.unfreezeMenu();
      }
    }

    function handlePointerLeave(event: Event) {
      const shell = root.closest(".article-editor-shell");
      const relatedTarget =
        "relatedTarget" in event ? event.relatedTarget : null;

      if (
        shell instanceof HTMLElement &&
        relatedTarget instanceof Node &&
        !shell.contains(relatedTarget)
      ) {
        sideMenu.unfreezeMenu();
      }
    }

    root.addEventListener("mousemove", handleMouseMove, true);
    root
      .closest(".article-editor-shell")
      ?.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("mousemove", handleMouseMove, true);
      root
        .closest(".article-editor-shell")
        ?.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [editor, menuState?.blockId, sideMenu]);

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
          onPointerEnter: () => {
            sideMenu.freezeMenu();
          },
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