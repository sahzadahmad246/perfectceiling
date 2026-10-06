export type CatalogueMosaicPhoto = { id: string; url: string; alt: string };

/** Each slot gets a different photo; successive frames visit the whole album. */
export function getCatalogueMosaicFrame(photos: CatalogueMosaicPhoto[], frame: number) {
  if (!photos.length) return [];
  const offset = ((frame % photos.length) + photos.length) % photos.length;
  return Array.from({ length: Math.min(3, photos.length) }, (_, slot) => photos[(offset + slot) % photos.length]);
}
