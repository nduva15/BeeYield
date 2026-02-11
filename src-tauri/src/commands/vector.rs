// ─────────────────────────────────────────────────────────────
// Tauri Commands — Vector Store
// ─────────────────────────────────────────────────────────────

use crate::error::{BeeYieldError, CmdResult, CommandError};
use crate::models::{KnowledgeNode, SearchResult, VectorStoreStats};
use crate::AppState;
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

/// Ingest a batch of documents into the vector store.
/// Each document will be embedded via Gemini text-embedding-004
/// and then inserted into the HNSW index.
#[tauri::command]
pub async fn ingest_documents(
    state: State<'_, Arc<RwLock<AppState>>>,
    documents: Vec<IngestDoc>,
) -> CmdResult<IngestResult> {
    let mut app = state.write().await;
    let mut inserted = 0_usize;
    let mut errors = Vec::new();

    for (i, doc) in documents.iter().enumerate() {
        // Embed the content
        let embedding = match app.ai_pipeline.embed(&doc.content).await {
            Ok(e) => e,
            Err(e) => {
                errors.push(format!("Doc {i}: {e}"));
                continue;
            }
        };

        let node = KnowledgeNode {
            id: uuid::Uuid::new_v4(),
            title: doc.title.clone(),
            content: doc.content.clone(),
            source: doc.source.clone().unwrap_or_else(|| "manual".into()),
            category: crate::models::NodeCategory::Custom(
                doc.category.clone().unwrap_or_else(|| "general".into()),
            ),
            embedding: Some(embedding),
            metadata: doc.metadata.clone().unwrap_or(serde_json::json!({})),
            created_at: chrono::Utc::now(),
        };

        match app.vector_store.insert(node) {
            Ok(_) => inserted += 1,
            Err(e) => errors.push(format!("Doc {i}: {e}")),
        }
    }

    Ok(IngestResult {
        inserted,
        failed: errors.len(),
        errors,
        total_nodes: app.vector_store.len(),
    })
}

/// Search the knowledge lake for the given query.
#[tauri::command]
pub async fn search_knowledge(
    state: State<'_, Arc<RwLock<AppState>>>,
    query: String,
    top_k: Option<usize>,
) -> CmdResult<Vec<SearchResult>> {
    let app = state.read().await;

    // Embed the query
    let embedding = app
        .ai_pipeline
        .embed(&query)
        .await
        .map_err(|e| CommandError::from(e))?;

    let results = app
        .vector_store
        .search(&embedding, top_k.unwrap_or(10))
        .map_err(|e| CommandError::from(e))?;

    Ok(results)
}

/// Return current vector store statistics.
#[tauri::command]
pub async fn get_store_stats(
    state: State<'_, Arc<RwLock<AppState>>>,
) -> CmdResult<VectorStoreStats> {
    let app = state.read().await;
    Ok(app.vector_store.stats())
}

// ── Helper types ─────────────────────────────────────────────

#[derive(Debug, Clone, serde::Deserialize)]
pub struct IngestDoc {
    pub title: String,
    pub content: String,
    pub source: Option<String>,
    pub category: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct IngestResult {
    pub inserted: usize,
    pub failed: usize,
    pub errors: Vec<String>,
    pub total_nodes: usize,
}
