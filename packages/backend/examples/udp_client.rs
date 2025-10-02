//! Example UDP client for sending status updates
//! 
//! This example demonstrates how to:
//! 1. Create a UDP socket
//! 2. Send status update or ping
//! 3. Receive response (for ping)
//!
//! Run the server first: `cargo run --bin git-server-backend`
//! Then run this example: `cargo run --example udp_client`

use serde::{Serialize, Deserialize};
use std::net::UdpSocket;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum PacketType {
    SendMessage,
    GetMessages,
    Ack,
    Ping,
    Status,
    Typing,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MessagePacket {
    pub packet_type: PacketType,
    pub message: Option<serde_json::Value>,
    pub chat_id: Option<i64>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub user_id: Option<i64>,
    pub status_data: Option<String>,
}

fn main() -> std::io::Result<()> {
    println!("🚀 UDP Client Example");
    
    // Create UDP socket
    let socket = UdpSocket::bind("0.0.0.0:0")?;
    println!("✅ UDP socket created");
    
    // Example 1: Send Ping
    println!("\n📤 Example 1: Sending Ping...");
    let ping_packet = MessagePacket {
        packet_type: PacketType::Ping,
        message: None,
        chat_id: None,
        page: None,
        per_page: None,
        user_id: None,
        status_data: None,
    };
    
    let ping_json = serde_json::to_vec(&ping_packet).expect("Failed to serialize ping");
    socket.send_to(&ping_json, "127.0.0.1:8082")?;
    println!("✅ Ping sent!");
    
    // Wait for pong response
    let mut buffer = vec![0u8; 1024];
    socket.set_read_timeout(Some(std::time::Duration::from_secs(2)))?;
    
    match socket.recv_from(&mut buffer) {
        Ok((n, src)) => {
            let response = String::from_utf8_lossy(&buffer[..n]);
            println!("✅ Received from {}: {}", src, response);
        }
        Err(e) => {
            println!("⚠️  No response received: {}", e);
        }
    }
    
    // Example 2: Send Status Update
    println!("\n📤 Example 2: Sending Status Update...");
    let status_packet = MessagePacket {
        packet_type: PacketType::Status,
        message: None,
        chat_id: None,
        page: None,
        per_page: None,
        user_id: Some(1),
        status_data: Some("online".to_string()),
    };
    
    let status_json = serde_json::to_vec(&status_packet).expect("Failed to serialize status");
    socket.send_to(&status_json, "127.0.0.1:8082")?;
    println!("✅ Status update sent!");
    
    // Example 3: Send Typing Indicator
    println!("\n📤 Example 3: Sending Typing Indicator...");
    let typing_packet = MessagePacket {
        packet_type: PacketType::Typing,
        message: None,
        chat_id: Some(1),
        page: None,
        per_page: None,
        user_id: Some(1),
        status_data: None,
    };
    
    let typing_json = serde_json::to_vec(&typing_packet).expect("Failed to serialize typing");
    socket.send_to(&typing_json, "127.0.0.1:8082")?;
    println!("✅ Typing indicator sent!");
    
    println!("\n👋 Done! All packets sent successfully.");
    Ok(())
}
