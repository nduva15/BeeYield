// ─────────────────────────────────────────────────────────────
// Gemini 2.0 Flash Client
//
// Uses the generativelanguage.googleapis.com REST API directly.
// Supports the 2-million-token context window for bulk analysis.
// ─────────────────────────────────────────────────────────────

use crate::error::BeeYieldError;
use crate::models::TokenUsage;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct GeminiClient {
    api_key: String,
    model: String,
    client: Client,
}

/// Internal response envelope from Gemini REST API.
#[derive(Debug, Deserialize)]
struct GeminiApiResponse {
    candidates: Option<Vec<GeminiCandidate>>,
    #[serde(rename = "usageMetadata")]
    usage_metadata: Option<GeminiUsage>,
}

#[derive(Debug, Deserialize)]
struct GeminiCandidate {
    content: GeminiContent,
}

#[derive(Debug, Deserialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Debug, Deserialize)]
struct GeminiPart {
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GeminiUsage {
    #[serde(rename = "promptTokenCount")]
    prompt_token_count: Option<u32>,
    #[serde(rename = "candidatesTokenCount")]
    candidates_token_count: Option<u32>,
    #[serde(rename = "totalTokenCount")]
    total_token_count: Option<u32>,
}

/// What we hand back to the pipeline.
pub struct GeminiResponse {
    pub text: String,
    pub usage: TokenUsage,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiReqContent>,
    #[serde(rename = "generationConfig")]
    generation_config: GenConfig,
}

#[derive(Serialize)]
struct GeminiReqContent {
    parts: Vec<GeminiReqPart>,
}

#[derive(Serialize)]
struct GeminiReqPart {
    text: String,
}

#[derive(Serialize)]
struct GenConfig {
    temperature: f32,
    #[serde(rename = "maxOutputTokens")]
    max_output_tokens: u32,
    #[serde(rename = "topP")]
    top_p: f32,
}

impl GeminiClient {
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

    /// Send a prompt to Gemini and return the text + token counts.
    pub async fn generate(&self, prompt: &str) -> Result<GeminiResponse, BeeYieldError> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            self.model, self.api_key
        );

        let body = GeminiRequest {
            contents: vec![GeminiReqContent {
                parts: vec![GeminiReqPart {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: GenConfig {
                temperature: 0.7,
                max_output_tokens: 8192,
                top_p: 0.95,
            },
        };

        let resp = self
            .client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("Gemini request failed: {e}")))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body_text = resp.text().await.unwrap_or_default();
            return Err(BeeYieldError::AIPipeline(format!(
                "Gemini API {status}: {body_text}"
            )));
        }

        let api_resp: GeminiApiResponse = resp
            .json()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("Gemini parse error: {e}")))?;

        let text = api_resp
            .candidates
            .and_then(|c| c.into_iter().next())
            .and_then(|c| c.content.parts.into_iter().next())
            .and_then(|p| p.text)
            .unwrap_or_else(|| "(no response from Gemini)".to_string());

        let usage = api_resp
            .usage_metadata
            .map(|u| TokenUsage {
                prompt_tokens: u.prompt_token_count.unwrap_or(0),
                completion_tokens: u.candidates_token_count.unwrap_or(0),
                total_tokens: u.total_token_count.unwrap_or(0),
            })
            .unwrap_or(TokenUsage {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0,
            });

        Ok(GeminiResponse { text, usage })
    }
}
