import { useState, useRef, useCallback } from "react";
import {
  Search,
  Zap,
  Brain,
  Database,
  Filter,
  Loader2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Bug,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  X,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */

interface StreamResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source: string;
  phase: number;
  domain?: string;
  global_id?: string;
  reliability?: number;
  url?: string;
}

interface SearchMeta {
  phase: number;
  label: string;
  elapsed_ms: number;
  count: number;
}

type Phase = 1 | 2 | 3 | 4;

const PHASE_LABELS: Record<Phase, string> = {
  1: "BM25 Keyword Scan",
  2: "Semantic Vector Search",
  3: "Cross-Encoder Re-rank",
  4: "Gemini Synthesis",
};

const PHASE_ICONS: Record<Phase, typeof Zap> = {
  1: Zap,
  2: Database,
  3: Brain,
  4: Sparkles,
};

const DOMAIN_ICONS: Record<string, typeof BookOpen> = {
  academic: BookOpen,
  iot_acoustic: Radio,
  geospatial: MapPin,
  disease_stressor: Bug,
  traceability: Shield,
};

const DOMAINS = [
  { value: "", label: "All Domains" },
  { value: "academic", label: "Academic & Peer-Reviewed" },
  { value: "iot_acoustic", label: "IoT & Acoustic" },
  { value: "geospatial", label: "Geospatial & Biodiversity" },
  { value: "disease_stressor", label: "Disease & Stressor" },
  { value: "traceability", label: "Traceability & Quality" },
];

/* ─── Component ─────────────────────────────────────────── */

export function StreamingSearch() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [topK, setTopK] = useState(10);
  const [synthesize, setSynthesize] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [results, setResults] = useState<StreamResult[]>([]);
  const [metas, setMetas] = useState<SearchMeta[]>([]);
  const [synthesis, setSynthesis] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const getBackendUrl = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__) {
      return "http://127.0.0.1:3001/search/stream";
    }
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
    return `${base}/api/v1/search/stream`;
  }, []);

  const startSearch = useCallback(async () => {
    if (!query.trim() || isStreaming) return;

    setResults([]);
    setMetas([]);
    setSynthesis("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        top_k: String(topK),
      });
      if (domain) params.set("domain", domain);
      if (synthesize) params.set("synthesize", "true");

      const url = `${getBackendUrl()}?${params}`;

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "text/event-stream" },
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const reader = resp.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const chunk of lines) {
          const dataLine = chunk
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!dataLine) continue;

          const raw = dataLine.slice(6).trim();
          if (raw === "[DONE]") continue;

          try {
            const evt = JSON.parse(raw);

            if (evt.type === "result") {
              setResults((prev) => {
                const exists = prev.some((r) => r.id === evt.id);
                if (exists) return prev;
                return [...prev, evt as StreamResult];
              });
            } else if (evt.type === "meta") {
              setMetas((prev) => [...prev, evt as SearchMeta]);
            } else if (evt.type === "synthesis") {
              setSynthesis((prev) => prev + (evt.text || ""));
            } else if (evt.type === "done") {
              // Final summary — nothing to show
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Search failed");
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [query, domain, topK, synthesize, isStreaming, getBackendUrl]);

  const cancelSearch = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const activePhase: Phase | null = metas.length
    ? (Math.max(...metas.map((m) => m.phase)) as Phase)
    : isStreaming
      ? 1
      : null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Search className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Streaming Vector Search</h2>
          <p className="text-xs text-muted-foreground">
            4-phase progressive search across 25,000+ knowledge nodes
          </p>
        </div>
      </div>

      {/* ─── Search Bar ─────────────────────────────────── */}
      <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              placeholder="Search across all bee intelligence domains…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startSearch()}
              disabled={isStreaming}
            />
          </div>
          {isStreaming ? (
            <button
              onClick={cancelSearch}
              className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          ) : (
            <button
              onClick={startSearch}
              disabled={!query.trim()}
              className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Search
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              aria-label="Filter by knowledge domain"
              className="rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              {DOMAINS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Top K:</span>
            <input
              type="number"
              min={1}
              max={100}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              aria-label="Top K results"
              className="w-16 rounded-md border bg-background px-2 py-1.5 text-xs"
            />
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={synthesize}
              onChange={(e) => setSynthesize(e.target.checked)}
              className="rounded"
            />
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs">Gemini Synthesis</span>
          </label>
        </div>
      </div>

      {/* ─── Phase Progress ─────────────────────────────── */}
      {(isStreaming || metas.length > 0) && (
        <div className="grid grid-cols-4 gap-2">
          {([1, 2, 3, 4] as Phase[]).map((p) => {
            const meta = metas.find((m) => m.phase === p);
            const Icon = PHASE_ICONS[p];
            const isActive = activePhase === p && isStreaming;
            const isDone = meta !== undefined;

            return (
              <div
                key={p}
                className={`rounded-lg border p-3 text-center transition-all ${
                  isActive
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                    : isDone
                      ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                      : "border-muted opacity-40"
                }`}
              >
                <div className="flex justify-center mb-1">
                  {isActive ? (
                    <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                  ) : (
                    <Icon
                      className={`h-4 w-4 ${isDone ? "text-green-600" : "text-muted-foreground"}`}
                    />
                  )}
                </div>
                <p className="text-[11px] font-medium">{PHASE_LABELS[p]}</p>
                {meta && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {meta.elapsed_ms}ms · {meta.count} hits
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Error ──────────────────────────────────────── */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ─── Results ────────────────────────────────────── */}
      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {results.map((r) => {
              const expanded = expandedId === r.id;
              const DomainIcon =
                DOMAIN_ICONS[r.domain || ""] || BookOpen;

              return (
                <div
                  key={r.id}
                  className="rounded-lg border bg-card p-3 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <DomainIcon className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium truncate">
                          {r.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-mono">
                            {(r.score * 100).toFixed(1)}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Phase {r.phase}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {r.source}
                          </span>
                          {r.reliability !== undefined && (
                            <span className="text-[10px] text-muted-foreground">
                              R:{(r.reliability * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open source: ${r.title}`}
                          className="text-muted-foreground hover:text-amber-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() =>
                          setExpandedId(expanded ? null : r.id)
                        }
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground whitespace-pre-wrap">
                      {r.content}
                      {r.global_id && (
                        <div className="mt-2 font-mono text-[10px]">
                          GID: {r.global_id}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Synthesis ──────────────────────────────────── */}
      {synthesis && (
        <div className="rounded-xl border border-purple-300 bg-purple-50 dark:bg-purple-900/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300">
              AI Synthesis
            </h3>
          </div>
          <div className="text-sm text-purple-900 dark:text-purple-200 whitespace-pre-wrap">
            {synthesis}
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamingSearch;
