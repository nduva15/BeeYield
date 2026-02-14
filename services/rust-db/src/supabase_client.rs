/// Supabase REST client — connection-pooled HTTP client for all CRUD operations.
/// Zero hardcoded data. All operations are pure pass-through to Supabase PostgREST.
use reqwest::{Client, StatusCode};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;

use crate::config::Config;
use crate::models::{
    DbDeleteRequest, DbInsertRequest, DbResponse, DbSelectRequest,
    DbUpdateRequest, DbUpsertRequest, DbGetByIdRequest,
};

pub struct SupabaseClient {
    client: Client,
    config: Arc<Config>,
}

impl SupabaseClient {
    pub fn new(config: Arc<Config>) -> Self {
        let client = Client::builder()
            .pool_max_idle_per_host(10)
            .pool_idle_timeout(std::time::Duration::from_secs(30))
            .timeout(std::time::Duration::from_secs(15))
            .build()
            .expect("Failed to build HTTP client");

        SupabaseClient { client, config }
    }

    /// Build headers for a request, using optional bearer token override.
    fn build_headers(&self, token: Option<&str>, prefer: Option<&str>) -> reqwest::header::HeaderMap {
        let mut headers = reqwest::header::HeaderMap::new();
        let auth_key = self.config.auth_key();

        headers.insert("apikey", auth_key.parse().unwrap());
        headers.insert(
            "Authorization",
            format!("Bearer {}", token.unwrap_or(auth_key))
                .parse()
                .unwrap(),
        );
        headers.insert("Content-Type", "application/json".parse().unwrap());
        headers.insert(
            "Prefer",
            prefer
                .unwrap_or("return=representation")
                .parse()
                .unwrap(),
        );

        headers
    }

    /// INSERT — POST to table
    pub async fn insert(&self, req: &DbInsertRequest) -> DbResponse {
        let url = format!("{}/{}", self.config.rest_url(), req.table);
        let headers = self.build_headers(req.token.as_deref(), None);

        match self.client.post(&url).headers(headers).json(&req.data).send().await {
            Ok(resp) => {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                if status == StatusCode::OK || status == StatusCode::CREATED {
                    let data: Value = serde_json::from_str(&body).unwrap_or(Value::Null);
                    DbResponse::success(data)
                } else {
                    DbResponse::error(body)
                }
            }
            Err(e) => DbResponse::error(e.to_string()),
        }
    }

    /// SELECT — GET from table with filters & ordering
    pub async fn select(&self, req: &DbSelectRequest) -> Value {
        let url = format!("{}/{}", self.config.rest_url(), req.table);
        let headers = self.build_headers(req.token.as_deref(), None);

        let mut params: Vec<(String, String)> = vec![
            ("select".to_string(), req.columns.clone().unwrap_or_else(|| "*".to_string())),
            ("limit".to_string(), req.limit.unwrap_or(100).to_string()),
        ];

        // Apply filters
        if let Some(ref filters) = req.filters {
            for (key, value) in filters {
                let filter_val = if let Some(s) = value.as_str() {
                    // Check if it already has an operator prefix
                    let has_operator = ["eq.", "neq.", "gt.", "lt.", "gte.", "lte.",
                        "like.", "ilike.", "is.", "in.", "cs.", "cd."]
                        .iter()
                        .any(|op| s.starts_with(op));
                    if has_operator {
                        s.to_string()
                    } else {
                        format!("eq.{}", s)
                    }
                } else if let Some(arr) = value.as_array() {
                    let vals: Vec<String> = arr
                        .iter()
                        .map(|v| v.as_str().map(|s| s.to_string()).unwrap_or_else(|| v.to_string()))
                        .collect();
                    format!("in.({})", vals.join(","))
                } else {
                    format!("eq.{}", value)
                };
                params.push((key.clone(), filter_val));
            }
        }

        // Apply ordering
        if let Some(ref order_by) = req.order_by {
            let direction = if req.ascending.unwrap_or(true) { "asc" } else { "desc" };
            params.push(("order".to_string(), format!("{}.{}", order_by, direction)));
        }

        match self
            .client
            .get(&url)
            .headers(headers)
            .query(&params)
            .send()
            .await
        {
            Ok(resp) => {
                if resp.status() == StatusCode::OK {
                    resp.json::<Value>().await.unwrap_or(Value::Array(vec![]))
                } else {
                    let err = resp.text().await.unwrap_or_default();
                    log::error!("DB Select Error for {}: {}", req.table, err);
                    Value::Array(vec![])
                }
            }
            Err(e) => {
                log::error!("DB Select Exception for {}: {}", req.table, e);
                Value::Array(vec![])
            }
        }
    }

