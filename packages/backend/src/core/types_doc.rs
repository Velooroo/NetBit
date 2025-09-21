//! Документация для типов данных NetBit
//! 
//! Этот модуль содержит документацию для всех основных типов данных,
//! структур API ответов, ошибок и конфигурации системы.

// Импорты из реальной реализации
pub use crate::core::types::{
    ServerConfig, ApiResponse, Pagination, Sort, SortDirection,
    ErrorType, AppError,
    success_response, success_response_with_message, 
    error_response, error_response_with_details
};

/// Конфигурация NetBit сервера
///
/// Основная структура конфигурации, содержащая все настройки необходимые
/// для работы NetBit сервера. Создается из переменных окружения.
///
/// # Поля конфигурации
/// 
/// ## Сетевые настройки
/// - `host: String` - IP адрес для привязки сервера
///   - `"0.0.0.0"` - все интерфейсы (по умолчанию)
///   - `"127.0.0.1"` - только localhost
///   - `"192.168.1.100"` - конкретный IP
///
/// - `port: u16` - TCP порт для HTTP сервера
///   - Диапазон: 1-65535
///   - По умолчанию: 8000
///   - Рекомендуемые: 8000, 3000, 8080
///
/// ## База данных
/// - `database_url: String` - Путь к SQLite базе данных
///   - Файл: `"./data/netbit.db"`
///   - Память: `":memory:"` (только для тестов)
///   - Абсолютный путь: `"/var/lib/netbit/db.sqlite"`
///
/// ## Безопасность
/// - `jwt_secret: String` - Секретный ключ для JWT токенов
///   - ⚠️ ОБЯЗАТЕЛЬНО изменить в продакшене!
///   - Минимум 32 символа
///   - Используйте криптографически стойкие генераторы
///
/// ## Git репозитории
/// - `repositories_path: String` - Папка хранения Git репозиториев
///   - Относительный путь: `"repositories"`
///   - Абсолютный путь: `"/var/lib/netbit/repos"`
///   - Должна быть доступна для чтения/записи
///
/// # Примеры создания
/// ```rust,no_run
/// use netbit_backend::core::types_doc::ServerConfig;
/// 
/// // Ручное создание (не рекомендуется)
/// let config = ServerConfig {
///     host: "127.0.0.1".to_string(),
///     port: 8000,
///     database_url: "gitea.db".to_string(),
///     jwt_secret: "super-secret-key".to_string(),
///     repositories_path: "repositories".to_string(),
/// };
/// 
/// // Рекомендуемый способ - через load_config()
/// use netbit_backend::core::config_doc::load_config;
/// let config = load_config();
/// ```
///
/// # Значения по умолчанию
/// ```rust,no_run
/// use netbit_backend::core::types_doc::ServerConfig;
/// 
/// let default_config = ServerConfig::default();
/// assert_eq!(default_config.host, "127.0.0.1");
/// assert_eq!(default_config.port, 8000);
/// assert_eq!(default_config.database_url, "gitea.db");
/// ```
pub use ServerConfig as DocumentedServerConfig;

/// Стандартная структура ответа API
///
/// Универсальная структура для всех HTTP ответов NetBit API.
/// Обеспечивает единообразный формат ответов для клиентских приложений.
///
/// # Поля структуры
/// - `success: bool` - Флаг успешности операции
///   - `true` - операция выполнена успешно
///   - `false` - произошла ошибка
///
/// - `message: Option<String>` - Дополнительное сообщение
///   - Успех: описание выполненного действия
///   - Ошибка: описание проблемы
///
/// - `data: Option<T>` - Данные ответа (generic тип)
///   - Присутствуют только при `success = true`
///   - Может быть любым сериализуемым типом
///
/// # Типы ответов
/// 
/// ## Успешный ответ с данными
/// ```json
/// {
///   "success": true,
///   "data": {
///     "id": 1,
///     "username": "john_doe"
///   }
/// }
/// ```
///
/// ## Успешный ответ с сообщением
/// ```json
/// {
///   "success": true,
///   "message": "User created successfully",
///   "data": {
///     "id": 42,
///     "username": "new_user"
///   }
/// }
/// ```
///
/// ## Ответ с ошибкой
/// ```json
/// {
///   "success": false,
///   "message": "User not found"
/// }
/// ```
///
/// # Использование в обработчиках API
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{ApiResponse, success_response, error_response};
/// use actix_web::{web, HttpResponse, Result};
/// 
/// async fn get_user(user_id: web::Path<i32>) -> Result<HttpResponse> {
///     match find_user(*user_id).await {
///         Some(user) => Ok(HttpResponse::Ok().json(success_response(user))),
///         None => Ok(HttpResponse::NotFound().json(error_response("User not found")))
///     }
/// }
/// ```
pub use ApiResponse as DocumentedApiResponse;

