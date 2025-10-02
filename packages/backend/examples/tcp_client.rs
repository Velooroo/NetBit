//! Example TCP client for sending messages
//! 
//! This example demonstrates how to:
//! 1. Connect to the TCP messaging server
//! 2. Send a message
//! 3. Receive an acknowledgment (ACK)
//!
//! Run the server first: `cargo run --bin git-server-backend`
//! Then run this example: `cargo run --example tcp_client`

use serde::{Serialize, Deserialize};
use std::io::{Read, Write};
use std::net::TcpStream;

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
pub enum MessageType {
    Text,
    Image,
    File,
    System,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Message {
    pub id: Option<i64>,
    pub chat_id: i64,
    pub sender_id: i64,
    pub content: String,
    pub message_type: MessageType,
    pub created_at: Option<String>,
    pub is_edited: bool,
    pub edited_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MessagePacket {
    pub packet_type: PacketType,
    pub message: Option<Message>,
    pub chat_id: Option<i64>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
    pub user_id: Option<i64>,
    pub status_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AckPacket {
    pub message_id: i64,
    pub success: bool,
    pub error: Option<String>,
}

fn main() -> std::io::Result<()> {
    println!("🚀 TCP Client Example - Connecting to localhost:8081...");
    
    // Connect to the server
    let mut stream = TcpStream::connect("127.0.0.1:8081")?;
    println!("✅ Connected to TCP server!");
    
    // Create a message
    let message = Message {
        id: None,
        chat_id: 1,
        sender_id: 1,
        content: "Hello from TCP client!".to_string(),
        message_type: MessageType::Text,
        created_at: None,
        is_edited: false,
        edited_at: None,
    };
    
    // Create a packet
    let packet = MessagePacket {
        packet_type: PacketType::SendMessage,
        message: Some(message),
        chat_id: None,
        page: None,
        per_page: None,
        user_id: None,
        status_data: None,
    };
    
    // Serialize and send
    let packet_json = serde_json::to_vec(&packet).expect("Failed to serialize packet");
    println!("📤 Sending message packet ({} bytes)...", packet_json.len());
    stream.write_all(&packet_json)?;
    println!("✅ Message sent!");
    
    // Wait for ACK
    println!("⏳ Waiting for ACK...");
    let mut buffer = vec![0u8; 4096];
    let n = stream.read(&mut buffer)?;
    
    if n > 0 {
        let ack: AckPacket = serde_json::from_slice(&buffer[..n])
            .expect("Failed to deserialize ACK");
        
        if ack.success {
            println!("✅ ACK received! Message ID: {}", ack.message_id);
        } else {
            println!("❌ ACK received with error: {:?}", ack.error);
        }
    } else {
        println!("⚠️  No ACK received (connection closed)");
    }
    
    println!("👋 Closing connection...");
    Ok(())
}
