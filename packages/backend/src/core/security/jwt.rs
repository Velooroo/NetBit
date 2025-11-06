//! JWT утилиты

use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::LazyLock;

use crate::core::config::load_config;

static JWT_SECRET: LazyLock<String> = LazyLock::new(|| load_config().jwt_secret);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub user_id: i64,
    pub username: String,
    pub email: Option<String>,
    pub exp: i64,
    pub iat: i64,
}

impl Claims {
    pub fn new(user_id: i64, username: String, email: Option<String>, ttl_hours: i64) -> Self {
        let now = Utc::now();
        let exp = now + Duration::hours(ttl_hours);
        Self {
            user_id,
            username,
            email,
            exp: exp.timestamp(),
            iat: now.timestamp(),
        }
    }

    pub fn encode(&self) -> Result<String, jsonwebtoken::errors::Error> {
        encode(
            &Header::new(Algorithm::HS256),
            self,
            &EncodingKey::from_secret(JWT_SECRET.as_bytes()),
        )
    }

    pub fn decode(token: &str) -> Result<Self, jsonwebtoken::errors::Error> {
        decode::<Claims>(
            token,
            &DecodingKey::from_secret(JWT_SECRET.as_bytes()),
            &Validation::new(Algorithm::HS256),
        )
        .map(|data| data.claims)
    }
}
