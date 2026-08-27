use serde::{Deserialize, Serialize};
use specta::Type;

/// Industry benchmark data exposed over RPC for ROI projections.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct IndustryBenchmark {
    pub industry: String,
    pub complexity_multiplier: f64,
    pub savings_multiplier: f64,
    pub risk_multiplier: f64,
    pub avg_implementation_months: f64,
    pub avg_roi_percentage: f64,
    pub data_quality_baseline: i32,
}

impl IndustryBenchmark {
    pub fn default_for_industry(industry: &str) -> Self {
        match industry.to_lowercase().as_str() {
            "manufacturing" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 1.3,
                savings_multiplier: 1.4,
                risk_multiplier: 1.2,
                avg_implementation_months: 6.0,
                avg_roi_percentage: 185.0,
                data_quality_baseline: 65,
            },
            "retail" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 1.0,
                savings_multiplier: 1.2,
                risk_multiplier: 0.9,
                avg_implementation_months: 4.0,
                avg_roi_percentage: 220.0,
                data_quality_baseline: 70,
            },
            "healthcare" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 1.5,
                savings_multiplier: 1.6,
                risk_multiplier: 1.4,
                avg_implementation_months: 9.0,
                avg_roi_percentage: 165.0,
                data_quality_baseline: 60,
            },
            "finance" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 1.4,
                savings_multiplier: 1.5,
                risk_multiplier: 1.3,
                avg_implementation_months: 8.0,
                avg_roi_percentage: 175.0,
                data_quality_baseline: 75,
            },
            "logistics" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 1.2,
                savings_multiplier: 1.7,
                risk_multiplier: 1.1,
                avg_implementation_months: 5.0,
                avg_roi_percentage: 240.0,
                data_quality_baseline: 68,
            },
            "technology" => Self {
                industry: industry.to_string(),
                complexity_multiplier: 0.8,
                savings_multiplier: 1.1,
                risk_multiplier: 0.7,
                avg_implementation_months: 3.0,
                avg_roi_percentage: 280.0,
                data_quality_baseline: 80,
            },
            _ => Self {
                industry: "other".to_string(),
                complexity_multiplier: 1.0,
                savings_multiplier: 1.0,
                risk_multiplier: 1.0,
                avg_implementation_months: 6.0,
                avg_roi_percentage: 200.0,
                data_quality_baseline: 70,
            },
        }
    }
}
