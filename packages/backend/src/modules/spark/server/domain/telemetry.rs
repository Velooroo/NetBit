use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TelemetryType {
    Log,
    Metric,
    Event,
    Error,
}

impl std::fmt::Display for TelemetryType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            TelemetryType::Log => write!(f, "log"),
            TelemetryType::Metric => write!(f, "metric"),
            TelemetryType::Event => write!(f, "event"),
            TelemetryType::Error => write!(f, "error"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LogLevel::Debug => write!(f, "debug"),
            LogLevel::Info => write!(f, "info"),
            LogLevel::Warn => write!(f, "warn"),
            LogLevel::Error => write!(f, "error"),
            LogLevel::Fatal => write!(f, "fatal"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SparkUnitTelemetry {
    pub id: i64,
    pub unit_id: Uuid,
    pub telemetry_type: String,
    pub level: Option<String>,
    pub message: Option<String>,
    pub data: Option<JsonValue>,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTelemetryRequest {
    pub telemetry_type: TelemetryType,
    pub level: Option<LogLevel>,
    pub message: Option<String>,
    pub data: Option<JsonValue>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryQuery {
    pub unit_id: Uuid,
    pub telemetry_type: Option<TelemetryType>,
    pub level: Option<LogLevel>,
    pub from: Option<DateTime<Utc>>,
    pub to: Option<DateTime<Utc>>,
    pub limit: Option<i64>,
}

impl SparkUnitTelemetry {
    pub async fn create(
        pool: &PgPool,
        unit_id: Uuid,
        req: CreateTelemetryRequest,
    ) -> Result<Self, sqlx::Error> {
        let telemetry_type = req.telemetry_type.to_string();
        let level = req.level.map(|l| l.to_string());

        sqlx::query_as!(
            SparkUnitTelemetry,
            r#"
            INSERT INTO spark_unit_telemetry (unit_id, telemetry_type, level, message, data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            "#,
            unit_id,
            telemetry_type,
            level,
            req.message,
            req.data
        )
        .fetch_one(pool)
        .await
    }

    pub async fn query(pool: &PgPool, query: TelemetryQuery) -> Result<Vec<Self>, sqlx::Error> {
        let telemetry_type = query.telemetry_type.map(|t| t.to_string());
        let level = query.level.map(|l| l.to_string());
        let limit = query.limit.unwrap_or(100);

        let mut sql = String::from("SELECT * FROM spark_unit_telemetry WHERE unit_id = $1");
        let mut param_count = 1;

        if telemetry_type.is_some() {
            param_count += 1;
            sql.push_str(&format!(" AND telemetry_type = ${}", param_count));
        }

        if level.is_some() {
            param_count += 1;
            sql.push_str(&format!(" AND level = ${}", param_count));
        }

        if query.from.is_some() {
            param_count += 1;
            sql.push_str(&format!(" AND timestamp >= ${}", param_count));
        }

        if query.to.is_some() {
            param_count += 1;
            sql.push_str(&format!(" AND timestamp <= ${}", param_count));
        }

        sql.push_str(" ORDER BY timestamp DESC");
        param_count += 1;
        sql.push_str(&format!(" LIMIT ${}", param_count));

        let mut query_builder = sqlx::query_as::<_, SparkUnitTelemetry>(&sql).bind(query.unit_id);

        if let Some(t) = telemetry_type {
            query_builder = query_builder.bind(t);
        }
        if let Some(l) = level {
            query_builder = query_builder.bind(l);
        }
        if let Some(from) = query.from {
            query_builder = query_builder.bind(from);
        }
        if let Some(to) = query.to {
            query_builder = query_builder.bind(to);
        }
        query_builder = query_builder.bind(limit);

        query_builder.fetch_all(pool).await
    }

    pub async fn get_latest_logs(
        pool: &PgPool,
        unit_id: Uuid,
        limit: i64,
    ) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkUnitTelemetry,
            r#"
            SELECT * FROM spark_unit_telemetry 
            WHERE unit_id = $1 AND telemetry_type = 'log'
            ORDER BY timestamp DESC
            LIMIT $2
            "#,
            unit_id,
            limit
        )
        .fetch_all(pool)
        .await
    }

    pub async fn get_metrics(
        pool: &PgPool,
        unit_id: Uuid,
        from: DateTime<Utc>,
        to: DateTime<Utc>,
    ) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkUnitTelemetry,
            r#"
            SELECT * FROM spark_unit_telemetry 
            WHERE unit_id = $1 
            AND telemetry_type = 'metric'
            AND timestamp >= $2
            AND timestamp <= $3
            ORDER BY timestamp ASC
            "#,
            unit_id,
            from,
            to
        )
        .fetch_all(pool)
        .await
    }

    pub async fn delete_old(
        pool: &PgPool,
        before: DateTime<Utc>,
    ) -> Result<u64, sqlx::Error> {
        let result = sqlx::query!(
            r#"
            DELETE FROM spark_unit_telemetry WHERE timestamp < $1
            "#,
            before
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }
}
