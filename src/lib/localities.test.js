import { expect, test } from "bun:test";
import { localityPath, validateLocality } from "./localities";
import { buildPublicPageMetadata } from "./seo";
import { getCatalogueImageAlt } from "./catalogue";
const settings = { businessName: "Perfect Ceiling", logoUrl: null, phone: "9326654356", whatsapp: "918302740856", email: "", city: "Thane", serviceAreas: "Thane" };
test("metadata applies the brand exactly once and bypasses the root template", () => {
 const metadata = buildPublicPageMetadata({ title: "PVC Ceiling | Perfect Ceiling | Perfect Ceiling", description: "Description", url: "https://example.com/services/pvc", settings });
 expect(metadata.title).toEqual({ absolute: "PVC Ceiling | Perfect Ceiling" });
 expect(metadata.openGraph?.title).toBe("PVC Ceiling | Perfect Ceiling");
});
test("slug-like search titles become readable", () => {
 expect(buildPublicPageMetadata({ title: "\u200bgrid-ceiling-installation", description: "Description", url: "/services/grid", settings }).title).toEqual({ absolute: "Grid Ceiling Installation | Perfect Ceiling" });
});
test("city and locality routes retain a browseable hierarchy", () => {
 expect(localityPath({ city_slug: "thane", slug: "" })).toBe("/areas/thane");
 expect(localityPath({ city_slug: "thane", slug: "hiranandani-estate" })).toBe("/areas/thane/hiranandani-estate");
 expect(validateLocality({ name: "City", city: "Thane", city_slug: "../admin", published: false })).toBeTruthy();
});
test("drafts can be incomplete but publishing requires local facts and services", () => {
 const page = { name: "Thane", city: "Thane", city_slug: "thane" };
 expect(validateLocality(page)).toBeNull();
 expect(validateLocality({ ...page, published: true })).toBeTruthy();
 expect(validateLocality({ ...page, published: true, intro: "Intro", content: "Actual scope", local_details: "Actual coverage", service_ids: ["service"] })).toBeNull();
 expect(validateLocality({ ...page, faqs: [{ question: "Question", answer: "" }] })).toBeTruthy();
});
test("catalogue alt does not turn wall moulding into a ceiling or claim a photo location", () => {
 expect(getCatalogueImageAlt({ subtitle: "1000036569" }, "Wall molding", { city: "Thane", businessName: "Perfect Ceiling" })).toBe("Wall molding design photo");
 expect(getCatalogueImageAlt({ subtitle: "Panel detail" }, "Wall molding")).toBe("Panel detail");
});
