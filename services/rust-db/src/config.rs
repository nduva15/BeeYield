/// Configuration module — ALL values from environment variables, zero hardcoded data.
use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub supabase_url: String,
    pub supabase_key: String,
    pub supabase_service_role_key: Option<String>,
    pub listen_host: String,
    pub listen_port: u16,
}

impl Config {
    /// Load configuration exclusively from environment variables.
    /// Panics on startup if required vars are missing — no silent fallbacks.
    pub fn from_env() -> Self {
        // Try SUPABASE_URL first, then VITE_SUPABASE_URL for compatibility
        let supabase_url = env::var("SUPABASE_URL")
            .or_else(|_| env::var("VITE_SUPABASE_URL"))
            .expect("SUPABASE_URL or VITE_SUPABASE_URL must be set");

        let supabase_key = env::var("SUPABASE_KEY")
            .or_else(|_| env::var("SUPABASE_ANON_KEY"))
            .or_else(|_| env::var("VITE_SUPABASE_ANON_KEY"))
            .expect("SUPABASE_KEY or SUPABASE_ANON_KEY must be set");

        let supabase_service_role_key = env::var("SUPABASE_SERVICE_ROLE_KEY").ok();

        let listen_host = env::var("RUST_DB_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let listen_port = env::var("RUST_DB_PORT")
            .unwrap_or_else(|_| "9091".to_string())
            .parse::<u16>()
            .expect("RUST_DB_PORT must be a valid port number");

        Config {
            supabase_url,
            supabase_key,
            supabase_service_role_key,
            listen_host,
            listen_port,
        }
    }

    /// Returns the authorization key — prefers service role key for admin operations.
    pub fn auth_key(&self) -> &str {
        self.supabase_service_role_key
            .as_deref()
            .unwrap_or(&self.supabase_key)
    }

    /// Returns the REST API base URL (e.g. https://xxx.supabase.co/rest/v1)
    pub fn rest_url(&self) -> String {
        format!("{}/rest/v1", self.supabase_url.trim_end_matches('/'))
    }
}
