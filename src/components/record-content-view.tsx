"use client";

import { useEffect } from "react";

import {
  recordContentView,
  type ContentViewKind,
} from "@/lib/views";

type RecordContentViewProps = {
  kind: Exclude<ContentViewKind, "catalogue_image">;
  id: string;
};

export function RecordContentView({ kind, id }: RecordContentViewProps) {
  useEffect(() => {
    if (!id) {
      return;
    }

    void recordContentView(kind, id);
  }, [id, kind]);

  return null;
}
