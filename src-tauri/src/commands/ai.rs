// ─────────────────────────────────────────────────────────────
// Tauri Commands — AI Pipeline
// ─────────────────────────────────────────────────────────────

use crate::error::{CmdResult, CommandError};
use crate::models::*;
use crate::AppState;
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

/// Ask BeeYield AI a question. Runs the full RAG pipeline:
/// embed → vector search → Gemini analysis → GPT-4o synthesis.
#[tauri::command]
pub async fn ask_beeyield(
    state: State<'_, Arc<RwLock<AppState>>>,
    query: AIQuery,
) -> CmdResult<AIResponse> {
    let app = state.read().await;
    let limit = query.context_limit.unwrap_or(10);

    // Stage 1: Vector retrieval
    let embedding = app
        .ai_pipeline
        .embed(&query.question)
        .await
        .map_err(CommandError::from)?;

    let context = app
        .vector_store
        .search(&embedding, limit)
        .map_err(CommandError::from)?;

    // Stage 2 + 3: Gemini → GPT-4o
    let response = app
        .ai_pipeline
        .ask(&query, &context)
        .await
        .map_err(CommandError::from)?;

    Ok(response)
}

/// Analyze hive sensor data for health assessment.
#[tauri::command]
pub async fn analyze_hive_data(
    state: State<'_, Arc<RwLock<AppState>>>,
    request: HiveAnalysisRequest,
) -> CmdResult<AIResponse> {
    let app = state.read().await;

    let response = app
        .ai_pipeline
        .analyze_hive(&request)
        .await
        .map_err(CommandError::from)?;

    Ok(response)
}

/// Generate a structured report (harvest summary, market analysis, etc.).
#[tauri::command]
pub async fn generate_report(
    state: State<'_, Arc<RwLock<AppState>>>,
    request: ReportRequest,
) -> CmdResult<AIResponse> {
    let app = state.read().await;

    let prompt = match request.report_type {
        ReportType::HiveHealth => {
            "Generate a comprehensive hive health report for the specified period. \
             Include colony strength indicators, disease risk assessment, queen status, \
             and recommended interventions."
        }
        ReportType::HarvestSummary => {
            "Generate a harvest summary report with yield analysis, quality metrics, \
             batch traceability verification, and comparison to previous seasons."
        }
        ReportType::PollinationEfficiency => {
            "Generate a pollination efficiency report analyzing bee flight patterns, \
             crop coverage, cross-pollination rates, and improvement recommendations."
        }
        ReportType::MarketAnalysis => {
            "Generate a market analysis report covering current honey prices in Kenya, \
             demand trends, export opportunities, and competitive positioning."
        }
        ReportType::TraceabilityAudit => {
            "Generate a full traceability audit report verifying HoneyChain integrity, \
             batch code completeness, and compliance with food safety standards."
        }
    };

    let query = AIQuery {
        question: prompt.to_string(),
        context_limit: Some(20),
        include_sources: Some(true),
        model_override: None,
    };

    // Get context from knowledge lake
    let embedding = app
        .ai_pipeline
        .embed(prompt)
        .await
        .map_err(CommandError::from)?;

    let context = app
        .vector_store
        .search(&embedding, 20)
        .map_err(CommandError::from)?;

    let response = app
        .ai_pipeline
        .ask(&query, &context)
        .await
        .map_err(CommandError::from)?;

    Ok(response)
}
