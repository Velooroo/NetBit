use super::types::*;
use std::fs;
use std::path::Path;
use uuid::Uuid;
use chrono::{Utc, DateTime, NaiveDateTime, TimeZone, Local};

pub struct ScheduleHandler {
    schedule_dir: String,
}

impl ScheduleHandler {
    pub fn new() -> Self {
        let schedule_dir = "./netbit_data/schedule".to_string();
        // Ensure schedule directory exists
        let _ = fs::create_dir_all(&schedule_dir);
        Self { schedule_dir }
    }

    pub async fn handle(&self, command: ScheduleCommand) -> CommandResult {
        match command {
            ScheduleCommand::Remind { message, time } => {
                self.add_reminder(message, time).await
            }
            ScheduleCommand::Alarm { time, message } => {
                self.add_alarm(time, message).await
            }
            ScheduleCommand::List => {
                self.list_scheduled_items().await
            }
            ScheduleCommand::Cancel { id } => {
                self.cancel_item(id).await
            }
        }
    }

    async fn add_reminder(&self, message: String, time_str: String) -> CommandResult {
        match self.parse_time(&time_str) {
            Ok(scheduled_time) => {
                let item = ScheduledItem {
                    id: Uuid::new_v4(),
                    message: message.clone(),
                    scheduled_time,
                    item_type: ScheduleType::Reminder,
                    is_completed: false,
                };

                self.save_scheduled_item(&item).await
            }
            Err(e) => CommandResult::error(format!("Invalid time format: {}", e)),
        }
    }

    async fn add_alarm(&self, time_str: String, message: Option<String>) -> CommandResult {
        match self.parse_time(&time_str) {
            Ok(scheduled_time) => {
                let item = ScheduledItem {
                    id: Uuid::new_v4(),
                    message: message.unwrap_or_else(|| "Alarm".to_string()),
                    scheduled_time,
                    item_type: ScheduleType::Alarm,
                    is_completed: false,
                };

                self.save_scheduled_item(&item).await
            }
            Err(e) => CommandResult::error(format!("Invalid time format: {}", e)),
        }
    }

