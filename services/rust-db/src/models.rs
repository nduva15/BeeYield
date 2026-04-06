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

#[derive(Debug, Serialize, Deserialize)]
pub struct AIQueryRequest {
    pub message: String,
    #[serde(default)]
    pub language: Option<String>,
    #[serde(default)]
    pub user_role: Option<String>,
    #[serde(default)]
    pub user_name: Option<String>,
    #[serde(default)]
    pub context_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIQueryResponse {
    pub response: String,
    pub intents: Vec<String>,
    pub temperature: f64,
    pub system_prompt: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentStkPushRequest {
    pub phone: String,
    pub amount: i64,
    pub account_ref: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentStkPushResponse {
    pub success: bool,
    pub checkout_request_id: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentCallbackRequest {
    pub body: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaymentCallbackResponse {
    pub result_code: i64,
    pub merchant_request_id: String,
    pub checkout_request_id: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub service: String,
    pub status: String,
    pub supabase_configured: bool,
}

#[derive(Debug, Deserialize)]
pub struct IntegrationConfigRequest {
    pub platform: String,
    pub is_active: bool,
    #[serde(default)]
    pub store_url: Option<String>,
    #[serde(default)]
    pub kra_pin: Option<String>,
    #[serde(default)]
    pub branch_code: Option<String>,
    #[serde(default)]
    pub device_serial: Option<String>,
    #[serde(default)]
    pub company_name: Option<String>,
    #[serde(default)]
    pub access_token: Option<String>,
    #[serde(default)]
    pub config_json: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthUrlResponse {
    pub url: String,
    pub state: String,
}

#[derive(Debug, Deserialize)]
pub struct QuickBooksCompleteRequest {
    pub code: String,
    #[serde(default)]
    pub realm_id: Option<String>,
    #[serde(default, rename = "realmId")]
    pub realm_id_legacy: Option<String>,
    pub state: String,
}

#[derive(Debug, Deserialize)]
pub struct ShopifyAuthorizeRequest {
    pub shop: String,
}

#[derive(Debug, Deserialize)]
pub struct ShopifyCompleteRequest {
    pub query: String,
}

#[derive(Debug, Serialize)]
pub struct IntegrationSyncResponse {
    pub success: bool,
    pub platform: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metrics: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub config: Option<Value>,
}
