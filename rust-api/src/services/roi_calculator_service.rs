use crate::{config::Config, database::DatabasePool, error::RpcError, models::*};
use std::sync::Arc;
use uuid::Uuid;

pub struct ROICalculatorService {
    db: DatabasePool,
    config: Arc<Config>,
}

impl ROICalculatorService {
    pub fn new(db: DatabasePool, config: Arc<Config>) -> Self {
        Self { db, config }
    }

    /// Execute the full ROI calculation engine against the provided inputs.
    pub async fn calculate_roi(
        &self,
        input: CreateROICalculationInput,
    ) -> Result<ROIResults, RpcError> {
        // Get industry benchmark with AI adoption rates
        let industry_benchmark =
            IndustryBenchmark::default_for_industry(&input.organization_profile.industry);
        let ai_adoption_rate =
            Self::get_ai_adoption_rate(&input.organization_profile.industry);

        // Get selected plan with token limits
        let selected_plan = SubscriptionPlan::get_all_plans()
            .into_iter()
            .find(|p| p.name.to_lowercase() == input.selected_plan.to_lowercase())
            .ok_or_else(|| RpcError::NotFound("Subscription plan not found".to_string()))?;

        let monthly_tokens = selected_plan.ai_tokens_monthly;
        let max_team_members = selected_plan.max_users;
        let kronova_subscription = selected_plan.yearly_price;

        // ====================================================================
        // User Coverage Calculation
        // ====================================================================
        let covered_employees = if max_team_members == -1 {
            input.organization_profile.employees as f64
        } else {
            f64::min(
                input.organization_profile.employees as f64,
                max_team_members as f64,
            )
        };
        let employee_coverage_ratio =
            covered_employees / input.organization_profile.employees as f64;
        let additional_seats_needed = if max_team_members == -1 {
            0.0
        } else {
            f64::max(
                0.0,
                input.organization_profile.employees as f64 - max_team_members as f64,
            )
        };
        let additional_seat_cost = if additional_seats_needed > 0.0 {
            additional_seats_needed
                * (kronova_subscription / f64::max(1.0, max_team_members as f64))
        } else {
            0.0
        };

        // ====================================================================
        // PART 1: Current System Costs
        // ====================================================================
        let hourly_rate = input.organization_profile.avg_salary / 2080.0;
        let manual_labor_cost = (input.organization_profile.employees as f64
            * input.organization_profile.avg_salary
            * (input.operations_metrics.manual_hours / 40.0))
            / 52.0;

        let error_costs = (input.organization_profile.avg_salary
            * input.organization_profile.employees as f64
            * (input.operations_metrics.error_rate / 100.0))
            / 12.0;

        let downtime_costs = (input.organization_profile.avg_salary
            * input.organization_profile.employees as f64
            * (input.operations_metrics.system_downtime / 100.0))
            / 12.0;

        let data_quality_costs =
            100_000.0 * (1.0 - input.infrastructure_data.data_quality as f64 / 100.0);
        let integration_penalty = (input.infrastructure_data.integration_complexity as f64
            / 100.0)
            * 50_000.0
            * industry_benchmark.complexity_multiplier;

        let current_annual_cost = (manual_labor_cost + error_costs + downtime_costs) * 12.0
            + input.operations_metrics.compliance_costs
            + 75_000.0 // maintenance_costs
            + 25_000.0 // security_costs
            + data_quality_costs
            + integration_penalty;

        // ====================================================================
        // PART 2: Readiness Factors
        // ====================================================================
        let ai_readiness_factor = (input.strategic_factors.ai_maturity as f64
            + input.strategic_factors.change_readiness as f64
            + input.strategic_factors.executive_support as f64)
            / 300.0;
        let data_readiness_factor = input.infrastructure_data.data_quality as f64 / 100.0;
        let cloud_readiness_factor = input.infrastructure_data.cloud_readiness as f64 / 100.0;
        let organizational_readiness =
            (ai_readiness_factor + data_readiness_factor + cloud_readiness_factor) / 3.0;

        // ====================================================================
        // PART 3: Token-Based Productivity Value
        // ====================================================================
        let token_productivity_value = Self::calculate_token_value(
            monthly_tokens,
            covered_employees as i32,
            input.organization_profile.avg_salary,
        );
        let readiness_multiplier = 0.5 + (organizational_readiness * 0.5);

        // ====================================================================
        // PART 4: Kronova Feature Values
        // ====================================================================
        let effective_tool_count = 18.0 * organizational_readiness;
        let tools_efficiency_multiplier = 1.0 + (effective_tool_count * 0.04 * 0.6);

        let adoption_scaling = if covered_employees <= 5.0 {
            0.7 + (covered_employees * 0.06)
        } else if covered_employees <= 25.0 {
            0.85 + ((covered_employees - 5.0) / 200.0)
        } else if covered_employees <= 100.0 {
            0.75 + ((100.0 - covered_employees) / 750.0)
        } else {
            0.70 + (f64::min(covered_employees, 500.0) - 100.0) / 8000.0
        };

        let effective_token_value = token_productivity_value
            * readiness_multiplier
            * ai_adoption_rate
            * adoption_scaling;

        // Voice Platform
        let voice_scale_factor = f64::min(1.0, covered_employees / 10.0);
        let voice_platform_value = covered_employees
            * hourly_rate
            * 2080.0
            * 0.35
            * 0.15
            * organizational_readiness
            * voice_scale_factor;

        let company_scale_factor = f64::min(1.0, covered_employees / 25.0);

        // Asset Tokenization
        let asset_tokenization_value =
            if Self::is_asset_tokenization_relevant(&input.organization_profile.industry) {
                current_annual_cost
                    * 0.12
                    * organizational_readiness
                    * employee_coverage_ratio
                    * company_scale_factor
                    * 0.5
            } else {
                0.0
            };

        // Stablecoin Integration
        let stablecoin_value =
            if Self::is_stablecoin_relevant(&input.organization_profile.industry) {
                input.operations_metrics.compliance_costs
                    * 0.08
                    * organizational_readiness
                    * employee_coverage_ratio
                    * company_scale_factor
                    * 0.5
            } else {
                0.0
            };

        // ====================================================================
        // PART 5: Traditional Operational Savings
        // ====================================================================
        let base_efficiency_gain =
            (0.2 + ai_readiness_factor * 0.4) * tools_efficiency_multiplier;
        let operational_savings = manual_labor_cost
            * 12.0
            * base_efficiency_gain
            * industry_benchmark.savings_multiplier
            * employee_coverage_ratio
            * adoption_scaling;

        let error_reduction_rate = 0.4 + data_readiness_factor * 0.35;
        let quality_savings = error_costs
            * 12.0
            * error_reduction_rate
            * tools_efficiency_multiplier
            * employee_coverage_ratio
            * adoption_scaling;

        let strategic_multiplier =
            input.strategic_factors.competitive_pressure as f64 / 100.0;
        let strategic_value = (input.organization_profile.avg_salary
            * covered_employees
            * 0.03
            * strategic_multiplier
            * organizational_readiness
            * company_scale_factor)
            + voice_platform_value
            + asset_tokenization_value
            + stablecoin_value;

        let scale_factor =
            1.0 + (input.organization_profile.employees as f64).log10() * 1.2;
        let scaled_data_prep = 5000.0 * scale_factor;
        let scaled_training = 2000.0 * scale_factor;
        let scaled_maintenance = 3000.0 * scale_factor;

        let capped_tools_multiplier = f64::min(tools_efficiency_multiplier, 1.3);
        let hidden_cost_reduction = (scaled_data_prep * 0.4
            + scaled_training * 0.3
            + scaled_maintenance * 0.2)
            * capped_tools_multiplier
            * employee_coverage_ratio
            * organizational_readiness;

        // ====================================================================
        // PART 6: Total Savings & ROI
        // ====================================================================
        let implementation_multiplier = if kronova_subscription >= 9990.0 {
            0.3
        } else if kronova_subscription >= 2990.0 {
            0.4
        } else {
            0.5
        };
        let implementation_costs = kronova_subscription * implementation_multiplier;
        let ongoing_operational_costs = kronova_subscription * 0.15;

        let total_savings = operational_savings
            + quality_savings
            + strategic_value
            + hidden_cost_reduction
            + effective_token_value;
        let kronova_annual_cost =
            kronova_subscription + ongoing_operational_costs + additional_seat_cost;
        let annual_savings = total_savings - kronova_annual_cost;

        let total_investment = kronova_subscription + implementation_costs;
        let roi = if kronova_annual_cost > 0.0 {
            (annual_savings / kronova_annual_cost) * 100.0
        } else {
            0.0
        };
        let payback_months = if annual_savings > 0.0 {
            f64::max(0.1, total_investment / (annual_savings / 12.0))
        } else {
            0.0
        };

        let three_year_savings = annual_savings + (annual_savings * 1.05)
            + (annual_savings * 1.1)
            - implementation_costs;
        let five_year_value =
            annual_savings * (1.0 + 1.05 + 1.1 + 1.15 + 1.2) - implementation_costs;

        // ====================================================================
        // PART 7: Risk Assessment
        // ====================================================================
        let implementation_risk = ((100.0 - input.strategic_factors.ai_maturity as f64)
            * industry_benchmark.risk_multiplier)
            / 100.0;
        let data_quality_risk =
            ((100.0 - input.infrastructure_data.data_quality as f64) / 100.0) * 50.0;
        let adoption_risk =
            ((100.0 - input.strategic_factors.change_readiness as f64) / 100.0) * 30.0;

        // ====================================================================
        // PART 8: Performance Metrics
        // ====================================================================
        let productivity_gain = f64::min(95.0, base_efficiency_gain * 100.0);
        let error_reduction = f64::min(95.0, error_reduction_rate * 100.0);
        let enterprise_bonus = if kronova_subscription >= 9990.0 {
            2.0
        } else {
            0.0
        };
        let time_to_value =
            f64::max(2.0, 10.0 - ai_readiness_factor * 6.0 - enterprise_bonus);

        Ok(ROIResults {
            current_annual_cost,
            kronova_annual_cost,
            annual_savings,
            roi,
            payback_months,
            three_year_savings,
            five_year_value,
            operational_savings,
            quality_savings,
            strategic_value,
            hidden_cost_reduction,
            implementation_risk,
            data_quality_risk,
            adoption_risk,
            productivity_gain,
            error_reduction,
            time_to_value,
        })
    }

