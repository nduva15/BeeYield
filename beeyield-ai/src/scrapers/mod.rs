//! Scraper modules for different academic sources

pub mod pubmed;
pub mod core_ac;
pub mod wikipedia;
pub mod gutenberg;
pub mod hub;
pub mod researchgate;
pub mod usda;
pub mod biorxiv;
pub mod arxiv;
pub mod semantic_scholar;

use async_trait::async_trait;
use anyhow::Result;
use serde::{Deserialize, Serialize};

/// A scraped document from any source
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    /// Unique identifier from source
    pub id: String,
    /// Document title
    pub title: String,
    /// Raw text content
    pub content: String,
    /// Source name (pubmed, core, wikipedia, gutenberg)
    pub source: String,
    /// URL if available
    pub url: Option<String>,
    /// Publication date if available
    pub date: Option<String>,
    /// Authors if available
    pub authors: Option<Vec<String>>,
    /// Abstract if separate from content
    pub abstract_text: Option<String>,
    /// Geo-Tagging: Location identifier (e.g., Ethiopia, Kenya, UK)
    pub location_id: Option<String>,
    /// Subspecies focus (e.g., A.m. simensis, A.m. scutellata)
    pub subspecies: Option<String>,
    /// Temporal weighting (higher for newer research)
    pub temporal_weight: f32,
    /// Authority ranking (official bodies vs. community posts)
    pub authority_ranking: i32,
}

/// Trait for all scrapers
#[async_trait]
pub trait Scraper: Send + Sync {
    /// Scrape documents matching the query
    async fn scrape(&self, query: Option<&str>, max_docs: usize) -> Result<Vec<Document>>;
    
    /// Get the source name
    fn source_name(&self) -> &'static str;
}
