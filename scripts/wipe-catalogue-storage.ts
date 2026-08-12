/**
 * Delete all catalogue images from Supabase Storage (business-assets/catalogue/*).
 *
 * Hosted Supabase blocks: DELETE FROM storage.objects
 * Use this Storage API script instead.
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Run:
 *   bun run scripts/wipe-catalogue-storage.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BUCKET = "business-assets";
const FOLDER = "catalogue";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const text = readFileSync(envPath, "utf8");

  for (const line of text.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");

    if (eq <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function listAllCataloguePaths(): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    if (!data?.length) {
      break;
    }

    for (const item of data) {
      // Skip folder placeholders if any
      if (!item.name || item.name.endsWith("/")) {
        continue;
      }

      // list() returns names without the folder prefix
      paths.push(`${FOLDER}/${item.name}`);
    }

    if (data.length < limit) {
      break;
    }

    offset += limit;
  }

  return paths;
}

async function removeInBatches(paths: string[]) {
  const batchSize = 50;
  let removed = 0;

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const { error } = await supabase.storage.from(BUCKET).remove(batch);

    if (error) {
      throw new Error(`Remove failed: ${error.message}`);
    }

    removed += batch.length;
    console.log(`Removed ${removed}/${paths.length}…`);
  }

  return removed;
}

async function main() {
  console.log(`Listing ${BUCKET}/${FOLDER}/ …`);
  const paths = await listAllCataloguePaths();

  if (!paths.length) {
    console.log("No catalogue storage files found. Nothing to delete.");
    return;
  }

  console.log(`Found ${paths.length} file(s). Deleting…`);
  const removed = await removeInBatches(paths);
  console.log(`Done. Deleted ${removed} catalogue storage file(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
