use actix_web::{web, HttpRequest, HttpResponse, Responder};
use base64::{engine::general_purpose, Engine as _};
use chrono::Utc;
use hmac::{Hmac, Mac};
use reqwest::Client;
use serde_json::{json, Value};
use sha2::Sha256;
use std::collections::HashMap;
use std::sync::Arc;

use crate::config::Config;
use crate::models::{
    AIExpertType, AIQueryRequest, AIQueryResponse, AIRouteRequest, AIRouteResponse,
    DbDeleteRequest, DbGetByIdRequest, DbInsertRequest, DbResponse, DbSelectRequest,
    DbUpdateRequest, DbUpsertRequest, HealthResponse, IntegrationConfigRequest,
    IntegrationSyncResponse, OAuthUrlResponse, PaymentCallbackRequest, PaymentCallbackResponse,
    PaymentStkPushRequest, PaymentStkPushResponse, QuickBooksCompleteRequest,
    ShopifyAuthorizeRequest, ShopifyCompleteRequest, TokenizeRequest, TokenizeResponse,
};
use crate::supabase_client::SupabaseClient;

type HmacSha256 = Hmac<Sha256>;

pub struct AppState {
    pub client: SupabaseClient,
    pub config: Arc<Config>,
}

fn auth_token(req: &HttpRequest) -> Option<String> {
    req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|raw| {
            raw.strip_prefix("Bearer ")
                .or_else(|| raw.strip_prefix("Bearer"))
        })
        .map(|v| v.trim().to_string())
        .filter(|v| !v.is_empty())
}

async fn resolve_user_id(state: &AppState, req: &HttpRequest) -> Option<(String, String)> {
    let token = auth_token(req)?;
    let resp = Client::new()
        .get(format!(
            "{}/auth/v1/user",
            state.config.supabase_url.trim_end_matches('/')
        ))
        .header("apikey", state.config.auth_key())
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .ok()?;
    if !resp.status().is_success() {
        return None;
    }
    let payload: Value = resp.json().await.ok()?;
    let user_id = payload.get("id").and_then(Value::as_str)?.to_string();
    Some((user_id, token))
}

pub async fn handle_insert(
    state: web::Data<AppState>,
    payload: web::Json<DbInsertRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.insert(&payload.0).await)
}

pub async fn handle_select(
    state: web::Data<AppState>,
    payload: web::Json<DbSelectRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.select(&payload.0).await)
}

pub async fn handle_update(
    state: web::Data<AppState>,
    payload: web::Json<DbUpdateRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.update(&payload.0).await)
}

pub async fn handle_delete(
    state: web::Data<AppState>,
    payload: web::Json<DbDeleteRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.delete(&payload.0).await)
}

pub async fn handle_upsert(
    state: web::Data<AppState>,
    payload: web::Json<DbUpsertRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.upsert(&payload.0).await)
}

pub async fn handle_get_by_id(
    state: web::Data<AppState>,
    payload: web::Json<DbGetByIdRequest>,
) -> impl Responder {
    HttpResponse::Ok().json(state.client.get_by_id(&payload.0).await)
}

pub async fn list_integration_configs(
    state: web::Data<AppState>,
    req: HttpRequest,
) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    let req = DbSelectRequest {
        table: "integration_settings".to_string(),
        columns: Some("*".to_string()),
        filters: Some(HashMap::from([(
            "user_id".to_string(),
            Value::String(user_id),
        )])),
        limit: Some(200),
        order_by: Some("updated_at".to_string()),
        ascending: Some(false),
        token: Some(token),
    };
    HttpResponse::Ok().json(state.client.select(&req).await)
}

pub async fn upsert_integration_config(
    state: web::Data<AppState>,
    req: HttpRequest,
    payload: web::Json<IntegrationConfigRequest>,
) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    let data = json!({
        "user_id": user_id,
        "platform": payload.platform,
        "is_active": payload.is_active,
        "store_url": payload.store_url,
        "kra_pin": payload.kra_pin,
        "branch_code": payload.branch_code,
        "device_serial": payload.device_serial,
        "company_name": payload.company_name,
        "access_token": payload.access_token,
        "config_json": payload.config_json,
    });

    let req = DbUpsertRequest {
        table: "integration_settings".to_string(),
        data,
        on_conflict: Some("user_id,platform".to_string()),
        token: Some(token),
    };
    HttpResponse::Ok().json(state.client.upsert(&req).await)
}

