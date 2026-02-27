/**
 * gen-catalog-from-analysis.mjs
 *
 * Generates src/data/products.js and api-mock/db.json from
 * scripts/image-analysis.json (produced by analyze-images.mjs).
 *
 * Rules:
 *   - confidence >= 0.70 → full entry
 *   - confidence 0.55–0.69 → included, tagged "review-needed"
 *   - confidence < 0.55 → excluded
 *   - topCategory "unknown" → excluded
 *   - Prices are DETERMINISTIC (table-based, not random)
 *   - Existing products.js prices preserved when URL already exists
 *
 * Usage:
 *   node scripts/gen-catalog-from-analysis.mjs [--dry-run]
 *
 * --dry-run  prints the product count and first 3 entries without writing files.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ANALYSIS_FILE = join(__dirname, "image-analysis.json");
const PRODUCTS_FILE = join(ROOT, "src", "data", "products.js");
const DB_FILE = join(ROOT, "api-mock", "db.json");

const isDryRun = process.argv.includes("--dry-run");

// ── Guard ─────────────────────────────────────────────────────────────────────
if (!existsSync(ANALYSIS_FILE)) {
  console.error(
    "[gen-catalog] ❌  scripts/image-analysis.json not found.\n" +
      "  Run first:  GEMINI_API_KEY=... node scripts/analyze-images.mjs\n"
  );
  process.exit(1);
}

// ── Load inputs ───────────────────────────────────────────────────────────────
const { items } = JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"));

// Load existing products to preserve hand-tuned prices & names
let existingByUrl = {};
if (existsSync(PRODUCTS_FILE)) {
  try {
    const { fallbackProducts } = await import("../src/data/products.js");
    existingByUrl = Object.fromEntries(fallbackProducts.map((p) => [p.img, p]));
  } catch {
    // ignore if products.js is in a bad state
  }
}

// ── Deterministic price table ─────────────────────────────────────────────────
// Prices are fixed per (topCategory, flags) so every re-run yields the same value.
// To change a price: edit this table or edit products.js directly.
const PRICE_TABLE = {
  burger: {
    default: 29.9,
    premium: 44.9,   // isPremium or truffle/picanha subtype
    double: 39.9,    // double/smash-duplo
    chicken: 28.9,
    fish: 27.9,
    veggie: 28.9,
  },
  side: {
    default: 14.9,
    premium: 19.9,   // loaded / rústica
  },
  drink: {
    default: 8.9,
    milkshake: 19.9,
    juice: 12.9,
    alcoholic: 16.9,
  },
  dessert: {
    default: 14.9,
    premium: 21.9,   // petit-gateau, brownie-sorvete
  },
};

function resolvePrice(topCategory, analysis, existingPrice) {
  // Always prefer a previously set price
  if (existingPrice) return existingPrice;

  const t = PRICE_TABLE[topCategory] ?? PRICE_TABLE.burger;
  const sub = (analysis.subtype ?? "").toLowerCase();
  // analysis is already normalize()d at call site — flags always present
  const fl = analysis.flags;

  if (topCategory === "burger") {
    if (fl.isPremium || sub.includes("truffle") || sub.includes("picanha")) return t.premium;
    if (sub.includes("double") || sub.includes("duplo")) return t.double;
    if (sub.includes("chicken") || sub.includes("frango")) return t.chicken;
    if (sub.includes("fish") || sub.includes("peixe")) return t.fish;
    if (analysis.diet?.vegetarian || analysis.diet?.vegan) return t.veggie;
    return t.default;
  }

  if (topCategory === "side") {
    if (fl.isPremium || sub.includes("rustic") || sub.includes("loaded")) return t.premium;
    return t.default;
  }

  if (topCategory === "drink") {
    if (sub.includes("milkshake") || sub.includes("shake")) return t.milkshake;
    if (sub.includes("juice") || sub.includes("suco") || sub.includes("limon")) return t.juice;
    if (sub.includes("beer") || sub.includes("cerveja") || sub.includes("cocktail")) return t.alcoholic;
    return t.default;
  }

  if (topCategory === "dessert") {
    if (fl.isPremium || sub.includes("brownie") || sub.includes("petit") || sub.includes("gateau")) return t.premium;
    return t.default;
  }

  return 14.9;
}

// ── Map topCategory → SKU prefix & UI category label ─────────────────────────
const CAT_MAP = {
  burger:  { sku: "SND", label: "Sanduíches" },
  side:    { sku: "ACP", label: "Acompanhamentos" },
  drink:   { sku: "BEB", label: "Bebidas" },
  dessert: { sku: "SOB", label: "Sobremesas" },
};

// ── Normalize: enforce diet/flag logical consistency ─────────────────────────
// LLMs occasionally hallucinate contradictory fields (vegan + containsCheese).
// These hard rules close that gap before any tag generation or price lookup.
function normalize(analysis) {
  const a = structuredClone(analysis);
  a.diet ??= { vegetarian: false, vegan: false };
  a.flags ??= { containsBacon: false, containsCheese: false, hasEgg: false, spicy: false, isPremium: false };

  if (a.diet.vegan) {
    // Vegan implies vegetarian; vegan items never contain animal products
    a.diet.vegetarian = true;
    a.flags.containsBacon = false;
    a.flags.containsCheese = false;
    a.flags.hasEgg = false;
  }
  if (a.diet.vegetarian) {
    // Vegetarian items never contain bacon
    a.flags.containsBacon = false;
  }
  return a;
}

// ── Build boolean tags from analysis flags ────────────────────────────────────
function booleanTags(analysis) {
  // analysis must already be normalize()d before calling this
  const f = analysis.flags;
  const d = analysis.diet;
  const out = [];
  if (d.vegan) out.push("vegano");
  else if (d.vegetarian) out.push("vegetariano");
  if (f.containsBacon) out.push("bacon");
  if (f.containsCheese) out.push("queijo");
  if (f.hasEgg) out.push("ovo");
  if (f.spicy) out.push("picante");
  if (f.isPremium) out.push("premium");
  return out;
}

// ── Build product list ────────────────────────────────────────────────────────
const CATEGORY_ORDER = ["Sanduíches", "Combos", "Acompanhamentos", "Bebidas", "Sobremesas"];

const MIN_CONFIDENCE = 0.55;
const REVIEW_THRESHOLD = 0.70;

const rows = Object.entries(items)
  .filter(([, v]) => !v.error && v.analysis)
  .map(([url, v]) => {
    const analysis = normalize(v.analysis);
    return { url, ...analysis, _conf: analysis.confidence ?? 0 };
  })
  .filter((r) => r.topCategory !== "unknown" && r._conf >= MIN_CONFIDENCE)
  .sort((a, b) => {
    // 1. Category order
    const ai = CATEGORY_ORDER.indexOf(CAT_MAP[a.topCategory]?.label ?? "");
    const bi = CATEGORY_ORDER.indexOf(CAT_MAP[b.topCategory]?.label ?? "");
    if (ai !== bi) return ai - bi;
    // 2. Confidence desc
    if (b._conf !== a._conf) return b._conf - a._conf;
    // 3. URL tie-break → fully deterministic across runs and engines
    return a.url.localeCompare(b.url);
  });

const products = [];
let id = 1;

for (const r of rows) {
  const meta = CAT_MAP[r.topCategory];
  if (!meta) continue;

  const existing = existingByUrl[r.url];

  const aiTags = [
    ...(Array.isArray(r.tags) ? r.tags : []),
    ...booleanTags(r),
  ];
  if (r._conf < REVIEW_THRESHOLD) aiTags.push("review-needed");

  const mergedTags = [...new Set([
    ...(existing?.tags ?? []),
    ...aiTags,
  ])];

  products.push({
    id,
    sku: `${meta.sku}-${String(id).padStart(3, "0")}`,
    name: existing?.name ?? r.title_pt ?? r.subtype ?? "Item",
    category: meta.label,
    price: resolvePrice(r.topCategory, r, existing?.price),
    img: r.url,
    description: r.description_pt ?? existing?.description ?? "",
    active: true,
    tags: mergedTags,
  });

  id++;
}

// ── Dry run ───────────────────────────────────────────────────────────────────
if (isDryRun) {
  console.log(`\n[gen-catalog] DRY RUN — ${products.length} products would be written.\n`);
  console.log("First 3 entries:");
  console.log(JSON.stringify(products.slice(0, 3), null, 2));
  console.log(
    `\n  review-needed count: ${products.filter((p) => p.tags.includes("review-needed")).length}`
  );
  console.log("Re-run without --dry-run to write files.\n");
  process.exit(0);
}

// ── Serialize products.js ─────────────────────────────────────────────────────
function serializeProduct(p) {
  const tagsStr =
    p.tags.length === 0
      ? "[]"
      : `[${p.tags.map((t) => `"${t}"`).join(", ")}]`;

  return (
    `  {\n` +
    `    id: ${p.id},\n` +
    `    sku: "${p.sku}",\n` +
    `    name: "${p.name}",\n` +
    `    category: "${p.category}",\n` +
    `    price: ${p.price},\n` +
    `    img: "${p.img}",\n` +
    `    description: "${p.description.replace(/"/g, '\\"')}",\n` +
    `    active: ${p.active},\n` +
    `    tags: ${tagsStr},\n` +
    `  }`
  );
}

const SECTION_COMMENTS = {
  "Sanduíches":     "  // ─── Sanduíches ──────────────────────────────────────────────────────────",
  Combos:           "  // ─── Combos ──────────────────────────────────────────────────────────────",
  Acompanhamentos:  "  // ─── Acompanhamentos ─────────────────────────────────────────────────────",
  Bebidas:          "  // ─── Bebidas ─────────────────────────────────────────────────────────────",
  Sobremesas:       "  // ─── Sobremesas ──────────────────────────────────────────────────────────",
};

let lastCat = null;
const bodyLines = [];
for (const p of products) {
  if (p.category !== lastCat) {
    if (lastCat !== null) bodyLines.push("");
    if (SECTION_COMMENTS[p.category]) bodyLines.push(SECTION_COMMENTS[p.category]);
    lastCat = p.category;
  }
  bodyLines.push(serializeProduct(p) + ",");
}

const jsOutput =
  `// AUTO-GENERATED by scripts/gen-catalog-from-analysis.mjs\n` +
  `// Source: scripts/image-analysis.json (Gemini Vision)\n` +
  `// To update: re-run analyze-images.mjs then this script.\n` +
  `// Contract: { id, name, category, price, img } (+ forward-compatible fields)\n` +
  `//\n` +
  `// Tags with "review-needed" = confidence 0.55–0.69. Review manually.\n` +
  `\nexport const fallbackProducts = [\n` +
  bodyLines.join("\n") +
  `\n];\n`;

writeFileSync(PRODUCTS_FILE, jsOutput);
writeFileSync(DB_FILE, JSON.stringify({ products }, null, 2) + "\n");

const reviewCount = products.filter((p) => p.tags.includes("review-needed")).length;
console.log(`
[gen-catalog] Done.
  ✔ ${products.length} products written
  ⚠ ${reviewCount} tagged "review-needed" (confidence 0.55–0.69)
  → src/data/products.js
  → api-mock/db.json
`);
