//! Документация для доменной модели пользователя NetBit
//! 
//! Этот модуль содержит документацию для работы с пользователями в системе,
//! включая создание, поиск, аутентификацию и управление профилями.

// Импорты из реальной реализации
pub use crate::domain::user::User;

/// Модель пользователя NetBit системы
///
/// Основная сущность для работы с пользователями в системе NetBit.
/// Представляет зарегистрированного пользователя со всей необходимой информацией
/// для аутентификации, авторизации и профиля.
///
/// # Структура пользователя
/// 
/// ## Идентификация
/// - `id: Option<i64>` - Уникальный идентификатор пользователя
///   - `None` для новых пользователей (до сохранения в БД)
///   - `Some(id)` для существующих пользователей
///
/// ## Учетные данные
/// - `username: String` - Уникальное имя пользователя для входа
///   - Используется для аутентификации
///   - Должно быть уникальным в системе
///   - Рекомендации: 3-50 символов, буквы, цифры, подчеркивания
///
/// - `password: String` - Хэшированный пароль
///   - ⚠️ Никогда не храните пароли в открытом виде!
///   - Используется bcrypt или аналогичный алгоритм
///   - Автоматически исключается из JSON сериализации
///
/// ## Профильная информация
/// - `email: Option<String>` - Электронная почта (опционально)
///   - Используется для восстановления пароля
///   - Уведомления и связь с пользователем
///   - Валидируется на корректность формата
///
/// - `created_at: Option<DateTime<Utc>>` - Дата регистрации
///   - Автоматически устанавливается при создании
///   - Хранится в UTC для избежания проблем с часовыми поясами
///
/// # Примеры использования
/// 
/// ## Создание нового пользователя
/// ```rust,no_run
/// use netbit_backend::domain::user_doc::DocumentedUser;
/// use chrono::Utc;
/// 
/// let new_user = DocumentedUser {
///     id: None, // Будет установлен автоматически при сохранении
///     username: "john_doe".to_string(),
///     password: hash_password("secure_password"), // Обязательно хэшировать!
///     email: Some("john@example.com".to_string()),
///     created_at: Some(Utc::now()),
/// };
/// ```
///
/// ## Поиск пользователя
/// ```rust,no_run
/// use netbit_backend::domain::user_doc::DocumentedUser;
/// 
/// // Поиск по username
/// if let Some(user) = DocumentedUser::find_by_username("john_doe", db_connection)? {
///     println!("Найден пользователь: {}", user.username);
/// }
/// 
/// // Поиск по ID
/// if let Some(user) = DocumentedUser::find_by_id(1, db_connection)? {
///     println!("Email: {:?}", user.email);
/// }
/// ```
///
/// # Безопасность
/// 
/// ## Пароли
/// - Пароли ВСЕГДА должны быть хэшированы перед сохранением
/// - Используйте bcrypt, scrypt или Argon2 для хэширования
/// - Никогда не сравнивайте пароли напрямую
/// - Поле password автоматически исключается из JSON ответов
///
/// ## Валидация
/// - Username проверяется на уникальность
/// - Email валидируется на корректность формата
/// - Обязательные поля проверяются при создании
///
/// # Database Schema
/// ```sql
/// CREATE TABLE users (
///     id INTEGER PRIMARY KEY AUTOINCREMENT,
///     username TEXT NOT NULL UNIQUE,
///     password TEXT NOT NULL,
///     email TEXT,
///     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
/// );
/// ```
///
/// # Основные методы
/// 
/// ## Создание пользователя
/// ```rust,no_run
/// let user_id = user.create(connection)?;
/// ```
/// 
/// ## Поиск пользователей
/// ```rust,no_run
/// let user = User::find_by_username("john_doe", connection)?;
/// let user = User::find_by_id(42, connection)?;
/// let users = User::list_users(20, 0, connection)?; // лимит, офсет
/// ```
/// 
/// ## Обновление профиля
/// ```rust,no_run
/// user.update_profile(connection)?;
/// User::change_password(user_id, "old", "new", connection)?;
/// ```
/// 
/// ## Удаление пользователя
/// ```rust,no_run
/// User::delete_user(user_id, connection)?;
/// ```
pub use User as DocumentedUser;