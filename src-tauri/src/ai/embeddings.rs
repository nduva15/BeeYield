// ─────────────────────────────────────────────────────────────
// Embedding Client (Gemini text-embedding-004)
//
// Converts text into 768-d float vectors for the vector store.
// ─────────────────────────────────────────────────────────────

use crate::error::BeeYieldError;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct EmbeddingClient {
    api_key: String,
    client: Client,
}

#[derive(Serialize)]
struct EmbedRequest {
    model: String,
    content: EmbedContent,
}

#[derive(Serialize)]
struct EmbedContent {
    parts: Vec<EmbedPart>,
}

#[derive(Serialize)]
struct EmbedPart {
    text: String,
}

#[derive(Deserialize)]
struct EmbedResponse {
    embedding: Option<EmbedValues>,
}

#[derive(Deserialize)]
struct EmbedValues {
    values: Vec<f32>,
}

impl EmbeddingClient {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            client: Client::new(),
        }
    }

    /// Embed a single text chunk into a 768-d vector.
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, BeeYieldError> {
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={}",
            self.api_key
        );

        let body = EmbedRequest {
            model: "models/text-embedding-004".into(),
            content: EmbedContent {
                parts: vec![EmbedPart {
                    text: text.to_string(),
                }],
            },
        };

        let resp = self
            .client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("Embedding request failed: {e}")))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let err_body = resp.text().await.unwrap_or_default();
            return Err(BeeYieldError::AIPipeline(format!(
                "Embedding API {status}: {err_body}"
            )));
        }

        let api_resp: EmbedResponse = resp
            .json()
            .await
            .map_err(|e| BeeYieldError::AIPipeline(format!("Embedding parse error: {e}")))?;

        api_resp
            .embedding
            .map(|e| e.values)
            .ok_or_else(|| BeeYieldError::AIPipeline("No embedding returned".into()))
    }

    /// Batch-embed multiple texts. Calls the API sequentially
    /// (the Gemini embedding endpoint doesn't support true batching).
    pub async fn embed_batch(&self, texts: &[String]) -> Result<Vec<Vec<f32>>, BeeYieldError> {
        let mut results = Vec::with_capacity(texts.len());
        for text in texts {
            results.push(self.embed(text).await?);
        }
        Ok(results)
    }
}
