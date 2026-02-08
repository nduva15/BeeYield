//! PubMed E-utilities scraper for bee research papers

use super::{Document, Scraper};
use anyhow::{Result, Context};
use async_trait::async_trait;
use reqwest::Client;
use serde::Deserialize;
use tracing::{info, warn};
use std::time::Duration;

const PUBMED_SEARCH_URL: &str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const PUBMED_FETCH_URL: &str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

/// PubMed scraper using NCBI E-utilities API
pub struct PubMedScraper {
    client: Client,
    rate_limit_ms: u64,
}

#[derive(Debug, Deserialize)]
struct ESearchResult {
    esearchresult: ESearchInner,
}

#[derive(Debug, Deserialize)]
struct ESearchInner {
    idlist: Vec<String>,
    count: String,
}

impl PubMedScraper {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap(),
            rate_limit_ms: 350, // ~3 requests/second per NCBI guidelines
        }
    }

    /// Search PubMed for article IDs
    async fn search_ids(&self, query: &str, max_docs: usize) -> Result<Vec<String>> {
        let full_query = format!("{} AND (bee OR apis OR apiary OR hive OR honeybee)", query);
        
        let response = self.client
            .get(PUBMED_SEARCH_URL)
            .query(&[
                ("db", "pubmed"),
                ("term", &full_query),
                ("retmax", &max_docs.to_string()),
                ("retmode", "json"),
            ])
            .send()
            .await
            .context("Failed to search PubMed")?;

        let result: ESearchResult = response.json().await?;
        info!("Found {} articles matching query", result.esearchresult.count);
        
        Ok(result.esearchresult.idlist)
    }

    /// Fetch article abstracts by IDs
    async fn fetch_abstracts(&self, ids: &[String]) -> Result<Vec<Document>> {
        let mut documents = Vec::new();
        
        // Batch fetch in groups of 50
        for chunk in ids.chunks(50) {
            let id_list = chunk.join(",");
            
            let response = self.client
                .get(PUBMED_FETCH_URL)
                .query(&[
                    ("db", "pubmed"),
                    ("id", &id_list),
                    ("rettype", "abstract"),
                    ("retmode", "text"),
                ])
                .send()
                .await?;

            let text = response.text().await?;
            
            // Parse the text response into documents
            // PubMed returns formatted text with headers
            documents.extend(self.parse_abstract_response(&text, chunk));
            
            // Rate limiting
            tokio::time::sleep(Duration::from_millis(self.rate_limit_ms)).await;
        }
        
        Ok(documents)
    }

    fn parse_abstract_response(&self, text: &str, ids: &[String]) -> Vec<Document> {
        let mut documents = Vec::new();
        
        // Split by double newlines (PubMed abstract separator)
        let sections: Vec<&str> = text.split("\n\n").collect();
        
        for (i, section) in sections.iter().enumerate() {
            if section.trim().is_empty() {
                continue;
            }
            
            let id = ids.get(i).cloned().unwrap_or_else(|| format!("pubmed_{}", i));
            
            // Extract title (first line usually)
            let lines: Vec<&str> = section.lines().collect();
            let title = lines.first().unwrap_or(&"Untitled").to_string();
            
            documents.push(Document {
                id: id.clone(),
                title,
                content: section.to_string(),
                source: "pubmed".to_string(),
                url: Some(format!("https://pubmed.ncbi.nlm.nih.gov/{}/", id)),
                date: None,
                authors: None,
                abstract_text: Some(section.to_string()),
                location_id: None, // Will be enriched by HubScraper
                subspecies: None,
                temporal_weight: 1.0, // Default weight
                authority_ranking: 1, // Scientific journal baseline
            });
        }
        
        documents
    }
}

impl Default for PubMedScraper {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Scraper for PubMedScraper {
    async fn scrape(&self, query: Option<&str>, max_docs: usize) -> Result<Vec<Document>> {
        let search_query = query.unwrap_or("Apis mellifera OR beekeeping OR apiculture");
        
        info!("Searching PubMed for: {}", search_query);
        
        let ids = self.search_ids(search_query, max_docs).await?;
        
        if ids.is_empty() {
            warn!("No articles found for query");
            return Ok(Vec::new());
        }
        
        info!("Fetching {} abstracts", ids.len());
        self.fetch_abstracts(&ids).await
    }

    fn source_name(&self) -> &'static str {
        "pubmed"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_pubmed_search() {
        let scraper = PubMedScraper::new();
        let results = scraper.scrape(Some("varroa mite"), 5).await.unwrap();
        assert!(!results.is_empty());
    }
}
