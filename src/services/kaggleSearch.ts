/// <reference types="vite/client" />

// ─────────────────────────────────────────────────────────────
// BeeYield — Kaggle Headless Search Client
//
// Split-Brain query pipeline:
//   Tauri invoke → Rust search_kaggle → sidecar/Kaggle/offline
//
// When running outside Tauri (browser dev), falls back to
// direct HTTP fetch against the Kaggle Ngrok URL.
// ─────────────────────────────────────────────────────────────

export interface KaggleSearchHit {
  id: number;
  title: string;
  source: string;
  category: string | null;
  score: number;
}

export interface KaggleSearchResponse {
  results: KaggleSearchHit[];
  query: string;
  took_ms: number;
  total_indexed: number;
  /** Where results came from: "sidecar" | "kaggle" | "offline_cache" */
  source: "sidecar" | "kaggle" | "offline_cache";
}

/**
 * Search the BeeYield knowledge lake (25K+ documents).
 *
 * Resolution order:
 * 1. Tauri command (uses Rust → sidecar → Kaggle → offline)
 * 2. Direct HTTP to Kaggle Ngrok endpoint (browser fallback)
 */
export async function searchKnowledgeLake(
  query: string,
  topK = 10
): Promise<KaggleSearchResponse> {
  // Try Tauri invoke first
  if (typeof window !== "undefined" && "__TAURI__" in window) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke<KaggleSearchResponse>("search_kaggle", {
        query,
        topK,
      });
    } catch (err) {
      console.warn("[kaggle] Tauri invoke failed:", err);
    }
  }

  // Fallback: direct HTTP to Kaggle or local backend
  return directFetch(query, topK);
}

/**
 * Direct HTTP fetch (for browser dev or when Tauri is unavailable)
 */
async function directFetch(
  query: string,
  topK: number
): Promise<KaggleSearchResponse> {
  const kaggleUrl =
    import.meta.env.VITE_KAGGLE_SEARCH_URL ?? "http://localhost:8765";
  const apiKey = import.meta.env.VITE_KAGGLE_API_KEY ?? "";

  try {
    const resp = await fetch(`${kaggleUrl}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "X-API-Key": apiKey } : {}),
      },
      body: JSON.stringify({ query, top_k: topK }),
    });

    if (!resp.ok) {
      throw new Error(`Kaggle search failed: ${resp.status}`);
    }

    const data = await resp.json();
    return { ...data, source: "kaggle" } as KaggleSearchResponse;
  } catch (err) {
    console.warn("[kaggle] Direct fetch failed:", err);
    return {
      results: [],
      query,
      took_ms: 0,
      total_indexed: 0,
      source: "offline_cache",
    };
  }
}

/**
 * Check health of the search infrastructure.
 * Returns status of both the local sidecar and Kaggle endpoint.
 */
export async function checkKaggleHealth(): Promise<{
  sidecar: { url: string; status: string };
  kaggle: { url: string; status: string };
  active_tier: string;
}> {
  if (typeof window !== "undefined" && "__TAURI__" in window) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke("kaggle_health_check");
    } catch {
      // fall through
    }
  }

  return {
    sidecar: { url: "http://127.0.0.1:3001", status: "unknown" },
    kaggle: { url: "not configured", status: "unknown" },
    active_tier: "offline",
  };
}
