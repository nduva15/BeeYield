// ─────────────────────────────────────────────────────────────
// Tauri Commands — HoneyChain Verification
// ─────────────────────────────────────────────────────────────

use crate::error::{CmdResult, CommandError};
use crate::models::BatchVerification;
use crate::AppState;
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

/// Verify a honey batch's integrity on the HoneyChain.
#[tauri::command]
pub async fn verify_batch(
    state: State<'_, Arc<RwLock<AppState>>>,
    batch_code: String,
) -> CmdResult<BatchVerification> {
    let app = state.read().await;

    let result = app
        .honey_verifier
        .verify_batch(&app.config.backend_url, &batch_code)
        .await
        .map_err(CommandError::from)?;

    Ok(result)
}

/// Get HoneyChain overall status.
#[tauri::command]
pub async fn get_chain_status(
    state: State<'_, Arc<RwLock<AppState>>>,
) -> CmdResult<serde_json::Value> {
    let app = state.read().await;

    let status = app
        .honey_verifier
        .chain_status(&app.config.backend_url)
        .await
        .map_err(CommandError::from)?;

    Ok(serde_json::to_value(status).unwrap_or(serde_json::json!({"error": "serialize failed"})))
}
