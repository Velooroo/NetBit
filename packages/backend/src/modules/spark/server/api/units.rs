use actix_web::{web, HttpResponse, HttpRequest};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::core::auth::verify_token;
use crate::modules::spark::server::domain::{
    SparkRemoteUnit, SparkPackage, SparkPackageVersion,
    CreateUnitRequest, UpdateUnitStatusRequest
};

#[derive(Debug, Deserialize)]
pub struct CreateUnitBody {
    pub name: String,
    pub package_name: String,
    pub device_name: Option<String>,
    pub device_os: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct UnitResponse {
    pub success: bool,
    pub message: String,
    pub unit: Option<SparkRemoteUnit>,
}

// POST /api/spark/units - Create new remote unit
pub async fn create_unit(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    body: web::Json<CreateUnitBody>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Check if user has installed the package
    let package = match SparkPackage::find_by_name(&pool, &body.package_name).await {
        Ok(Some(pkg)) => pkg,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "Package not found"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch package: {}", e)
            }));
        }
    };

    // Get installed version for user
    let installation = match sqlx::query!(
        r#"
        SELECT package_version_id FROM spark_user_installations
        WHERE user_id = $1 AND package_id = $2
        "#,
        user_id,
        package.id
    )
    .fetch_optional(pool.as_ref())
    .await
    {
        Ok(Some(inst)) => inst,
        Ok(None) => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Package not installed. Please install it first using 'spark install'"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to check installation: {}", e)
            }));
        }
    };

    let create_req = CreateUnitRequest {
        name: body.name.clone(),
        package_name: body.package_name.clone(),
        device_name: body.device_name.clone(),
        device_os: body.device_os.clone(),
    };

    match SparkRemoteUnit::create(&pool, user_id, package.id, installation.package_version_id, create_req).await {
        Ok(unit) => HttpResponse::Created().json(UnitResponse {
            success: true,
            message: format!("Unit '{}' created successfully", unit.name),
            unit: Some(unit),
        }),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to create unit: {}", e)
        })),
    }
}

// GET /api/spark/units - List user's units
pub async fn list_units(
    req: HttpRequest,
    pool: web::Data<PgPool>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    match SparkRemoteUnit::list_by_owner(&pool, user_id).await {
        Ok(units) => HttpResponse::Ok().json(units),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch units: {}", e)
        })),
    }
}

// GET /api/spark/units/:unit_id - Get unit details
pub async fn get_unit(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    match SparkRemoteUnit::find_by_uuid(&pool, *unit_id).await {
        Ok(Some(unit)) => {
            if unit.owner_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "Access denied"
                }));
            }
            HttpResponse::Ok().json(unit)
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Unit not found"
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch unit: {}", e)
        })),
    }
}

// PUT /api/spark/units/:unit_id/status - Update unit status
pub async fn update_unit_status(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
    body: web::Json<UpdateUnitStatusRequest>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify ownership
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

    match SparkRemoteUnit::update_status(&pool, *unit_id, body.into_inner()).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "Unit status updated"
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to update status: {}", e)
        })),
    }
}

// POST /api/spark/units/:unit_id/heartbeat - Send heartbeat
pub async fn unit_heartbeat(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Verify ownership
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

    match SparkRemoteUnit::update_heartbeat(&pool, *unit_id).await {
        Ok(_) => HttpResponse::Ok().json(serde_json::json!({
            "success": true
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to update heartbeat: {}", e)
        })),
    }
}

// DELETE /api/spark/units/:unit_id - Delete unit
pub async fn delete_unit(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    unit_id: web::Path<Uuid>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    match SparkRemoteUnit::delete(&pool, *unit_id, user_id).await {
        Ok(true) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "message": "Unit deleted successfully"
        })),
        Ok(false) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Unit not found or access denied"
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to delete unit: {}", e)
        })),
    }
}
