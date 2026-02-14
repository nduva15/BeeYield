/// BeeYield Rust Database Service
/// High-performance Supabase REST client with connection pooling.
/// ALL config from environment variables. ZERO hardcoded data.
mod config;
mod handlers;
mod models;
mod supabase_client;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer, middleware::Logger};
use std::sync::Arc;

use config::Config;
use handlers::AppState;
use supabase_client::SupabaseClient;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load .env file if present (searches up the directory tree)
    let _ = dotenvy::from_filename("../../.env");
    let _ = dotenvy::from_filename("../../backend/.env");
    let _ = dotenvy::dotenv();

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
            // Database CRUD endpoints
            .route("/db/insert", web::post().to(handlers::handle_insert))
            .route("/db/select", web::post().to(handlers::handle_select))
            .route("/db/update", web::patch().to(handlers::handle_update))
            .route("/db/delete", web::delete().to(handlers::handle_delete))
            .route("/db/upsert", web::post().to(handlers::handle_upsert))
            .route("/db/get-by-id", web::post().to(handlers::handle_get_by_id))
            // Health
            .route("/health", web::get().to(handlers::health_check))
            // AI Routing
            .route("/ai/route", web::post().to(handlers::handle_ai_route))
            // AI Tokenization
            .route("/ai/tokenize", web::post().to(handlers::handle_tokenize))
    })

    .bind(&bind_addr)?

    .run()
    .await
}
