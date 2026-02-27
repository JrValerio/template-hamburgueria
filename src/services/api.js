import axios from "axios";
import { fallbackProducts } from "../data/products";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://hamburgueria-kenzie-json-serve.herokuapp.com/";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

/**
 * Fetch the product catalog from the remote API.
 *
 * Behavior:
 * - If VITE_USE_STATIC_FALLBACK=true, returns the local seed immediately.
 * - Otherwise attempts up to 2 requests with a 1-second gap between them.
 * - On all failures returns the local seed and sets `_fromFallback = true`
 *   on the returned array so callers can show a degraded-state indicator.
 */
export async function fetchProducts() {
  if (import.meta.env.VITE_USE_STATIC_FALLBACK === "true") {
    const seed = [...fallbackProducts];
    seed._fromFallback = true;
    return seed;
  }

  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await api.get("/products");
      return data;
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.warn(
          `[api] fetchProducts: remote unreachable after ${MAX_ATTEMPTS} attempts — using local fallback.`,
          err?.message
        );
        const seed = [...fallbackProducts];
        seed._fromFallback = true;
        return seed;
      }
    }
  }
}
