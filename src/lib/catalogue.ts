export type CatalogueImageItem = {
  id: string;
  imageUrl: string;
  storagePath: string;
  caption: string;
  altText: string | null;
  seoDescription: string | null;
  published: boolean;
  sortOrder: number;
};

/** One draft image in the admin form (create multi / edit single). */
export type CatalogueImageDraft = {
  clientId: string;
  /** Preview URL (blob: for local picks, https for existing). */
  imageUrl: string;
  storagePath: string;
  /** Local file held until save — only then is it uploaded. */
  file?: File | null;
  caption: string;
  altText: string;
  seoDescription: string;
  published: boolean;
  sortOrder: string;
};

export type CatalogueFormInput = {
  imageUrl: string;
  storagePath: string;
  caption: string;
  altText: string;
  seoDescription: string;
  published: boolean;
  sortOrder: string;
};

/** Caption is the public title. */
export function getCatalogueDisplayTitle(item: { caption: string }) {
  return item.caption.trim();
}

/** Alt text for the image; falls back to caption. */
export function getCatalogueAltText(item: {
  caption: string;
  altText?: string | null;
}) {
  return item.altText?.trim() || item.caption.trim();
}

export function getCataloguePublicPath(id: string) {
  return `/catalogue/${id}`;
}

export function getCatalogueSeoDescription(item: {
  caption: string;
  seoDescription?: string | null;
}) {
  return item.seoDescription?.trim() || item.caption.trim();
}

export function emptyCatalogueDraft(
  sortOrder = "0",
): CatalogueImageDraft {
  return {
    clientId: crypto.randomUUID(),
    imageUrl: "",
    storagePath: "",
    file: null,
    caption: "",
    altText: "",
    seoDescription: "",
    published: true,
    sortOrder,
  };
}

export function catalogueItemToDraft(
  item: CatalogueImageItem,
): CatalogueImageDraft {
  return {
    clientId: item.id,
    imageUrl: item.imageUrl,
    storagePath: item.storagePath,
    file: null,
    caption: item.caption,
    altText: item.altText ?? "",
    seoDescription: item.seoDescription ?? "",
    published: item.published,
    sortOrder: String(item.sortOrder),
  };
}

export function draftToFormInput(draft: CatalogueImageDraft): CatalogueFormInput {
  return {
    imageUrl: draft.imageUrl,
    storagePath: draft.storagePath,
    caption: draft.caption,
    altText: draft.altText,
    seoDescription: draft.seoDescription,
    published: draft.published,
    sortOrder: draft.sortOrder,
  };
}

/** @deprecated use draft helpers; kept for edit-cache mapping */
export function catalogueItemToForm(
  item: CatalogueImageItem,
): CatalogueFormInput {
  return draftToFormInput(catalogueItemToDraft(item));
}
