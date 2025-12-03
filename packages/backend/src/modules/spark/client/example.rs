// Example usage of Spark Client

use std::path::PathBuf;
use std::sync::Arc;

use super::{SparkApiClient, PackageManager, ProcessManager, TelemetryAgent};

pub async fn example_workflow() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize API client with auth token
    let api_client = SparkApiClient::new("http://localhost:8080".to_string())
        .with_auth("your_jwt_token_here".to_string());
    
    let api_client = Arc::new(api_client);

    // Initialize package manager
    let packages_dir = PathBuf::from("./spark_packages");
    let package_manager = PackageManager::new(packages_dir, (*api_client).clone());
    package_manager.init()?;

    // Search for packages
    println!("Searching for packages...");
    let packages = package_manager.search("sipd").await?;
    for pkg in &packages {
        println!("Found: {} - {}", pkg.name, pkg.description.as_ref().unwrap_or(&"No description".to_string()));
    }

    // Install package
    println!("\nInstalling package 'sipd'...");
    let installed = package_manager.install("sipd").await?;
    println!("Installed: {} version {}", installed.name, installed.version);

    // Initialize process manager
    let process_manager = Arc::new(ProcessManager::new((*api_client).clone()));

    // Start a process
    println!("\nStarting sipd...");
    let unit = process_manager.start(
        "sipd",
        "sipd-instance-1",
        "node",  // command to run
        vec!["index.js"],  // arguments
    ).await?;
    println!("Started unit: {} (PID: {})", unit.name, unit.pid);

    // Initialize telemetry agent
    let telemetry = Arc::new(TelemetryAgent::new(
        api_client.clone(),
        process_manager.clone(),
        30, // heartbeat every 30 seconds
    ));

    // Start telemetry agent in background
    let telemetry_clone = telemetry.clone();
    tokio::spawn(async move {
        telemetry_clone.start().await;
    });

    // Send custom log
    telemetry.send_log(
        unit.unit_id,
        "info",
        "SIPD started successfully"
    ).await?;

    // List running units
    println!("\nRunning units:");
    let units = process_manager.list();
    for u in &units {
        println!("- {} ({}) - PID: {}", u.name, u.package_name, u.pid);
    }

    // Wait a bit
    tokio::time::sleep(tokio::time::Duration::from_secs(10)).await;

    // Stop the unit
    println!("\nStopping unit...");
    process_manager.stop(unit.unit_id).await?;
    println!("Unit stopped");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires running server
    async fn test_full_workflow() {
        example_workflow().await.unwrap();
    }
}
