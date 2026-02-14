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

/// GET /health
pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let resp = HealthResponse {
        service: "beeyield-rust-db".to_string(),
        status: "ok".to_string(),
        supabase_configured: !state.config.supabase_url.is_empty(),
    };
    HttpResponse::Ok().json(resp)
}
