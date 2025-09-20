use tokio::net::TcpStream;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use std::io::{stdin, stdout, Write};

pub async fn start_tui() {
    let mut stream = TcpStream::connect("127.0.0.1:7878").await.unwrap();
    println!("Connected to daemon!");

    loop {
        print!("> ");
        stdout().flush().unwrap();

        let mut input = String::new();
        stdin().read_line(&mut input).unwrap();
        let input = input.trim();

        if input == "exit" {
            break;
        }

        stream.write_all(input.as_bytes()).await.unwrap();

        let mut buffer = [0; 1024];
        let n = stream.read(&mut buffer).await.unwrap();
        let response = String::from_utf8_lossy(&buffer[..n]);
        println!("{}", response);
    }
}
