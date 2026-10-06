import { describe, expect, test } from "bun:test";
import { getCatalogueMosaicFrame } from "./catalogue-mosaic";

const photos = Array.from({ length: 7 }, (_, index) => ({ id: String(index), url: `/photo-${index}.jpg`, alt: `Design ${index}` }));

describe("catalogue mosaic rotation", () => {
  test("cycles through every photo in an album larger than three", () => {
    const seen = new Set();
    for (let frame = 0; frame < photos.length; frame++) {
      const visible = getCatalogueMosaicFrame(photos, frame);
      expect(visible).toHaveLength(3);
      expect(new Set(visible.map((photo) => photo.id)).size).toBe(3);
      visible.forEach((photo) => seen.add(photo.id));
    }
    expect(seen.size).toBe(7);
  });
  test("three photos rotate into all three positions", () => {
    const album = photos.slice(0, 3);
    expect(getCatalogueMosaicFrame(album, 0).map((photo) => photo.id)).toEqual(["0", "1", "2"]);
    expect(getCatalogueMosaicFrame(album, 1).map((photo) => photo.id)).toEqual(["1", "2", "0"]);
    expect(getCatalogueMosaicFrame(album, 2).map((photo) => photo.id)).toEqual(["2", "0", "1"]);
  });
  test("two photos swap positions without duplicated tiles", () => {
    expect(getCatalogueMosaicFrame(photos.slice(0, 2), 1).map((photo) => photo.id)).toEqual(["1", "0"]);
  });
  test("one-photo and empty albums remain valid", () => {
    expect(getCatalogueMosaicFrame(photos.slice(0, 1), 15)).toEqual([photos[0]]);
    expect(getCatalogueMosaicFrame([], 1)).toEqual([]);
  });
  test("wraps at the end of the album", () => {
    expect(getCatalogueMosaicFrame(photos, 7)).toEqual(getCatalogueMosaicFrame(photos, 0));
  });
});
