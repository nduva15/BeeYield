/// HTTP request handlers — expose Supabase CRUD as REST endpoints.
/// All operations pass-through to Supabase. Zero hardcoded data.
use actix_web::{web, HttpResponse};
use std::sync::Arc;

use crate::config::Config;
use crate::models::*;
use crate::supabase_client::SupabaseClient;
use base64::{engine::general_purpose, Engine as _};
use chrono::Local;

pub struct AppState {
    pub client: SupabaseClient,
    pub config: Arc<Config>,
}

/// POST /db/insert
pub async fn handle_insert(
    state: web::Data<AppState>,
    body: web::Json<DbInsertRequest>,
) -> HttpResponse {
    let result = state.client.insert(&body).await;
    if result.success {
        HttpResponse::Created().json(result)
    } else {
        HttpResponse::BadRequest().json(result)
    }
}

/// POST /db/select
pub async fn handle_select(
    state: web::Data<AppState>,
    body: web::Json<DbSelectRequest>,
) -> HttpResponse {
    let result = state.client.select(&body).await;
    HttpResponse::Ok().json(result)
}

/// PATCH /db/update
pub async fn handle_update(
    state: web::Data<AppState>,
    body: web::Json<DbUpdateRequest>,
) -> HttpResponse {
    let result = state.client.update(&body).await;
    if result.success {
        HttpResponse::Ok().json(result)
    } else {
        HttpResponse::BadRequest().json(result)
    }
}

/// DELETE /db/delete
pub async fn handle_delete(
    state: web::Data<AppState>,
    body: web::Json<DbDeleteRequest>,
) -> HttpResponse {
    let result = state.client.delete(&body).await;
    if result.success {
        HttpResponse::Ok().json(result)
    } else {
        HttpResponse::BadRequest().json(result)
    }
}

/// POST /db/upsert
pub async fn handle_upsert(
    state: web::Data<AppState>,
    body: web::Json<DbUpsertRequest>,
) -> HttpResponse {
    let result = state.client.upsert(&body).await;
    if result.success {
        HttpResponse::Ok().json(result)
    } else {
        HttpResponse::BadRequest().json(result)
    }
}

/// POST /db/get-by-id
pub async fn handle_get_by_id(
    state: web::Data<AppState>,
    body: web::Json<DbGetByIdRequest>,
) -> HttpResponse {
    let result = state.client.get_by_id(&body).await;
    HttpResponse::Ok().json(result)
}

/// POST /ai/route
/// High-performance Expert-MoE Routing ported from C++
pub async fn handle_ai_route(
    body: web::Json<AIRouteRequest>,
) -> HttpResponse {
    let query = body.query.to_lowercase();
    
    // Pathology Expert
    if ["varroa", "foulbrood", "nosema", "disease", "pest", "virus", "mite"]
        .iter().any(|&k| query.contains(k)) {
        return HttpResponse::Ok().json(AIRouteResponse {
            expert: AIExpertType::Pathology,
            confidence: 0.95,
            reason: "Pathology keywords detected in query".to_string(),
        });
    }

    // African Expert
    if ["kenya", "ethiopia", "africa", "scutellata", "adansonii", "nairobi", "makueni"]
        .iter().any(|&k| query.contains(k)) {
        return HttpResponse::Ok().json(AIRouteResponse {
            expert: AIExpertType::African,
            confidence: 0.92,
            reason: "African regional context identified".to_string(),
        });
    }

    // Asian Expert
    if ["asia", "china", "india", "japan", "cerana", "giant hornet", "manuka"]
        .iter().any(|&k| query.contains(k)) {
        return HttpResponse::Ok().json(AIRouteResponse {
            expert: AIExpertType::AsianOceanic,
            confidence: 0.88,
            reason: "Asian/Oceanic regional context identified".to_string(),
        });
    }

    // Default to General
    HttpResponse::Ok().json(AIRouteResponse {
        expert: AIExpertType::General,
        confidence: 1.0,
        reason: "General apiculture intelligence routed".to_string(),
    })
}

/// POST /ai/tokenize
pub async fn handle_tokenize(
    body: web::Json<TokenizeRequest>,
) -> HttpResponse {
    // Attempt to load the domain-specific BeeYield tokenizer
    // Fallback to a basic BPE if not found
    let tokenizer_path = "beeyield_tokenizer.json";
    let tokenizer = if std::path::Path::new(tokenizer_path).exists() {
        tokenizers::Tokenizer::from_file(tokenizer_path).ok()
    } else {
        None
    };

    if let Some(tok) = tokenizer {
        match tok.encode(body.text.clone(), false) {
            Ok(encoding) => {
                let tokens = encoding.get_ids().to_vec();
                HttpResponse::Ok().json(TokenizeResponse { tokens })
            }
            Err(e) => HttpResponse::InternalServerError().body(format!("Tokenization error: {}", e)),
        }
    } else {
        // Fallback: character-level tokenization in Rust for extreme performance
        let tokens: Vec<u32> = body.text.chars().map(|c| c as u32).collect();
        HttpResponse::Ok().json(TokenizeResponse { tokens })
    }
}