    async fn save_scheduled_item(&self, item: &ScheduledItem) -> CommandResult {
        let item_file = format!("{}/{}.json", self.schedule_dir, item.id);
        
        match serde_json::to_string_pretty(item) {
            Ok(json_content) => {
                match fs::write(&item_file, json_content) {
                    Ok(_) => {
                        let type_str = match item.item_type {
                            ScheduleType::Reminder => "Reminder",
                            ScheduleType::Alarm => "Alarm",
                        };
                        
                        CommandResult::success_with_data(
                            format!("{} scheduled for {}", type_str, 
                                item.scheduled_time.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S")),
                            serde_json::json!({
                                "id": item.id,
                                "message": item.message,
                                "scheduled_time": item.scheduled_time,
                                "type": type_str
                            })
                        )
                    }
                    Err(e) => CommandResult::error(format!("Failed to save scheduled item: {}", e)),
                }
            }
            Err(e) => CommandResult::error(format!("Failed to serialize scheduled item: {}", e)),
        }
    }

    async fn list_scheduled_items(&self) -> CommandResult {
        let mut items = Vec::new();
        let now = Utc::now();
        
        if let Ok(entries) = fs::read_dir(&self.schedule_dir) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        if let Ok(content) = fs::read_to_string(entry.path()) {
                            if let Ok(item) = serde_json::from_str::<ScheduledItem>(&content) {
                                // Only include future items or items from today
                                if !item.is_completed && item.scheduled_time > now.checked_sub_signed(chrono::Duration::hours(24)).unwrap_or(now) {
                                    items.push(item);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Sort by scheduled time
        items.sort_by(|a, b| a.scheduled_time.cmp(&b.scheduled_time));

        if items.is_empty() {
            CommandResult::success("No scheduled items found".to_string())
        } else {
            let items_summary: Vec<serde_json::Value> = items.iter().map(|item| {
                let type_str = match item.item_type {
                    ScheduleType::Reminder => "Reminder",
                    ScheduleType::Alarm => "Alarm",
                };
                
                let time_until = if item.scheduled_time > now {
                    let duration = item.scheduled_time.signed_duration_since(now);
                    if duration.num_days() > 0 {
                        format!("in {} days", duration.num_days())
                    } else if duration.num_hours() > 0 {
                        format!("in {} hours", duration.num_hours())
                    } else if duration.num_minutes() > 0 {
                        format!("in {} minutes", duration.num_minutes())
                    } else {
                        "very soon".to_string()
                    }
                } else {
                    "overdue".to_string()
                };

                serde_json::json!({
                    "id": item.id,
                    "message": item.message,
                    "type": type_str,
                    "scheduled_time": item.scheduled_time.with_timezone(&Local).format("%Y-%m-%d %H:%M:%S").to_string(),
                    "time_until": time_until,
                    "is_overdue": item.scheduled_time <= now
                })
            }).collect();

            CommandResult::success_with_data(
                format!("Found {} scheduled items", items.len()),
                serde_json::json!({ "items": items_summary })
            )
        }
    }

    async fn cancel_item(&self, id: String) -> CommandResult {
        let item_file = format!("{}/{}.json", self.schedule_dir, id);
        
        if !Path::new(&item_file).exists() {
            return CommandResult::error(format!("Scheduled item with ID '{}' not found", id));
        }

        // Read item details before deletion
        let (message, type_str) = if let Ok(content) = fs::read_to_string(&item_file) {
            if let Ok(item) = serde_json::from_str::<ScheduledItem>(&content) {
                let type_str = match item.item_type {
                    ScheduleType::Reminder => "Reminder",
                    ScheduleType::Alarm => "Alarm",
                };
                (item.message, type_str.to_string())
            } else {
                ("Unknown".to_string(), "Item".to_string())
            }
        } else {
            ("Unknown".to_string(), "Item".to_string())
        };

        match fs::remove_file(&item_file) {
            Ok(_) => {
                CommandResult::success(format!("{} '{}' cancelled successfully", type_str, message))
            }
            Err(e) => CommandResult::error(format!("Failed to cancel scheduled item: {}", e)),
        }
    }

    fn parse_time(&self, time_str: &str) -> Result<DateTime<Utc>, String> {
        let now = Local::now();
        
        // Try different time formats
        
        // Format: "15:30" (today)
        if let Ok(time) = NaiveDateTime::parse_from_str(&format!("{} {}", now.format("%Y-%m-%d"), time_str), "%Y-%m-%d %H:%M") {
            let local_dt = Local.from_local_datetime(&time).single()
                .ok_or("Invalid local time")?;
            return Ok(local_dt.with_timezone(&Utc));
        }
        
        // Format: "2024-01-01 15:30"
        if let Ok(time) = NaiveDateTime::parse_from_str(time_str, "%Y-%m-%d %H:%M") {
            let local_dt = Local.from_local_datetime(&time).single()
                .ok_or("Invalid local time")?;
            return Ok(local_dt.with_timezone(&Utc));
        }
        
        // Format: "01-01 15:30" (this year)
        if let Ok(time) = NaiveDateTime::parse_from_str(&format!("{} {}", now.format("%Y"), time_str), "%Y %m-%d %H:%M") {
            let local_dt = Local.from_local_datetime(&time).single()
                .ok_or("Invalid local time")?;
            return Ok(local_dt.with_timezone(&Utc));
        }
        
        // Format: "tomorrow 15:30"
        if time_str.starts_with("tomorrow ") {
            let time_part = time_str.strip_prefix("tomorrow ").unwrap();
            let tomorrow = now + chrono::Duration::days(1);
            if let Ok(time) = NaiveDateTime::parse_from_str(&format!("{} {}", tomorrow.format("%Y-%m-%d"), time_part), "%Y-%m-%d %H:%M") {
                let local_dt = Local.from_local_datetime(&time).single()
                    .ok_or("Invalid local time")?;
                return Ok(local_dt.with_timezone(&Utc));
            }
        }
        
        // Format: "in 30m", "in 2h", "in 1d"
        if time_str.starts_with("in ") {
            let duration_str = time_str.strip_prefix("in ").unwrap();
            if let Some(duration) = self.parse_duration(duration_str) {
                return Ok(Utc::now() + duration);
            }
        }
        
        Err(format!("Unsupported time format: '{}'. Supported formats: 'HH:MM', 'YYYY-MM-DD HH:MM', 'tomorrow HH:MM', 'in 30m/2h/1d'", time_str))
    }
    
    fn parse_duration(&self, duration_str: &str) -> Option<chrono::Duration> {
        if duration_str.ends_with('m') {
            if let Ok(minutes) = duration_str.trim_end_matches('m').parse::<i64>() {
                return Some(chrono::Duration::minutes(minutes));
            }
        } else if duration_str.ends_with('h') {
            if let Ok(hours) = duration_str.trim_end_matches('h').parse::<i64>() {
                return Some(chrono::Duration::hours(hours));
            }
        } else if duration_str.ends_with('d') {
            if let Ok(days) = duration_str.trim_end_matches('d').parse::<i64>() {
                return Some(chrono::Duration::days(days));
            }
        }
        None
    }
}
