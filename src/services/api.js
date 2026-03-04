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
 * @param {{ category?: string, signal?: AbortSignal }} [options] - Options for the fetch.
 * @returns {Promise<{ products: Array, fromFallback: boolean }>}
 */
export async function fetchProducts({ category, signal } = {}) {
  const filter = (p) => !category || p.category === category;

  if (import.meta.env.VITE_USE_STATIC_FALLBACK === "true") {
    return { products: fallbackProducts.filter(filter), fromFallback: true };
  }

  const MAX_ATTEMPTS = 2;
  const url = category ? `/products?category=${category}` : "/products";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await api.get(url, { signal });
      return { products: data, fromFallback: false };
    } catch (err) {
      // If the request was cancelled, re-throw the error so the calling component can handle it.
      if (axios.isCancel(err)) {
        throw err;
      }

      // If it's the last attempt, log a warning and return the fallback data.
      if (attempt >= MAX_ATTEMPTS) {
        console.warn(
          `[api] fetchProducts: remote unreachable after ${MAX_ATTEMPTS} attempts — using local fallback.`,
          err?.message
        );
        return {
          products: fallbackProducts.filter(filter),
          fromFallback: true,
        };
      }
      
      // If it's not the last attempt, wait for a short period before trying again.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  
  // This part should be unreachable, but as a safeguard, return fallback.
  return { products: fallbackProducts.filter(filter), fromFallback: true };
}
