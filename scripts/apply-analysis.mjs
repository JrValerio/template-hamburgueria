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
const analysis = JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"));
const { fallbackProducts } = await import("../src/data/products.js");

// ── Map boolean → tag slug ────────────────────────────────────────────────────
function booleanTagsFromAnalysis(a) {
  const map = {
    isVegetarian: "vegetariano",
    isVegan: "vegano",
    hasBacon: "bacon",
    hasCheese: "queijo",
    hasEgg: "ovo",
    isSpicy: "picante",
    isPremium: "premium",
  };
  return Object.entries(map)
    .filter(([key]) => a[key] === true)
    .map(([, tag]) => tag);
}

// ── Apply patches ─────────────────────────────────────────────────────────────
const SKIP_CONFIDENCE = new Set(["low"]);
let patched = 0;
let skipped = 0;

const updated = fallbackProducts.map((product) => {
  const a = analysis[product.img];

  if (!a || a.error || SKIP_CONFIDENCE.has(a.confidence)) {
    skipped++;
    return product;
  }

  // Merge tags: keep existing + add AI booleans + add AI explicit tags
  const aiTags = [
    ...booleanTagsFromAnalysis(a),
    ...(Array.isArray(a.tags) ? a.tags : []),
  ];
  const mergedTags = [...new Set([...product.tags, ...aiTags])];

  const next = {
    ...product,
    description: a.suggestedDescription ?? product.description,
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
