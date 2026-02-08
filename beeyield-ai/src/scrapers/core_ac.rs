//! CORE.ac.uk API scraper for open-access research papers

use super::{Document, Scraper};
use anyhow::{Result, Context};
use async_trait::async_trait;
use reqwest::Client;
use serde::Deserialize;
use tracing::{info, warn};
use std::time::Duration;

const CORE_API_URL: &str = "https://api.core.ac.uk/v3/search/works";

/// CORE.ac.uk scraper for open-access papers
pub struct CoreScraper {
    client: Client,
    api_key: Option<String>,
    rate_limit_ms: u64,
}

#[derive(Debug, Deserialize)]
struct CoreResponse {
    results: Vec<CoreWork>,
    #[serde(rename = "totalHits")]
    total_hits: u64,
}

#[derive(Debug, Deserialize)]
struct CoreWork {
    id: String,
    title: Option<String>,
    #[serde(rename = "abstract")]
    abstract_text: Option<String>,
    #[serde(rename = "fullText")]
    full_text: Option<String>,
    authors: Option<Vec<CoreAuthor>>,
    #[serde(rename = "publishedDate")]
    published_date: Option<String>,
    #[serde(rename = "downloadUrl")]
    download_url: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CoreAuthor {
    name: Option<String>,
}

impl CoreScraper {
    pub fn new(api_key: Option<String>) -> Self {
        Self {
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap(),
            api_key,
            rate_limit_ms: 100, // 10 requests/second
        }
    }

    async fn search(&self, query: &str, limit: usize, offset: usize) -> Result<CoreResponse> {
        let full_query = format!("({}) AND (bee OR apis OR honeybee OR apiculture)", query);
        
        let mut request = self.client
            .get(CORE_API_URL)
            .query(&[
                ("q", &full_query),
                ("limit", &limit.to_string()),
                ("offset", &offset.to_string()),
            ]);
        
        // Add API key if available
        if let Some(ref key) = self.api_key {
            request = request.header("Authorization", format!("Bearer {}", key));
        }
        
        let response = request.send().await.context("Failed to query CORE API")?;
        
        if !response.status().is_success() {
            warn!("CORE API returned status: {}", response.status());
            return Ok(CoreResponse { results: vec![], total_hits: 0 });
        }
        
        response.json().await.context("Failed to parse CORE response")
    }
}

impl Default for CoreScraper {
    fn default() -> Self {
        // Try to get API key from environment
        Self::new(std::env::var("CORE_API_KEY").ok())
    }
}

#[async_trait]
impl Scraper for CoreScraper {
    async fn scrape(&self, query: Option<&str>, max_docs: usize) -> Result<Vec<Document>> {
        let search_query = query.unwrap_or("bee health OR varroa OR nosema OR foulbrood");
        
        info!("Searching CORE.ac.uk for: {}", search_query);
        
        let mut all_documents = Vec::new();
        let mut offset = 0;
        let page_size = 100.min(max_docs);
        
        while all_documents.len() < max_docs {
            let response = self.search(search_query, page_size, offset).await?;
            
            if response.results.is_empty() {
                break;
            }
            
            info!("Retrieved {} results (total: {})", response.results.len(), response.total_hits);
            
            for work in response.results {
                // Prefer full text, fall back to abstract
                let content = work.full_text
                    .or(work.abstract_text.clone())
                    .unwrap_or_default();
                
                if content.is_empty() {
                    continue;
                }
                
                let authors: Option<Vec<String>> = work.authors.map(|a| {
                    a.into_iter()
                        .filter_map(|auth| auth.name)
                        .collect()
                });
                
                all_documents.push(Document {
                    id: work.id,
                    title: work.title.unwrap_or_else(|| "Untitled".to_string()),
                    content,
                    source: "core".to_string(),
                    url: work.download_url,
                    date: work.published_date,
                    authors,
                    abstract_text: work.abstract_text,
                    location_id: None,
                    subspecies: None,
                    temporal_weight: 1.0,
                    authority_ranking: 1,
                });
                
                if all_documents.len() >= max_docs {
                    break;
                }
            }
            
            offset += page_size;
            tokio::time::sleep(Duration::from_millis(self.rate_limit_ms)).await;
        }
        
        info!("Collected {} documents from CORE", all_documents.len());
        Ok(all_documents)
    }

    fn source_name(&self) -> &'static str {
        "core"
    }
}