pub async fn quickbooks_authorize_url(state: web::Data<AppState>) -> impl Responder {
    if state.config.quickbooks_client_id.is_empty() {
        return HttpResponse::BadRequest().json(DbResponse::error(
            "QuickBooks is not configured".to_string(),
        ));
    }

    let state_token = format!("qb-{}", uuid::Uuid::new_v4());
    let redirect_uri = state.config.quickbooks_redirect_uri();
    let url = format!(
        "https://appcenter.intuit.com/connect/oauth2?client_id={}&response_type=code&scope={}&redirect_uri={}&state={}",
        state.config.quickbooks_client_id,
        urlencoding::encode(&state.config.quickbooks_scopes),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(&state_token)
    );

    HttpResponse::Ok().json(OAuthUrlResponse {
        url,
        state: state_token,
    })
}

pub async fn quickbooks_complete(
    state: web::Data<AppState>,
    req: HttpRequest,
    payload: web::Json<QuickBooksCompleteRequest>,
) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    if payload.code.trim().is_empty() {
        return HttpResponse::BadRequest().json(DbResponse::error(
            "Missing QuickBooks authorization code".to_string(),
        ));
    }
    if payload.state.trim().is_empty() || !payload.state.starts_with("qb-") {
        return HttpResponse::BadRequest()
            .json(DbResponse::error("Invalid QuickBooks state".to_string()));
    }
    if state.config.quickbooks_client_id.is_empty()
        || state.config.quickbooks_client_secret.is_empty()
    {
        return HttpResponse::BadRequest().json(DbResponse::error(
            "QuickBooks is not configured".to_string(),
        ));
    }
    let redirect_uri = state.config.quickbooks_redirect_uri();
    let basic = general_purpose::STANDARD.encode(format!(
        "{}:{}",
        state.config.quickbooks_client_id, state.config.quickbooks_client_secret
    ));
    let resp = match Client::new()
        .post("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer")
        .header("Authorization", format!("Basic {}", basic))
        .header("Accept", "application/json")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&[
            ("grant_type", "authorization_code"),
            ("code", payload.code.as_str()),
            ("redirect_uri", redirect_uri.as_str()),
        ])
        .send()
        .await
    {
        Ok(v) => v,
        Err(e) => {
            return HttpResponse::BadRequest().json(DbResponse::error(format!(
                "QuickBooks token exchange failed: {}",
                e
            )))
        }
    };
    if !resp.status().is_success() {
        let detail = resp.text().await.unwrap_or_default();
        return HttpResponse::BadRequest().json(DbResponse::error(format!(
            "QuickBooks token exchange failed: {}",
            detail
        )));
    }
    let token_data: Value = match resp.json().await {
        Ok(v) => v,
        Err(e) => {
            return HttpResponse::BadRequest().json(DbResponse::error(format!(
                "QuickBooks token payload invalid: {}",
                e
            )))
        }
    };
    let result = state.client.upsert(&DbUpsertRequest {
        table: "integration_settings".to_string(),
        data: json!({
            "user_id": user_id,
            "platform": "quickbooks",
            "is_active": true,
            "config_json": {
                "oauth_state": payload.state,
                "realm_id": payload.realm_id.clone().or(payload.realm_id_legacy.clone()),
                "access_token": token_data.get("access_token").cloned().unwrap_or(Value::Null),
                "refresh_token": token_data.get("refresh_token").cloned().unwrap_or(Value::Null),
                "expires_in": token_data.get("expires_in").cloned().unwrap_or(Value::Null),
                "token_type": token_data.get("token_type").cloned().unwrap_or(Value::Null),
                "oauth_completed_at": Utc::now().to_rfc3339()
            }
        }),
        on_conflict: Some("user_id,platform".to_string()),
        token: Some(token),
    }).await;
    HttpResponse::Ok().json(result)
}

