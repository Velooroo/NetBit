use std::io::Cursor;
use rodio::{Decoder, OutputStream, Sink};
use notify_rust::Notification;
use tokio::time::{sleep, Duration};
use chrono::{DateTime, Utc};
use uuid::Uuid;

pub struct NotificationService;

impl NotificationService {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self)
    }

    pub async fn schedule_alarm(&self, id: Uuid, message: String, scheduled_time: DateTime<Utc>) {
        let now = Utc::now();
        if scheduled_time <= now {
            return;
        }

        let duration = scheduled_time.signed_duration_since(now);
        let sleep_duration = Duration::from_secs(duration.num_seconds() as u64);

        tokio::spawn(async move {
            sleep(sleep_duration).await;
            
            // Play alarm sound
            if let Err(e) = Self::play_alarm_sound().await {
                eprintln!("Failed to play alarm sound: {}", e);
            }

            // Show system notification
            if let Err(e) = Self::show_notification("NetBit Alarm", &message).await {
                eprintln!("Failed to show notification: {}", e);
            }

            println!("🔔 ALARM: {}", message);
        });
    }

    pub async fn schedule_reminder(&self, id: Uuid, message: String, scheduled_time: DateTime<Utc>) {
        let now = Utc::now();
        if scheduled_time <= now {
            return;
        }

        let duration = scheduled_time.signed_duration_since(now);
        let sleep_duration = Duration::from_secs(duration.num_seconds() as u64);

        tokio::spawn(async move {
            sleep(sleep_duration).await;
            
            // Play reminder sound (softer than alarm)
            if let Err(e) = Self::play_reminder_sound().await {
                eprintln!("Failed to play reminder sound: {}", e);
            }

            // Show system notification
            if let Err(e) = Self::show_notification("NetBit Reminder", &message).await {
                eprintln!("Failed to show notification: {}", e);
            }

            println!("📝 REMINDER: {}", message);
        });
    }

    async fn play_alarm_sound() -> Result<(), Box<dyn std::error::Error>> {
        // Generate a simple alarm beep sound
        let sample_rate = 44100;
        let duration = 1.0; // 1 second
        let frequency = 800.0; // Hz
        
        let mut samples = Vec::new();
        for i in 0..(sample_rate as f32 * duration) as usize {
            let t = i as f32 / sample_rate as f32;
            let sample = (t * frequency * 2.0 * std::f32::consts::PI).sin();
            samples.push((sample * 0.3 * i16::MAX as f32) as i16);
        }

        // Repeat the beep 3 times
        for _ in 0..3 {
            Self::play_samples(&samples).await?;
            sleep(Duration::from_millis(200)).await;
        }

        Ok(())
    }

    async fn play_reminder_sound() -> Result<(), Box<dyn std::error::Error>> {
        // Generate a softer reminder sound
        let sample_rate = 44100;
        let duration = 0.5; // 0.5 seconds
        let frequency = 600.0; // Hz
        
        let mut samples = Vec::new();
        for i in 0..(sample_rate as f32 * duration) as usize {
            let t = i as f32 / sample_rate as f32;
            let sample = (t * frequency * 2.0 * std::f32::consts::PI).sin();
            samples.push((sample * 0.2 * i16::MAX as f32) as i16);
        }

        Self::play_samples(&samples).await?;
        Ok(())
    }

    async fn play_samples(samples: &[i16]) -> Result<(), Box<dyn std::error::Error>> {
        // Convert samples to bytes for playback
        let mut bytes = Vec::new();
        for &sample in samples {
            bytes.extend_from_slice(&sample.to_le_bytes());
        }

        // Create a WAV header
        let wav_header = Self::create_wav_header(samples.len(), 44100, 1, 16);
        let mut wav_data = wav_header;
        wav_data.extend(bytes);

        // Play using rodio
        let (_stream, stream_handle) = OutputStream::try_default()?;
        let sink = Sink::try_new(&stream_handle)?;
        
        let cursor = Cursor::new(wav_data);
        let source = Decoder::new(cursor)?;
        sink.append(source);
        sink.sleep_until_end();

        Ok(())
    }

    fn create_wav_header(num_samples: usize, sample_rate: u32, channels: u16, bits_per_sample: u16) -> Vec<u8> {
        let byte_rate = sample_rate * channels as u32 * bits_per_sample as u32 / 8;
        let block_align = channels * bits_per_sample / 8;
        let data_size = num_samples * block_align as usize;
        let file_size = 36 + data_size;

        let mut header = Vec::new();
        
        // RIFF header
        header.extend(b"RIFF");
        header.extend((file_size as u32).to_le_bytes());
        header.extend(b"WAVE");
        
        // fmt chunk
        header.extend(b"fmt ");
        header.extend(16u32.to_le_bytes()); // chunk size
        header.extend(1u16.to_le_bytes()); // audio format (PCM)
        header.extend(channels.to_le_bytes());
        header.extend(sample_rate.to_le_bytes());
        header.extend(byte_rate.to_le_bytes());
        header.extend(block_align.to_le_bytes());
        header.extend(bits_per_sample.to_le_bytes());
        
        // data chunk
        header.extend(b"data");
        header.extend((data_size as u32).to_le_bytes());
        
        header
    }

    async fn show_notification(title: &str, message: &str) -> Result<(), Box<dyn std::error::Error>> {
        Notification::new()
            .summary(title)
            .body(message)
            .icon("dialog-information")
            .timeout(5000) // 5 seconds
            .show()?;
        
        Ok(())
    }

    pub fn play_startup_sound(&self) {
        // Play a pleasant startup sound
        tokio::spawn(async {
            if let Err(e) = Self::play_startup_tone().await {
                eprintln!("Failed to play startup sound: {}", e);
            }
        });
    }

    async fn play_startup_tone() -> Result<(), Box<dyn std::error::Error>> {
        let sample_rate = 44100;
        let duration = 0.3;
        
        // Play a pleasant chord (C major)
        let frequencies = [261.63, 329.63, 392.00]; // C, E, G
        let mut samples = Vec::new();
        
        for i in 0..(sample_rate as f32 * duration) as usize {
            let t = i as f32 / sample_rate as f32;
            let mut sample = 0.0;
            
            for &freq in &frequencies {
                sample += (t * freq * 2.0 * std::f32::consts::PI).sin() / 3.0;
            }
            
            samples.push((sample * 0.1 * i16::MAX as f32) as i16);
        }

        Self::play_samples(&samples).await?;
        Ok(())
    }
}
