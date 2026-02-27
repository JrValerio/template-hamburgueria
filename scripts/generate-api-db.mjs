/**
 * Generates api-mock/db.json from src/data/products.js.
 *
 * Run from the repo root:
 *   node scripts/generate-api-db.mjs
 *
 * This keeps the json-server database in sync with the front-end seed,
 * so there is a single source of truth for the product catalog.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const { fallbackProducts } = await import("../src/data/products.js");

const db = { products: fallbackProducts };
const outDir = join(ROOT, "api-mock");
const outFile = join(outDir, "db.json");

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(db, null, 2) + "\n");

console.log(
  `[generate-api-db] wrote ${fallbackProducts.length} products to api-mock/db.json`
);
