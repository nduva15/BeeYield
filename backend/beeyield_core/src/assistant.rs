//! AI Assistant Engine — Port of `ai_assistant.py`
//!
//! Handles:
//!   - Intent Detection (Keyword-based)
//!   - Temperature selection based on intent
//!   - System prompt assembly
//!   - Response sanitization & formatting
//!
//! Architecture:
//!   Rust manages the prompt templates and intent classifications.
//!   Python handles the async HTTP calls to Gemini and DB/Blockchain retrieval.

use pyo3::prelude::*;
use std::collections::HashMap;

#[pyclass]
pub struct Assistant {
    intents: HashMap<String, Vec<String>>,
}

#[pymethods]
impl Assistant {
    #[new]
    pub fn new() -> Self {
        let mut intents = HashMap::new();
        let map = [
            ("product_search", vec!["buy", "purchase", "order", "shop", "honey", "price", "cost", "product", "available", "stock", "store"]),
            ("order_status", vec!["order", "tracking", "delivery", "shipment", "status", "where is my"]),
            ("trace_honey", vec!["trace", "origin", "source", "batch", "verify", "authenticate", "qr", "honeychain"]),
            ("iot_data", vec!["sensor", "temperature", "humidity", "weight", "telemetry", "iot", "monitoring", "data"]),
            ("hive_health", vec!["health", "disease", "sick", "varroa", "mite", "infection", "anomaly", "symptom", "treatment", "cure", "prevention", "pest"]),
            ("greeting", vec!["hello", "hi", "hey", "jambo", "habari", "natta", "bonjour", "hallo", "hola"]),
            ("harvest_logs", vec!["harvest", "yield", "production", "bottles", "jars", "collected", "volume"]),
        ];

        for (k, v) in map {
            intents.insert(k.to_string(), v.into_iter().map(|s| s.to_string()).collect());
        }
        
        Self { intents }
    }

    /// Detect intents from a user message.
    fn detect_intents(&self, message: &str) -> Vec<String> {
        let msg_lower = message.to_lowercase();
        let mut detected = Vec::new();

        for (intent, keywords) in &self.intents {
            for kw in keywords {
                if msg_lower.contains(kw) {
                    detected.push(intent.clone());
                    break;
                }
            }
        }

        if detected.is_empty() {
            detected.push("general".to_string());
        }
        detected
    }

    /// Determine optimal temperature for the LLM.
    fn get_temperature(&self, intents: Vec<String>) -> f64 {
        let creative = ["greeting", "farewell", "about_beeyield"];
        let factual = ["trace_honey", "order_status", "iot_data", "product_search", "harvest_logs"];

        if intents.iter().any(|i| creative.contains(&i.as_str())) {
            0.7
        } else if intents.iter().any(|i| factual.contains(&i.as_str())) {
            0.1
        } else {
            0.4
        }
    }

    /// Assemble the system prompt with grounding context.
    #[pyo3(signature = (language, user_role, user_name, intents, context_data))]
    fn build_system_prompt(
        &self,
        language: &str,
        user_role: &str,
        user_name: Option<&str>,
        intents: Vec<String>,
        context_data: &str,
    ) -> String {
        let name_str = match user_name {
            Some(name) => format!(" named {}", name),
            None => "".to_string(),
        };

        format!(
            "SYSTEM ROLE: You are the BeeYield Assistant. Your purpose is to handle traceability, shop orders, and apiary diagnostics.\n\
            \n\
            RESPONSE LANGUAGE: {}\n\
            USER CONTEXT: {} user{}\n\
            DETECTED INTENTS: {}\n\
            \n\
            DATA CONTEXT:\n\
            {}\n\
            \n\
            ════════════════════════════════════════\n\
            GUIDELINES:\n\
            1. ACCURACY: Use ONLY the data provided. Never hallucinate.\n\
            2. FORMATTING: Use headers (##) and bold text for clarity.\n\
            3. BRAND: Professional and expert voice.\n\
            4. ACTIONABLE: Conclude with specific next steps.",
            language, user_role, name_str, intents.join(", "), context_data
        )
    }

    /// Sanitize and format the AI response.
    fn format_response(&self, text: &str) -> String {
        let mut formatted = text.trim()
            .replace("HoneyBee Corp", "BeeYield")
            .replace("YieldBee", "BeeYield");
        
        // Ensure at least two paragraphs if not present
        if !formatted.contains("\n\n") && formatted.len() > 100 {
            if let Some(pos) = formatted.chars().position(|c| c == '.' || c == '!' || c == '?') {
                if pos < formatted.len() - 1 {
                    formatted.insert_str(pos + 1, "\n\n");
                }
            }
        }
        formatted
    }
}

#[pyclass]
pub struct IntentDetector;

#[pymethods]
impl IntentDetector {
    #[staticmethod]
    fn detect(message: &str) -> Vec<String> {
        let ai = Assistant::new();
        ai.detect_intents(message)
    }

    #[staticmethod]
    fn get_temperature(intents: Vec<String>) -> f64 {
        let ai = Assistant::new();
        ai.get_temperature(intents)
    }
}