/// Структура для пагинации списков
///
/// Используется для разбивки больших списков данных на страницы.
/// Поддерживает стандартные параметры пагинации и метаинформацию.
///
/// # Поля пагинации
/// - `page: u32` - Номер текущей страницы (начиная с 1)
/// - `per_page: u32` - Количество элементов на странице
/// - `total: u32` - Общее количество элементов
/// - `total_pages: u32` - Общее количество страниц
///
/// # Примеры использования
/// ```rust,no_run
/// use netbit_backend::core::types_doc::Pagination;
/// 
/// // Создание пагинации для 150 элементов по 20 на странице
/// let pagination = Pagination {
///     page: 1,
///     per_page: 20,
///     total: 150,
///     total_pages: 8, // ceil(150 / 20)
/// };
/// 
/// // В URL параметрах: ?page=1&per_page=20
/// ```
///
/// # В API ответах
/// ```json
/// {
///   "success": true,
///   "data": {
///     "items": [...],
///     "pagination": {
///       "page": 1,
///       "per_page": 20,
///       "total": 150,
///       "total_pages": 8
///     }
///   }
/// }
/// ```
pub use Pagination as DocumentedPagination;

/// Структура для сортировки
///
/// Определяет параметры сортировки для списков данных.
/// Поддерживает сортировку по любому полю в двух направлениях.
///
/// # Поля сортировки
/// - `field: String` - Имя поля для сортировки
///   - `"created_at"` - по дате создания
///   - `"name"` - по имени
///   - `"id"` - по идентификатору
///
/// - `direction: SortDirection` - Направление сортировки
///   - `SortDirection::Asc` - по возрастанию
///   - `SortDirection::Desc` - по убыванию
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{Sort, SortDirection};
/// 
/// // Сортировка по дате создания (новые сначала)
/// let sort = Sort {
///     field: "created_at".to_string(),
///     direction: SortDirection::Desc,
/// };
/// 
/// // Сортировка по имени (алфавитный порядок)
/// let sort = Sort {
///     field: "name".to_string(),
///     direction: SortDirection::Asc,
/// };
/// ```
///
/// # В URL параметрах
/// ```
/// ?sort_field=created_at&sort_direction=desc
/// ?sort_field=name&sort_direction=asc
/// ```
pub use Sort as DocumentedSort;

/// Направление сортировки
///
/// Перечисление для указания направления сортировки данных.
///
/// # Варианты
/// - `Asc` - По возрастанию (ascending)
///   - Числа: 1, 2, 3, 4...
///   - Буквы: A, B, C, D...
///   - Даты: старые → новые
///
/// - `Desc` - По убыванию (descending)
///   - Числа: 4, 3, 2, 1...
///   - Буквы: D, C, B, A...
///   - Даты: новые → старые
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::SortDirection;
/// 
/// let ascending = SortDirection::Asc;
/// let descending = SortDirection::Desc;
/// 
/// // В SQL запросах
/// match direction {
///     SortDirection::Asc => "ORDER BY field ASC",
///     SortDirection::Desc => "ORDER BY field DESC",
/// }
/// ```
pub use SortDirection as DocumentedSortDirection;

/// Типы ошибок в системе NetBit
///
/// Перечисление всех возможных типов ошибок для категоризации
/// и обработки различных ситуаций в приложении.
///
/// # Типы ошибок
/// 
/// ## `DatabaseError`
/// Ошибки работы с базой данных:
/// - Ошибки подключения
/// - Синтаксические ошибки SQL
/// - Нарушения ограничений (constraints)
/// - Проблемы с миграциями
///
/// ## `AuthenticationError`
/// Ошибки аутентификации:
/// - Неверные учетные данные
/// - Истекший токен
/// - Отсутствующий токен
/// - Неверный формат токена
///
/// ## `AuthorizationError`
/// Ошибки авторизации:
/// - Недостаточно прав доступа
/// - Попытка доступа к чужим ресурсам
/// - Заблокированный аккаунт
///
/// ## `ValidationError`
/// Ошибки валидации данных:
/// - Неверный формат email
/// - Слишком короткий пароль
/// - Обязательные поля не заполнены
/// - Неверный формат данных
///
/// ## `NotFoundError`
/// Ошибки отсутствия ресурсов:
/// - Пользователь не найден
/// - Проект не существует
/// - Файл не найден
/// - Эндпоинт не существует
///
/// ## `ConflictError`
/// Ошибки конфликтов:
/// - Пользователь уже существует
/// - Дублирование уникальных полей
/// - Конфликт версий
///
/// ## `InternalError`
/// Внутренние ошибки сервера:
/// - Непредвиденные исключения
/// - Ошибки файловой системы
/// - Проблемы с внешними сервисами
///
/// # Примеры использования
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{ErrorType, AppError};
/// 
/// // Создание ошибки валидации
/// let error = AppError::new(
///     ErrorType::ValidationError,
///     "Email format is invalid"
/// );
/// 
/// // Ошибка с деталями
/// let error = AppError::with_details(
///     ErrorType::DatabaseError,
///     "Failed to create user",
///     "UNIQUE constraint failed: users.email"
/// );
/// ```
pub use ErrorType as DocumentedErrorType;

