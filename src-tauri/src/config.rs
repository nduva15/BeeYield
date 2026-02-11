// ─────────────────────────────────────────────────────────────
// Application Configuration
// Reads from environment variables with sensible defaults.
// ─────────────────────────────────────────────────────────────

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    // ── Supabase ──────────────────────────────────────────
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub supabase_service_role_key: Option<String>,

    // ── AI Models ─────────────────────────────────────────
    pub gemini_api_key: String,
    pub gemini_model: String,
    pub openai_api_key: Option<String>,
    pub openai_model: String,

    // ── Vector Store ──────────────────────────────────────
    pub vector_dimensions: usize,
    pub vector_ef_construction: usize,
    pub vector_max_elements: usize,

    // ── Backend ───────────────────────────────────────────
    pub backend_url: String,
}

impl AppConfig {
    /// Build config from environment, falling back to defaults.
    pub fn from_env() -> Self {
        Self {
            supabase_url: env("VITE_SUPABASE_URL", "https://placeholder.supabase.co"),
            supabase_anon_key: env("VITE_SUPABASE_ANON_KEY", ""),
            supabase_service_role_key: std::env::var("SUPABASE_SERVICE_ROLE_KEY").ok(),

            gemini_api_key: env("GOOGLE_API_KEY", ""),
            gemini_model: env("GEMINI_MODEL", "gemini-2.0-flash"),
            openai_api_key: std::env::var("OPENAI_API_KEY").ok(),
            openai_model: env("OPENAI_MODEL", "gpt-4o"),

            vector_dimensions: env("VECTOR_DIMENSIONS", "768")
                .parse()
                .unwrap_or(768),
            vector_ef_construction: env("VECTOR_EF_CONSTRUCTION", "200")
                .parse()
                .unwrap_or(200),
            vector_max_elements: env("VECTOR_MAX_ELEMENTS", "50000")
                .parse()
                .unwrap_or(50_000),

            backend_url: env("BACKEND_URL", "http://127.0.0.1:8000"),
        }
    }
}

fn env(key: &str, default: &str) -> String {
    std::env::var(key).unwrap_or_else(|_| default.to_string())
}
