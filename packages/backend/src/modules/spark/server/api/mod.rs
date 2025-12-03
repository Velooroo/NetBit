pub mod packages;
pub mod units;
pub mod telemetry;

use actix_web::HttpResponse;

pub async fn health() -> HttpResponse {
    HttpResponse::Ok().body("Spark API is healthy!")
}