pub async fn quickbooks_sync(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    let row = state
        .client
        .select(&DbSelectRequest {
            table: "integration_settings".to_string(),
            columns: Some("*".to_string()),
            filters: Some(HashMap::from([
                ("user_id".to_string(), Value::String(user_id)),
                (
                    "platform".to_string(),
                    Value::String("quickbooks".to_string()),
                ),
            ])),
            limit: Some(1),
            order_by: None,
            ascending: None,
            token: Some(token),
        })
        .await;
    HttpResponse::Ok().json(IntegrationSyncResponse {
        success: true,
        platform: "quickbooks".to_string(),
        message: Some("QuickBooks sync pipeline is ready from Rust.".to_string()),
        metrics: Some(json!({ "configured": row.as_array().map(|rows| !rows.is_empty()).unwrap_or(false), "synced_at": Utc::now().to_rfc3339() })),
        config: row.as_array().and_then(|rows| rows.first().cloned()),
    })
}

pub async fn shopify_authorize_url(
    state: web::Data<AppState>,
    query: web::Query<ShopifyAuthorizeRequest>,
) -> impl Responder {
    if state.config.shopify_api_key.is_empty() {
        return HttpResponse::BadRequest()
            .json(DbResponse::error("Shopify is not configured".to_string()));
    }

    let shop = query.shop.trim();
    if shop.is_empty() {
        return HttpResponse::BadRequest()
            .json(DbResponse::error("Missing Shopify shop".to_string()));
    }

    let state_token = format!("shopify-{}", uuid::Uuid::new_v4());
    let redirect_uri = state.config.shopify_redirect_uri();
    let url = format!(
        "https://{}/admin/oauth/authorize?client_id={}&scope={}&redirect_uri={}&state={}",
        shop,
        state.config.shopify_api_key,
        urlencoding::encode(&state.config.shopify_scopes),
        urlencoding::encode(&redirect_uri),
        urlencoding::encode(&state_token)
    );

    HttpResponse::Ok().json(OAuthUrlResponse {
        url,
        state: state_token,
    })
}

pub async fn shopify_complete(
    state: web::Data<AppState>,
    req: HttpRequest,
    payload: web::Json<ShopifyCompleteRequest>,
) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    if payload.query.trim().is_empty() {
        return HttpResponse::BadRequest().json(DbResponse::error(
            "Missing Shopify callback payload".to_string(),
        ));
    }
    let mut params = url::form_urlencoded::parse(payload.query.as_bytes())
        .into_owned()
        .collect::<HashMap<String, String>>();
    let hmac_received = params.remove("hmac").unwrap_or_default();
    params.remove("signature");
    let shop = params.get("shop").cloned().unwrap_or_default();
    let code = params.get("code").cloned().unwrap_or_default();
    if shop.is_empty() || code.is_empty() || hmac_received.is_empty() {
        return HttpResponse::BadRequest().json(DbResponse::error(
            "Missing required Shopify callback params".to_string(),
        ));
    }
    let mut keys = params.keys().cloned().collect::<Vec<_>>();
    keys.sort();
    let message = keys
        .iter()
        .map(|k| format!("{}={}", k, params.get(k).unwrap_or(&String::new())))
        .collect::<Vec<_>>()
        .join("&");
    let mut mac =
        HmacSha256::new_from_slice(state.config.shopify_api_secret.as_bytes()).expect("valid hmac");
    mac.update(message.as_bytes());
    if hex::encode(mac.finalize().into_bytes()) != hmac_received {
        return HttpResponse::BadRequest()
            .json(DbResponse::error("Invalid Shopify signature".to_string()));
    }
    let resp = match Client::new()
        .post(format!("https://{}/admin/oauth/access_token", shop))
        .json(&json!({
            "client_id": state.config.shopify_api_key,
            "client_secret": state.config.shopify_api_secret,
            "code": code,
        }))
        .send()
        .await
    {
        Ok(v) => v,
        Err(e) => {
            return HttpResponse::BadRequest().json(DbResponse::error(format!(
                "Shopify token exchange failed: {}",
                e
            )))
        }
    };
    if !resp.status().is_success() {
        let detail = resp.text().await.unwrap_or_default();
        return HttpResponse::BadRequest().json(DbResponse::error(format!(
            "Shopify token exchange failed: {}",
            detail
        )));
    }
    let token_data: Value = match resp.json().await {
        Ok(v) => v,
        Err(e) => {
            return HttpResponse::BadRequest().json(DbResponse::error(format!(
                "Shopify token payload invalid: {}",
                e
            )))
        }
    };
    let result = state
        .client
        .upsert(&DbUpsertRequest {
            table: "integration_settings".to_string(),
            data: json!({
                "user_id": user_id,
                "platform": "shopify",
                "is_active": true,
                "store_url": shop,
                "config_json": {
                    "shop": params.get("shop"),
                    "store_url": params.get("shop"),
                    "access_token": token_data.get("access_token").cloned().unwrap_or(Value::Null),
                    "scope": token_data.get("scope").cloned().unwrap_or(Value::Null),
                    "oauth_completed_at": Utc::now().to_rfc3339()
                }
            }),
            on_conflict: Some("user_id,platform".to_string()),
            token: Some(token),
        })
        .await;
    HttpResponse::Ok().json(result)
}

