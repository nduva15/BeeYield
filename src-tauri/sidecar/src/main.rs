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
    extract::{Query, State},
    http::StatusCode,
    response::sse::{Event, Sse},
    routing::{get, post},
    Json, Router,
};
use futures::stream::Stream;
use serde::{Deserialize, Serialize};
use std::{convert::Infallible, pin::Pin, sync::Arc};
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;

// ── Lightweight in-process vector store (mirrors the Tauri one) ──

struct AppState {
    nodes: Vec<VectorNode>,
    dimensions: usize,
    backend_url: String,
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

    let backend_url = std::env::var("BACKEND_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:8000".into());

    let state: SharedState = Arc::new(RwLock::new(AppState {
        nodes: Vec::with_capacity(25_000),
        dimensions: dims,
        backend_url,
    }));

    let app = Router::new()
        .route("/health", get(health))
        .route("/stats", get(stats))
        .route("/ingest", post(ingest))
        .route("/search", post(search))
        .route("/search/stream", get(stream_search_proxy))
        .route("/search/instant", post(instant_search_proxy))
        .route("/search/ingest", post(domain_ingest_proxy))
        .route("/search/stats", get(lakehouse_stats_proxy))
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

// ── Python backend proxy routes ──────────────────────────────

#[derive(Deserialize)]
struct StreamQuery {
    q: String,
    #[serde(default = "default_top_k")]
    top_k: usize,
    domain: Option<String>,
    #[serde(default)]
    synthesize: bool,
}

fn default_top_k() -> usize { 10 }

/// SSE proxy: forwards the Python `/api/v1/search/stream` SSE to the desktop client
async fn stream_search_proxy(
    State(state): State<SharedState>,
    Query(params): Query<StreamQuery>,
) -> Sse<Pin<Box<dyn Stream<Item = Result<Event, Infallible>> + Send>>> {
    let s = state.read().await;
    let mut url = format!(
        "{}/api/v1/search/stream?q={}&top_k={}",
        s.backend_url,
        urlencoding::encode(&params.q),
        params.top_k,
    );
    if let Some(ref d) = params.domain {
        url.push_str(&format!("&domain={}", urlencoding::encode(d)));
    }
    if params.synthesize {
        url.push_str("&synthesize=true");
    }
    drop(s);

    let stream = async_stream::stream! {
        match reqwest::Client::new().get(&url).send().await {
            Ok(resp) => {
                let mut stream = resp.bytes_stream();
                use futures::StreamExt;
                let mut buffer = String::new();
                while let Some(chunk) = stream.next().await {
                    match chunk {
                        Ok(bytes) => {
                            buffer.push_str(&String::from_utf8_lossy(&bytes));
                            // Parse SSE lines
                            while let Some(pos) = buffer.find("\n\n") {
                                let msg = buffer[..pos].to_string();
                                buffer = buffer[pos + 2..].to_string();
                                if let Some(data) = msg.strip_prefix("data: ") {
                                    yield Ok(Event::default().data(data.to_string()));
                                }
                            }
                        }
                        Err(e) => {
                            yield Ok(Event::default().data(
                                serde_json::json!({"error": e.to_string()}).to_string()
                            ));
                            break;
                        }
                    }
                }
            }
            Err(e) => {
                yield Ok(Event::default().data(
                    serde_json::json!({"error": format!("Backend unreachable: {e}")}).to_string()
                ));
            }
        }
    };

    Sse::new(Box::pin(stream))
}

#[derive(Deserialize, Serialize)]
struct InstantSearchBody {
    query: String,
    #[serde(default = "default_top_k")]
    top_k: usize,
    domain_filter: Option<String>,
    include_synthesis: Option<bool>,
}

/// POST proxy to Python /api/v1/search/instant
async fn instant_search_proxy(
    State(state): State<SharedState>,
    Json(body): Json<InstantSearchBody>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let s = state.read().await;
    let url = format!("{}/api/v1/search/instant", s.backend_url);
    drop(s);

    let client = reqwest::Client::new();
    let resp = client.post(&url).json(&body).send().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let data: serde_json::Value = resp.json().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    Ok(Json(data))
}

#[derive(Deserialize, Serialize)]
struct DomainIngestBody {
    domain: String,
    items: Vec<serde_json::Value>,
    #[serde(default = "default_true")]
    persist: bool,
    #[serde(default = "default_true")]
    index: bool,
}

fn default_true() -> bool { true }

/// POST proxy to Python /api/v1/search/ingest
async fn domain_ingest_proxy(
    State(state): State<SharedState>,
    Json(body): Json<DomainIngestBody>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let s = state.read().await;
    let url = format!("{}/api/v1/search/ingest", s.backend_url);
    drop(s);

    let client = reqwest::Client::new();
    let resp = client.post(&url).json(&body).send().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let data: serde_json::Value = resp.json().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    Ok(Json(data))
}

/// GET proxy to Python /api/v1/search/stats
async fn lakehouse_stats_proxy(
    State(state): State<SharedState>,
) -> Result<Json<serde_json::Value>, StatusCode> {
    let s = state.read().await;
    let url = format!("{}/api/v1/search/stats", s.backend_url);
    drop(s);

    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    let data: serde_json::Value = resp.json().await
        .map_err(|_| StatusCode::BAD_GATEWAY)?;

    Ok(Json(data))
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
