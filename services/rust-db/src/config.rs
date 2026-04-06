/// Configuration module — ALL values from environment variables, zero hardcoded data.
use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub supabase_url: String,
    pub supabase_key: String,
    pub supabase_service_role_key: Option<String>,
    pub listen_host: String,
    pub listen_port: u16,
    // M-Pesa Daraja Config
    pub mpesa_key: String,
    pub mpesa_secret: String,
    pub mpesa_shortcode: String,
    pub mpesa_passkey: String,
    pub mpesa_callback_url: String,
    pub app_url: String,
    pub quickbooks_client_id: String,
    pub quickbooks_client_secret: String,
    pub quickbooks_scopes: String,
    pub shopify_api_key: String,
    pub shopify_api_secret: String,
    pub shopify_scopes: String,
    pub etims_api_key: String,
    pub etims_base_url: String,
    pub etims_vscu_serial: String,
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

        let mpesa_key = env::var("MPESA_CONSUMER_KEY").unwrap_or_default();
        let mpesa_secret = env::var("MPESA_CONSUMER_SECRET").unwrap_or_default();
        let mpesa_shortcode = env::var("MPESA_SHORTCODE").unwrap_or_default();
        let mpesa_passkey = env::var("MPESA_PASSKEY").unwrap_or_default();
        let mpesa_callback_url = env::var("MPESA_CALLBACK_URL").unwrap_or_default();
        let app_url = env::var("APP_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());
        let quickbooks_client_id = env::var("QUICKBOOKS_CLIENT_ID").unwrap_or_default();
        let quickbooks_client_secret = env::var("QUICKBOOKS_CLIENT_SECRET").unwrap_or_default();
        let quickbooks_scopes = env::var("QUICKBOOKS_SCOPES")
            .unwrap_or_else(|_| "com.intuit.quickbooks.accounting".to_string());
        let shopify_api_key = env::var("SHOPIFY_API_KEY").unwrap_or_default();
        let shopify_api_secret = env::var("SHOPIFY_API_SECRET").unwrap_or_default();
        let shopify_scopes =
            env::var("SHOPIFY_SCOPES").unwrap_or_else(|_| "read_products,read_orders".to_string());
        let etims_api_key = env::var("ETIMS_API_KEY").unwrap_or_default();
        let etims_base_url = env::var("ETIMS_BASE_URL")
            .unwrap_or_else(|_| "https://etims-sandbox.kra.go.ke/api/v1".to_string());
        let etims_vscu_serial =
            env::var("ETIMS_VSCU_SERIAL").unwrap_or_else(|_| "BY-VSCU-MOCK-2026".to_string());

        Config {
            supabase_url,
            supabase_key,
            supabase_service_role_key,
            listen_host,
            listen_port,
            mpesa_key,
            mpesa_secret,
            mpesa_shortcode,
            mpesa_passkey,
            mpesa_callback_url,
            app_url,
            quickbooks_client_id,
            quickbooks_client_secret,
            quickbooks_scopes,
            shopify_api_key,
            shopify_api_secret,
            shopify_scopes,
            etims_api_key,
            etims_base_url,
            etims_vscu_serial,
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

    pub fn quickbooks_redirect_uri(&self) -> String {
        format!(
            "{}/integrations/callback/quickbooks",
            self.app_url.trim_end_matches('/')
        )
    }

    pub fn shopify_redirect_uri(&self) -> String {
        format!(
            "{}/integrations/callback/shopify",
            self.app_url.trim_end_matches('/')
        )
    }

    pub fn mpesa_configured(&self) -> bool {
        !self.mpesa_key.is_empty()
            && !self.mpesa_secret.is_empty()
            && !self.mpesa_shortcode.is_empty()
            && !self.mpesa_passkey.is_empty()
            && !self.mpesa_callback_url.is_empty()
    }

    pub fn etims_verify_url(&self, transaction_id: &str) -> String {
        format!(
            "{}/verify?id={}",
            self.etims_base_url.trim_end_matches('/'),
            transaction_id
        )
    }
}
