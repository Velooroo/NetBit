use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_files as fs;
use actix_cors::Cors;
use env_logger;

// ============================================================================
// ИМПОРТЫ МОДУЛЕЙ
// ============================================================================

mod core;
mod domain;
mod api;
mod utils;
mod storage;
mod messaging;

use core::{database::Database, config::load_config, config::validate_config, config::print_config};
use storage::cache::MessageCache;
use messaging::{MessagingServer, MessagingConfig};
use std::sync::Arc;

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
    let database = match Database::new(&config.database_url) {
        Ok(db) => {
            println!("Database connected successfully");
            db
        },
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            std::process::exit(1);
        }
    };

    // Тест подключения к базе данных
    if let Err(e) = database.test_connection() {
        eprintln!("Database connection test failed: {}", e);
        std::process::exit(1);
    }

    // Выполнение миграций
    if let Err(e) = database.migrate() {
        eprintln!("Database migration failed: {}", e);
        std::process::exit(1);
    }

    // Инициализация кеша
    println!("Initializing message cache...");
    let cache = Arc::new(MessageCache::new());
    
    // Загрузка данных из БД в кеш
    if let Err(e) = cache.load_from_db(database.connection.clone()) {
        eprintln!("Failed to load cache from database: {}", e);
        std::process::exit(1);
    }
    println!("Cache loaded successfully");

    // Запуск messaging сервера (TCP/UDP)
    let messaging_config = MessagingConfig::default();
    let messaging_server = MessagingServer::new(
        messaging_config,
        cache.clone(),
        Arc::new(database.clone()),
    );
    
    // Запускаем messaging сервер в фоновой задаче
    tokio::spawn(async move {
        if let Err(e) = messaging_server.start().await {
            eprintln!("Messaging server error: {}", e);
        }
    });

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
            .app_data(web::Data::new(cache.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            .configure(configure_routes)
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
                .route("/login", web::post().to(api::user::login))
                .route("/register", web::post().to(api::user::register))
        )
        // API маршруты для пользователей
        .service(
            web::scope("/api/user")
                .route("/profile", web::get().to(api::user::user_profile))
        )
        // API маршруты для проектов
        .service(
            web::scope("/api/projects")
                .route("", web::get().to(api::project::list_projects))
                .route("/public", web::get().to(api::project::list_public_projects))
                .route("/create", web::post().to(api::project::create_project))
                .route("/{user}/{project}", web::get().to(api::project::get_project))
                .route("/{user}/{project}/config", web::get().to(api::project::get_project_config))
                .route("/{user}/{project}/config", web::put().to(api::project::update_project_config))
                .route("/{user}/{project}/repos/create", web::post().to(api::project::create_repo_in_project))
                .route("/{user}/{project}/{repo}", web::get().to(api::repo::get_repo_in_project))
                .route("/{user}/{project}/{repo}/contents", web::get().to(api::repo::get_repo_contents))
                .route("/{user}/{project}/{repo}/commits", web::get().to(api::repo::get_repo_commits))
                .route("/{user}/{project}/{repo}/branches", web::get().to(api::repo::get_repo_branches))
                .route("/{user}/{project}/{repo}/readme", web::get().to(api::repo::get_repo_readme))
        )
        // API маршруты для уведомлений
        .service(
            web::scope("/api/notifications")
                .route("", web::get().to(api::notification::get_notifications))
                .route("", web::post().to(api::notification::create_notification))
                .route("/{id}", web::put().to(api::notification::update_notification))
                .route("/{id}", web::delete().to(api::notification::delete_notification))
        )
        // API маршруты для чатов
        .service(
            web::scope("/api/chats")
                .route("", web::get().to(api::chat::get_chats))
                .route("", web::post().to(api::chat::create_chat))
                .route("/{id}", web::get().to(api::chat::get_chat))
                .route("/{id}/messages", web::get().to(api::chat::get_messages))
                .route("/{id}/messages", web::post().to(api::chat::send_message))
        )
        // API маршруты для репозиториев (устаревшие)
        .service(
            web::scope("/api/repos")
                .route("", web::get().to(api::repo::list_repos))
                .route("/create", web::post().to(api::repo::create_repo))
                .route("/{repo_name}", web::get().to(api::repo::get_repo))
        )
        // Git Smart HTTP Protocol
        .service(
            web::scope("/git")
                .route("/{user_name}/{repo_name}/info/refs", web::get().to(api::git::handle_info_refs))
                .route("/{user_name}/{repo_name}/git-upload-pack", web::post().to(api::git::handle_upload_pack))
                .route("/{user_name}/{repo_name}/git-receive-pack", web::post().to(api::git::handle_receive_pack))
        );
        // Статические файлы (если нужны)
        // .service(fs::Files::new("/static", "./static").show_files_listing());
}