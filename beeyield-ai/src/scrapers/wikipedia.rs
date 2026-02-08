//! Wikipedia scraper for bee-related articles

use super::{Document, Scraper};
use anyhow::{Result, Context};
use async_trait::async_trait;
use reqwest::Client;
use serde::Deserialize;
use tracing::info;
use std::time::Duration;

const WIKIPEDIA_API: &str = "https://en.wikipedia.org/w/api.php";

/// Wikipedia category scraper for bee knowledge
pub struct WikipediaScraper {
    client: Client,
}

#[derive(Debug, Deserialize)]
struct CategoryResponse {
    query: CategoryQuery,
}

#[derive(Debug, Deserialize)]
struct CategoryQuery {
    categorymembers: Vec<CategoryMember>,
}

#[derive(Debug, Deserialize)]
struct CategoryMember {
    pageid: u64,
    title: String,
}

#[derive(Debug, Deserialize)]
struct PageResponse {
    query: PageQuery,
}

#[derive(Debug, Deserialize)]
struct PageQuery {
    pages: std::collections::HashMap<String, WikiPage>,
}

#[derive(Debug, Deserialize)]
struct WikiPage {
    pageid: Option<u64>,
    title: Option<String>,
    extract: Option<String>,
}

impl WikipediaScraper {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .user_agent("BeeYieldAI/1.0 (beeyield.co.ke; Educational)")
                .build()
                .unwrap(),
        }
    }

    /// Get pages in a category
    async fn get_category_members(&self, category: &str, limit: usize) -> Result<Vec<CategoryMember>> {
        let response = self.client
            .get(WIKIPEDIA_API)
            .query(&[
                ("action", "query"),
                ("list", "categorymembers"),
                ("cmtitle", &format!("Category:{}", category)),
                ("cmlimit", &limit.to_string()),
                ("format", "json"),
            ])
            .send()
            .await?;

        let result: CategoryResponse = response.json().await?;
        Ok(result.query.categorymembers)
    }

    /// Fetch page content as plain text
    async fn get_page_content(&self, title: &str) -> Result<Option<WikiPage>> {
        let response = self.client
            .get(WIKIPEDIA_API)
            .query(&[
                ("action", "query"),
                ("prop", "extracts"),
                ("exintro", "false"),
                ("explaintext", "true"),
                ("titles", title),
                ("format", "json"),
            ])
            .send()
            .await?;

        let result: PageResponse = response.json().await?;
        Ok(result.query.pages.into_values().next())
    }
}

impl Default for WikipediaScraper {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Scraper for WikipediaScraper {
    async fn scrape(&self, _query: Option<&str>, max_docs: usize) -> Result<Vec<Document>> {
        // Key bee-related categories
        let categories = [
            "Apis_(genus)",
            "Beekeeping",
            "Bee_diseases",
            "Honey",
            "Pollination",
            "Apidae",
        ];
        
        let mut all_documents = Vec::new();
        let per_category = max_docs / categories.len();
        
        for category in categories {
            info!("Scraping Wikipedia category: {}", category);
            
            let members = self.get_category_members(category, per_category)
                .await
                .context("Failed to get category members")?;
            
            for member in members {
                if all_documents.len() >= max_docs {
                    break;
                }
                
                if let Some(page) = self.get_page_content(&member.title).await? {
                    if let Some(content) = page.extract {
                        if !content.is_empty() {
                            all_documents.push(Document {
                                id: format!("wiki_{}", member.pageid),
                                title: page.title.unwrap_or(member.title.clone()),
                                content,
                                source: "wikipedia".to_string(),
                                url: Some(format!("https://en.wikipedia.org/wiki/{}", 
                                    member.title.replace(' ', "_"))),
                                date: None,
                                authors: None,
                                abstract_text: None,
                                location_id: None,
                                subspecies: None,
                                temporal_weight: 0.8,
                                authority_ranking: 2,
                            });
                        }
                    }
                }
                
                // Small delay to be nice to Wikipedia
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        }
        
        info!("Collected {} documents from Wikipedia", all_documents.len());
        Ok(all_documents)
    }

    fn source_name(&self) -> &'static str {
        "wikipedia"
    }
}
