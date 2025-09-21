//! Документация для конфигурации NetBit приложения
//! 
//! Этот модуль содержит документацию для системы конфигурации NetBit,
//! включая все настройки сервера, базы данных и внешних сервисов.
//! Конфигурация загружается из переменных окружения и .env файлов.

// Импорты из реальной реализации
pub use crate::core::config::{load_config, validate_config, print_config, dev_config, test_config};
pub use crate::core::types::ServerConfig;

/// Главная конфигурация NetBit сервера
///
/// Центральная структура, объединяющая все настройки NetBit сервера.
/// Загружается из переменных окружения при запуске приложения.
///
/// # Компоненты конфигурации
/// - `host` - IP адрес для привязки HTTP сервера
/// - `port` - Порт для HTTP сервера
/// - `database_url` - Путь к файлу базы данных SQLite
/// - `jwt_secret` - Секретный ключ для подписи JWT токенов
/// - `repositories_path` - Путь к папке с Git репозиториями
///
/// # Загрузка конфигурации
/// ```rust,no_run
/// use netbit_backend::core::config_doc::{load_config, validate_config};
/// 
/// // Автоматическая загрузка из переменных окружения
/// let config = load_config();
/// 
/// // Валидация конфигурации
/// if let Err(e) = validate_config(&config) {
///     eprintln!("Configuration error: {}", e);
///     std::process::exit(1);
/// }
/// 
/// println!("Server will run on {}:{}", config.host, config.port);
/// println!("Database: {}", config.database_url);
/// ```
///
/// # Переменные окружения
/// ```bash
/// # Сетевые настройки
/// HOST=0.0.0.0                    # IP адрес (по умолчанию: 0.0.0.0)
/// PORT=8000                       # Порт сервера (по умолчанию: 8000)
/// 
/// # База данных
/// DATABASE_URL=gitea.db           # Путь к SQLite файлу (по умолчанию: gitea.db)
/// 
/// # Безопасность (ОБЯЗАТЕЛЬНО в продакшене!)
/// JWT_SECRET=your-secret-key      # Секретный ключ для JWT
/// 
/// # Git репозитории
/// REPOSITORIES_PATH=repositories  # Папка с репозиториями (по умолчанию: repositories)
/// ```
///
/// # Безопасность
/// ⚠️ **ВАЖНО**: В продакшене обязательно установите `JWT_SECRET` 
/// на длинную случайную строку. Никогда не используйте значение по умолчанию!
///
/// # Валидация
/// При загрузке конфигурации происходит автоматическая валидация:
/// - Проверка наличия обязательных параметров
/// - Валидация формата портов (должны быть > 0)
/// - Проверка непустых строк для критических параметров
/// - Предупреждение о использовании дефолтного JWT секрета
///
/// # Примеры использования
/// 
/// ## Разработка
/// ```rust,no_run
/// use netbit_backend::core::config_doc::dev_config;
/// 
/// let config = dev_config(); // Предустановленные настройки для разработки
/// ```
/// 
/// ## Тестирование
/// ```rust,no_run
/// use netbit_backend::core::config_doc::test_config;
/// 
/// let config = test_config(); // Конфигурация для тестов (БД в памяти)
/// ```
///
/// ## Продакшен
/// ```rust,no_run
/// use netbit_backend::core::config_doc::{load_config, validate_config, print_config};
/// 
/// let config = load_config();
/// validate_config(&config)?;
/// print_config(&config); // Вывод конфигурации (без секретов)
/// ```
pub use ServerConfig as DocumentedServerConfig;

/// Загрузка конфигурации из переменных окружения
///
/// Основная функция для инициализации конфигурации NetBit сервера.
/// Читает переменные окружения и возвращает заполненную структуру конфигурации.
///
/// # Поведение
/// - Если переменная окружения не найдена, используется значение по умолчанию
/// - Для порта выполняется парсинг в число с fallback на дефолт
/// - Все строковые параметры принимаются как есть
///
/// # Возвращает
/// [`ServerConfig`] - Полностью заполненная конфигурация
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::config_doc::load_config;
/// 
/// // Загрузка с дефолтными значениями
/// let config = load_config();
/// assert_eq!(config.host, "0.0.0.0");
/// assert_eq!(config.port, 8000);
/// 
/// // С переменными окружения
/// std::env::set_var("HOST", "127.0.0.1");
/// std::env::set_var("PORT", "3000");
/// let config = load_config();
/// assert_eq!(config.host, "127.0.0.1");
/// assert_eq!(config.port, 3000);
/// ```
pub use load_config as documented_load_config;

/// Валидация параметров конфигурации
///
/// Проверяет корректность всех параметров конфигурации перед запуском сервера.
/// Обязательно вызывайте эту функцию после загрузки конфигурации.
///
/// # Проверки
/// - `host` не должен быть пустой строкой
/// - `port` должен быть больше 0
/// - `database_url` не должен быть пустым
/// - `jwt_secret` не должен быть пустым
/// - Предупреждение при использовании дефолтного JWT секрета
///
/// # Аргументы
/// * `config` - Ссылка на конфигурацию для валидации
///
/// # Возвращает
/// * `Ok(())` - Если конфигурация валидна
/// * `Err(String)` - Сообщение об ошибке валидации
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::config_doc::{load_config, validate_config};
/// 
/// let config = load_config();
/// 
/// match validate_config(&config) {
///     Ok(()) => println!("✅ Конфигурация валидна"),
///     Err(e) => {
///         eprintln!("❌ Ошибка конфигурации: {}", e);
///         std::process::exit(1);
///     }
/// }
/// ```
pub use validate_config as documented_validate_config;

/// Вывод текущей конфигурации (без секретных данных)
///
/// Выводит в консоль все параметры конфигурации кроме секретных полей.
/// Полезно для отладки и логирования при запуске сервера.
///
/// # Безопасность
/// JWT секрет всегда выводится как `[HIDDEN]` для предотвращения утечки.
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::config_doc::{load_config, print_config};
/// 
/// let config = load_config();
/// print_config(&config);
/// // Выведет:
/// // Server Configuration:
/// //   Host: 0.0.0.0
/// //   Port: 8000
/// //   Database URL: gitea.db
/// //   JWT Secret: [HIDDEN]
/// //   Repositories Path: repositories
/// ```
pub use print_config as documented_print_config;

/// Предустановленная конфигурация для разработки
///
/// Возвращает конфигурацию с безопасными настройками для локальной разработки.
/// Использует localhost и стандартные порты.
///
/// # Параметры разработки
/// - Host: `127.0.0.1` (только локальные подключения)
/// - Port: `8000`
/// - Database: `gitea.db` (локальный файл)
/// - JWT Secret: `dev-secret-key-not-for-production`
/// - Repositories: `repositories`
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::config_doc::dev_config;
/// 
/// let config = dev_config();
/// assert_eq!(config.host, "127.0.0.1");
/// // Готово для разработки!
/// ```
pub use dev_config as documented_dev_config;

/// Предустановленная конфигурация для тестирования
///
/// Возвращает конфигурацию оптимизированную для автоматических тестов.
/// Использует базу данных в памяти и случайные порты.
///
/// # Параметры тестирования
/// - Host: `127.0.0.1`
/// - Port: `0` (случайный свободный порт)
/// - Database: `:memory:` (SQLite в памяти)
/// - JWT Secret: `test-secret-key`
/// - Repositories: `test_repositories`
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::config_doc::test_config;
/// 
/// let config = test_config();
/// assert_eq!(config.database_url, ":memory:");
/// // База данных будет создана в памяти для каждого теста
/// ```
pub use test_config as documented_test_config;