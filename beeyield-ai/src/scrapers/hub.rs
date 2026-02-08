//! Hub-aware scraper for selective regional data ingestion

use super::{Document, Scraper};
use anyhow::Result;
use async_trait::async_trait;
use tracing::info;

pub struct HubScraper {
    pub location_id: String,
    pub subspecies: Option<String>,
    pub base_weight: f32,
    pub inner_scraper: Box<dyn Scraper>,
}

#[async_trait]
impl Scraper for HubScraper {
    async fn scrape(&self, query: Option<&str>, max_docs: usize) -> Result<Vec<Document>> {
        info!("HubScraper: Ingesting data for Hub: {}", self.location_id);
        
        let mut docs = self.inner_scraper.scrape(query, max_docs).await?;
        
        for doc in &mut docs {
            doc.location_id = Some(self.location_id.clone());
            doc.subspecies = self.subspecies.clone();
            doc.temporal_weight *= self.base_weight;
        }
        
        Ok(docs)
    }

    fn source_name(&self) -> &'static str {
        self.inner_scraper.source_name()
    }
}
