use actix_web::{web, HttpResponse, HttpRequest};
use sqlx::PgPool;
use serde::Deserialize;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::core::auth::verify_token;
use crate::modules::spark::server::domain::{
    SparkRemoteUnit, SparkUnitTelemetry,
    CreateTelemetryRequest, TelemetryQuery as DomainTelemetryQuery
};

#[derive(Debug, Deserialize)]
pub struct TelemetryQueryParams {
    telemetry_type: Option<String>,
    level: Option<String>,
    from: Option<DateTime<Utc>>,
    to: Option<DateTime<Utc>>,
    limit: Option<i64>,
}

// POST /api/spark/units/:unit_id/telemetry - Submit telemetry data
pub async fn submit_telemetry(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
    body: web::Json<CreateTelemetryRequest>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify unit ownership
    match SparkRemoteUnit::find_by_uuid(&pool, *unit_id).await {
        Ok(Some(unit)) => {
            if unit.owner_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Unit not found"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch unit: {}", e)
            }));
        }
    }

    match SparkUnitTelemetry::create(&pool, *unit_id, body.into_inner()).await {
        Ok(telemetry) => HttpResponse::Created().json(telemetry),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to submit telemetry: {}", e)
        })),
    }
}

// GET /api/spark/units/:unit_id/telemetry - Query telemetry data
pub async fn query_telemetry(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
    params: web::Query<TelemetryQueryParams>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify unit ownership
    match SparkRemoteUnit::find_by_uuid(&pool, *unit_id).await {
        Ok(Some(unit)) => {
            if unit.owner_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Unit not found"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch unit: {}", e)
            }));
        }
    }

    let telemetry_type = params.telemetry_type.as_ref().and_then(|t| {
        use crate::modules::spark::server::domain::TelemetryType;
        match t.as_str() {
            "log" => Some(TelemetryType::Log),
            "metric" => Some(TelemetryType::Metric),
            "event" => Some(TelemetryType::Event),
            "error" => Some(TelemetryType::Error),
            _ => None,
        }
    });

    let level = params.level.as_ref().and_then(|l| {
        use crate::modules::spark::server::domain::LogLevel;
        match l.as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            "fatal" => Some(LogLevel::Fatal),
            _ => None,
        }
    });

    let query = DomainTelemetryQuery {
        unit_id: *unit_id,
        telemetry_type,
        level,
        from: params.from,
        to: params.to,
        limit: params.limit,
    };

    match SparkUnitTelemetry::query(&pool, query).await {
        Ok(telemetry) => HttpResponse::Ok().json(telemetry),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to query telemetry: {}", e)
        })),
    }
}

// GET /api/spark/units/:unit_id/logs - Get latest logs
pub async fn get_logs(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
    params: web::Query<TelemetryQueryParams>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify unit ownership
    match SparkRemoteUnit::find_by_uuid(&pool, *unit_id).await {
        Ok(Some(unit)) => {
            if unit.owner_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Unit not found"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch unit: {}", e)
            }));
        }
    }

    let limit = params.limit.unwrap_or(100).min(1000);

    match SparkUnitTelemetry::get_latest_logs(&pool, *unit_id, limit).await {
        Ok(logs) => HttpResponse::Ok().json(logs),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch logs: {}", e)
        })),
    }
}

// GET /api/spark/units/:unit_id/metrics - Get metrics in time range
pub async fn get_metrics(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
    params: web::Query<TelemetryQueryParams>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify unit ownership
    match SparkRemoteUnit::find_by_uuid(&pool, *unit_id).await {
        Ok(Some(unit)) => {
            if unit.owner_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
        }
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Unit not found"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch unit: {}", e)
            }));
        }
    }

    let from = params.from.unwrap_or_else(|| Utc::now() - chrono::Duration::hours(24));
    let to = params.to.unwrap_or_else(|| Utc::now());

    match SparkUnitTelemetry::get_metrics(&pool, *unit_id, from, to).await {
        Ok(metrics) => HttpResponse::Ok().json(metrics),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch metrics: {}", e)
        })),
    }
}
