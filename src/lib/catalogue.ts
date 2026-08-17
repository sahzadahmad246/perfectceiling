/** One photo inside a catalogue group. */
export type CatalogueGroupImage = {
  id: string;
  imageUrl: string;
  storagePath: string;
  /** Optional label under the photo; also used as image alt text. */
  subtitle: string | null;
  /** List-card cover for this group. */
  isThumbnail: boolean;
  sortOrder: number;
  viewCount: number;
};

/** Admin catalogue group (e.g. "Moldings") with its photos. */
export type CatalogueGroupItem = {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  sortOrder: number;
  images: CatalogueGroupImage[];
};

/** Local draft for one photo in the admin form. */
export type CatalogueImageDraft = {
  clientId: string;
  /** Existing DB id when editing a saved image. */
  id?: string;
  /** Preview URL (blob: for local picks, https for existing). */
  imageUrl: string;
  storagePath: string;
  /** Local file held until save — only then is it uploaded. */
  file?: File | null;
  subtitle: string;
  isThumbnail: boolean;
  sortOrder: string;
};

/** Form payload for create/update of a whole group. */
export type CatalogueFormInput = {
  title: string;
  description: string;
  published: boolean;
  sortOrder: string;
  images: Array<{
    /** Existing image id when updating; omit for new uploads. */
    id?: string;
    imageUrl: string;
    storagePath: string;
    subtitle: string;
    isThumbnail: boolean;
    sortOrder: string;
  }>;
};

export function getCatalogueDisplayTitle(item: { title: string }) {
  return item.title.trim();
}

/** Alt text for a photo: subtitle, else group title, else generic. */
export function getCatalogueImageAlt(
  image: { subtitle?: string | null },
  groupTitle?: string,
  options?: { city?: string | null; businessName?: string | null },
) {
  const subject =
    image.subtitle?.trim() ||
    groupTitle?.trim() ||
    "Ceiling design";
  const city = options?.city?.trim();
  const business = options?.businessName?.trim();

  if (city && business) {
    return `${subject} false ceiling design in ${city} by ${business}`;
  }

  if (city) {
    return `${subject} false ceiling design in ${city}`;
  }

  return `${subject} false ceiling design`;
}

export function getCatalogueImageSeoTitle(
  image: { subtitle?: string | null },
  groupTitle: string,
  city?: string | null,
) {
  const subject = image.subtitle?.trim() || groupTitle.trim();
  const place = city?.trim();

  return place
    ? `${subject} | ${groupTitle} ceiling design in ${place}`
    : `${subject} | ${groupTitle} ceiling design`;
}

export function getCataloguePublicPath(id: string) {
  return `/catalogue/${id}`;
}

/** Public path for a single image (OG/share deep link). */
export function getCatalogueImagePublicPath(groupId: string, imageId: string) {
  return `/catalogue/${groupId}?image=${encodeURIComponent(imageId)}`;
}

/** Cover photo for list cards: marked thumbnail, else first image. */
export function getCataloguePreviewImage(
  item: Pick<CatalogueGroupItem, "images">,
): CatalogueGroupImage | null {
  const thumb = item.images.find((image) => image.isThumbnail);
  return thumb ?? item.images[0] ?? null;
}

export function emptyCatalogueImageDraft(
  sortOrder = "0",
): CatalogueImageDraft {
  return {
    clientId: crypto.randomUUID(),
    imageUrl: "",
    storagePath: "",
    file: null,
    subtitle: "",
    isThumbnail: false,
    sortOrder,
  };
}

export function groupItemToImageDrafts(
  item: CatalogueGroupItem,
): CatalogueImageDraft[] {
  return item.images.map((image) => ({
    clientId: image.id,
    id: image.id,
    imageUrl: image.imageUrl,
    storagePath: image.storagePath,
    file: null,
    subtitle: image.subtitle ?? "",
    isThumbnail: image.isThumbnail,
    sortOrder: String(image.sortOrder),
  }));
}

/** Ensure exactly one thumbnail among form images (first if none). */
export function normalizeThumbnailFlags(
  images: CatalogueFormInput["images"],
): CatalogueFormInput["images"] {
  if (!images.length) {
    return images;
  }

  const hasThumb = images.some((image) => image.isThumbnail);

  return images.map((image, index) => ({
    ...image,
    isThumbnail: hasThumb ? Boolean(image.isThumbnail) : index === 0,
  }));
}
