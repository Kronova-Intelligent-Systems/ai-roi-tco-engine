use serde::Deserialize;
use std::env;

/// Runtime configuration loaded from environment variables.
///
/// Supabase key naming follows the new 2025+ convention:
/// - `NEXT_PUBLIC_SUPABASE_ANON_KEY`  — publishable key, safe for client-side reads
/// - `SUPABASE_SERVICE_ROLE_KEY`       — secret key, server-only writes/admin ops
/// - `SUPABASE_SECRET_KEY`             — secret key, server-only writes/admin ops
#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    /// PostgreSQL connection string (direct DB access for sqlx)
    pub database_url: String,
    pub host: String,
    pub port: u16,
    pub jwt_secret: String,
    pub environment: String,

    /// Supabase project URL (e.g. https://xxxx.supabase.co)
    pub supabase_url: String,

    /// Publishable anon key — used for public PostgREST reads (RLS enforced)
    pub supabase_anon_key: String,

    /// Service-role secret key — used for privileged writes from the Rust API
    pub supabase_service_key: String,

    pub supabase_publishable_key: String,

    pub supabase_secret_key: String,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Config {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://localhost/kronova".to_string()),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3001".to_string())
                .parse()?,
            jwt_secret: env::var("JWT_SECRET")
                .expect("CRITICAL ERROR: JWT_SECRET environment variable is missing"),
            environment: env::var("ENVIRONMENT")
                .unwrap_or_else(|_| "development".to_string()),
            supabase_url: env::var("NEXT_PUBLIC_SUPABASE_URL")
                .expect("CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_URL environment variable is missing"),
            supabase_anon_key: env::var("NEXT_PUBLIC_SUPABASE_ANON_KEY")
                .expect("CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing"),
            supabase_publishable_key: env::var("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
                .expect("CRITICAL ERROR: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable is missing"),
            supabase_service_key: env::var("SUPABASE_SERVICE_ROLE_KEY")
                .expect("CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is missing"),
            supabase_secret_key: env::var("SUPABASE_SECRET_KEY")
                .expect("CRITICAL ERROR: SUPABASE_SECRET_KEY environment variable is missing"),
        })
    }

    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}
