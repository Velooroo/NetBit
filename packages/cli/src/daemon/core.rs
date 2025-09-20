use super::protocol::{DaemonRequest, DaemonResponse};
use super::services::NetBitServices;
use tokio::net::{TcpListener, TcpStream};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::sync::Arc;
use crossbeam_channel::{unbounded, Receiver, Sender};

pub struct NetBitDaemon {
    services: Arc<NetBitServices>,
    shutdown_tx: Sender<()>,
    shutdown_rx: Receiver<()>,
}

impl NetBitDaemon {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let services = Arc::new(NetBitServices::new()?);
        let (shutdown_tx, shutdown_rx) = unbounded();

        Ok(Self {
            services,
            shutdown_tx,
            shutdown_rx,
        })
    }

    pub async fn run(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("🚀 NetBit daemon starting...");
        
        // Play startup sound
        if let Ok(notification_service) = crate::daemon::notifications::NotificationService::new() {
            notification_service.play_startup_sound();
        }

        let listener = TcpListener::bind("127.0.0.1:7878").await?;
        println!("📡 NetBit daemon listening on 127.0.0.1:7878");
        println!("🎯 Ready to serve TUI clients");

        loop {
            tokio::select! {
                // Handle incoming connections
                result = listener.accept() => {
                    match result {
                        Ok((socket, addr)) => {
                            println!("🔗 New client connected: {}", addr);
                            let services = Arc::clone(&self.services);
                            let shutdown_tx = self.shutdown_tx.clone();
                            
                            tokio::spawn(async move {
                                if let Err(e) = Self::handle_client(socket, services, shutdown_tx).await {
                                    eprintln!("❌ Client handler error: {}", e);
                                }
                            });
                        }
                        Err(e) => {
                            eprintln!("❌ Failed to accept connection: {}", e);
                        }
                    }
                }
                
                // Handle shutdown signal
                _ = async {
                    loop {
                        if self.shutdown_rx.try_recv().is_ok() {
                            break;
                        }
                        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
                    }
                } => {
                    println!("🛑 Shutdown signal received");
                    break;
                }
            }
        }

        println!("👋 NetBit daemon shutting down");
        Ok(())
    }

    async fn handle_client(
        mut socket: TcpStream,
        services: Arc<NetBitServices>,
        shutdown_tx: Sender<()>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut buffer = vec![0; 8192]; // Increased buffer size for larger messages
        
        loop {
            // Read message length first (4 bytes)
            let mut len_buf = [0u8; 4];
            match socket.read_exact(&mut len_buf).await {
                Ok(_) => {},
                Err(_) => {
                    println!("🔌 Client disconnected");
                    return Ok(());
                }
            }
            
            let message_len = u32::from_le_bytes(len_buf) as usize;
            if message_len > buffer.len() {
                buffer.resize(message_len, 0);
            }
            
            // Read the actual message
            match socket.read_exact(&mut buffer[..message_len]).await {
                Ok(_) => {},
                Err(_) => {
                    println!("🔌 Client disconnected during message read");
                    return Ok(());
                }
            }

            // Parse the request
            let request_str = String::from_utf8_lossy(&buffer[..message_len]);
            
            match serde_json::from_str::<DaemonRequest>(&request_str) {
                Ok(request) => {
                    println!("📨 Received request: {:?}", request);
                    
                    // Handle shutdown request specially
                    if matches!(request, DaemonRequest::Shutdown) {
                        let response = DaemonResponse::success("Daemon shutting down".to_string());
                        let response_json = serde_json::to_string(&response)?;
                        Self::send_response(&mut socket, &response_json).await?;
                        
                        // Send shutdown signal
                        let _ = shutdown_tx.send(());
                        return Ok(());
                    }
                    
                    // Process the request
                    let response = services.handle_request(request).await;
                    let response_json = serde_json::to_string(&response)?;
                    
                    // Send response
                    Self::send_response(&mut socket, &response_json).await?;
                }
                Err(e) => {
                    eprintln!("❌ Failed to parse request: {}", e);
                    let error_response = DaemonResponse::error(format!("Invalid request format: {}", e));
                    let response_json = serde_json::to_string(&error_response)?;
                    Self::send_response(&mut socket, &response_json).await?;
                }
            }
        }
    }

    async fn send_response(
        socket: &mut TcpStream,
        response: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let response_bytes = response.as_bytes();
        let len = response_bytes.len() as u32;
        
        // Send length first
        socket.write_all(&len.to_le_bytes()).await?;
        // Send the response
        socket.write_all(response_bytes).await?;
        
        Ok(())
    }

    pub fn get_shutdown_sender(&self) -> Sender<()> {
        self.shutdown_tx.clone()
    }
}

// Client helper for TUI to communicate with daemon
pub struct DaemonClient {
    address: String,
}

impl DaemonClient {
    pub fn new() -> Self {
        Self {
            address: "127.0.0.1:7878".to_string(),
        }
    }

    pub async fn send_request(&self, request: DaemonRequest) -> Result<DaemonResponse, Box<dyn std::error::Error>> {
        let mut stream = TcpStream::connect(&self.address).await?;
        
        // Serialize request
        let request_json = serde_json::to_string(&request)?;
        let request_bytes = request_json.as_bytes();
        let len = request_bytes.len() as u32;
        
        // Send length first
        stream.write_all(&len.to_le_bytes()).await?;
        // Send request
        stream.write_all(request_bytes).await?;
        
        // Read response length
        let mut len_buf = [0u8; 4];
        stream.read_exact(&mut len_buf).await?;
        let response_len = u32::from_le_bytes(len_buf) as usize;
        
        // Read response
        let mut response_buf = vec![0; response_len];
        stream.read_exact(&mut response_buf).await?;
        
        // Parse response
        let response_str = String::from_utf8_lossy(&response_buf);
        let response: DaemonResponse = serde_json::from_str(&response_str)?;
        
        Ok(response)
    }

    pub async fn ping(&self) -> Result<bool, Box<dyn std::error::Error>> {
        match self.send_request(DaemonRequest::Ping).await {
            Ok(DaemonResponse::Pong) => Ok(true),
            _ => Ok(false),
        }
    }

    pub async fn is_daemon_running(&self) -> bool {
        self.ping().await.unwrap_or(false)
    }
}

impl Default for DaemonClient {
    fn default() -> Self {
        Self::new()
    }
}