    /// Calculate token-based productivity value.
    fn calculate_token_value(monthly_tokens: i64, employees: i32, avg_salary: f64) -> f64 {
        let hourly_rate = avg_salary / 2080.0;
        let hours_saved_per_year = 217.0;
        let base_productivity_value = hourly_rate * hours_saved_per_year;

        let tokens_per_employee = 400_000i64;
        let coverage_ratio = if monthly_tokens == -1 {
            1.0
        } else {
            f64::min(
                1.0,
                monthly_tokens as f64 / (employees as f64 * tokens_per_employee as f64),
            )
        };

        base_productivity_value * employees as f64 * coverage_ratio * 1.8
    }

    fn get_ai_adoption_rate(industry: &str) -> f64 {
        match industry.to_lowercase().as_str() {
            "technology" => 0.85,
            "finance" => 0.78,
            "manufacturing" => 0.72,
            "logistics" => 0.70,
            "retail" => 0.68,
            "healthcare" => 0.65,
            _ => 0.60,
        }
    }

    fn is_asset_tokenization_relevant(industry: &str) -> bool {
        matches!(
            industry.to_lowercase().as_str(),
            "finance" | "manufacturing" | "logistics" | "retail"
        )
    }

    fn is_stablecoin_relevant(industry: &str) -> bool {
        matches!(
            industry.to_lowercase().as_str(),
            "finance" | "retail" | "technology"
        )
    }

