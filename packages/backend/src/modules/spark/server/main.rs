use actix_web::web;
use log::info;

use crate::modules::spark::server::api;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // Health check
        .service(web::scope("/api/spark")
            .route("/health", web::get().to(api::health))
        )
        // Package management routes
        .service(web::scope("/api/spark/packages")
            .route("", web::get().to(api::packages::list_packages))
            .route("", web::post().to(api::packages::create_package))
            .route("/search", web::get().to(api::packages::search_packages))
            .route("/install", web::post().to(api::packages::install_package))
            .route("/{name}", web::get().to(api::packages::get_package))
            .route("/{name}/versions", web::post().to(api::packages::create_version))
        )
        // Remote unit management routes
        .service(web::scope("/api/spark/units")
            .route("", web::get().to(api::units::list_units))
            .route("", web::post().to(api::units::create_unit))
            .route("/{unit_id}", web::get().to(api::units::get_unit))
            .route("/{unit_id}", web::delete().to(api::units::delete_unit))
            .route("/{unit_id}/status", web::put().to(api::units::update_unit_status))
            .route("/{unit_id}/heartbeat", web::post().to(api::units::unit_heartbeat))
            .route("/{unit_id}/telemetry", web::post().to(api::telemetry::submit_telemetry))
            .route("/{unit_id}/telemetry", web::get().to(api::telemetry::query_telemetry))
            .route("/{unit_id}/logs", web::get().to(api::telemetry::get_logs))
            .route("/{unit_id}/metrics", web::get().to(api::telemetry::get_metrics))
        );
}