/// POST /ai/query
/// Memory-safe, high-concurrency intent detection and prompt assembly.
pub async fn handle_ai_query(body: web::Json<AIQueryRequest>) -> HttpResponse {
    let message = &body.message;
    let mut detected_intents = Vec::new();

    // Ported Intent Logic
    let intents_map = [
        ("product_search", vec!["buy", "purchase", "order", "shop", "honey", "price", "cost", "product", "available", "stock", "store"]),
        ("order_status", vec!["order", "tracking", "delivery", "shipment", "status", "where is my"]),
        ("trace_honey", vec!["trace", "origin", "source", "batch", "verify", "authenticate", "qr", "honeychain"]),
        ("iot_data", vec!["sensor", "temperature", "humidity", "weight", "telemetry", "iot", "monitoring", "data"]),
        ("hive_health", vec!["health", "disease", "sick", "varroa", "mite", "infection", "anomaly", "symptom", "treatment", "cure", "prevention", "pest"]),
        ("greeting", vec!["hello", "hi", "hey", "jambo", "habari", "natta", "bonjour", "hallo", "hola"]),
    ];

    let msg_lower = message.to_lowercase();
    for (intent, keywords) in intents_map {
        if keywords.iter().any(|&kw| msg_lower.contains(kw)) {
            detected_intents.push(intent.to_string());
        }
    }
    if detected_intents.is_empty() {
        detected_intents.push("general".to_string());
    }

    // Temperature select
    let temperature = if detected_intents.contains(&"greeting".to_string()) { 0.7 } else { 0.1 };

    // Prompt building
    let system_prompt = format!(
        "SYSTEM ROLE: BeeYield Assistant. ROLE: {}. INTENTS: {}.\nCONTEXT:\n{}",
        body.user_role.as_deref().unwrap_or("User"),
        detected_intents.join(", "),
        body.context_data.as_deref().unwrap_or("No additional context.")
    );

    HttpResponse::Ok().json(AIQueryResponse {
        response: format!("Processing query: '{}' with intents: {:?}", message, detected_intents),
        intents: detected_intents,
        temperature,
        system_prompt,
    })
}

/// POST /payments/stk-push
/// External external Payment gateway handshake.
pub async fn handle_mpesa_push(
    state: web::Data<AppState>,
    body: web::Json<PaymentStkPushRequest>,
) -> HttpResponse {
    // 1. Get OAuth Token
    let client = reqwest::Client::new();
    let auth_res = match client
        .get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials")
        .basic_auth(&state.config.mpesa_key, Some(&state.config.mpesa_secret))
        .send()
        .await {
            Ok(res) => res,
            Err(e) => return HttpResponse::InternalServerError().body(format!("OAuth error: {}", e)),
        };

    let token: serde_json::Value = match auth_res.json().await {
        Ok(v) => v,
        Err(e) => return HttpResponse::InternalServerError().body(format!("JSON error: {}", e)),
    };
    let access_token = token["access_token"].as_str().unwrap_or_default();

    // 2. Initiate STK Push
    let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
    let password = general_purpose::STANDARD.encode(format!("{}{}{}", state.config.mpesa_shortcode, state.config.mpesa_passkey, timestamp));

    let payload = serde_json::json!({
        "BusinessShortCode": state.config.mpesa_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": body.amount,
        "PartyA": body.phone,
        "PartyB": state.config.mpesa_shortcode,
        "PhoneNumber": body.phone,
        "CallBackURL": state.config.mpesa_callback_url,
        "AccountReference": body.account_ref,
        "TransactionDesc": "BeeYield Rust Handshake"
    });

    let stk_res = match client
        .post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest")
        .bearer_auth(access_token)
        .json(&payload)
        .send()
        .await {
            Ok(res) => res,
            Err(e) => return HttpResponse::InternalServerError().body(format!("STK error: {}", e)),
        };

    let stk_data: serde_json::Value = match stk_res.json().await {
        Ok(v) => v,
        Err(e) => return HttpResponse::InternalServerError().body(format!("JSON error: {}", e)),
    };

    HttpResponse::Ok().json(PaymentStkPushResponse {
        success: stk_data["ResponseCode"].as_str() == Some("0"),
        checkout_request_id: stk_data["CheckoutRequestID"].as_str().unwrap_or_default().to_string(),
        message: stk_data["ResponseDescription"].as_str().unwrap_or("Request Initiated").to_string(),
    })
}

/// POST /payments/parse-callback
pub async fn handle_parse_callback(body: web::Json<PaymentCallbackRequest>) -> HttpResponse {
    let v: serde_json::Value = match serde_json::from_str(&body.body) {
        Ok(v) => v,
        Err(_) => return HttpResponse::BadRequest().body("Invalid JSON"),
    };

    let result_code = v.pointer("/Body/stkCallback/ResultCode")
        .and_then(|v| v.as_i64())
        .unwrap_or(1);
    
    let merchant_id = v.pointer("/Body/stkCallback/MerchantRequestID")
        .and_then(|v| v.as_str())
        .unwrap_or_default();
    
    let checkout_id = v.pointer("/Body/stkCallback/CheckoutRequestID")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    HttpResponse::Ok().json(PaymentCallbackResponse {
        result_code,
        merchant_request_id: merchant_id.to_string(),
        checkout_request_id: checkout_id.to_string(),
    })
}

/// GET /health

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let resp = HealthResponse {
        service: "beeyield-rust-db".to_string(),
        status: "ok".to_string(),
        supabase_configured: !state.config.supabase_url.is_empty(),
    };
    HttpResponse::Ok().json(resp)
}
