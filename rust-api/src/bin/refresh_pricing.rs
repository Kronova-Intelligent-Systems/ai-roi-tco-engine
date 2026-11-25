use std::sync::Arc;
use tracing::{info, error, Level};

// Adjust these imports if your module structure is slightly different
use kronova_roi_api::config::Config;
use kronova_roi_api::database::DatabasePool;
use kronova_roi_api::services::PlatformPricingService;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt().with_max_level(Level::INFO).init();
    info!("Starting manual pricing refresh...");

    dotenv::dotenv().ok();
    let config = Arc::new(Config::from_env()?);
    let db = DatabasePool::new(&config.database_url).await?;

    let svc = PlatformPricingService::new(db, config);
    if let Err(e) = svc.refresh_live_pricing().await {
        error!("Pricing refresh failed: {}", e);
        std::process::exit(1);
    }

    info!("Pricing refresh completed successfully.");
    Ok(())
}
