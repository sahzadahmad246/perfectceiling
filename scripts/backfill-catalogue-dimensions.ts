/** Serial, bounded backfill. Dry run unless --apply is supplied. */
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Load server-only Supabase environment variables before running.");
const client = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await client.from("catalogue_group_images").select("id,image_url,width,height");
if (error) throw new Error("Run the catalogue dimensions migration first.");
let failed = 0;
for (const row of data ?? []) {
 if (row.width && row.height) continue;
 try {
   const imageUrl = new URL(row.image_url);
   if (imageUrl.origin !== new URL(url).origin || !imageUrl.pathname.startsWith("/storage/v1/object/public/")) throw new Error("Unexpected image origin/path");
   const response = await fetch(imageUrl, { signal: AbortSignal.timeout(15000), redirect: "error" });
   if (!response.ok) throw new Error(`HTTP ${response.status}`);
   const reader = response.body!.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
   while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.length; if (bytes > 10 * 1024 * 1024) { await reader.cancel(); throw new Error("Image exceeds 10 MB"); } chunks.push(chunk.value); }
   const meta = await sharp(Buffer.concat(chunks)).metadata(); const rotated = meta.orientation && meta.orientation >= 5;
   const dimensions = { width: rotated ? meta.height : meta.width, height: rotated ? meta.width : meta.height };
   if (!dimensions.width || !dimensions.height) throw new Error("No image dimensions");
   if (process.argv.includes("--apply")) { const result = await client.from("catalogue_group_images").update(dimensions).eq("id", row.id); if (result.error) throw new Error(result.error.code); }
   console.log(row.id, dimensions.width, dimensions.height, process.argv.includes("--apply") ? "saved" : "dry run");
 } catch { failed++; console.error("Could not update image", row.id); }
}
if (failed) process.exitCode = 1;
