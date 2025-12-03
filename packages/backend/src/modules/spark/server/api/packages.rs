use actix_web::{web, HttpResponse, HttpRequest};
use sqlx::PgPool;
use serde::{Deserialize, Serialize};

use crate::core::auth::verify_token;
use crate::modules::spark::server::domain::{
    SparkPackage, CreatePackageRequest, CreateVersionRequest, SparkPackageVersion
};

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    q: Option<String>,
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct InstallRequest {
    package_name: String,
    version: Option<String>, // if None, install latest
}

#[derive(Debug, Serialize)]
pub struct InstallResponse {
    success: bool,
    message: String,
    package: Option<SparkPackage>,
    version: Option<SparkPackageVersion>,
}

// GET /api/spark/packages - List all public packages
pub async fn list_packages(
    pool: web::Data<PgPool>,
    query: web::Query<SearchQuery>,
) -> HttpResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.offset.unwrap_or(0);

    match SparkPackage::list_public(&pool, limit, offset).await {
        Ok(packages) => HttpResponse::Ok().json(packages),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch packages: {}", e)
        })),
    }
}

// GET /api/spark/packages/search?q=query - Search packages
pub async fn search_packages(
    pool: web::Data<PgPool>,
    query: web::Query<SearchQuery>,
) -> HttpResponse {
    let search_query = match &query.q {
        Some(q) if !q.is_empty() => q,
        _ => {
            return HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Search query 'q' is required"
            }));
        }
    };

    let limit = query.limit.unwrap_or(20).min(100);

    match SparkPackage::search(&pool, search_query, limit).await {
        Ok(packages) => HttpResponse::Ok().json(packages),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Search failed: {}", e)
        })),
    }
}

// GET /api/spark/packages/:name - Get package info
pub async fn get_package(
    pool: web::Data<PgPool>,
    name: web::Path<String>,
) -> HttpResponse {
    match SparkPackage::find_by_name(&pool, &name).await {
        Ok(Some(package)) => {
            // Also fetch versions
            match SparkPackageVersion::list_by_package(&pool, package.id).await {
                Ok(versions) => HttpResponse::Ok().json(serde_json::json!({
                    "package": package,
                    "versions": versions
                })),
                Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": format!("Failed to fetch versions: {}", e)
                })),
            }
        }
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Package not found"
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to fetch package: {}", e)
        })),
    }
}

// POST /api/spark/packages - Create new package
pub async fn create_package(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    body: web::Json<CreatePackageRequest>,
) -> HttpResponse {
    // Verify JWT token
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Check if package name already exists
    match SparkPackage::find_by_name(&pool, &body.name).await {
        Ok(Some(_)) => {
            return HttpResponse::Conflict().json(serde_json::json!({
                "error": "Package with this name already exists"
            }));
        }
        Ok(None) => {}
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to check package: {}", e)
            }));
        }
    }

    match SparkPackage::create(&pool, user_id, body.into_inner()).await {
        Ok(package) => HttpResponse::Created().json(package),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to create package: {}", e)
        })),
    }
}

// POST /api/spark/packages/:name/versions - Add new version
pub async fn create_version(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    name: web::Path<String>,
    body: web::Json<CreateVersionRequest>,
) -> HttpResponse {
    // Verify JWT token and check ownership
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Get package and verify ownership
    let package = match SparkPackage::find_by_name(&pool, &name).await {
        Ok(Some(pkg)) => {
            if pkg.author_id != user_id {
                return HttpResponse::Forbidden().json(serde_json::json!({
                    "error": "You don't have permission to add versions to this package"
                }));
            }
            pkg
        }
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

    match SparkPackageVersion::create(&pool, package.id, body.into_inner()).await {
        Ok(version) => HttpResponse::Created().json(version),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to create version: {}", e)
        })),
    }
}

// POST /api/spark/packages/install - Install package for user
pub async fn install_package(
    req: HttpRequest,
    pool: web::Data<PgPool>,
    body: web::Json<InstallRequest>,
) -> HttpResponse {
    let user_id = match verify_token(&req) {
        Ok(claims) => claims.user_id,
        Err(e) => {
            return HttpResponse::Unauthorized().json(serde_json::json!({
                "error": format!("Unauthorized: {}", e)
            }));
        }
    };

    // Find package
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

    // Get version (latest if not specified)
    let version = match SparkPackageVersion::find_latest(&pool, package.id).await {
        Ok(Some(v)) => v,
        Ok(None) => {
            return HttpResponse::NotFound().json(serde_json::json!({
                "error": "No stable version found for this package"
            }));
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "error": format!("Failed to fetch version: {}", e)
            }));
        }
    };

    // Record installation
    match sqlx::query!(
        r#"
        INSERT INTO spark_user_installations (user_id, package_id, package_version_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, package_id) DO UPDATE SET 
            package_version_id = $3,
            installed_at = CURRENT_TIMESTAMP
        "#,
        user_id,
        package.id,
        version.id
    )
    .execute(pool.as_ref())
    .await
    {
        Ok(_) => {
            // Increment download counter
            let _ = SparkPackage::increment_downloads(&pool, package.id).await;

            HttpResponse::Ok().json(InstallResponse {
                success: true,
                message: format!("Package '{}' version {} installed successfully", package.name, version.version),
                package: Some(package),
                version: Some(version),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": format!("Failed to record installation: {}", e)
        })),
    }
}
