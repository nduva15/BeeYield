// ─────────────────────────────────────────────────────────────
// Unified error types for the BeeYield Rust backend
// ─────────────────────────────────────────────────────────────

use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum BeeYieldError {
    #[error("Vector store error: {0}")]
    VectorStore(String),

    #[error("AI pipeline error: {0}")]
    AIPipeline(String),

    #[error("HoneyChain verification failed: {0}")]
    HoneyChain(String),

    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("{0}")]
    General(String),
}

/// Tauri commands must return types that implement `Serialize`.
/// We wrap BeeYieldError in a serializable envelope.
#[derive(Debug, Serialize)]
pub struct CommandError {
    pub code: String,
    pub message: String,
}

impl From<BeeYieldError> for CommandError {
    fn from(e: BeeYieldError) -> Self {
        let code = match &e {
            BeeYieldError::VectorStore(_) => "VECTOR_STORE",
            BeeYieldError::AIPipeline(_) => "AI_PIPELINE",
            BeeYieldError::HoneyChain(_) => "HONEYCHAIN",
            BeeYieldError::Network(_) => "NETWORK",
            BeeYieldError::Serde(_) => "SERIALIZATION",
            BeeYieldError::Io(_) => "IO",
            BeeYieldError::General(_) => "GENERAL",
        };
        CommandError {
            code: code.to_string(),
            message: e.to_string(),
        }
    }
}

impl From<CommandError> for tauri::ipc::InvokeError {
    fn from(e: CommandError) -> Self {
        tauri::ipc::InvokeError::from(serde_json::to_string(&e).unwrap_or_default())
    }
}

/// Shorthand result type for Tauri commands.
pub type CmdResult<T> = Result<T, CommandError>;
