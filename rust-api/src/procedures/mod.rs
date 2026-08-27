use std::marker::PhantomData;
use std::sync::Arc;

use rspc::{Procedure, ProcedureBuilder, ResolverInput, ResolverOutput, Router};
use uuid::Uuid;
use validator::Validate;

use crate::config::Config;
use crate::database::DatabasePool;
use crate::error::RpcError;
use crate::models::*;
use crate::services::{PlatformPricingService, ROICalculatorService};

// =============================================================================
// Context - shared state injected into every procedure
// =============================================================================

#[derive(Clone)]
pub struct Ctx {
    pub db: DatabasePool,
    pub config: Arc<Config>,
}

// =============================================================================
// BaseProcedure - rspc 0.4 procedure factory
//
// Every procedure is built through this type which wires up:
//   - The context type (Ctx)
//   - The error type (RpcError)
//   - Default middleware (add tracing, auth, etc. here later)
// =============================================================================

pub struct BaseProcedure<TErr = RpcError>(PhantomData<TErr>);

impl<TErr> BaseProcedure<TErr> {
    pub fn builder<TInput, TResult>(
    ) -> ProcedureBuilder<TErr, Ctx, Ctx, TInput, TInput, TResult, TResult>
    where
        TErr: rspc::Error,
        TInput: ResolverInput,
        TResult: ResolverOutput<TErr>,
    {
        Procedure::builder()
    }
}

// =============================================================================
// Router - mounts all procedures
// =============================================================================

pub fn mount() -> Router<Ctx> {
    Router::new()
        // ------------------------------------------------------------------
        // Queries
        // ------------------------------------------------------------------
        .procedure("version", {
            <BaseProcedure>::builder()
                .query(|_ctx, _: ()| async move {
                    Ok(env!("CARGO_PKG_VERSION").to_string())
                })
        })
        .procedure("subscriptionPlans", {
            <BaseProcedure>::builder()
                .query(|_ctx, _: ()| async move {
                    Ok(SubscriptionPlan::get_all_plans())
                })
        })
        .procedure("industryBenchmark", {
            <BaseProcedure>::builder()
                .query(|_ctx, industry: String| async move {
                    Ok(IndustryBenchmark::default_for_industry(&industry))
                })
        })
        .procedure("getCalculation", {
            <BaseProcedure>::builder()
                .query(|ctx, id: String| async move {
                    let service = ROICalculatorService::new(ctx.db.clone(), ctx.config.clone());
                    let uuid = Uuid::parse_str(&id)
                        .map_err(|e| RpcError::Validation(e.to_string()))?;

                    let calculation = service
                        .get_calculation(uuid)
                        .await
                        .map_err(|e| RpcError::Database(e.to_string()))?;

                    let response = calculation
                        .into_response()
                        .map_err(|e| RpcError::Serialization(e.to_string()))?;

                    Ok(response)
                })
        })
        .procedure("listCalculations", {
            <BaseProcedure>::builder()
                .query(|ctx, user_id: Option<String>| async move {
                    let service = ROICalculatorService::new(ctx.db.clone(), ctx.config.clone());
                    let uuid = user_id
                        .map(|id| Uuid::parse_str(&id))
                        .transpose()
                        .map_err(|e| RpcError::Validation(e.to_string()))?;

                    let calculations = service
                        .list_calculations(uuid)
                        .await
                        .map_err(|e| RpcError::Database(e.to_string()))?;

                    let responses: Vec<ROICalculationResponse> = calculations
                        .into_iter()
                        .filter_map(|c| c.into_response().ok())
                        .collect();

                    let total = responses.len() as i64;

                    Ok(ROICalculationList {
                        calculations: responses,
                        total,
                    })
                })
        })
        // ------------------------------------------------------------------
        // AI Platform Pricing Queries
        // ------------------------------------------------------------------

        // List all active AI platforms with optional filters.
        .procedure("listAiPlatforms", {
            <BaseProcedure>::builder()
                .query(|ctx, filters: Option<AiPlatformFilters>| async move {
                    let svc = PlatformPricingService::new(ctx.db.clone(), ctx.config.clone());
                    svc.list_platforms(filters)
                        .await
                        .map_err(|e| RpcError::Internal(e.to_string()))
                })
        })

        // Compute per-platform ROI comparison relative to the user's inputs.
        .procedure("getAiPlatformRoiComparison", {
            <BaseProcedure>::builder()
                .query(|ctx, input: RoiComparisonInput| async move {
                    let svc = PlatformPricingService::new(ctx.db.clone(), ctx.config.clone());
                    svc.get_roi_comparison(input)
                        .await
                        .map_err(|e| RpcError::Internal(e.to_string()))
                })
        })

        // Trigger an immediate pricing refresh (service-role op — restrict to admin in prod).
        .procedure("refreshPlatformPricing", {
            <BaseProcedure>::builder()
                .mutation(|ctx, _: ()| async move {
                    let svc = PlatformPricingService::new(ctx.db.clone(), ctx.config.clone());
                    svc.refresh_live_pricing()
                        .await
                        .map_err(|e| RpcError::Internal(e.to_string()))?;
                    Ok(serde_json::json!({ "ok": true, "message": "Pricing refresh triggered" }))
                })
        })

        // ------------------------------------------------------------------
        // Mutations
        // ------------------------------------------------------------------
        .procedure("calculateROI", {
    <BaseProcedure>::builder()
        .mutation(|ctx, input: CreateROICalculationInput| async move {
            // 1. Validate input
            input.validate().map_err(|e| {
                tracing::error!("CRITICAL: Validation Error in calculateROI: {}", e);
                RpcError::from(e)
            })?;

            let service = ROICalculatorService::new(ctx.db.clone(), ctx.config.clone());

            // 2. Calculation Engine
            let results = service
                .calculate_roi(input.clone())
                .await
                .map_err(|e| {
                    tracing::error!("CRITICAL: Math Engine Error in calculateROI: {}", e);
                    RpcError::Internal(e.to_string())
                })?;

            // 3. Database Persistence (Most likely point of failure)
            let calculation = service
                .save_calculation(input, results.clone(), None)
                .await
                .map_err(|e| {
                    tracing::error!("CRITICAL: Database Insert Error in calculateROI: {}", e);
                    RpcError::Database(e.to_string())
                })?;

            // 4. Serialization
            let response = calculation
                .into_response()
                .map_err(|e| {
                    tracing::error!("CRITICAL: Serialization Error in calculateROI: {}", e);
                    RpcError::Serialization(e.to_string())
                })?;

            Ok(ROICalculationWithResults {
                calculation: response,
                results,
            })
        })
    })
}
