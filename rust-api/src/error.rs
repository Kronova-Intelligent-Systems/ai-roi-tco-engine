use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use serde_json::json;
use specta::Type;
use thiserror::Error;

// =============================================================================
// rspc 0.4 Typed Error
// =============================================================================

/// Application-level error type that implements `rspc::Error` for typesafe
/// error propagation across the RPC boundary.
///
/// rspc 0.4 requires a custom error enum that:
///   1. Derives `Serialize` + `specta::Type` for TypeScript export
///   2. Implements `rspc::Error` with `into_procedure_error`
#[derive(Debug, Error, Serialize, Type)]
#[serde(tag = "type", content = "error")]
pub enum RpcError {
    #[error("database error: {0}")]
    Database(String),

    #[error("validation error: {0}")]
    Validation(String),

    #[error("not found: {0}")]
    NotFound(String),

    #[error("unauthorized")]
    Unauthorized(String),

    #[error("internal error: {0}")]
    Internal(String),

    #[error("serialization error: {0}")]
    Serialization(String),

    // Add this missing variant:
    #[error("external API error: {0}")]
    ExternalApi(String),
}

impl rspc::Error for RpcError {
    fn into_procedure_error(self) -> rspc::ProcedureError {
        rspc::ResolverError::new(self, None::<std::io::Error>).into()
    }
}

/// Convenience conversions so service-layer errors map cleanly into `RpcError`.
impl From<sqlx::Error> for RpcError {
    fn from(err: sqlx::Error) -> Self {
        RpcError::Database(err.to_string())
    }
}

impl From<serde_json::Error> for RpcError {
    fn from(err: serde_json::Error) -> Self {
        RpcError::Serialization(err.to_string())
    }
}

impl From<anyhow::Error> for RpcError {
    fn from(err: anyhow::Error) -> Self {
        RpcError::Internal(err.to_string())
    }
}

impl From<validator::ValidationErrors> for RpcError {
    fn from(err: validator::ValidationErrors) -> Self {
        RpcError::Validation(err.to_string())
    }
}

// =============================================================================
// Axum-level API Error (for non-rspc routes like /health)
// =============================================================================

/// Lightweight error type for direct Axum route handlers (health checks, etc.).
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Internal server error")]
    Internal(#[from] anyhow::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            ApiError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, self.to_string()),
            ApiError::Validation(msg) => (StatusCode::BAD_REQUEST, msg),
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, self.to_string()),
            ApiError::Internal(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
            ApiError::Serialization(_) => (StatusCode::BAD_REQUEST, self.to_string()),
        };

        let body = Json(json!({
            "error": message,
        }));

        (status, body).into_response()
    }
}
