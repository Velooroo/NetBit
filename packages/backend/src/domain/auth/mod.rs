//! Доменная модель refresh токенов и связанные операции

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

/// Храним refresh-токены в базе для контроля сессий
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefreshToken {
    pub id: Uuid,
    pub user_id: i64,
    pub token_hash: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
    pub user_agent: Option<String>,
    pub ip_address: Option<String>,
}

impl RefreshToken {
    pub async fn insert(&self, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "INSERT INTO refresh_tokens \
                (id, user_id, token_hash, created_at, expires_at, revoked_at, user_agent, ip_address) \
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            self.id,
            self.user_id,
            self.token_hash,
            self.created_at,
            self.expires_at,
            self.revoked_at,
            self.user_agent,
            self.ip_address
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn find_active_by_hash(
        hash: &str,
        pool: &PgPool,
    ) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as!(
            RefreshToken,
            "SELECT id, user_id, token_hash, created_at, expires_at, revoked_at, user_agent, ip_address \
             FROM refresh_tokens \
             WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP",
            hash,
        )
        .fetch_optional(pool)
        .await
    }

    pub async fn revoke(&self, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1",
            self.id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn revoke_all_for_user(user_id: i64, pool: &PgPool) -> Result<(), sqlx::Error> {
        sqlx::query!(
            "UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL",
            user_id
        )
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn cleanup_expired(pool: &PgPool) -> Result<u64, sqlx::Error> {
        let result = sqlx::query!(
            "DELETE FROM refresh_tokens WHERE expires_at <= CURRENT_TIMESTAMP OR revoked_at IS NOT NULL"
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}
