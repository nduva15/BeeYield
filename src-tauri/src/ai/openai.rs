// ─────────────────────────────────────────────────────────────
// OpenAI GPT-4o Client (Stage 3 — Synthesis Writer)
// ─────────────────────────────────────────────────────────────

use crate::error::BeeYieldError;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct OpenAIClient {
    api_key: String,
    model: String,
    client: Client,
}

pub struct OpenAIResponse {
    pub text: String,
}

// ── Request types ────────────────────────────────────────────

#[derive(Serialize)]
struct ChatRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f32,
    max_tokens: u32,
}

#[derive(Serialize)]
struct ChatMessage {
    role: String,
    content: String,
}

// ── Response types ───────────────────────────────────────────

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<ChatChoice>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: ChatRespMessage,
}

#[derive(Deserialize)]
struct ChatRespMessage {
    content: Option<String>,
}

impl OpenAIClient {
    pub fn new(api_key: String, model: String) -> Self {
        Self {
            api_key,
            model,
            client: Client::new(),
        }
    }

    pub fn model(&self) -> &str {
        &self.model
    }

    pub async fn generate(&self, prompt: &str) -> Result<OpenAIResponse, BeeYieldError> {
        let body = ChatRequest {
            model: self.model.clone(),
            messages: vec![
                ChatMessage {
                    role: "system".into(),
                    content: "You are a senior report writer for BeeYield, \
                              a honey traceability and precision pollination \
                              platform serving farmers in Kibwezi, Kenya. \
                              Write clear, professional, data-driven reports."
                        .into(),
                },
                ChatMessage {
                    role: "user".into(),
                    content: prompt.to_string(),
                },
            ],
            temperature: 0.4,
            max_tokens: 4096,
        };

        let resp = self
            .client
            .post("https://api.openai.com/v1/chat/completions")
            .bearer_auth(&self.api_key)
            .json(&body)
            .send()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("OpenAI request failed: {e}")))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body_text = resp.text().await.unwrap_or_default();
            return Err(BeeYieldError::AIPipeline(format!(
                "OpenAI API {status}: {body_text}"
            )));
        }

        let api_resp: ChatResponse = resp
            .json()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("OpenAI parse error: {e}")))?;

        let text = api_resp
            .choices
            .into_iter()
            .next()
            .and_then(|c| c.message.content)
            .unwrap_or_else(|| "(no response from OpenAI)".to_string());

        Ok(OpenAIResponse { text })
    }
}
