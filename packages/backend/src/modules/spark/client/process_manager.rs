use std::collections::HashMap;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::error::Error;
use uuid::Uuid;
use log::{info, error, warn};

use super::api_client::{SparkApiClient, CreateUnitRequest, UpdateStatusRequest, RemoteUnit};

#[derive(Debug, Clone)]
pub struct ManagedProcess {
    pub unit_id: Uuid,
    pub name: String,
    pub package_name: String,
    pub pid: u32,
    pub status: String,
}

pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<Uuid, Child>>>,
    units: Arc<Mutex<HashMap<Uuid, ManagedProcess>>>,
    api_client: SparkApiClient,
}

impl ProcessManager {
    pub fn new(api_client: SparkApiClient) -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
            units: Arc::new(Mutex::new(HashMap::new())),
            api_client,
        }
    }

    pub async fn start(
        &self,
        package_name: &str,
        unit_name: &str,
        command: &str,
        args: Vec<&str>,
    ) -> Result<ManagedProcess, Box<dyn Error>> {
        info!("Starting process for package '{}' with name '{}'", package_name, unit_name);

        // Create unit on server
        let device_name = hostname::get()
            .ok()
            .and_then(|h| h.into_string().ok());
        
        let device_os = std::env::consts::OS.to_string();

        let create_req = CreateUnitRequest {
            name: unit_name.to_string(),
            package_name: package_name.to_string(),
            device_name: Some(device_name.unwrap_or_else(|| "unknown".to_string())),
            device_os: Some(device_os),
        };

        let unit = self.api_client.create_unit(create_req).await?;
        let unit_id = unit.unit_id;

        // Start process
        let mut cmd = Command::new(command);
        cmd.args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let child = cmd.spawn()?;
        let pid = child.id();

        info!("Process started with PID: {}", pid);

        // Update unit status on server
        let status_req = UpdateStatusRequest {
            status: "running".to_string(),
            pid: Some(pid as i32),
            port: None,
        };

        self.api_client.update_unit_status(unit_id, status_req).await?;

        // Store process
        let managed = ManagedProcess {
            unit_id,
            name: unit_name.to_string(),
            package_name: package_name.to_string(),
            pid,
            status: "running".to_string(),
        };

        {
            let mut processes = self.processes.lock().unwrap();
            processes.insert(unit_id, child);
        }

        {
            let mut units = self.units.lock().unwrap();
            units.insert(unit_id, managed.clone());
        }

        info!("Unit {} registered with ID: {}", unit_name, unit_id);

        Ok(managed)
    }

    pub async fn stop(&self, unit_id: Uuid) -> Result<(), Box<dyn Error>> {
        info!("Stopping unit: {}", unit_id);

        let mut child = {
            let mut processes = self.processes.lock().unwrap();
            processes.remove(&unit_id)
                .ok_or(format!("Unit {} not found", unit_id))?
        };

        // Kill process
        child.kill()?;
        child.wait()?;

        // Update status on server
        let status_req = UpdateStatusRequest {
            status: "stopped".to_string(),
            pid: None,
            port: None,
        };

        self.api_client.update_unit_status(unit_id, status_req).await?;

        // Remove from units
        {
            let mut units = self.units.lock().unwrap();
            units.remove(&unit_id);
        }

        info!("Unit {} stopped successfully", unit_id);

        Ok(())
    }

    pub fn list(&self) -> Vec<ManagedProcess> {
        let units = self.units.lock().unwrap();
        units.values().cloned().collect()
    }

    pub fn get(&self, unit_id: Uuid) -> Option<ManagedProcess> {
        let units = self.units.lock().unwrap();
        units.get(&unit_id).cloned()
    }

    pub async fn check_status(&self, unit_id: Uuid) -> Result<String, Box<dyn Error>> {
        let processes = self.processes.lock().unwrap();
        
        if let Some(child) = processes.get(&unit_id) {
            // Check if process is still running using PID
            #[cfg(unix)]
            {
                use std::process::Command;
                let pid = child.id();
                let output = Command::new("ps")
                    .args(&["-p", &pid.to_string()])
                    .output()?;
                
                if output.status.success() && !output.stdout.is_empty() {
                    return Ok("running".to_string());
                } else {
                    return Ok("stopped".to_string());
                }
            }

            #[cfg(windows)]
            {
                // Windows implementation
                Ok("running".to_string())
            }
        } else {
            Ok("stopped".to_string())
        }
    }

    pub async fn cleanup_stopped(&self) -> Result<(), Box<dyn Error>> {
        let unit_ids: Vec<Uuid> = {
            let units = self.units.lock().unwrap();
            units.keys().cloned().collect()
        };

        for unit_id in unit_ids {
            let status = self.check_status(unit_id).await?;
            if status == "stopped" {
                warn!("Unit {} has stopped unexpectedly", unit_id);
                
                // Update server
                let status_req = UpdateStatusRequest {
                    status: "failed".to_string(),
                    pid: None,
                    port: None,
                };
                
                if let Err(e) = self.api_client.update_unit_status(unit_id, status_req).await {
                    error!("Failed to update status for unit {}: {}", unit_id, e);
                }

                // Remove from tracking
                {
                    let mut processes = self.processes.lock().unwrap();
                    processes.remove(&unit_id);
                }
                {
                    let mut units = self.units.lock().unwrap();
                    units.remove(&unit_id);
                }
            }
        }

        Ok(())
    }
}
