use actix_web::{HttpResponse};

struct Package {
    id: i32,
    name: String,
    owner_id: i64,
}

pub async fn health() -> HttpResponse {
    HttpResponse::Ok().body("Health OK!")
}

pub async fn package_check() -> HttpResponse {
    HttpResponse::Ok().body("Package check OK!")
} 
