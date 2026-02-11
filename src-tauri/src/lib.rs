// ─────────────────────────────────────────────────────────────
// BeeYield AI — Native Hive (Library Root)
// ─────────────────────────────────────────────────────────────
//
// This crate wires together:
//   1. Tauri v2 window + capability system
//   2. In-process HNSW vector store (25,000+ embeddings)
//   3. Multi-model AI pipeline (Gemini 2.0 Flash → GPT-4o)
//   4. HoneyChain Merkle verification
//
// Memory budget target: ≤80 MB RSS at 25k vectors (768-d).
// ─────────────────────────────────────────────────────────────

pub mod commands;
pub mod ai;
pub mod vector;
pub mod honeychain;
pub mod models;
pub mod config;
pub mod error;

use std::sync::Arc;
use tokio::sync::RwLock;

/// Shared application state injected into every Tauri command.
pub struct AppState {
    pub vector_store: vector::VectorStore,
    pub ai_pipeline: ai::pipeline::AIPipeline,
    pub honey_verifier: honeychain::HoneyVerifier,
    pub config: config::AppConfig,
}

pub fn run() {
    // Initialise structured logging
    tracing_subscriber::fmt()
        .with_env_filter("beeyield_lib=debug,tauri=info")
        .with_target(false)
        .init();

    tracing::info!("🐝 BeeYield AI: Native Hive starting…");

    let config = config::AppConfig::from_env();
    let vector_store = vector::VectorStore::new(config.vector_dimensions, config.vector_ef_construction);
    let ai_pipeline = ai::pipeline::AIPipeline::new(config.clone());
    let honey_verifier = honeychain::HoneyVerifier::new();

    let state = Arc::new(RwLock::new(AppState {
        vector_store,
        ai_pipeline,
        honey_verifier,
        config,
    }));

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            // ── Vector Search ────────────────────────────
            commands::vector::ingest_documents,
            commands::vector::search_knowledge,
            commands::vector::get_store_stats,
            // ── AI Pipeline ──────────────────────────────
            commands::ai::ask_beeyield,
            commands::ai::analyze_hive_data,
            commands::ai::generate_report,
            // ── HoneyChain ───────────────────────────────
            commands::honeychain::verify_batch,
            commands::honeychain::get_chain_status,
            // ── System ───────────────────────────────────
            commands::system::health_check,
            commands::system::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("Failed to launch BeeYield AI");
}
