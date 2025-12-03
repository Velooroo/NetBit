use actix_cors::Cors;
use actix_web::{middleware::Logger, web, App, HttpServer};
use env_logger;

// ============================================================================
// ИМПОРТЫ УТИЛИТ
// ============================================================================

mod core;
mod domain;
mod services;
mod transports;
mod utils;

use core::{
    config::load_config, config::print_config, config::validate_config, database::Database,
};

// ============================================================================
// ИМПОРТЫ МОДУЛЕЙ
// ============================================================================

mod modules;

// ============================================================================
// ОСНОВНАЯ ФУНКЦИЯ
// ============================================================================

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Инициализация логгера
    env_logger::init();

    // Загрузка конфигурации
    let config = load_config();

    // Валидация конфигурации
    if let Err(e) = validate_config(&config) {
        eprintln!("Configuration error: {}", e);
        std::process::exit(1);
    }

    // Вывод конфигурации
    print_config(&config);

    // Инициализация базы данных
    let database = match Database::new(&config.database_url).await {
        Ok(db) => {
            println!("Database connected successfully");
            db
        }
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            std::process::exit(1);
        }
    };

    // Выполнение миграций
    if let Err(e) = database.run_migrations().await {
        eprintln!("Failed to run migrations: {}", e);
        std::process::exit(1);
    }
    println!("Database migrations completed successfully");

    // Тест подключения к базе данных
    if let Err(e) = database.test_connection().await {
        eprintln!("Database connection test failed: {}", e);
        std::process::exit(1);
    }

    let bind_address = format!("{}:{}", config.host, config.port);
    println!("Starting server at http://{}", bind_address);

    // Запуск HTTP сервера
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(database.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .configure(configure_routes)
            .configure(modules::spark::configure_routes)
    })
    .bind(&bind_address)?
    .run()
    .await
}

// ============================================================================
// КОНФИГУРАЦИЯ МАРШРУТОВ
// ============================================================================

fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg
        // API маршруты для аутентификации
        .service(
            web::scope("/api/auth")
                .route("/login", web::post().to(transports::http::users::login))
                .route(
                    "/register",
                    web::post().to(transports::http::users::register),
                )
                .route(
                    "/refresh",
                    web::post().to(transports::http::users::refresh_token),
                )
                .route("/logout", web::post().to(transports::http::users::logout)),
        )
        // API маршруты для пользователей
        .service(web::scope("/api/user").route(
            "/profile",
            web::get().to(transports::http::users::user_profile),
        ))
        // API маршруты для проектов
        .service(
            web::scope("/api/projects")
                .route("", web::get().to(transports::http::projects::list_projects))
                .route(
                    "/public",
                    web::get().to(transports::http::projects::list_public_projects),
                )
                .route(
                    "/create",
                    web::post().to(transports::http::projects::create_project),
                )
                .route(
                    "/{user}/{project}",
                    web::get().to(transports::http::projects::get_project),
                )
                .route(
                    "/{user}/{project}/config",
                    web::get().to(transports::http::projects::get_project_config),
                )
                .route(
                    "/{user}/{project}/config",
                    web::put().to(transports::http::projects::update_project_config),
                )
                .route(
                    "/{user}/{project}/repos/create",
                    web::post().to(transports::http::projects::create_repo_in_project),
                )
                .route(
                    "/{user}/{project}/{repo}",
                    web::get().to(transports::http::repositories::get_repo_in_project),
                )
                .route(
                    "/{user}/{project}/{repo}/contents",
                    web::get().to(transports::http::repositories::get_repo_contents),
                )
                .route(
                    "/{user}/{project}/{repo}/commits",
                    web::get().to(transports::http::repositories::get_repo_commits),
                )
                .route(
                    "/{user}/{project}/{repo}/branches",
                    web::get().to(transports::http::repositories::get_repo_branches),
                )
                .route(
                    "/{user}/{project}/{repo}/readme",
                    web::get().to(transports::http::repositories::get_repo_readme),
                ),
        )
        // API маршруты для уведомлений
        .service(
            web::scope("/api/notifications")
                .route(
                    "",
                    web::get().to(transports::http::notifications::get_notifications),
                )
                .route(
                    "",
                    web::post().to(transports::http::notifications::create_notification),
                )
                .route(
                    "/{id}",
                    web::put().to(transports::http::notifications::update_notification),
                ),
        )
        // Git Smart HTTP Protocol
        .service(
            web::scope("/git")
                .route(
                    "/{user_name}/{repo_name}/info/refs",
                    web::get().to(transports::http::git::handle_info_refs),
                )
                .route(
                    "/{user_name}/{repo_name}/git-upload-pack",
                    web::post().to(transports::http::git::handle_upload_pack),
                )
                .route(
                    "/{user_name}/{repo_name}/git-receive-pack",
                    web::post().to(transports::http::git::handle_receive_pack),
                ),
        );
    // Статические файлы (если нужны)
    // .service(fs::Files::new("/static", "./static").show_files_listing());
}
