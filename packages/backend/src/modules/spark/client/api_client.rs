use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::error::Error;
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct SparkApiClient {
    base_url: String,
    auth_token: Option<String>,
    client: reqwest::Client,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageInfo {
    pub id: i64,
    pub name: String,
    pub display_name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub downloads: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageVersion {
    pub id: i64,
    pub package_id: i64,
    pub version: String,
    pub download_url: Option<String>,
    pub checksum: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InstallRequest {
    pub package_name: String,
    pub version: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateUnitRequest {
    pub name: String,
    pub package_name: String,
    pub device_name: Option<String>,
    pub device_os: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RemoteUnit {
    pub id: i64,
    pub unit_id: Uuid,
    pub name: String,
    pub package_id: i64,
    pub status: String,
    pub pid: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateStatusRequest {
    pub status: String,
    pub pid: Option<i32>,
    pub port: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TelemetryRequest {
    pub telemetry_type: String,
    pub level: Option<String>,
    pub message: Option<String>,
    pub data: Option<JsonValue>,
}

impl SparkApiClient {
    pub fn new(base_url: String) -> Self {
        Self {
            base_url,
            auth_token: None,
            client: reqwest::Client::new(),
        }
    }

    pub fn with_auth(mut self, token: String) -> Self {
        self.auth_token = Some(token);
        self
    }

    fn get_headers(&self) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        if let Some(token) = &self.auth_token {
            headers.insert(
                reqwest::header::AUTHORIZATION,
                format!("Bearer {}", token).parse().unwrap(),
            );
        }
        headers.insert(
            reqwest::header::CONTENT_TYPE,
            "application/json".parse().unwrap(),
        );
        headers
    }

    // Package operations
    pub async fn list_packages(&self) -> Result<Vec<PackageInfo>, Box<dyn Error>> {
        let url = format!("{}/api/spark/packages", self.base_url);
        let response = self.client
            .get(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to list packages: {}", response.status()).into());
        }

        Ok(response.json().await?)
    }

    pub async fn search_packages(&self, query: &str) -> Result<Vec<PackageInfo>, Box<dyn Error>> {
        let url = format!("{}/api/spark/packages/search?q={}", self.base_url, query);
        let response = self.client
            .get(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to search packages: {}", response.status()).into());
        }

        Ok(response.json().await?)
    }

    pub async fn get_package(&self, name: &str) -> Result<(PackageInfo, Vec<PackageVersion>), Box<dyn Error>> {
        let url = format!("{}/api/spark/packages/{}", self.base_url, name);
        let response = self.client
            .get(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to get package: {}", response.status()).into());
        }

        #[derive(Deserialize)]
        struct Response {
            package: PackageInfo,
            versions: Vec<PackageVersion>,
        }

        let data: Response = response.json().await?;
        Ok((data.package, data.versions))
    }

    pub async fn install_package(&self, package_name: &str) -> Result<(PackageInfo, PackageVersion), Box<dyn Error>> {
        let url = format!("{}/api/spark/packages/install", self.base_url);
        let req = InstallRequest {
            package_name: package_name.to_string(),
            version: None,
        };

        let response = self.client
            .post(&url)
            .headers(self.get_headers())
            .json(&req)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to install package: {}", response.status()).into());
        }

        #[derive(Deserialize)]
        struct InstallResponse {
            package: PackageInfo,
            version: PackageVersion,
        }

        let data: InstallResponse = response.json().await?;
        Ok((data.package, data.version))
    }

    // Unit operations
    pub async fn create_unit(&self, req: CreateUnitRequest) -> Result<RemoteUnit, Box<dyn Error>> {
        let url = format!("{}/api/spark/units", self.base_url);
        let response = self.client
            .post(&url)
            .headers(self.get_headers())
            .json(&req)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to create unit: {}", response.status()).into());
        }

        #[derive(Deserialize)]
        struct Response {
            unit: RemoteUnit,
        }

        let data: Response = response.json().await?;
        Ok(data.unit)
    }

    pub async fn list_units(&self) -> Result<Vec<RemoteUnit>, Box<dyn Error>> {
        let url = format!("{}/api/spark/units", self.base_url);
        let response = self.client
            .get(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to list units: {}", response.status()).into());
        }

        Ok(response.json().await?)
    }

    pub async fn update_unit_status(&self, unit_id: Uuid, req: UpdateStatusRequest) -> Result<(), Box<dyn Error>> {
        let url = format!("{}/api/spark/units/{}/status", self.base_url, unit_id);
        let response = self.client
            .put(&url)
            .headers(self.get_headers())
            .json(&req)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to update status: {}", response.status()).into());
        }

        Ok(())
    }

    pub async fn send_heartbeat(&self, unit_id: Uuid) -> Result<(), Box<dyn Error>> {
        let url = format!("{}/api/spark/units/{}/heartbeat", self.base_url, unit_id);
        let response = self.client
            .post(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to send heartbeat: {}", response.status()).into());
        }

        Ok(())
    }

    pub async fn delete_unit(&self, unit_id: Uuid) -> Result<(), Box<dyn Error>> {
        let url = format!("{}/api/spark/units/{}", self.base_url, unit_id);
        let response = self.client
            .delete(&url)
            .headers(self.get_headers())
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to delete unit: {}", response.status()).into());
        }

        Ok(())
    }

    // Telemetry operations
    pub async fn send_telemetry(&self, unit_id: Uuid, req: TelemetryRequest) -> Result<(), Box<dyn Error>> {
        let url = format!("{}/api/spark/units/{}/telemetry", self.base_url, unit_id);
        let response = self.client
            .post(&url)
            .headers(self.get_headers())
            .json(&req)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("Failed to send telemetry: {}", response.status()).into());
        }

        Ok(())
    }
}
