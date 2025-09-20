mod daemon;
mod tui;
mod core;
mod modules;
mod commands;

use clap::Parser;
use commands::{NetBitCli, NetBitCommand};
use daemon::{NetBitDaemon, DaemonRequest, DaemonResponse};
use daemon::core::DaemonClient;

#[tokio::main]
async fn main() {
    env_logger::init();

    let args: Vec<String> = std::env::args().collect();

    // Check for legacy TUI flag
    if args.contains(&"--tui".to_string()) {
        tui::start_tui().await;
        return;
    }

    // Check if running as daemon (no arguments)
    if args.len() == 1 {
        match NetBitDaemon::new() {
            Ok(daemon) => {
                if let Err(e) = daemon.run().await {
                    eprintln!("❌ Daemon error: {}", e);
                    std::process::exit(1);
                }
            }
            Err(e) => {
                eprintln!("❌ Failed to start daemon: {}", e);
                std::process::exit(1);
            }
        }
        return;
    }

    // Parse command line arguments
    let cli = match NetBitCli::try_parse() {
        Ok(cli) => cli,
        Err(e) => {
            eprintln!("{}", e);
            std::process::exit(1);
        }
    };

    // Handle TUI command specially
    if matches!(cli.command, NetBitCommand::Tui) {
        tui::start_tui().await;
        return;
    }

    // Convert CLI command to daemon request
    let daemon_request = convert_cli_to_daemon_request(cli.command);
    
    // Connect to daemon and send request
    let client = DaemonClient::new();
    
    // Check if daemon is running
    if !client.is_daemon_running().await {
        eprintln!("❌ NetBit daemon is not running. Please start it first by running: netbit");
        std::process::exit(1);
    }

    // Send request to daemon
    match client.send_request(daemon_request).await {
        Ok(response) => {
            match response {
                DaemonResponse::Success { message, data } => {
                    println!("✓ {}", message);
                    if let Some(data) = data {
                        if let Ok(pretty_json) = serde_json::to_string_pretty(&data) {
                            println!("\n{}", pretty_json);
                        }
                    }
                }
                DaemonResponse::Error { message } => {
                    eprintln!("✗ {}", message);
                    std::process::exit(1);
                }
                DaemonResponse::EditorResult { content, saved } => {
                    if saved {
                        println!("✓ Content saved");
                    } else {
                        println!("ℹ Content not saved");
                    }
                    if !content.is_empty() {
                        println!("\nContent:\n{}", content);
                    }
                }
                DaemonResponse::Pong => {
                    println!("✓ Daemon is running");
                }
            }
        }
        Err(e) => {
            eprintln!("❌ Failed to communicate with daemon: {}", e);
            std::process::exit(1);
        }
    }
}

fn convert_cli_to_daemon_request(command: NetBitCommand) -> DaemonRequest {
    match command {
        NetBitCommand::Note(note_cmd) => {
            match note_cmd {
                commands::NoteCommand::Add { title, content, tags } => {
                    DaemonRequest::CreateNote {
                        project: None,
                        title,
                        content,
                        tags,
                    }
                }
                commands::NoteCommand::List { tag } => {
                    DaemonRequest::ListNotes {
                        project: None,
                        tag,
                    }
                }
                commands::NoteCommand::Edit { id } => {
                    DaemonRequest::EditNote { id }
                }
                commands::NoteCommand::Delete { id } => {
                    DaemonRequest::DeleteNote { id }
                }
                commands::NoteCommand::Search { query } => {
                    DaemonRequest::SearchNotes {
                        project: None,
                        query,
                    }
                }
            }
        }
        NetBitCommand::Schedule(schedule_cmd) => {
            match schedule_cmd {
                commands::ScheduleCommand::Remind { message, time } => {
                    DaemonRequest::CreateReminder { message, time }
                }
                commands::ScheduleCommand::Alarm { time, message } => {
                    DaemonRequest::CreateAlarm { time, message }
                }
                commands::ScheduleCommand::List => {
                    DaemonRequest::ListScheduled
                }
                commands::ScheduleCommand::Cancel { id } => {
                    DaemonRequest::CancelScheduled { id }
                }
            }
        }
        NetBitCommand::Project(project_cmd) => {
            match project_cmd {
                commands::ProjectCommand::New { name, template } => {
                    DaemonRequest::CreateProject { name, template }
                }
                commands::ProjectCommand::List => {
                    DaemonRequest::ListProjects
                }
                commands::ProjectCommand::Switch { name } => {
                    DaemonRequest::SwitchProject { name }
                }
                commands::ProjectCommand::Info { name } => {
                    DaemonRequest::GetProjectInfo { name }
                }
                _ => DaemonRequest::GetStatus,
            }
        }
        NetBitCommand::Daemon(daemon_cmd) => {
            match daemon_cmd {
                commands::DaemonCommand::Status => DaemonRequest::GetStatus,
                commands::DaemonCommand::Stop => DaemonRequest::Shutdown,
                _ => DaemonRequest::Ping,
            }
        }
        NetBitCommand::Push { message } => {
            DaemonRequest::Push { message }
        }
        NetBitCommand::Pull => {
            DaemonRequest::Pull
        }
        NetBitCommand::Status => {
            DaemonRequest::Status
        }
        NetBitCommand::Edit { file } => {
            DaemonRequest::OpenEditor {
                file_path: file,
                content: None,
            }
        }
        NetBitCommand::Tui => {
            DaemonRequest::Ping // This shouldn't happen as TUI is handled above
        }
    }
}
