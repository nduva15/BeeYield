// ─────────────────────────────────────────────────────────────
// BeeYield AI Sidecar
//
// A headless HTTP server exposing the same vector search and
// AI pipeline as the Tauri app. Used for:
//   • CI/CD automated testing of the knowledge lake
//   • Headless server deployment (no GUI needed)
//   • Pre-warming the vector store before Tauri launch
//
// Runs on port 3001 by default.
// ─────────────────────────────────────────────────────────────

use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;

// ── Lightweight in-process vector store (mirrors the Tauri one) ──

struct AppState {
    nodes: Vec<VectorNode>,
    dimensions: usize,
}

#[derive(Clone, Serialize, Deserialize)]
struct VectorNode {
    id: String,
    title: String,
    content: String,
    source: String,
    embedding: Vec<f32>,
}

#[derive(Deserialize)]
struct IngestPayload {
    documents: Vec<IngestDoc>,
}

#[derive(Deserialize)]
struct IngestDoc {
    title: String,
    content: String,
    source: Option<String>,
    embedding: Vec<f32>,
}

#[derive(Serialize)]
struct IngestResult {
    inserted: usize,
    total_nodes: usize,
}

#[derive(Deserialize)]
struct SearchPayload {
    embedding: Vec<f32>,
    top_k: Option<usize>,
}

#[derive(Serialize)]
struct SearchResult {
    id: String,
    title: String,
    content: String,
    score: f32,
    source: String,
}

#[derive(Serialize)]
struct StatsResult {
    total_nodes: usize,
    dimensions: usize,
    memory_mb: f64,
}

type SharedState = Arc<RwLock<AppState>>;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter("beeyield_sidecar=debug")
        .init();

    let port: u16 = std::env::var("SIDECAR_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3001);

    let dims: usize = std::env::var("VECTOR_DIMENSIONS")
        .ok()
        .and_then(|d| d.parse().ok())
        .unwrap_or(768);

    let state: SharedState = Arc::new(RwLock::new(AppState {
        nodes: Vec::with_capacity(25_000),
        dimensions: dims,
    }));

    let app = Router::new()
        .route("/health", get(health))
        .route("/stats", get(stats))
        .route("/ingest", post(ingest))
        .route("/search", post(search))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = format!("127.0.0.1:{port}");
    tracing::info!("🐝 BeeYield Sidecar listening on {addr}");

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "engine": "beeyield-sidecar",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

async fn stats(State(state): State<SharedState>) -> Json<StatsResult> {
    let s = state.read().await;
    let mem = (s.nodes.len() * s.dimensions * 4) as f64 / 1_048_576.0;
    Json(StatsResult {
        total_nodes: s.nodes.len(),
        dimensions: s.dimensions,
        memory_mb: (mem * 100.0).round() / 100.0,
    })
}

async fn ingest(
    State(state): State<SharedState>,
    Json(payload): Json<IngestPayload>,
) -> Result<Json<IngestResult>, StatusCode> {
    let mut s = state.write().await;
    let mut inserted = 0;

    for doc in payload.documents {
        if doc.embedding.len() != s.dimensions {
            continue;
        }
        s.nodes.push(VectorNode {
            id: uuid::Uuid::new_v4().to_string(),
            title: doc.title,
            content: doc.content,
            source: doc.source.unwrap_or_else(|| "sidecar".into()),
            embedding: doc.embedding,
        });
        inserted += 1;
    }

    Ok(Json(IngestResult {
        inserted,
        total_nodes: s.nodes.len(),
    }))
}

async fn search(
    State(state): State<SharedState>,
    Json(payload): Json<SearchPayload>,
) -> Result<Json<Vec<SearchResult>>, StatusCode> {
    let s = state.read().await;
    let top_k = payload.top_k.unwrap_or(10);

    if payload.embedding.len() != s.dimensions {
        return Err(StatusCode::BAD_REQUEST);
    }

    let mut scored: Vec<(f32, usize)> = s
        .nodes
        .iter()
        .enumerate()
        .map(|(i, n)| (cosine_sim(&payload.embedding, &n.embedding), i))
        .collect();

    scored.sort_unstable_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    scored.truncate(top_k);

    let results = scored
        .into_iter()
        .map(|(score, idx)| {
            let n = &s.nodes[idx];
            SearchResult {
                id: n.id.clone(),
                title: n.title.clone(),
                content: n.content.clone(),
                score,
                source: n.source.clone(),
            }
        })
        .collect();

    Ok(Json(results))
}

#[inline]
fn cosine_sim(a: &[f32], b: &[f32]) -> f32 {
    let (mut dot, mut na, mut nb) = (0.0f32, 0.0f32, 0.0f32);
    for i in 0..a.len() {
        dot += a[i] * b[i];
        na += a[i] * a[i];
        nb += b[i] * b[i];
    }
    let d = na.sqrt() * nb.sqrt();
    if d == 0.0 { 0.0 } else { dot / d }
}
