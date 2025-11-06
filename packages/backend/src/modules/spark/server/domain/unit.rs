use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{PgPool, FromRow};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UnitStatus {
    Starting,
    Running,
    Stopped,
    Failed,
    Paused,
}

impl std::fmt::Display for UnitStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UnitStatus::Starting => write!(f, "starting"),
            UnitStatus::Running => write!(f, "running"),
            UnitStatus::Stopped => write!(f, "stopped"),
            UnitStatus::Failed => write!(f, "failed"),
            UnitStatus::Paused => write!(f, "paused"),
        }
    }
}

impl std::str::FromStr for UnitStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "starting" => Ok(UnitStatus::Starting),
            "running" => Ok(UnitStatus::Running),
            "stopped" => Ok(UnitStatus::Stopped),
            "failed" => Ok(UnitStatus::Failed),
            "paused" => Ok(UnitStatus::Paused),
            _ => Err(format!("Invalid status: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SparkRemoteUnit {
    pub id: i64,
    pub unit_id: Uuid,
    pub name: String,
    pub package_id: i64,
    pub package_version_id: i64,
    pub owner_id: i64,
    pub device_name: Option<String>,
    pub device_os: Option<String>,
    pub status: String,
    pub pid: Option<i32>,
    pub port: Option<i32>,
    pub started_at: Option<DateTime<Utc>>,
    pub stopped_at: Option<DateTime<Utc>>,
    pub last_heartbeat: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUnitRequest {
    pub name: String,
    pub package_name: String,
    pub device_name: Option<String>,
    pub device_os: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUnitStatusRequest {
    pub status: UnitStatus,
    pub pid: Option<i32>,
    pub port: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UnitWithPackage {
    #[serde(flatten)]
    pub unit: SparkRemoteUnit,
    pub package_name: String,
    pub package_version: String,
}

impl SparkRemoteUnit {
    pub async fn create(
        pool: &PgPool,
        owner_id: i64,
        package_id: i64,
        version_id: i64,
        req: CreateUnitRequest,
    ) -> Result<Self, sqlx::Error> {
        sqlx::query_as!(
            SparkRemoteUnit,
            r#"
            INSERT INTO spark_remote_units 
            (name, package_id, package_version_id, owner_id, device_name, device_os, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'stopped')
            RETURNING *
            "#,
            req.name,
            package_id,
            version_id,
            owner_id,
            req.device_name,
            req.device_os
        )
        .fetch_one(pool)
        .await
    }

    pub async fn find_by_uuid(pool: &PgPool, unit_id: Uuid) -> Result<Option<Self>, sqlx::Error> {
        sqlx::query_as!(
            SparkRemoteUnit,
            r#"
            SELECT * FROM spark_remote_units WHERE unit_id = $1
            "#,
            unit_id
        )
        .fetch_optional(pool)
        .await
    }

    pub async fn list_by_owner(pool: &PgPool, owner_id: i64) -> Result<Vec<UnitWithPackage>, sqlx::Error> {
        let units = sqlx::query!(
            r#"
            SELECT 
                u.*,
                p.name as package_name,
                v.version as package_version
            FROM spark_remote_units u
            JOIN spark_packages p ON u.package_id = p.id
            JOIN spark_package_versions v ON u.package_version_id = v.id
            WHERE u.owner_id = $1
            ORDER BY u.created_at DESC
            "#,
            owner_id
        )
        .fetch_all(pool)
        .await?;

        Ok(units
            .into_iter()
            .map(|row| UnitWithPackage {
                unit: SparkRemoteUnit {
                    id: row.id.unwrap(),
                    unit_id: row.unit_id.unwrap(),
                    name: row.name.unwrap(),
                    package_id: row.package_id.unwrap(),
                    package_version_id: row.package_version_id.unwrap(),
                    owner_id: row.owner_id.unwrap(),
                    device_name: row.device_name,
                    device_os: row.device_os,
                    status: row.status.unwrap(),
                    pid: row.pid,
                    port: row.port,
                    started_at: row.started_at,
                    stopped_at: row.stopped_at,
                    last_heartbeat: row.last_heartbeat,
                    created_at: row.created_at.unwrap(),
                },
                package_name: row.package_name.unwrap(),
                package_version: row.package_version.unwrap(),
            })
            .collect())
    }

    pub async fn update_status(
        pool: &PgPool,
        unit_id: Uuid,
        req: UpdateUnitStatusRequest,
    ) -> Result<(), sqlx::Error> {
        let status_str = req.status.to_string();
        let now = Utc::now();

        match req.status {
            UnitStatus::Running => {
                sqlx::query!(
                    r#"
                    UPDATE spark_remote_units 
                    SET status = $1, pid = $2, port = $3, started_at = $4, last_heartbeat = $4
                    WHERE unit_id = $5
                    "#,
                    status_str,
                    req.pid,
                    req.port,
                    now,
                    unit_id
                )
                .execute(pool)
                .await?;
            }
            UnitStatus::Stopped | UnitStatus::Failed => {
                sqlx::query!(
                    r#"
                    UPDATE spark_remote_units 
                    SET status = $1, stopped_at = $2, last_heartbeat = $2
                    WHERE unit_id = $3
                    "#,
                    status_str,
                    now,
                    unit_id
                )
                .execute(pool)
                .await?;
            }
            _ => {
                sqlx::query!(
                    r#"
                    UPDATE spark_remote_units 
                    SET status = $1, last_heartbeat = $2
                    WHERE unit_id = $3
                    "#,
                    status_str,
                    now,
                    unit_id
                )
                .execute(pool)
                .await?;
            }
        }

        Ok(())
    }

    pub async fn update_heartbeat(pool: &PgPool, unit_id: Uuid) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            UPDATE spark_remote_units 
            SET last_heartbeat = $1
            WHERE unit_id = $2
            "#,
            Utc::now(),
            unit_id
        )
        .execute(pool)
        .await?;
        Ok(())
    }

    pub async fn delete(pool: &PgPool, unit_id: Uuid, owner_id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query!(
            r#"
            DELETE FROM spark_remote_units 
            WHERE unit_id = $1 AND owner_id = $2
            "#,
            unit_id,
            owner_id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}
