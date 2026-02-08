//! Project Gutenberg scraper for historical beekeeping texts

use super::{Document, Scraper};
use anyhow::{Result, Context};
use async_trait::async_trait;
use reqwest::Client;
use tracing::info;
use std::time::Duration;

/// Known Gutenberg books about bees and beekeeping
const BEE_BOOKS: &[(&str, &str, &str, &str)] = &[
    // (id, title, author, url)
    ("15873", "Langstroth on the Hive and the Honey-Bee", "L. L. Langstroth", 
     "https://www.gutenberg.org/cache/epub/15873/pg15873.txt"),
    ("25873", "The Bee-keeper's Manual", "Henry Taylor",
     "https://www.gutenberg.org/cache/epub/25873/pg25873.txt"),
    ("30772", "Bee Keeping", "D. M. Macdonald",
     "https://www.gutenberg.org/cache/epub/30772/pg30772.txt"),
    ("21741", "British Bee Journal, and Bee-keepers' Adviser, Vol. I", "Various",
     "https://www.gutenberg.org/cache/epub/21741/pg21741.txt"),
    ("65296", "The Practical Bee-keeper", "George S. Demuth",
     "https://www.gutenberg.org/cache/epub/65296/pg65296.txt"),
];

/// Project Gutenberg scraper for historical beekeeping literature
pub struct GutenbergScraper {
    client: Client,
}

impl GutenbergScraper {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .timeout(Duration::from_secs(60))
                .build()
                .unwrap(),
        }
    }

    async fn fetch_book(&self, url: &str) -> Result<String> {
        let response = self.client
            .get(url)
            .send()
            .await
            .context("Failed to fetch Gutenberg book")?;
        
        response.text().await.context("Failed to read book text")
    }

    /// Remove Gutenberg header/footer boilerplate
    fn clean_gutenberg_text(&self, text: &str) -> String {
        let lines: Vec<&str> = text.lines().collect();
        let mut start = 0;
        let mut end = lines.len();
        
        // Find start of actual content
        for (i, line) in lines.iter().enumerate() {
            if line.contains("*** START OF") || line.contains("***START OF") {
                start = i + 1;
                break;
            }
        }
        
        // Find end of actual content
        for (i, line) in lines.iter().enumerate().rev() {
            if line.contains("*** END OF") || line.contains("***END OF") {
                end = i;
                break;
            }
        }
        
        lines[start..end].join("\n")
    }
}

impl Default for GutenbergScraper {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Scraper for GutenbergScraper {
    async fn scrape(&self, _query: Option<&str>, max_docs: usize) -> Result<Vec<Document>> {
        let mut documents = Vec::new();
        
        for (id, title, author, url) in BEE_BOOKS.iter().take(max_docs) {
            info!("Fetching Gutenberg book: {}", title);
            
            match self.fetch_book(url).await {
                Ok(raw_text) => {
                    let content = self.clean_gutenberg_text(&raw_text);
                    
                    documents.push(Document {
                        id: format!("gutenberg_{}", id),
                        title: title.to_string(),
                        content,
                        source: "gutenberg".to_string(),
                        url: Some(format!("https://www.gutenberg.org/ebooks/{}", id)),
                        date: None, // Historical
                        authors: Some(vec![author.to_string()]),
                        abstract_text: None,
                        location_id: None,
                        subspecies: None,
                        temporal_weight: 0.3, // Historical texts are valuable but low temporal priority
                        authority_ranking: 3, // Historical baseline
                    });
                }
                Err(e) => {
                    tracing::warn!("Failed to fetch {}: {}", title, e);
                }
            }
            
            // Be nice to Gutenberg servers
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
        
        info!("Collected {} documents from Project Gutenberg", documents.len());
        Ok(documents)
    }

    fn source_name(&self) -> &'static str {
        "gutenberg"
    }
}
