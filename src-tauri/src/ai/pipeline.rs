// ─────────────────────────────────────────────────────────────
// Multi-Model AI Pipeline
//
// Stage 1 (Retrieval):  Vector store search  — < 100 ms
// Stage 2 (Analysis):   Gemini 2.0 Flash     — 2M token window
// Stage 3 (Synthesis):  GPT-4o writer        — polished output
//
// Falls back to Gemini-only if OpenAI key is absent.
// ─────────────────────────────────────────────────────────────

use crate::config::AppConfig;
use crate::error::BeeYieldError;
use crate::models::*;
use std::time::Instant;

pub struct AIPipeline {
    gemini: super::gemini::GeminiClient,
    openai: Option<super::openai::OpenAIClient>,
    embedder: super::embeddings::EmbeddingClient,
}

impl AIPipeline {
    pub fn new(config: AppConfig) -> Self {
        let gemini = super::gemini::GeminiClient::new(
            config.gemini_api_key.clone(),
            config.gemini_model.clone(),
        );

        let openai = config.openai_api_key.as_ref().map(|key| {
            super::openai::OpenAIClient::new(key.clone(), config.openai_model.clone())
        });

        let embedder = super::embeddings::EmbeddingClient::new(config.gemini_api_key.clone());

        tracing::info!(
            "AI Pipeline ready — Gemini: {}, OpenAI: {}",
            config.gemini_model,
            if openai.is_some() {
                &config.openai_model
            } else {
                "disabled"
            }
        );

        Self {
            gemini,
            openai,
            embedder,
        }
    }

    /// Full RAG pipeline: embed query → search → analyze → synthesize.
    pub async fn ask(
        &self,
        query: &AIQuery,
        context_chunks: &[SearchResult],
    ) -> Result<AIResponse, BeeYieldError> {
        let start = Instant::now();

        // ── Stage 2: Gemini Analysis ─────────────────────
        let context_text = context_chunks
            .iter()
            .enumerate()
            .map(|(i, c)| {
                format!(
                    "[Source {}] {}\n{}\n---",
                    i + 1,
                    c.title,
                    c.content
                )
            })
            .collect::<Vec<_>>()
            .join("\n\n");

        let gemini_prompt = format!(
            "You are BeeYield AI, an expert in honey traceability, \
             precision pollination, and apiculture for Kibwezi, Kenya.\n\n\
             ## Knowledge Base Context\n{}\n\n\
             ## User Question\n{}\n\n\
             Provide a thorough, structured analysis with actionable insights. \
             Use headers, bullet points, and data references where applicable.",
            context_text, query.question
        );

        let gemini_response = self
            .gemini
            .generate(&gemini_prompt)
            .await?;

        // ── Stage 3: GPT-4o Synthesis (if available) ─────
        let (final_answer, model_used) = if let Some(ref openai) = self.openai {
            let synthesis_prompt = format!(
                "You are a senior report writer for BeeYield, a honey \
                 traceability platform in Kenya. Take the following analysis \
                 from our AI analyst and rewrite it into a polished, \
                 professional report. Preserve all data and insights but \
                 improve clarity, structure, and readability.\n\n\
                 ## Raw Analysis\n{}\n\n\
                 ## Original Question\n{}\n\n\
                 Write the final report now.",
                gemini_response.text, query.question
            );

            match openai.generate(&synthesis_prompt).await {
                Ok(resp) => (resp.text, format!("gemini+{}", self.openai.as_ref().map(|o| o.model()).unwrap_or("gpt-4o"))),
                Err(e) => {
                    tracing::warn!("OpenAI synthesis failed, using Gemini output: {e}");
                    (gemini_response.text, self.gemini.model().to_string())
                }
            }
        } else {
            (gemini_response.text, self.gemini.model().to_string())
        };

        let latency = start.elapsed().as_millis() as u64;

        Ok(AIResponse {
            answer: final_answer,
            sources: context_chunks.to_vec(),
            model_used,
            tokens_used: gemini_response.usage,
            latency_ms: latency,
        })
    }

    /// Produce an embedding vector for the given text.
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, BeeYieldError> {
        self.embedder.embed(text).await
    }

    /// Analyze hive sensor data and return health assessment.
    pub async fn analyze_hive(
        &self,
        request: &HiveAnalysisRequest,
    ) -> Result<AIResponse, BeeYieldError> {
        let start = Instant::now();

        let sensor_summary = request
            .sensor_data
            .iter()
            .map(|r| {
                format!(
                    "{}: temp={:.1}°C, humidity={:.1}%, weight={:.1}kg, sound={:.1}dB",
                    r.timestamp.format("%Y-%m-%d %H:%M"),
                    r.temperature.unwrap_or(0.0),
                    r.humidity.unwrap_or(0.0),
                    r.weight.unwrap_or(0.0),
                    r.sound_level.unwrap_or(0.0),
                )
            })
            .collect::<Vec<_>>()
            .join("\n");

        let prompt = format!(
            "You are BeeYield AI, a hive health specialist for Kibwezi, Kenya.\n\n\
             ## Hive: {}\n## Sensor Data (last {} days)\n{}\n\n\
             Provide:\n\
             1. Overall health score (1-100)\n\
             2. Key anomalies detected\n\
             3. Recommended actions\n\
             4. Predicted honey yield trend\n\
             5. Queen status assessment",
            request.hive_id,
            request.period_days.unwrap_or(7),
            sensor_summary
        );

        let resp = self.gemini.generate(&prompt).await?;

        Ok(AIResponse {
            answer: resp.text,
            sources: vec![],
            model_used: self.gemini.model().to_string(),
            tokens_used: resp.usage,
            latency_ms: start.elapsed().as_millis() as u64,
        })
    }
}
