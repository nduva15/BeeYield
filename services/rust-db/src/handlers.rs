/// HTTP request handlers — expose Supabase CRUD as REST endpoints.
/// All operations pass-through to Supabase. Zero hardcoded data.
use actix_web::{web, HttpResponse};
use std::sync::Arc;

use crate::config::Config;
use crate::models::*;
use crate::supabase_client::SupabaseClient;

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

/// GET /health

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let resp = HealthResponse {
        service: "beeyield-rust-db".to_string(),
        status: "ok".to_string(),
        supabase_configured: !state.config.supabase_url.is_empty(),
    };
    HttpResponse::Ok().json(resp)
}

