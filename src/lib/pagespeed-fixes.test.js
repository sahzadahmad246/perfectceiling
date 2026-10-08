import { test, expect } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StarRating } from "../components/star-rating";
function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
test("homepage text colors meet 4.5:1 against their warm backgrounds", () => {
  for (const [text, backgrounds] of [
    ["6c665c", ["f3f0e9", "f3eee5", "eee9df", "f1ede5", "edf1ec", "f3ebe6", "eeedf2"]],
    ["80603e", ["f3f0e9", "fbfbfa"]], ["746653", ["fbfbfa", "f3eee5"]], ["7c5c39", ["f3eee5"]],
    ["7b5b38", ["f1ede5"]], ["52674f", ["edf1ec"]], ["805946", ["f3ebe6"]], ["665770", ["eeedf2"]],
  ]) for (const background of backgrounds) expect((luminance(background) + 0.05) / (luminance(text) + 0.05)).toBeGreaterThanOrEqual(4.5);
});
test("rating stars expose one valid named image to assistive technology", () => {
 const html = renderToStaticMarkup(createElement(StarRating, { rating: 4.7 }));
 expect(html).toContain('role="img"'); expect(html).toContain('aria-label="4.7 out of 5 stars"');
});
