/// Data models — request/response types for the Supabase REST gateway.
/// No hardcoded field values anywhere.
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

// ============ REQUEST MODELS ============

#[derive(Debug, Deserialize)]
pub struct DbInsertRequest {
    pub table: String,
    pub data: Value,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DbSelectRequest {
    pub table: String,
    #[serde(default)]
    pub columns: Option<String>,
    #[serde(default)]
    pub filters: Option<HashMap<String, Value>>,
    #[serde(default)]
    pub limit: Option<i64>,
    #[serde(default)]
    pub order_by: Option<String>,
    #[serde(default)]
    pub ascending: Option<bool>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DbUpdateRequest {
    pub table: String,
    pub data: Value,
    pub filters: HashMap<String, Value>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DbDeleteRequest {
    pub table: String,
    pub filters: HashMap<String, Value>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DbUpsertRequest {
    pub table: String,
    pub data: Value,
    #[serde(default)]
    pub on_conflict: Option<String>,
    #[serde(default)]
    pub token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct DbGetByIdRequest {
    pub table: String,
    pub id: String,
    #[serde(default)]
    pub id_column: Option<String>,
    #[serde(default)]
    pub token: Option<String>,
}

// ============ RESPONSE MODELS ============

#[derive(Debug, Serialize)]
pub struct DbResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl DbResponse {
    pub fn success(data: Value) -> Self {
        DbResponse {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(msg: String) -> Self {
        DbResponse {
            success: false,
            data: None,
            error: Some(msg),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRouteRequest {
    pub query: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AIExpertType {
    African,
    EuropeanNa,
    AsianOceanic,
    Pathology,
    General,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRouteResponse {
    pub expert: AIExpertType,
    pub confidence: f32,
    pub reason: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenizeRequest {
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenizeResponse {
    pub tokens: Vec<u32>,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {

    pub service: String,
    pub status: String,
    pub supabase_configured: bool,
}

