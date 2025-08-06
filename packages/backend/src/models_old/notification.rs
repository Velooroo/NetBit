use rusqlite::{params, Result};
use std::sync::{Arc, Mutex};
use rusqlite::Connection;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Notification {
    /// Идентификатор
    pub id: Option<i64>,
    /// Наименование 
    pub name: String,
    /// Содержимое
    pub content: String,
    /// Дата создания уведомления
    pub created_at: Option<String>,
}

impl Notification {
    /// Создаёт новое уведомление в базе данных
    pub fn create(&self, conn: Arc<Mutex<Connection>>) -> Result<i64> {
        let conn = conn.lock().unwrap();

        conn.execute(
            "INSERT INTO notification (name, content) VALUES (?1, ?2)",
            params![self.name, self.content]
        )?;

        Ok(conn.last_insert_rowid())
    }

    /// Получает все уведомления из базы данных
    pub fn find_all(conn: Arc<Mutex<Connection>>) -> Result<Vec<Notification>> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, name, content, created_at FROM notification ORDER BY created_at DESC"
        )?;

        let notifications = stmt.query_map([], |row| {
            Ok(Notification {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
            })
        })?;

        let mut result = Vec::new();
        for notification in notifications {
            result.push(notification?);
        }

        Ok(result)
    }

    /// Находит уведомление по имени
    pub fn find_by_name(name: &str, conn: Arc<Mutex<Connection>>) -> Result<Option<Notification>> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, name, content, created_at FROM notification WHERE name = ?1"
        )?;

        let mut rows = stmt.query(params![name])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Notification {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Находит уведомление по ID
    pub fn find_by_id(id: i64, conn: Arc<Mutex<Connection>>) -> Result<Option<Notification>> {
        let conn = conn.lock().unwrap();

        let mut stmt = conn.prepare(
            "SELECT id, name, content, created_at FROM notification WHERE id = ?1"
        )?;

        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(Notification {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                content: row.get(2)?,
                created_at: row.get(3)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Обновляет уведомление в базе данных
    pub fn update(&self, conn: Arc<Mutex<Connection>>) -> Result<()> {
        let conn = conn.lock().unwrap();

        if let Some(id) = self.id {
            conn.execute(
                "UPDATE notification SET name = ?1, content = ?2 WHERE id = ?3",
                params![self.name, self.content, id]
            )?;
        }

        Ok(())
    }

    /// Удаляет уведомление по ID
    pub fn delete(id: i64, conn: Arc<Mutex<Connection>>) -> Result<()> {
        let conn = conn.lock().unwrap();

        conn.execute(
            "DELETE FROM notification WHERE id = ?1",
            params![id]
        )?;

        Ok(())
    }
}
