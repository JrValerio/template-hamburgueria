/**
 * analyze-images.mjs
 *
 * Calls Gemini 1.5-flash Vision on every image under public/assets/menu/
 * and saves structured metadata to scripts/image-analysis.json.
 *
 * Usage:
 *   GEMINI_API_KEY=<key> node scripts/analyze-images.mjs
 *
 * Cache behavior:
 *   - Results are keyed by image path + SHA-1 content hash.
 *   - Re-running skips already-analyzed images (safe to interrupt/resume).
 *   - To re-analyze a specific image: delete its entry from image-analysis.json.
 *
 * Rate: 1 request / 5 s  →  12 RPM  (free tier limit: 15 RPM)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname, extname, relative, sep } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MENU_DIR = join(ROOT, "public", "assets", "menu");
const ANALYSIS_FILE = join(__dirname, "image-analysis.json");
const DELAY_MS = 5_000;
const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

// ── API key ───────────────────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(
    "\n[analyze-images] ❌  GEMINI_API_KEY env var is missing.\n" +
      "  Run:  GEMINI_API_KEY=your_key node scripts/analyze-images.mjs\n" +
      "  Get a free key at: https://aistudio.google.com/app/apikey\n"
  );
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sha1(filePath) {
  return createHash("sha1").update(readFileSync(filePath)).digest("hex");
}

function mimeType(ext) {
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(p));
    else if (entry.isFile() && ALLOWED_EXTS.has(extname(p).toLowerCase())) {
      files.push(p);
    }
  }
  return files;
}

/** /assets/menu/burgers/burger-001.jpg */
function toPublicUrl(absPath) {
  return "/" + relative(join(ROOT, "public"), absPath).split(sep).join("/");
}

/** "burgers" → "burger"  |  "fries" → "side"  |  etc.
 *  Anchors on the "menu" segment so path depth changes never break the index. */
function folderHint(url) {
  const parts = url.split("/");
  const idx = parts.indexOf("menu");
  const folder = idx >= 0 ? (parts[idx + 1] ?? "") : "";
  const map = { burgers: "burger", drinks: "drink", desserts: "dessert", fries: "side" };
  return map[folder] ?? "unknown";
}

function stripFences(text) {
  return text
    .replace(/^```[a-z]*\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
}

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = existsSync(ANALYSIS_FILE)
  ? JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"))
  : { version: 2, items: {} };

if (!cache.items) cache.items = {};

function saveCache() {
  writeFileSync(ANALYSIS_FILE, JSON.stringify(cache, null, 2) + "\n");
}

// ── Gemini client ─────────────────────────────────────────────────────────────
const genai = new GoogleGenerativeAI(apiKey);
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

const PROMPT = `You are a food-menu classifier for a Brazilian burger restaurant.
Analyze the image and return ONLY a valid JSON object — no markdown, no explanation.

Schema:
{
  "topCategory": "burger"|"drink"|"side"|"dessert"|"unknown",
  "subtype": "brief English subtype (e.g. bacon-cheeseburger, milkshake, french-fries, brownie)",
  "title_pt": "attractive name in Brazilian Portuguese, max 30 chars",
  "description_pt": "enticing 1-sentence description in Brazilian Portuguese, max 90 chars",
  "diet": { "vegetarian": false, "vegan": false },
  "flags": { "containsBacon": false, "containsCheese": false, "hasEgg": false, "spicy": false, "isPremium": false },
  "tags": ["lowercase-kebab-tag"],
  "confidence": 0.9,
  "notes": "optional observation"
}

Rules:
- confidence: 0..1 float
- tags: max 8, lowercase kebab-case
- Return ONLY the JSON object`;

// ── Analyze one image with retry ──────────────────────────────────────────────
async function analyzeOne(absPath, hint) {
  const ext = extname(absPath).toLowerCase();
  const base64 = readFileSync(absPath).toString("base64");

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent([
        { text: PROMPT + `\n\nFolder hint (for context only): ${hint}` },
        { inlineData: { data: base64, mimeType: mimeType(ext) } },
      ]);
      const raw = stripFences(result.response.text());
      return JSON.parse(raw);
    } catch (err) {
      if (attempt === 3) throw err;
      const wait = 1_500 * attempt;
      console.warn(`  [retry ${attempt}] ${err.message} — waiting ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = walk(MENU_DIR);
console.log(`\n[analyze-images] ${files.length} images found under public/assets/menu/\n`);

let newCount = 0;
let skipCount = 0;
let errorCount = 0;

for (let i = 0; i < files.length; i++) {
  const absPath = files[i];
  const url = toPublicUrl(absPath);
  const hash = sha1(absPath);
  const hint = folderHint(url);

  const cached = cache.items[url];
  if (cached && cached.hash === hash && !cached.error) {
    skipCount++;
    if ((i + 1) % 20 === 0) {
      console.log(`[skip] ${i + 1}/${files.length} (${skipCount} cached)`);
    }
    continue;
  }

  try {
    const analysis = await analyzeOne(absPath, hint);
    cache.items[url] = {
      hash,
      folderHint: hint,
      analysis,
      analyzedAt: new Date().toISOString(),
    };
    newCount++;
    console.log(
      `[ok] ${i + 1}/${files.length}  ${url}\n` +
        `     → ${analysis.topCategory}/${analysis.subtype} (conf ${analysis.confidence})`
    );
  } catch (err) {
    cache.items[url] = { hash, folderHint: hint, error: err.message };
    errorCount++;
    console.error(`[error] ${url}: ${err.message}`);
  }

  // Save after every image — partial progress is never lost
  saveCache();

  // Rate-limit (skip delay after last item)
  if (i < files.length - 1) {
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
}

saveCache();

console.log(`
[analyze-images] Done.
  ✔ new:     ${newCount}
  ↷ skipped: ${skipCount} (cached)
  ✗ errors:  ${errorCount}
  → scripts/image-analysis.json (${Object.keys(cache.items).length} entries)

Next steps:
  # Patch existing catalog (preserves names/prices):
  node scripts/apply-analysis.mjs [--dry-run]

  # Regenerate full catalog from all analyzed images:
  node scripts/gen-catalog-from-analysis.mjs [--dry-run]
`);
