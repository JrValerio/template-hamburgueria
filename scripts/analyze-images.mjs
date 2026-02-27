/**
 * analyze-images.mjs
 *
 * Calls Gemini Flash Vision for every image referenced in products.js and
 * saves structured metadata to scripts/image-analysis.json.
 *
 * Usage:
 *   GEMINI_API_KEY=<key> node scripts/analyze-images.mjs
 *
 * Re-running is safe: already-analyzed images are skipped (cached).
 * To re-analyze a specific image, delete its key from image-analysis.json.
 *
 * Rate: 1 request / 5 s  →  safe inside Gemini free tier (15 RPM).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ANALYSIS_FILE = join(__dirname, "image-analysis.json");
const DELAY_MS = 5_000; // 12 RPM — well inside free-tier 15 RPM limit

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

// ── Load cache ────────────────────────────────────────────────────────────────
const cache = existsSync(ANALYSIS_FILE)
  ? JSON.parse(readFileSync(ANALYSIS_FILE, "utf8"))
  : {};

// ── Collect unique image paths from the product catalog ───────────────────────
const { fallbackProducts } = await import("../src/data/products.js");
const imagePaths = [...new Set(fallbackProducts.map((p) => p.img))];

console.log(
  `\n[analyze-images] ${imagePaths.length} unique images in catalog.\n`
);

// ── Gemini client ─────────────────────────────────────────────────────────────
const genai = new GoogleGenerativeAI(apiKey);
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });

const PROMPT = `You are a food-menu specialist analyzing a photo for a Brazilian hamburger restaurant.

Examine the image carefully and return ONLY a valid JSON object — no markdown, no explanation:

{
  "detectedFood": "concise English description of what you see (e.g. 'classic cheeseburger with bacon and fried egg')",
  "suggestedName": "attractive menu name in Brazilian Portuguese (max 30 chars)",
  "suggestedDescription": "enticing 1-sentence menu description in Brazilian Portuguese highlighting key ingredients (max 90 chars)",
  "isVegetarian": false,
  "isVegan": false,
  "hasBacon": false,
  "hasCheese": false,
  "hasEgg": false,
  "isSpicy": false,
  "isPremium": false,
  "tags": ["tag1", "tag2"],
  "confidence": "high"
}

Rules:
- confidence must be one of: "high", "medium", "low"
- tags should be lowercase slugs like "bacon", "vegetariano", "premium", "smash", "frango", "peixe"
- Return ONLY the JSON object, nothing else`;

// ── Analyze ───────────────────────────────────────────────────────────────────
const results = { ...cache };
let newCount = 0;
let skipCount = 0;
let errorCount = 0;

for (const imgPath of imagePaths) {
  if (results[imgPath] && !results[imgPath].error) {
    skipCount++;
    console.log(`[skip]  ${imgPath}`);
    continue;
  }

  // Map /assets/menu/... → local filesystem
  const localPath = join(ROOT, "public", imgPath);
  if (!existsSync(localPath)) {
    console.warn(`[miss]  ${localPath} — file not found`);
    errorCount++;
    continue;
  }

  try {
    const imageData = readFileSync(localPath);
    const base64 = imageData.toString("base64");

    const result = await model.generateContent([
      PROMPT,
      { inlineData: { data: base64, mimeType: "image/jpeg" } },
    ]);

    // Strip possible markdown fences from response
    const raw = result.response.text().trim();
    const jsonText = raw.startsWith("```")
      ? raw.replace(/^```[a-z]*\n?/, "").replace(/\n?```$/, "").trim()
      : raw;

    const parsed = JSON.parse(jsonText);
    results[imgPath] = parsed;
    newCount++;
    console.log(`[ok]    ${imgPath}  →  "${parsed.detectedFood}" (${parsed.confidence})`);
  } catch (err) {
    console.error(`[error] ${imgPath}:`, err.message);
    results[imgPath] = { error: err.message };
    errorCount++;
  }

  // Write after each image so partial progress isn't lost on crash
  writeFileSync(ANALYSIS_FILE, JSON.stringify(results, null, 2) + "\n");

  // Rate-limit delay (skip on last item)
  if (imgPath !== imagePaths[imagePaths.length - 1]) {
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }
}

// ── Final summary ─────────────────────────────────────────────────────────────
writeFileSync(ANALYSIS_FILE, JSON.stringify(results, null, 2) + "\n");

console.log(`
[analyze-images] Done.
  ✔ new:    ${newCount}
  ↷ skipped: ${skipCount}
  ✗ errors:  ${errorCount}
  → scripts/image-analysis.json (${Object.keys(results).length} entries)

Next step:
  node scripts/apply-analysis.mjs
`);