    /// Persist a completed ROI calculation to the database.
    pub async fn save_calculation(
        &self,
        input: CreateROICalculationInput,
        results: ROIResults,
        user_id: Option<Uuid>,
    ) -> Result<ROICalculation, RpcError> {
        let id = Uuid::new_v4();
        let now = chrono::Utc::now();

        let calculation = sqlx::query_as::<_, ROICalculation>(
            r#"
            INSERT INTO roi_calculations (
                id, user_id, organization_profile, operations_metrics,
                infrastructure_data, strategic_factors, results, selected_plan,
                created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            "#,
        )
        .bind(id)
        .bind(user_id)
        .bind(serde_json::to_value(&input.organization_profile)?)
        .bind(serde_json::to_value(&input.operations_metrics)?)
        .bind(serde_json::to_value(&input.infrastructure_data)?)
        .bind(serde_json::to_value(&input.strategic_factors)?)
        .bind(serde_json::to_value(&results)?)
        .bind(&input.selected_plan)
        .bind(now)
        .bind(now)
        .fetch_one(self.db.pool())
        .await?;

        Ok(calculation)
    }

    /// Retrieve a single ROI calculation by ID.
    pub async fn get_calculation(&self, id: Uuid) -> Result<ROICalculation, RpcError> {
        let calculation =
            sqlx::query_as::<_, ROICalculation>("SELECT * FROM roi_calculations WHERE id = $1")
                .bind(id)
                .fetch_one(self.db.pool())
                .await?;

        Ok(calculation)
    }

    /// List ROI calculations, optionally filtered by user ID.
    pub async fn list_calculations(
        &self,
        user_id: Option<Uuid>,
    ) -> Result<Vec<ROICalculation>, RpcError> {
        let calculations = if let Some(uid) = user_id {
            sqlx::query_as::<_, ROICalculation>(
                "SELECT * FROM roi_calculations WHERE user_id = $1 ORDER BY created_at DESC",
            )
            .bind(uid)
            .fetch_all(self.db.pool())
            .await?
        } else {
            sqlx::query_as::<_, ROICalculation>(
                "SELECT * FROM roi_calculations WHERE user_id IS NULL ORDER BY created_at DESC LIMIT 10",
            )
            .fetch_all(self.db.pool())
            .await?
        };

        Ok(calculations)
    }
}
