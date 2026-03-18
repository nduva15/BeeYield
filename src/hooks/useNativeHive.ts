// ─────────────────────────────────────────────────────────────
// useNativeHive — React hook for Tauri ↔ Web fallback
//
// When running inside the Tauri wrapper, all calls go through
// high-speed Rust IPC. In a normal browser, they fall back to
// the Python FastAPI backend via HTTP.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import * as bridge from "@/services/tauri-bridge";

export function useNativeHive() {
  const isTauri = bridge.isTauriEnvironment();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        return result;
      } catch (err: any) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message ?? "Unknown error";
        setError(msg);
        console.error("[NativeHive]", msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    isTauri,
    loading,
    error,

    // ── Vector Store ──────────────────────────────────
    ingestDocuments: (docs: bridge.IngestDoc[]) =>
      wrap(() => bridge.ingestDocuments(docs)),

    searchKnowledge: (query: string, topK?: number) =>
      wrap(() => bridge.searchKnowledge(query, topK)),

    getStoreStats: () => wrap(() => bridge.getStoreStats()),

    // ── Intelligence Pipeline ──────────────────────────────────
    askBeeYield: (query: bridge.AIQuery) =>
      wrap(() => bridge.askBeeYield(query)),

    analyzeHive: (req: bridge.HiveAnalysisRequest) =>
      wrap(() => bridge.analyzeHiveData(req)),

    generateReport: (req: bridge.ReportRequest) =>
      wrap(() => bridge.generateReport(req)),

    // ── HoneyChain ───────────────────────────────────
    verifyBatch: (batchCode: string) =>
      wrap(() => bridge.verifyBatch(batchCode)),

    getChainStatus: () => wrap(() => bridge.getChainStatus()),

    // ── System ───────────────────────────────────────
    healthCheck: () => wrap(() => bridge.healthCheck()),
    getSystemInfo: () => wrap(() => bridge.getSystemInfo()),
  };
}
