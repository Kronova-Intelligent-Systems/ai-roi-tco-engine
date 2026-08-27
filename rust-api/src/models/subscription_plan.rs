use serde::{Deserialize, Serialize};
use specta::Type;
use uuid::Uuid;

/// Subscription plan definition exposed over RPC.
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SubscriptionPlan {
    pub id: String,
    pub name: String,
    pub monthly_price: f64,
    pub yearly_price: f64,
    pub ai_tokens_monthly: i64,
    pub managed_assets: i32,
    pub storage_gb: i32,
    pub team_members: i32,
    pub max_users: i32,
    pub api_calls_monthly: i32,
    pub features: Vec<String>,
    pub is_introductory: bool,
}

impl SubscriptionPlan {
    pub fn get_all_plans() -> Vec<Self> {
        vec![
            Self {
                id: Uuid::new_v4().to_string(),
                name: "Lite".to_string(),
                monthly_price: 9.0,
                yearly_price: 108.0,
                ai_tokens_monthly: 100_000,
                managed_assets: 100,
                storage_gb: 1,
                team_members: 1,
                max_users: 1,
                api_calls_monthly: 1_000,
                features: vec![
                    "100,000 AI tokens/month".into(),
                    "100 managed assets".into(),
                    "1 team member".into(),
                    "Basic support".into(),
                ],
                is_introductory: true,
            },
            Self {
                id: Uuid::new_v4().to_string(),
                name: "Starter".to_string(),
                monthly_price: 99.0,
                yearly_price: 990.0,
                ai_tokens_monthly: 1_000_000,
                managed_assets: 1_000,
                storage_gb: 5,
                team_members: 5,
                max_users: 5,
                api_calls_monthly: 10_000,
                features: vec![
                    "1,000,000 AI tokens/month".into(),
                    "1,000 managed assets".into(),
                    "5 team members".into(),
                    "Basic analytics".into(),
                ],
                is_introductory: false,
            },
            Self {
                id: Uuid::new_v4().to_string(),
                name: "Professional".to_string(),
                monthly_price: 299.0,
                yearly_price: 2_990.0,
                ai_tokens_monthly: 10_000_000,
                managed_assets: 10_000,
                storage_gb: 50,
                team_members: 25,
                max_users: 25,
                api_calls_monthly: 100_000,
                features: vec![
                    "10,000,000 AI tokens/month".into(),
                    "10,000 managed assets".into(),
                    "25 team members".into(),
                    "Advanced analytics".into(),
                    "API access".into(),
                ],
                is_introductory: false,
            },
            Self {
                id: Uuid::new_v4().to_string(),
                name: "Enterprise".to_string(),
                monthly_price: 999.0,
                yearly_price: 9_990.0,
                ai_tokens_monthly: -1,
                managed_assets: -1,
                storage_gb: 500,
                team_members: -1,
                max_users: -1,
                api_calls_monthly: -1,
                features: vec![
                    "Unlimited AI tokens".into(),
                    "Unlimited managed assets".into(),
                    "Unlimited team members".into(),
                    "Custom integrations".into(),
                    "Dedicated support".into(),
                ],
                is_introductory: false,
            },
        ]
    }
}
