/**
 * apply-analysis.mjs
 *
 * Reads scripts/image-analysis.json and patches src/data/products.js:
 *   - Replaces description with the AI-generated one (if confidence >= medium)
 *   - Merges AI-detected tags (deduped) with existing tags
 *   - Preserves all other fields (id, sku, name, category, price, img, active)
 *
 * After running, re-sync the API mock:
 *   npm run gen:api-db
 *
 * Usage:
 *   node scripts/apply-analysis.mjs [--dry-run]
 *
 * --dry-run  prints the diff but does NOT write products.js
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ANALYSIS_FILE = join(__dirname, "image-analysis.json");
const PRODUCTS_FILE = join(ROOT, "src", "data", "products.js");

const isDryRun = process.argv.includes("--dry-run");

// ── Guards ────────────────────────────────────────────────────────────────────
if (!existsSync(ANALYSIS_FILE)) {
  console.error(
    "[apply-analysis] ❌  scripts/image-analysis.json not found.\n" +
      "  Run first:  GEMINI_API_KEY=... node scripts/analyze-images.mjs\n"
  );
  process.exit(1);
}

// ── Load data ─────────────────────────────────────────────────────────────────
// Cache format: { version, items: { [url]: { hash, analysis, ... } } }
const cache = JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"));
// Support both old flat format and new versioned format
const analysisItems = cache.items ?? cache;
const { fallbackProducts } = await import("../src/data/products.js");

// ── Normalize: enforce diet/flag logical consistency ─────────────────────────
function normalize(a) {
  const n = structuredClone(a);
  n.diet ??= { vegetarian: false, vegan: false };
  n.flags ??= { containsBacon: false, containsCheese: false, hasEgg: false, spicy: false, isPremium: false };
  if (n.diet.vegan) {
    n.diet.vegetarian = true;
    n.flags.containsBacon = false;
    n.flags.containsCheese = false;
    n.flags.hasEgg = false;
  }
  if (n.diet.vegetarian) n.flags.containsBacon = false;
  return n;
}

// ── Map flags → tag slugs (new schema) ───────────────────────────────────────
function booleanTagsFromAnalysis(raw) {
  const a = normalize(raw);
  const out = [];
  if (a.diet.vegan) out.push("vegano");
  else if (a.diet.vegetarian) out.push("vegetariano");
  if (a.flags.containsBacon) out.push("bacon");
  if (a.flags.containsCheese) out.push("queijo");
  if (a.flags.hasEgg) out.push("ovo");
  if (a.flags.spicy) out.push("picante");
  if (a.flags.isPremium) out.push("premium");
  return out;
}

// ── Apply patches ─────────────────────────────────────────────────────────────
const SKIP_CONFIDENCE = new Set(["low"]);
let patched = 0;
let skipped = 0;

const updated = fallbackProducts.map((product) => {
  const entry = analysisItems[product.img];
  // Unwrap versioned cache: { hash, analysis, ... } or flat legacy entry
  const a = entry?.analysis ?? entry;

  if (!a || a.error || SKIP_CONFIDENCE.has(a.confidence)) {
    skipped++;
    return product;
  }

  // Merge tags: keep existing + normalized AI booleans + AI explicit tags
  const aiTags = [
    ...booleanTagsFromAnalysis(a),
    ...(Array.isArray(a.tags) ? a.tags : []),
  ];
  const mergedTags = [...new Set([...product.tags, ...aiTags])];

  // New schema uses description_pt; fall back to suggestedDescription (legacy)
  const description =
    a.description_pt ?? a.suggestedDescription ?? product.description;

  const next = {
    ...product,
    description,
    tags: mergedTags,
  };

  if (
    next.description !== product.description ||
    next.tags.length !== product.tags.length
  ) {
    patched++;
    if (isDryRun) {
      console.log(`\n[patch] id=${product.id}  ${product.img}`);
      console.log(`  desc:  "${product.description}"`);
      console.log(`      →  "${next.description}"`);
      if (next.tags.length !== product.tags.length) {
        console.log(`  tags:  [${product.tags}]  →  [${next.tags}]`);
      }
    }
  }

  return next;
});

// ── Serialize back to JS source ───────────────────────────────────────────────
function serializeProduct(p) {
  const tagsLine =
    p.tags.length === 0
      ? "[]"
      : `[${p.tags.map((t) => `"${t}"`).join(", ")}]`;

  return `  {
    id: ${p.id},
    sku: "${p.sku}",
    name: "${p.name}",
    category: "${p.category}",
    price: ${p.price},
    img: "${p.img}",
    description: "${p.description.replace(/"/g, '\\"')}",
    active: ${p.active},
    tags: ${tagsLine},
  }`;
}

// Rebuild section comments from original file based on category changes
const CATEGORY_COMMENTS = {
  "Sanduíches":
    "  // ─── Sanduíches ──────────────────────────────────────────────────────────",
  Combos:
    "  // ─── Combos ──────────────────────────────────────────────────────────────",
  Acompanhamentos:
    "  // ─── Acompanhamentos ─────────────────────────────────────────────────────",
  Bebidas:
    "  // ─── Bebidas ─────────────────────────────────────────────────────────────",
  Sobremesas:
    "  // ─── Sobremesas ──────────────────────────────────────────────────────────",
};

let lastCategory = null;
const lines = [];
for (const p of updated) {
  if (p.category !== lastCategory) {
    if (lastCategory !== null) lines.push("");
    if (CATEGORY_COMMENTS[p.category]) {
      lines.push(CATEGORY_COMMENTS[p.category]);
    }
    lastCategory = p.category;
  }
  lines.push(serializeProduct(p) + ",");
}

const header = `// Static seed catalog — used as offline fallback when the remote API is
// unreachable. Keep the UI-contract fields in sync with the API response:
// { id, name, category, price, img }
//
// Extra fields (sku, description, active, tags) are forward-compatible
// with a future SaaS backend; the current UI ignores them safely.
//
// Image convention: /assets/menu/<category>/<slug>-NNN.jpg
// All images live in public/ so Vite/Vercel serve them as static assets.
// Combos reuse burger hero shots (no dedicated combo folder).

export const fallbackProducts = [
`;

const footer = `];
`;

const output = header + lines.join("\n") + "\n" + footer;

// ── Write or print ────────────────────────────────────────────────────────────
if (isDryRun) {
  console.log(`\n[apply-analysis] DRY RUN — no files written.`);
} else {
  writeFileSync(PRODUCTS_FILE, output);
  console.log(`[apply-analysis] Wrote ${PRODUCTS_FILE}`);
}

console.log(`
[apply-analysis] Summary:
  ✔ patched:  ${patched} products
  ↷ skipped:  ${skipped} (low confidence or missing analysis)

${isDryRun ? "Re-run without --dry-run to apply." : "Next: npm run gen:api-db"}
`);
