import axios from "axios";
import { fallbackProducts } from "../data/products";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

/**
 * Fetch the product catalog from the remote API.
 *
 * Behavior:
 * - If VITE_API_BASE_URL is not defined, returns the local seed immediately.
 * - If VITE_USE_STATIC_FALLBACK=true, returns the local seed immediately.
 * - Otherwise attempts up to 2 requests with a 1-second gap between them.
 * - On all failures returns the local seed and sets `_fromFallback = true`
 *   on the returned array so callers can show a degraded-state indicator.
 */
/**
 * @param {{ category?: string }} [options]
 * @returns {{ products: Array, fromFallback: boolean }}
 */
export async function fetchProducts({ category } = {}) {
  const filter = (p) => !category || p.category === category;

  if (!BASE_URL || import.meta.env.VITE_USE_STATIC_FALLBACK === "true") {
    return { products: fallbackProducts.filter(filter), fromFallback: true };
  }

  const MAX_ATTEMPTS = 2;
  const url = category ? `/products?category=${category}` : "/products";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await api.get(url);
      return { products: data, fromFallback: false };
    } catch (err) {
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.warn(
          `[api] fetchProducts: remote unreachable after ${MAX_ATTEMPTS} attempts — using local fallback.`,
          err?.message
        );
        return {
          products: fallbackProducts.filter(filter),
          fromFallback: true,
        };
      }
    }
  }
}