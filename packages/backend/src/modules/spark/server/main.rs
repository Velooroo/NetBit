use log::{log, info, error};
use actix_web::{web};

use crate::spark::server::api;

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // API маршруты для аутентификации
        .service(
            web::scope("/api/spark")
                .route("/health", web::get().to(api::health))
        )
        // API маршруты для проверки пакетов
        .service(
            web::scope("/api/spark/package")
                .route("", web::get().to(api::package_check))
        );
}
