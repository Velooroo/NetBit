use std::sync::Arc;
use std::time::Duration;
use tokio::time::interval;
use uuid::Uuid;
use log::{info, error, debug};
use serde_json::json;

use super::api_client::{SparkApiClient, TelemetryRequest};
use super::process_manager::ProcessManager;

pub struct TelemetryAgent {
    api_client: Arc<SparkApiClient>,
    process_manager: Arc<ProcessManager>,
    heartbeat_interval: Duration,
}

impl TelemetryAgent {
    pub fn new(
        api_client: Arc<SparkApiClient>,
        process_manager: Arc<ProcessManager>,
        heartbeat_interval_secs: u64,
    ) -> Self {
        Self {
            api_client,
            process_manager,
            heartbeat_interval: Duration::from_secs(heartbeat_interval_secs),
        }
    }

    pub async fn start(&self) {
        info!("Starting telemetry agent with heartbeat interval: {:?}", self.heartbeat_interval);
        
        let mut ticker = interval(self.heartbeat_interval);

        loop {
            ticker.tick().await;
            
            if let Err(e) = self.send_heartbeats().await {
                error!("Failed to send heartbeats: {}", e);
            }

            if let Err(e) = self.collect_and_send_metrics().await {
                error!("Failed to collect metrics: {}", e);
            }
        }
    }

    async fn send_heartbeats(&self) -> Result<(), Box<dyn std::error::Error>> {
        let units = self.process_manager.list();

        for unit in units {
            debug!("Sending heartbeat for unit: {}", unit.unit_id);
            
            if let Err(e) = self.api_client.send_heartbeat(unit.unit_id).await {
                error!("Failed to send heartbeat for unit {}: {}", unit.unit_id, e);
            }
        }

        Ok(())
    }

    async fn collect_and_send_metrics(&self) -> Result<(), Box<dyn std::error::Error>> {
        let units = self.process_manager.list();

        for unit in units {
            // Collect process metrics (CPU, memory, etc.)
            if let Some(metrics) = self.collect_process_metrics(unit.pid).await {
                let telemetry = TelemetryRequest {
                    telemetry_type: "metric".to_string(),
                    level: None,
                    message: None,
                    data: Some(metrics),
                };

                if let Err(e) = self.api_client.send_telemetry(unit.unit_id, telemetry).await {
                    error!("Failed to send metrics for unit {}: {}", unit.unit_id, e);
                }
            }
        }

        Ok(())
    }

    async fn collect_process_metrics(&self, pid: u32) -> Option<serde_json::Value> {
        #[cfg(unix)]
        {
            use std::process::Command;

            // Get process stats using ps
            let output = Command::new("ps")
                .args(&["-p", &pid.to_string(), "-o", "pid,pcpu,pmem,vsz,rss"])
                .output()
                .ok()?;

            if !output.status.success() {
                return None;
            }

            let stdout = String::from_utf8_lossy(&output.stdout);
            let lines: Vec<&str> = stdout.lines().collect();
            
            if lines.len() < 2 {
                return None;
            }

            // Parse the second line (first is header)
            let data: Vec<&str> = lines[1].split_whitespace().collect();
            if data.len() < 5 {
                return None;
            }

            Some(json!({
                "pid": pid,
                "cpu_percent": data[1].parse::<f64>().unwrap_or(0.0),
                "memory_percent": data[2].parse::<f64>().unwrap_or(0.0),
                "vsz_kb": data[3].parse::<u64>().unwrap_or(0),
                "rss_kb": data[4].parse::<u64>().unwrap_or(0),
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }

        #[cfg(windows)]
        {
            // Windows implementation would go here
            Some(json!({
                "pid": pid,
                "platform": "windows",
                "timestamp": chrono::Utc::now().to_rfc3339()
            }))
        }
    }

    pub async fn send_log(
        &self,
        unit_id: Uuid,
        level: &str,
        message: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let telemetry = TelemetryRequest {
            telemetry_type: "log".to_string(),
            level: Some(level.to_string()),
            message: Some(message.to_string()),
            data: None,
        };

        self.api_client.send_telemetry(unit_id, telemetry).await
    }

    pub async fn send_event(
        &self,
        unit_id: Uuid,
        event_name: &str,
        data: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let telemetry = TelemetryRequest {
            telemetry_type: "event".to_string(),
            level: None,
            message: Some(event_name.to_string()),
            data: Some(data),
        };

        self.api_client.send_telemetry(unit_id, telemetry).await
    }

    pub async fn send_error(
        &self,
        unit_id: Uuid,
        error_message: &str,
        details: Option<serde_json::Value>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let telemetry = TelemetryRequest {
            telemetry_type: "error".to_string(),
            level: Some("error".to_string()),
            message: Some(error_message.to_string()),
            data: details,
        };

        self.api_client.send_telemetry(unit_id, telemetry).await
    }
}
