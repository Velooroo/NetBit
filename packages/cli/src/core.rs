use tokio::net::TcpStream;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

#[derive(Clone)]
pub struct NetBitCore;

impl NetBitCore {
    pub fn new() -> Self { NetBitCore {} }

    pub fn handle_command(&self, command: &str) -> String {
        match command {
            "hello" => "Hello from daemon!".to_string(),
            _ => format!("Unknown command: {}", command),
        }
    }
}
