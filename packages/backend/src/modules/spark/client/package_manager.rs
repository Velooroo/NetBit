use std::path::{Path, PathBuf};
use std::fs;
use std::error::Error;
use serde::{Deserialize, Serialize};
use log::{info, error};

use super::api_client::{SparkApiClient, PackageInfo, PackageVersion};

#[derive(Debug, Serialize, Deserialize)]
pub struct InstalledPackage {
    pub name: String,
    pub version: String,
    pub install_path: PathBuf,
    pub installed_at: String,
}

pub struct PackageManager {
    packages_dir: PathBuf,
    api_client: SparkApiClient,
}

impl PackageManager {
    pub fn new(packages_dir: PathBuf, api_client: SparkApiClient) -> Self {
        Self {
            packages_dir,
            api_client,
        }
    }

    pub fn init(&self) -> Result<(), Box<dyn Error>> {
        if !self.packages_dir.exists() {
            fs::create_dir_all(&self.packages_dir)?;
            info!("Created packages directory: {:?}", self.packages_dir);
        }
        Ok(())
    }

    pub async fn install(&self, package_name: &str) -> Result<InstalledPackage, Box<dyn Error>> {
        info!("Installing package: {}", package_name);

        // Call API to register installation
        let (package, version) = self.api_client.install_package(package_name).await?;

        // Create package directory
        let package_dir = self.packages_dir.join(&package.name);
        if !package_dir.exists() {
            fs::create_dir_all(&package_dir)?;
        }

        // Download package if download_url is provided
        if let Some(download_url) = &version.download_url {
            info!("Downloading package from: {}", download_url);
            self.download_package(download_url, &package_dir).await?;
        } else {
            info!("No download URL provided, creating empty package directory");
        }

        // Save package metadata
        let metadata = InstalledPackage {
            name: package.name.clone(),
            version: version.version.clone(),
            install_path: package_dir.clone(),
            installed_at: chrono::Utc::now().to_rfc3339(),
        };

        let metadata_path = package_dir.join("package.json");
        let metadata_json = serde_json::to_string_pretty(&metadata)?;
        fs::write(metadata_path, metadata_json)?;

        info!("Package '{}' version {} installed successfully", package.name, version.version);
        Ok(metadata)
    }

    async fn download_package(&self, url: &str, dest_dir: &Path) -> Result<(), Box<dyn Error>> {
        // Download package archive
        let response = reqwest::get(url).await?;
        
        if !response.status().is_success() {
            return Err(format!("Failed to download package: {}", response.status()).into());
        }

        let bytes = response.bytes().await?;
        
        // Save as archive
        let archive_path = dest_dir.join("package.tar.gz");
        fs::write(&archive_path, bytes)?;

        info!("Downloaded package to: {:?}", archive_path);
        
        // TODO: Extract archive if needed
        // For now, just save the raw file

        Ok(())
    }

    pub async fn search(&self, query: &str) -> Result<Vec<PackageInfo>, Box<dyn Error>> {
        self.api_client.search_packages(query).await
    }

    pub async fn list_available(&self) -> Result<Vec<PackageInfo>, Box<dyn Error>> {
        self.api_client.list_packages().await
    }

    pub fn list_installed(&self) -> Result<Vec<InstalledPackage>, Box<dyn Error>> {
        let mut installed = Vec::new();

        if !self.packages_dir.exists() {
            return Ok(installed);
        }

        for entry in fs::read_dir(&self.packages_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                let metadata_path = path.join("package.json");
                if metadata_path.exists() {
                    let content = fs::read_to_string(metadata_path)?;
                    if let Ok(package) = serde_json::from_str::<InstalledPackage>(&content) {
                        installed.push(package);
                    }
                }
            }
        }

        Ok(installed)
    }

    pub fn get_package_path(&self, package_name: &str) -> Option<PathBuf> {
        let package_dir = self.packages_dir.join(package_name);
        if package_dir.exists() {
            Some(package_dir)
        } else {
            None
        }
    }

    pub fn is_installed(&self, package_name: &str) -> bool {
        self.get_package_path(package_name).is_some()
    }

    pub async fn uninstall(&self, package_name: &str) -> Result<(), Box<dyn Error>> {
        let package_dir = self.packages_dir.join(package_name);
        
        if !package_dir.exists() {
            return Err(format!("Package '{}' is not installed", package_name).into());
        }

        fs::remove_dir_all(package_dir)?;
        info!("Package '{}' uninstalled successfully", package_name);
        
        Ok(())
    }

    pub async fn get_info(&self, package_name: &str) -> Result<(PackageInfo, Vec<PackageVersion>), Box<dyn Error>> {
        self.api_client.get_package(package_name).await
    }
}