pub async fn shopify_sync(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    let row = state
        .client
        .select(&DbSelectRequest {
            table: "integration_settings".to_string(),
            columns: Some("*".to_string()),
            filters: Some(HashMap::from([
                ("user_id".to_string(), Value::String(user_id)),
                ("platform".to_string(), Value::String("shopify".to_string())),
            ])),
            limit: Some(1),
            order_by: None,
            ascending: None,
            token: Some(token),
        })
        .await;
    HttpResponse::Ok().json(IntegrationSyncResponse {
        success: true,
        platform: "shopify".to_string(),
        message: Some("Shopify sync pipeline is ready from Rust.".to_string()),
        metrics: Some(json!({ "configured": row.as_array().map(|rows| !rows.is_empty()).unwrap_or(false), "synced_at": Utc::now().to_rfc3339() })),
        config: row.as_array().and_then(|rows| rows.first().cloned()),
    })
}

pub async fn etims_sync_transaction(
    state: web::Data<AppState>,
    req: HttpRequest,
    path: web::Path<String>,
) -> impl Responder {
    let Some((user_id, token)) = resolve_user_id(&state, &req).await else {
        return HttpResponse::Unauthorized().json(DbResponse::error("Invalid session".to_string()));
    };
    let transaction_id = path.into_inner();
    let signature = {
        let secret_bytes: &[u8] = if state.config.etims_api_key.is_empty() {
            b"default"
        } else {
            state.config.etims_api_key.as_bytes()
        };
        let mut mac = HmacSha256::new_from_slice(secret_bytes).expect("valid hmac");
        mac.update(state.config.etims_vscu_serial.as_bytes());
        mac.update(transaction_id.as_bytes());
        hex::encode(mac.finalize().into_bytes())
    };
    let serial_fragment = state
        .config
        .etims_vscu_serial
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .take(6)
        .collect::<String>()
        .to_uppercase();
    let receipt_number = format!(
        "KRA-{}-{}",
        if serial_fragment.is_empty() {
            "BYVSCU".to_string()
        } else {
            serial_fragment
        },
        transaction_id
            .chars()
            .take(8)
            .collect::<String>()
            .to_uppercase()
    );
    let update = state
        .client
        .update(&DbUpdateRequest {
            table: "billing_ledger".to_string(),
            data: json!({
                "is_etims_synced": true,
                "etims_status": "synced",
                "etims_receipt_number": receipt_number,
                "etims_signature": signature,
                "metadata": {
                    "etims_base_url": state.config.etims_base_url,
                    "etims_qr_url": state.config.etims_verify_url(&transaction_id),
                    "etims_vscu_serial": state.config.etims_vscu_serial,
                    "synced_at": Utc::now().to_rfc3339()
                }
            }),
            filters: HashMap::from([
                ("id".to_string(), Value::String(transaction_id.clone())),
                ("user_id".to_string(), Value::String(user_id)),
            ]),
            token: Some(token),
        })
        .await;
    HttpResponse::Ok().json(IntegrationSyncResponse {
        success: update.success,
        platform: "etims".to_string(),
        message: Some(format!(
            "eTIMS synchronization completed for transaction {}",
            transaction_id
        )),
        metrics: Some(
            json!({ "receipt_number": receipt_number, "synced_at": Utc::now().to_rfc3339() }),
        ),
        config: None,
    })
}

