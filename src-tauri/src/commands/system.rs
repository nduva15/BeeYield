// ─────────────────────────────────────────────────────────────
// Tauri Commands — System
// ─────────────────────────────────────────────────────────────

use crate::error::CmdResult;
use crate::models::SystemInfo;
use crate::AppState;
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

/// Quick health check — returns "ok" if the Rust engine is alive.
#[tauri::command]
pub async fn health_check() -> CmdResult<serde_json::Value> {
    Ok(serde_json::json!({
        "status": "ok",
        "engine": "beeyield-native-hive",
        "version": env!("CARGO_PKG_VERSION"),
        "timestamp": chrono::Utc::now().to_rfc3339(),
    }))
}

/// Return detailed system information.
#[tauri::command]
pub async fn get_system_info(
    state: State<'_, Arc<RwLock<AppState>>>,
) -> CmdResult<SystemInfo> {
    let app = state.read().await;
    let stats = app.vector_store.stats();

    Ok(SystemInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        rust_version: "1.77+".to_string(),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        memory_usage_mb: stats.memory_usage_mb,
        vector_store: stats,
        uptime_seconds: 0, // TODO: track with start_time in AppState
    })
}
