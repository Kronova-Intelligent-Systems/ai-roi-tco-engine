use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::FromRow;
use uuid::Uuid;
use chrono::{DateTime, Utc};

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize, Type, sqlx::Type, PartialEq, Eq)]
#[sqlx(type_name = "ai_platform_category", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AiPlatformCategory {
    FoundationModel,
    EnterpriseSuite,
    DeveloperApi,
    Productivity,
    VerticalAi,
    Infrastructure,
    OpenSourceHosted,
}

#[derive(Debug, Clone, Serialize, Deserialize, Type, sqlx::Type, PartialEq, Eq)]
#[sqlx(type_name = "pricing_model_type", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum PricingModelType {
    PerToken,
    PerRequest,
    SubscriptionMonthly,
    SubscriptionAnnual,
    ConsumptionBased,
    Hybrid,
    FreeTierThenPaid,
    EnterpriseCustom,
}

// ---------------------------------------------------------------------------
// Database row — NOT exposed via rspc, holds native DB types
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, FromRow, Deserialize, Serialize)]
pub struct AiPlatformPricingRow {
    pub id: Uuid,
    pub platform_slug: String,
    pub platform_name: String,
    pub vendor: String,
    pub category: AiPlatformCategory,
    pub pricing_model: PricingModelType,
    pub price_input_per_1m_tokens: Option<Decimal>,
    pub price_output_per_1m_tokens: Option<Decimal>,
    pub price_per_request: Option<Decimal>,
    pub monthly_base_price: Option<Decimal>,
    pub annual_base_price: Option<Decimal>,
    pub free_tier_included: bool,
    pub free_tier_details: Option<String>,
    pub enterprise_pricing_available: bool,
    pub roi_score: i16,
    pub ease_of_integration: i16,
    pub time_to_value_score: i16,
    pub scalability_score: i16,
    pub security_compliance_score: i16,
    pub support_score: i16,
    pub context_window_tokens: Option<i64>,
    pub supported_modalities: Vec<String>,
    pub regions_available: Vec<String>,
    pub soc2_compliant: bool,
    pub hipaa_eligible: bool,
    pub gdpr_compliant: bool,
    pub pricing_page_url: Option<String>,
    pub data_source: String,
    pub last_verified_at: DateTime<Utc>,
    pub is_active: bool,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ---------------------------------------------------------------------------
// RPC DTO — safe to cross the rspc boundary (all primitives / specta-safe)
// ---------------------------------------------------------------------------

/// Full platform record returned to the client via rspc or REST.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AiPlatformDto {
    pub id: String,
    pub platform_slug: String,
    pub platform_name: String,
    pub vendor: String,
    pub category: AiPlatformCategory,
    pub pricing_model: PricingModelType,
    pub price_input_per_1m_tokens: Option<f64>,
    pub price_output_per_1m_tokens: Option<f64>,
    pub price_per_request: Option<f64>,
    pub monthly_base_price: Option<f64>,
    pub annual_base_price: Option<f64>,
    pub free_tier_included: bool,
    pub free_tier_details: Option<String>,
    pub enterprise_pricing_available: bool,
    /// Composite ROI score 0-100
    pub roi_score: i32,
    pub ease_of_integration: i32,
    pub time_to_value_score: i32,
    pub scalability_score: i32,
    pub security_compliance_score: i32,
    pub support_score: i32,
    pub context_window_tokens: Option<i64>,
    pub supported_modalities: Vec<String>,
    pub regions_available: Vec<String>,
    pub soc2_compliant: bool,
    pub hipaa_eligible: bool,
    pub gdpr_compliant: bool,
    pub pricing_page_url: Option<String>,
    pub data_source: String,
    pub last_verified_at: String,
    pub notes: Option<String>,
}

impl From<AiPlatformPricingRow> for AiPlatformDto {
    fn from(r: AiPlatformPricingRow) -> Self {
        Self {
            id: r.id.to_string(),
            platform_slug: r.platform_slug,
            platform_name: r.platform_name,
            vendor: r.vendor,
            category: r.category,
            pricing_model: r.pricing_model,
            price_input_per_1m_tokens: r
                .price_input_per_1m_tokens
                .map(|d| d.try_into().unwrap_or(0.0)),
            price_output_per_1m_tokens: r
                .price_output_per_1m_tokens
                .map(|d| d.try_into().unwrap_or(0.0)),
            price_per_request: r.price_per_request.map(|d| d.try_into().unwrap_or(0.0)),
            monthly_base_price: r.monthly_base_price.map(|d| d.try_into().unwrap_or(0.0)),
            annual_base_price: r.annual_base_price.map(|d| d.try_into().unwrap_or(0.0)),
            free_tier_included: r.free_tier_included,
            free_tier_details: r.free_tier_details,
            enterprise_pricing_available: r.enterprise_pricing_available,
            roi_score: r.roi_score as i32,
            ease_of_integration: r.ease_of_integration as i32,
            time_to_value_score: r.time_to_value_score as i32,
            scalability_score: r.scalability_score as i32,
            security_compliance_score: r.security_compliance_score as i32,
            support_score: r.support_score as i32,
            context_window_tokens: r.context_window_tokens,
            supported_modalities: r.supported_modalities,
            regions_available: r.regions_available,
            soc2_compliant: r.soc2_compliant,
            hipaa_eligible: r.hipaa_eligible,
            gdpr_compliant: r.gdpr_compliant,
            pricing_page_url: r.pricing_page_url,
            data_source: r.data_source,
            last_verified_at: r.last_verified_at.to_rfc3339(),
            notes: r.notes,
        }
    }
}

// ---------------------------------------------------------------------------
// ROI comparison result — enriches each platform relative to user inputs
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct PlatformRoiComparison {
    pub platform: AiPlatformDto,
    /// Estimated annual cost based on user's employee count + usage pattern
    pub estimated_annual_cost: f64,
    /// Annual savings compared to user's current cost baseline
    pub estimated_annual_savings: f64,
    /// Months to break even
    pub estimated_payback_months: f64,
    /// Composite fit score 0-100 (weighted: roi, integration, compliance)
    pub composite_fit_score: f64,
    /// Delta ROI score relative to Kronova (negative = worse)
    pub roi_score_vs_kronova: i32,
}

// ---------------------------------------------------------------------------
// Filters for list queries
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AiPlatformFilters {
    pub category: Option<AiPlatformCategory>,
    pub max_monthly_budget: Option<f64>,
    pub require_soc2: Option<bool>,
    pub require_hipaa: Option<bool>,
    pub require_gdpr: Option<bool>,
    pub min_roi_score: Option<i32>,
    pub modality: Option<String>,
}

// ---------------------------------------------------------------------------
// ROI comparison input (mirrors what the calculator already computes)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct RoiComparisonInput {
    pub employees: i32,
    pub avg_salary: f64,
    pub manual_hours_per_week: f64,
    pub current_annual_cost: f64,
    pub filters: Option<AiPlatformFilters>,
}
