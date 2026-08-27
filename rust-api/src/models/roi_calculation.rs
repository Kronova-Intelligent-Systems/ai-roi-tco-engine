use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use specta::Type;
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Stored ROI calculation record from the database.
/// Note: This is a database model and does NOT derive specta::Type.
/// Use ROICalculationResponse for RPC/API responses.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct ROICalculation {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub organization_profile: serde_json::Value,
    pub operations_metrics: serde_json::Value,
    pub infrastructure_data: serde_json::Value,
    pub strategic_factors: serde_json::Value,
    pub results: serde_json::Value,
    pub selected_plan: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Typed response for ROI calculations returned over RPC.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct ROICalculationResponse {
    pub id: String,
    pub user_id: Option<String>,
    pub organization_profile: OrganizationProfile,
    pub operations_metrics: OperationsMetrics,
    pub infrastructure_data: InfrastructureData,
    pub strategic_factors: StrategicFactors,
    pub results: ROIResults,
    pub selected_plan: String,
    pub created_at: String,
    pub updated_at: String,
}

impl ROICalculation {
    /// Convert the database record with JSON columns into a fully typed response.
    pub fn into_response(self) -> Result<ROICalculationResponse, serde_json::Error> {
        Ok(ROICalculationResponse {
            id: self.id.to_string(),
            user_id: self.user_id.map(|u| u.to_string()),
            organization_profile: serde_json::from_value(self.organization_profile)?,
            operations_metrics: serde_json::from_value(self.operations_metrics)?,
            infrastructure_data: serde_json::from_value(self.infrastructure_data)?,
            strategic_factors: serde_json::from_value(self.strategic_factors)?,
            results: serde_json::from_value(self.results)?,
            selected_plan: self.selected_plan,
            created_at: self.created_at.to_rfc3339(),
            updated_at: self.updated_at.to_rfc3339(),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate, Type)]
#[serde(rename_all = "camelCase")]
pub struct OrganizationProfile {
    #[validate(range(min = 1))]
    pub employees: i32,

    #[validate(range(min = 0.0))]
    pub avg_salary: f64,

    #[validate(length(min = 2))]
    pub industry: String,

    #[validate(length(min = 2))]
    pub company_size: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate, Type)]
#[serde(rename_all = "camelCase")]
pub struct OperationsMetrics {
    #[validate(range(min = 0.0, max = 168.0))]
    pub manual_hours: f64,

    #[validate(range(min = 0.0, max = 100.0))]
    pub error_rate: f64,

    #[validate(range(min = 0.0, max = 100.0))]
    pub system_downtime: f64,

    #[validate(range(min = 0.0))]
    pub compliance_costs: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate, Type)]
#[serde(rename_all = "camelCase")]
pub struct InfrastructureData {
    #[validate(range(min = 0, max = 100))]
    pub data_quality: i32,

    #[validate(range(min = 0, max = 100))]
    pub integration_complexity: i32,

    #[validate(range(min = 0))]
    pub legacy_system_age: i32,

    #[validate(range(min = 0, max = 100))]
    pub cloud_readiness: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Validate, Type)]
#[serde(rename_all = "camelCase")]
pub struct StrategicFactors {
    #[validate(range(min = 0, max = 100))]
    pub ai_maturity: i32,

    #[validate(range(min = 0, max = 100))]
    pub change_readiness: i32,

    #[validate(range(min = 0, max = 100))]
    pub executive_support: i32,

    #[validate(range(min = 0, max = 100))]
    pub competitive_pressure: i32,
}

/// Full ROI calculation results returned from the calculation engine.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ROIResults {
    pub current_annual_cost: f64,
    pub kronova_annual_cost: f64,
    pub annual_savings: f64,
    pub roi: f64,
    pub payback_months: f64,
    pub three_year_savings: f64,
    pub five_year_value: f64,
    pub operational_savings: f64,
    pub quality_savings: f64,
    pub strategic_value: f64,
    pub hidden_cost_reduction: f64,
    pub implementation_risk: f64,
    pub data_quality_risk: f64,
    pub adoption_risk: f64,
    pub productivity_gain: f64,
    pub error_reduction: f64,
    pub time_to_value: f64,
}

/// Input payload for creating a new ROI calculation via RPC.
#[derive(Debug, Clone, Serialize, Deserialize, Validate, Type)]
#[serde(rename_all = "camelCase")]
pub struct CreateROICalculationInput {
    #[validate(nested)]
    pub organization_profile: OrganizationProfile,

    #[validate(nested)]
    pub operations_metrics: OperationsMetrics,

    #[validate(nested)]
    pub infrastructure_data: InfrastructureData,

    #[validate(nested)]
    pub strategic_factors: StrategicFactors,

    #[validate(length(min = 1))]
    pub selected_plan: String,
}

/// Combined response for a calculate + save operation.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ROICalculationWithResults {
    pub calculation: ROICalculationResponse,
    pub results: ROIResults,
}

/// Typed list response for multiple calculations.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct ROICalculationList {
    pub calculations: Vec<ROICalculationResponse>,
    pub total: i64,
}
