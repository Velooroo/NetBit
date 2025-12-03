//! Сервисная логика аутентификации

use actix_web::HttpRequest;
use base64::{engine::general_purpose, Engine as _};
use chrono::{Duration, Utc};
use log::error;
use rand::distr::{Alphanumeric, SampleString};
use rand::rng;
use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::core::{database::Database, security::jwt::Claims};
use crate::domain::{auth::RefreshToken, users::User};

const ACCESS_TOKEN_TTL_HOURS: i64 = 1;
const REFRESH_TOKEN_TTL_DAYS: i64 = 30;

#[derive(Serialize, Clone)]
pub struct TokenPair {
    pub access_token: String,
    pub access_expires_in: i64,
    pub refresh_token: String,
    pub refresh_expires_in: i64,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub tokens: TokenPair,
    pub user: User,
}

pub async fn authenticate_request(req: &HttpRequest, db: &Database) -> Option<User> {
    if let Some(user) = verify_jwt_token(req, db).await {
        return Some(user);
    }

    check_basic_auth(req, db).await
}

pub async fn issue_tokens(
    user: &User,
    db: &Database,
    user_agent: Option<String>,
    ip: Option<String>,
) -> Result<TokenPair, String> {
    let user_id = user.id.ok_or_else(|| "User must have id".to_string())?;
    let access_claims = Claims::new(
        user_id,
        user.username.clone(),
        user.email.clone(),
        ACCESS_TOKEN_TTL_HOURS,
    );

    let access_token = access_claims.encode().map_err(|e| {
        error!("Failed to generate JWT token: {}", e);
        "Failed to generate token".to_string()
    })?;

    let refresh_raw = generate_refresh_token();
    let refresh_hash = hash_refresh_token(&refresh_raw);
    let now = Utc::now();
    let refresh = RefreshToken {
        id: uuid::Uuid::new_v4(),
        user_id,
        token_hash: refresh_hash,
        created_at: now,
        expires_at: now + Duration::days(REFRESH_TOKEN_TTL_DAYS),
        revoked_at: None,
        user_agent,
        ip_address: ip,
    };

    refresh.insert(db.get_pool()).await.map_err(|e| {
        error!("Failed to persist refresh token: {}", e);
        "Failed to persist refresh token".to_string()
    })?;

    Ok(TokenPair {
        access_token,
        access_expires_in: ACCESS_TOKEN_TTL_HOURS * 3600,
        refresh_token: refresh_raw,
        refresh_expires_in: REFRESH_TOKEN_TTL_DAYS * 24 * 3600,
    })
}

pub async fn rotate_refresh_token(
    refresh_token: &str,
    db: &Database,
    user_agent: Option<String>,
    ip: Option<String>,
) -> Result<(User, TokenPair), String> {
    let pool = db.get_pool();
    let token_hash = hash_refresh_token(refresh_token);

    let stored = RefreshToken::find_active_by_hash(&token_hash, pool)
        .await
        .map_err(|e| {
            error!("Failed to fetch refresh token: {}", e);
            "Failed to fetch refresh token".to_string()
        })?
        .ok_or_else(|| "Invalid refresh token".to_string())?;

    let user = User::find_by_id(stored.user_id, pool)
        .await
        .map_err(|e| {
            error!("Failed to fetch user for refresh token: {}", e);
            "Failed to fetch user".to_string()
        })?
        .ok_or_else(|| "User not found".to_string())?;

    stored.revoke(pool).await.map_err(|e| {
        error!("Failed to revoke refresh token: {}", e);
        "Failed to revoke token".to_string()
    })?;

    let tokens = issue_tokens(&user, db, user_agent, ip).await?;

    Ok((user, tokens))
}

pub async fn revoke_all_sessions(user_id: i64, db: &Database) -> Result<(), String> {
    RefreshToken::revoke_all_for_user(user_id, db.get_pool())
        .await
        .map_err(|e| {
            error!("Failed to revoke sessions: {}", e);
            "Failed to revoke sessions".to_string()
        })
}

pub async fn revoke_single_session(refresh_token: &str, db: &Database) -> Result<(), String> {
    let pool = db.get_pool();
    let token_hash = hash_refresh_token(refresh_token);

    if let Some(stored) = RefreshToken::find_active_by_hash(&token_hash, pool)
        .await
        .map_err(|e| {
            error!("Failed to fetch refresh token: {}", e);
            "Failed to fetch refresh token".to_string()
        })?
    {
        stored.revoke(pool).await.map_err(|e| {
            error!("Failed to revoke refresh token: {}", e);
            "Failed to revoke token".to_string()
        })?;
    }

    Ok(())
}

pub fn extract_token_from_header(req: &HttpRequest) -> Option<String> {
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;
    match auth_str.strip_prefix("Bearer ") {
        Some(token) => Some(token.to_string()),
        None => None,
    }
}

pub async fn verify_jwt_token(req: &HttpRequest, db: &Database) -> Option<User> {
    let token = extract_token_from_header(req)?;
    let claims = Claims::decode(&token).ok()?;

    if claims.exp < Utc::now().timestamp() {
        return None;
    }

    let pool = db.get_pool();
    User::find_by_id(claims.user_id, pool).await.ok().flatten()
}

pub async fn check_basic_auth(req: &HttpRequest, db: &Database) -> Option<User> {
    let auth_header = req.headers().get("Authorization")?;
    let auth_str = auth_header.to_str().ok()?;

    if !auth_str.starts_with("Basic ") {
        return None;
    }

    let decoded = general_purpose::STANDARD
        .decode(auth_str.trim_start_matches("Basic "))
        .ok()?;
    let decoded_str = String::from_utf8(decoded).ok()?;
    let mut parts = decoded_str.splitn(2, ':');
    let username = parts.next()?;
    let password = parts.next()?;

    User::authenticate(username, password, db.get_pool())
        .await
        .ok()
        .flatten()
}

fn generate_refresh_token() -> String {
    let mut rng = rng();
    Alphanumeric.sample_string(&mut rng, 64)
}

fn hash_refresh_token(token: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    format!("{:x}", hasher.finalize())
}
