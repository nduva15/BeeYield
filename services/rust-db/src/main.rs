/// BeeYield Rust Database Service
/// High-performance Supabase REST client with connection pooling.
/// ALL config from environment variables. ZERO hardcoded data.
mod app_api;
mod config;
mod handlers;
mod models;
mod supabase_client;

use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use std::sync::Arc;

use config::Config;
use handlers::AppState;
use supabase_client::SupabaseClient;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load shared defaults first, then let backend-specific settings override them.
    let _ = dotenvy::from_filename("../../.env");
    let _ = dotenvy::from_filename_override("../../backend/.env");
    let _ = dotenvy::from_filename_override(".env");

    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    let config = Arc::new(Config::from_env());
    let bind_addr = format!("{}:{}", config.listen_host, config.listen_port);

    log::info!("🦀 BeeYield Rust DB Service starting on {}", bind_addr);
    log::info!("   Supabase URL: {}", config.supabase_url);

    let client = SupabaseClient::new(config.clone());
    let app_state = web::Data::new(AppState {
        client,
        config: config.clone(),
    });

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(Logger::default())
            .wrap(cors)
            .app_data(app_state.clone())
            .configure(app_api::configure)
            // Database CRUD endpoints
            .route("/db/insert", web::post().to(handlers::handle_insert))
            .route("/db/select", web::post().to(handlers::handle_select))
            .route("/db/update", web::patch().to(handlers::handle_update))
            .route("/db/delete", web::delete().to(handlers::handle_delete))
            .route("/db/upsert", web::post().to(handlers::handle_upsert))
            .route("/db/get-by-id", web::post().to(handlers::handle_get_by_id))
            // Integrations
            .route(
                "/integrations/configs",
                web::get().to(handlers::list_integration_configs),
            )
            .route(
                "/integrations/config",
                web::post().to(handlers::upsert_integration_config),
            )
            .route(
                "/integrations/quickbooks/authorize-url",
                web::get().to(handlers::quickbooks_authorize_url),
            )
            .route(
                "/integrations/quickbooks/complete",
                web::post().to(handlers::quickbooks_complete),
            )
            .route(
                "/integrations/quickbooks/sync",
                web::post().to(handlers::quickbooks_sync),
            )
            .route(
                "/integrations/shopify/authorize-url",
                web::get().to(handlers::shopify_authorize_url),
            )
            .route(
                "/integrations/shopify/complete",
                web::post().to(handlers::shopify_complete),
            )
            .route(
                "/integrations/shopify/sync",
                web::post().to(handlers::shopify_sync),
            )
            .route(
                "/integrations/etims/sync/{transaction_id}",
                web::post().to(handlers::etims_sync_transaction),
            )
            // Health
            .route("/health", web::get().to(handlers::health_check))
            // AI Routing & Query
            .route("/ai/route", web::post().to(handlers::handle_ai_route))
            .route("/ai/query", web::post().to(handlers::handle_ai_query))
            .route("/ai/tokenize", web::post().to(handlers::handle_tokenize))
            // Payments
            .route(
                "/payments/stk-push",
                web::post().to(handlers::handle_mpesa_push),
            )
            .route(
                "/payments/parse-callback",
                web::post().to(handlers::handle_parse_callback),
            )
    })
    .bind(&bind_addr)?
    .run()
    .await
}
