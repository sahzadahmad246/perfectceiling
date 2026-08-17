export const CONTENT_VIEW_KINDS = [
  "catalogue_image",
  "blog",
  "service",
] as const;

export type ContentViewKind = (typeof CONTENT_VIEW_KINDS)[number];

export function isContentViewKind(value: string): value is ContentViewKind {
  return CONTENT_VIEW_KINDS.includes(value as ContentViewKind);
}

export function formatViewCount(count: number) {
  const safe = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;

  if (safe >= 1_000_000) {
    return `${(safe / 1_000_000).toFixed(safe % 1_000_000 === 0 ? 0 : 1)}m`;
  }

  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(safe % 1000 === 0 ? 0 : 1)}k`;
  }

  return String(safe);
}

export function formatViewLabel(count: number) {
  const safe = Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  const formatted = formatViewCount(safe);

  return safe === 1 ? `${formatted} view` : `${formatted} views`;
}

export function sumViewCounts(counts: Array<number | null | undefined>) {
  return counts.reduce<number>((total, count) => {
    if (!Number.isFinite(count) || (count ?? 0) <= 0) {
      return total;
    }

    return total + Math.floor(count as number);
  }, 0);
}

export function getCatalogueGroupViewCount(item: {
  images: Array<{ viewCount?: number | null }>;
}) {
  return sumViewCounts(item.images.map((image) => image.viewCount));
}

function sessionKey(kind: ContentViewKind, id: string) {
  return `viewed:${kind}:${id}`;
}

export function hasRecordedContentView(kind: ContentViewKind, id: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(sessionKey(kind, id)) === "1";
  } catch {
    return false;
  }
}

export async function recordContentView(
  kind: ContentViewKind,
  id: string,
): Promise<boolean> {
  if (typeof window === "undefined" || !id) {
    return false;
  }

  const key = sessionKey(kind, id);

  try {
    if (window.sessionStorage.getItem(key) === "1") {
      return false;
    }

    window.sessionStorage.setItem(key, "1");
  } catch {
    // Private mode can block sessionStorage; still try once.
  }

  try {
    const response = await fetch("/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kind, id }),
      keepalive: true,
    });

    if (!response.ok) {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        // Ignore storage errors.
      }

      return false;
    }

    const payload = (await response.json()) as {
      ignored?: boolean;
    };

    return !payload.ignored;
  } catch {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }

    return false;
  }
}
