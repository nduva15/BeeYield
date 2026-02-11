// ─────────────────────────────────────────────────────────────
// BeeYield Native Hive — TypeScript Bindings
//
// Type-safe wrappers around Tauri IPC commands.
// These mirror the Rust models 1:1.
// ─────────────────────────────────────────────────────────────

import { invoke } from "@tauri-apps/api/core";

// ── Types ────────────────────────────────────────────────────

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SearchResult {
  node_id: string;
  title: string;
  content: string;
  score: number;
  category: string;
  source: string;
}

export interface VectorStoreStats {
  total_nodes: number;
  dimensions: number;
  memory_usage_mb: number;
  categories: [string, number][];
}

export interface IngestDoc {
  title: string;
  content: string;
  source?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestResult {
  inserted: number;
  failed: number;
  errors: string[];
  total_nodes: number;
}

export interface AIQuery {
  question: string;
  context_limit?: number;
  include_sources?: boolean;
  model_override?: string;
}

export interface AIResponse {
  answer: string;
  sources: SearchResult[];
  model_used: string;
  tokens_used: TokenUsage;
  latency_ms: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface SensorReading {
  timestamp: string;
  temperature?: number;
  humidity?: number;
  weight?: number;
  sound_level?: number;
}

export interface HiveAnalysisRequest {
  hive_id: string;
  sensor_data: SensorReading[];
  period_days?: number;
}

export interface ReportRequest {
  report_type:
    | "HiveHealth"
    | "HarvestSummary"
    | "PollinationEfficiency"
    | "MarketAnalysis"
    | "TraceabilityAudit";
  farmer_id?: string;
  date_range?: [string, string];
}

export interface BatchVerification {
  batch_code: string;
  is_valid: boolean;
  merkle_root: string;
  block_index: number;
  chain_length: number;
  integrity_score: number;
  details: Record<string, unknown>;
}

export interface SystemInfo {
  version: string;
  rust_version: string;
  os: string;
  arch: string;
  memory_usage_mb: number;
  vector_store: VectorStoreStats;
  uptime_seconds: number;
}

export interface HealthCheck {
  status: string;
  engine: string;
  version: string;
  timestamp: string;
}

// ── Detection ────────────────────────────────────────────────

/** Returns true if running inside a Tauri v2 webview. */
export function isTauriEnvironment(): boolean {
  return !!(window as any).__TAURI_INTERNALS__;
}

// ── Vector Store Commands ────────────────────────────────────

export async function ingestDocuments(
  documents: IngestDoc[]
): Promise<IngestResult> {
  return invoke<IngestResult>("ingest_documents", { documents });
}

export async function searchKnowledge(
  query: string,
  topK?: number
): Promise<SearchResult[]> {
  return invoke<SearchResult[]>("search_knowledge", {
    query,
    top_k: topK,
  });
}

export async function getStoreStats(): Promise<VectorStoreStats> {
  return invoke<VectorStoreStats>("get_store_stats");
}

// ── AI Pipeline Commands ─────────────────────────────────────

export async function askBeeYield(query: AIQuery): Promise<AIResponse> {
  return invoke<AIResponse>("ask_beeyield", { query });
}

export async function analyzeHiveData(
  request: HiveAnalysisRequest
): Promise<AIResponse> {
  return invoke<AIResponse>("analyze_hive_data", { request });
}

export async function generateReport(
  request: ReportRequest
): Promise<AIResponse> {
  return invoke<AIResponse>("generate_report", { request });
}

// ── HoneyChain Commands ──────────────────────────────────────

export async function verifyBatch(
  batchCode: string
): Promise<BatchVerification> {
  return invoke<BatchVerification>("verify_batch", {
    batch_code: batchCode,
  });
}

export async function getChainStatus(): Promise<Record<string, unknown>> {
  return invoke<Record<string, unknown>>("get_chain_status");
}

// ── System Commands ──────────────────────────────────────────

export async function healthCheck(): Promise<HealthCheck> {
  return invoke<HealthCheck>("health_check");
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>("get_system_info");
}
