// ─────────────────────────────────────────────────────────────
// Shared data models
// ─────────────────────────────────────────────────────────────

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ── Vector / Knowledge Lake ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeNode {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub source: String,
    pub category: NodeCategory,
    pub embedding: Option<Vec<f32>>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NodeCategory {
    ResearchPaper,
    HiveData,
    HarvestRecord,
    PollinationGuide,
    MarketIntelligence,
    RegulatoryCompliance,
    FarmerKnowledge,
    WeatherPattern,
    PestAlert,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub node_id: Uuid,
    pub title: String,
    pub content: String,
    pub score: f32,
    pub category: NodeCategory,
    pub source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorStoreStats {
    pub total_nodes: usize,
    pub dimensions: usize,
    pub memory_usage_mb: f64,
    pub categories: Vec<(String, usize)>,
}

// ── AI Pipeline ─────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIQuery {
    pub question: String,
    pub context_limit: Option<usize>,
    pub include_sources: Option<bool>,
    pub model_override: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIResponse {
    pub answer: String,
    pub sources: Vec<SearchResult>,
    pub model_used: String,
    pub tokens_used: TokenUsage,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HiveAnalysisRequest {
    pub hive_id: String,
    pub sensor_data: Vec<SensorReading>,
    pub period_days: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SensorReading {
    pub timestamp: DateTime<Utc>,
    pub temperature: Option<f64>,
    pub humidity: Option<f64>,
    pub weight: Option<f64>,
    pub sound_level: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReportRequest {
    pub report_type: ReportType,
    pub farmer_id: Option<String>,
    pub date_range: Option<(DateTime<Utc>, DateTime<Utc>)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ReportType {
    HiveHealth,
    HarvestSummary,
    PollinationEfficiency,
    MarketAnalysis,
    TraceabilityAudit,
}

// ── HoneyChain ──────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchVerification {
    pub batch_code: String,
    pub is_valid: bool,
    pub merkle_root: String,
    pub block_index: u64,
    pub chain_length: u64,
    pub integrity_score: f64,
    pub details: serde_json::Value,
}

// ── System ──────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub version: String,
    pub rust_version: String,
    pub os: String,
    pub arch: String,
    pub memory_usage_mb: f64,
    pub vector_store: VectorStoreStats,
    pub uptime_seconds: u64,
}