    /// UPDATE — PATCH table with filters
    pub async fn update(&self, req: &DbUpdateRequest) -> DbResponse {
        let url = format!("{}/{}", self.config.rest_url(), req.table);
        let headers = self.build_headers(req.token.as_deref(), None);

        let mut params: Vec<(String, String)> = vec![];
        for (key, value) in &req.filters {
            params.push((key.clone(), format!("eq.{}", value)));
        }

        match self
            .client
            .patch(&url)
            .headers(headers)
            .query(&params)
            .json(&req.data)
            .send()
            .await
        {
            Ok(resp) => {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                if status == StatusCode::OK || status == StatusCode::NO_CONTENT {
                    let data: Value = serde_json::from_str(&body).unwrap_or(Value::Array(vec![]));
                    DbResponse::success(data)
                } else {
                    DbResponse::error(body)
                }
            }
            Err(e) => DbResponse::error(e.to_string()),
        }
    }

    /// DELETE — DELETE from table with filters
    pub async fn delete(&self, req: &DbDeleteRequest) -> DbResponse {
        let url = format!("{}/{}", self.config.rest_url(), req.table);
        let headers = self.build_headers(req.token.as_deref(), None);

        let mut params: Vec<(String, String)> = vec![];
        for (key, value) in &req.filters {
            params.push((key.clone(), format!("eq.{}", value)));
        }

        match self
            .client
            .delete(&url)
            .headers(headers)
            .query(&params)
            .send()
            .await
        {
            Ok(resp) => {
                let status = resp.status();
                if status == StatusCode::OK || status == StatusCode::NO_CONTENT {
                    DbResponse::success(Value::Null)
                } else {
                    let body = resp.text().await.unwrap_or_default();
                    DbResponse::error(body)
                }
            }
            Err(e) => DbResponse::error(e.to_string()),
        }
    }

    /// UPSERT — POST with merge-duplicates
    pub async fn upsert(&self, req: &DbUpsertRequest) -> DbResponse {
        let url = format!("{}/{}", self.config.rest_url(), req.table);
        let headers = self.build_headers(
            req.token.as_deref(),
            Some("resolution=merge-duplicates,return=representation"),
        );

        match self.client.post(&url).headers(headers).json(&req.data).send().await {
            Ok(resp) => {
                let status = resp.status();
                let body = resp.text().await.unwrap_or_default();
                if status == StatusCode::OK || status == StatusCode::CREATED {
                    let data: Value = serde_json::from_str(&body).unwrap_or(Value::Null);
                    DbResponse::success(data)
                } else {
                    DbResponse::error(body)
                }
            }
            Err(e) => DbResponse::error(e.to_string()),
        }
    }

    /// GET BY ID — Select a single record
    pub async fn get_by_id(&self, req: &DbGetByIdRequest) -> Value {
        let id_column = req.id_column.as_deref().unwrap_or("id");
        let select_req = DbSelectRequest {
            table: req.table.clone(),
            columns: Some("*".to_string()),
            filters: Some(HashMap::from([(
                id_column.to_string(),
                Value::String(req.id.clone()),
            )])),
            limit: Some(1),
            order_by: None,
            ascending: None,
            token: req.token.clone(),
        };
        let results = self.select(&select_req).await;
        if let Some(arr) = results.as_array() {
            arr.first().cloned().unwrap_or(Value::Null)
        } else {
            Value::Null
        }
    }
}