/// Структура ошибки приложения
///
/// Универсальная структура для описания ошибок в NetBit системе.
/// Содержит тип ошибки, сообщение и дополнительные детали.
///
/// # Поля ошибки
/// - `error_type: ErrorType` - Категория ошибки
/// - `message: String` - Основное сообщение об ошибке
/// - `details: Option<String>` - Дополнительные технические детали
///
/// # Создание ошибок
/// 
/// ## Простая ошибка
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{AppError, ErrorType};
/// 
/// let error = AppError::new(
///     ErrorType::NotFoundError,
///     "User not found"
/// );
/// ```
///
/// ## Ошибка с деталями
/// ```rust,no_run
/// let error = AppError::with_details(
///     ErrorType::DatabaseError,
///     "Database operation failed",
///     "Connection timeout after 30 seconds"
/// );
/// ```
///
/// # Сериализация в JSON
/// ```json
/// {
///   "error_type": "ValidationError",
///   "message": "Invalid email format",
///   "details": "Email must contain @ symbol"
/// }
/// ```
///
/// # Использование в API
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{error_response_with_details, AppError, ErrorType};
/// use actix_web::{HttpResponse, Result};
/// 
/// async fn handle_error() -> Result<HttpResponse> {
///     let error = AppError::new(
///         ErrorType::ValidationError,
///         "Invalid input data"
///     );
///     
///     Ok(HttpResponse::BadRequest().json(
///         error_response_with_details("Validation failed", &error)
///     ))
/// }
/// ```
pub use AppError as DocumentedAppError;

/// Создание успешного ответа API
///
/// Вспомогательная функция для создания стандартного успешного ответа API
/// с данными без дополнительного сообщения.
///
/// # Аргументы
/// * `data: T` - Данные для включения в ответ (должны реализовывать Serialize)
///
/// # Возвращает
/// `ApiResponse<T>` с `success = true` и переданными данными
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::success_response;
/// use serde_json::json;
/// 
/// let user_data = json!({
///     "id": 1,
///     "username": "john_doe",
///     "email": "john@example.com"
/// });
/// 
/// let response = success_response(user_data);
/// // Результат: {"success": true, "data": {...}}
/// ```
pub use success_response as documented_success_response;

/// Создание успешного ответа API с сообщением
///
/// Создает успешный ответ API с дополнительным текстовым сообщением
/// и данными.
///
/// # Аргументы
/// * `message: &str` - Сообщение о выполненном действии
/// * `data: T` - Данные для включения в ответ
///
/// # Возвращает
/// `ApiResponse<T>` с `success = true`, сообщением и данными
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::success_response_with_message;
/// use serde_json::json;
/// 
/// let user = json!({"id": 42, "username": "new_user"});
/// let response = success_response_with_message("User created successfully", user);
/// 
/// // Результат: {
/// //   "success": true,
/// //   "message": "User created successfully",
/// //   "data": {"id": 42, "username": "new_user"}
/// // }
/// ```
pub use success_response_with_message as documented_success_response_with_message;

/// Создание ответа об ошибке
///
/// Создает стандартный ответ API для ошибочных ситуаций
/// с сообщением об ошибке.
///
/// # Аргументы
/// * `message: &str` - Сообщение об ошибке для пользователя
///
/// # Возвращает
/// `ApiResponse<()>` с `success = false` и сообщением об ошибке
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::error_response;
/// 
/// let response = error_response("User not found");
/// 
/// // Результат: {
/// //   "success": false,
/// //   "message": "User not found"
/// // }
/// ```
pub use error_response as documented_error_response;

/// Создание ответа об ошибке с деталями
///
/// Создает детализированный ответ об ошибке, включающий
/// структурированную информацию об ошибке.
///
/// # Аргументы
/// * `message: &str` - Основное сообщение об ошибке
/// * `error: &AppError` - Детальная информация об ошибке
///
/// # Возвращает
/// `ApiResponse<AppError>` с подробной информацией об ошибке
///
/// # Примеры
/// ```rust,no_run
/// use netbit_backend::core::types_doc::{error_response_with_details, AppError, ErrorType};
/// 
/// let app_error = AppError::with_details(
///     ErrorType::ValidationError,
///     "Invalid email format",
///     "Email must contain @ symbol and valid domain"
/// );
/// 
/// let response = error_response_with_details("Validation failed", &app_error);
/// 
/// // Результат: {
/// //   "success": false,
/// //   "message": "Validation failed",
/// //   "data": {
/// //     "error_type": "ValidationError",
/// //     "message": "Invalid email format",
/// //     "details": "Email must contain @ symbol and valid domain"
/// //   }
/// // }
/// ```
pub use error_response_with_details as documented_error_response_with_details;