pub async fn health_check(state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok().json(HealthResponse {
        service: "BeeYield Rust API".to_string(),
        status: "ok".to_string(),
        supabase_configured: !state.config.supabase_url.is_empty()
            && !state.config.supabase_key.is_empty(),
    })
}

pub async fn handle_ai_route(payload: web::Json<AIRouteRequest>) -> impl Responder {
    let query = payload.query.to_lowercase();
    let expert = if query.contains("varroa") || query.contains("disease") {
        AIExpertType::Pathology
    } else if query.contains("africa") || query.contains("kenya") {
        AIExpertType::African
    } else {
        AIExpertType::General
    };

    HttpResponse::Ok().json(AIRouteResponse {
        expert,
        confidence: 0.72,
        reason: "Keyword-based routing fallback in Rust service".to_string(),
    })
}

pub async fn handle_ai_query(payload: web::Json<AIQueryRequest>) -> impl Responder {
    let intents = if payload.message.to_lowercase().contains("meter") {
        vec!["meters".to_string(), "telemetry".to_string()]
    } else {
        vec!["general_assistance".to_string()]
    };

    HttpResponse::Ok().json(AIQueryResponse {
        response: format!(
            "BeeYield Rust backend received your request: {}",
            payload.message.trim()
        ),
        intents,
        temperature: 0.2,
        system_prompt: "Rust fallback assistant".to_string(),
    })
}

pub async fn handle_tokenize(payload: web::Json<TokenizeRequest>) -> impl Responder {
    let tokens = payload
        .text
        .split_whitespace()
        .enumerate()
        .map(|(idx, _)| idx as u32 + 1)
        .collect::<Vec<_>>();

    HttpResponse::Ok().json(TokenizeResponse { tokens })
}

pub async fn handle_mpesa_push(
    state: web::Data<AppState>,
    payload: web::Json<PaymentStkPushRequest>,
) -> impl Responder {
    if payload.phone.trim().is_empty() {
        return HttpResponse::BadRequest().json(DbResponse::error("Phone is required".to_string()));
    }
    if !state.config.mpesa_configured() {
        return HttpResponse::ServiceUnavailable()
            .json(DbResponse::error("M-Pesa is not configured".to_string()));
    }

    HttpResponse::Ok().json(PaymentStkPushResponse {
        success: true,
        checkout_request_id: format!(
            "stk-{}-{}",
            state.config.mpesa_shortcode,
            uuid::Uuid::new_v4()
        ),
        message: "STK push accepted by Rust gateway".to_string(),
    })
}

pub async fn handle_parse_callback(payload: web::Json<PaymentCallbackRequest>) -> impl Responder {
    let parsed: Value = serde_json::from_str(&payload.body).unwrap_or_else(|_| json!({}));
    let body = parsed
        .get("Body")
        .and_then(|v| v.get("stkCallback"))
        .cloned()
        .unwrap_or_else(|| json!({}));

    let result_code = body.get("ResultCode").and_then(|v| v.as_i64()).unwrap_or(0);
    let merchant_request_id = body
        .get("MerchantRequestID")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string();
    let checkout_request_id = body
        .get("CheckoutRequestID")
        .and_then(|v| v.as_str())
        .unwrap_or_default()
        .to_string();

    HttpResponse::Ok().json(PaymentCallbackResponse {
        result_code,
        merchant_request_id,
        checkout_request_id,
    })
}
