//! Pipeline orchestration for scraping, cleaning, and corpus building

use crate::scrapers::{Document, Scraper, pubmed::PubMedScraper, core_ac::CoreScraper, 
                      wikipedia::WikipediaScraper, gutenberg::GutenbergScraper,
                      researchgate::ResearchGateScraper, usda::USDAScraper,
                      biorxiv::BioRxivScraper, arxiv::ArXivScraper,
                      semantic_scholar::SemanticScholarScraper};
use crate::cleaners::{clean_text, CleanText};
use std::process::Command;
use anyhow::{Result, Context, bail};
use std::path::Path;
use tokio::fs;
use tracing::{info, warn};
use serde_json;

/// Run the scraping operation
pub async fn run_scrape(
    source: &str,
    query: Option<&str>,
    max_docs: usize,
    output_dir: &str,
) -> Result<()> {
    // Create output directory
    fs::create_dir_all(output_dir).await?;
    
    // Select scraper
    let documents = match source.to_lowercase().as_str() {
        "pubmed" => PubMedScraper::new().scrape(query, max_docs).await?,
        "core" => CoreScraper::default().scrape(query, max_docs).await?,
        "wikipedia" => WikipediaScraper::new().scrape(query, max_docs).await?,
        "gutenberg" => GutenbergScraper::new().scrape(query, max_docs).await?,
        "researchgate" => ResearchGateScraper::new().scrape(query, max_docs).await?,
        "usda" => USDAScraper::new().scrape(query, max_docs).await?,
        "biorxiv" => BioRxivScraper::new().scrape(query, max_docs).await?,
        "arxiv" => ArXivScraper::new().scrape(query, max_docs).await?,
        "semantic_scholar" => SemanticScholarScraper::new().scrape(query, max_docs).await?,
        "all" => {
            let per_source = max_docs / 9;
            let mut all = Vec::new();
            all.extend(PubMedScraper::new().scrape(query, per_source).await?);
            all.extend(CoreScraper::default().scrape(query, per_source).await?);
            all.extend(WikipediaScraper::new().scrape(query, per_source).await?);
            all.extend(GutenbergScraper::new().scrape(query, per_source).await?);
            all.extend(ResearchGateScraper::new().scrape(query, per_source).await?);
            all.extend(USDAScraper::new().scrape(query, per_source).await?);
            all.extend(BioRxivScraper::new().scrape(query, per_source).await?);
            all.extend(ArXivScraper::new().scrape(query, per_source).await?);
            all.extend(SemanticScholarScraper::new().scrape(query, per_source).await?);
            all
        }
        _ => bail!("Unknown source: {}. Use: pubmed, core, wikipedia, gutenberg, researchgate, usda, biorxiv, arxiv, semantic_scholar, all", source),
    };
    
    info!("Scraped {} documents", documents.len());
    
    // Save documents as JSON
    for doc in &documents {
        let filename = format!("{}/{}_{}.json", output_dir, doc.source, doc.id);
        let json = serde_json::to_string_pretty(doc)?;
        fs::write(&filename, json).await?;
    }
    
    info!("Saved {} documents to {}", documents.len(), output_dir);
    Ok(())
}

/// Run the cleaning operation
pub async fn run_clean(input_dir: &str, output_dir: &str) -> Result<()> {
    fs::create_dir_all(output_dir).await?;
    
    let mut entries = fs::read_dir(input_dir).await?;
    let mut processed = 0;
    let mut total_chars_removed = 0;
    
    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        
        if path.extension().map(|e| e == "json").unwrap_or(false) {
            // Read document
            let content = fs::read_to_string(&path).await?;
            let doc: Document = serde_json::from_str(&content)?;
            
            // Clean text
            let cleaned = clean_text(&doc.content);
            total_chars_removed += cleaned.chars_removed;
            
            // Save cleaned text
            let output_path = format!("{}/{}.txt", output_dir, doc.id);
            fs::write(&output_path, &cleaned.content).await?;
            
            processed += 1;
        }
    }
    
    info!("Cleaned {} documents, removed {} chars of noise", processed, total_chars_removed);
    Ok(())
}

/// Run the PDF ingestion operation (Neural Librarian)
pub async fn run_pdf_ingest(input_dir: &str, output_dir: &str, parser_path: &str) -> Result<()> {
    fs::create_dir_all(output_dir).await?;
    info!("🚀 Neural Librarian: Processing PDFs from {}", input_dir);

    let mut entries = fs::read_dir(input_dir).await?;
    let mut processed = 0;

    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        if path.extension().map(|e| e == "pdf").unwrap_or(false) {
            let output = Command::new(parser_path)
                .arg(&path)
                .output()
                .context("Failed to execute C++ PDF parser")?;

            if output.status.success() {
                let markdown = String::from_utf8_lossy(&output.stdout);
                let filename = path.file_stem().unwrap().to_str().unwrap();
                let output_path = format!("{}/{}.md", output_dir, filename);
                fs::write(&output_path, markdown.as_ref()).await?;
                processed += 1;
            } else {
                warn!("❌ Failed to parse PDF: {:?}", path);
            }
        }
    }

    info!("✅ Processed {} university papers via Neural Librarian.", processed);
    Ok(())
}

/// Build the final corpus from processed documents
pub async fn run_build(input_dir: &str, output_file: &str) -> Result<()> {
    // Ensure output directory exists
    if let Some(parent) = Path::new(output_file).parent() {
        fs::create_dir_all(parent).await?;
    }
    
    let mut corpus = String::new();
    let mut entries = fs::read_dir(input_dir).await?;
    let mut doc_count = 0;
    
    while let Some(entry) = entries.next_entry().await? {
        let path = entry.path();
        
        if path.extension().map(|e| e == "txt").unwrap_or(false) {
            let content = fs::read_to_string(&path).await?;
            
            // In a real MoE system, we would store metadata in a secondary DB.
            // For this atlas, we inject metadata tags that the MoE router will use.
            
            // Add document separator with metadata context
            corpus.push_str("\n<|doc|>\n");
            // Placeholder: metadata would ideally be loaded from the JSON counterparts here
            corpus.push_str(&content);
            corpus.push_str("\n<|endofdoc|>\n");
            
            doc_count += 1;
        }
    }
    
    fs::write(output_file, &corpus).await?;
    
    let word_count: usize = corpus.split_whitespace().count();
    let char_count = corpus.len();
    
    info!("Built corpus with {} documents", doc_count);
    info!("Corpus size: {} chars, ~{} words, ~{} tokens (estimated)", 
          char_count, word_count, word_count * 4 / 3);
    
    Ok(())
}

/// Main pipeline runner
pub struct Pipeline;

impl Pipeline {
    /// Run the full pipeline: scrape -> clean -> build
    pub async fn run_full(max_docs: usize) -> Result<()> {
        info!("=== Starting BeeYield AI Data Pipeline (Neural Librarian Mode) ===");
        
        // Phase 1: PDF Ingestion (University Papers)
        run_pdf_ingest("data/university_papers", "data/processed/academic", "./target/release/pdf_parser").await?;

        // Phase 2: Scrape from all sources
        run_scrape("all", None, max_docs, "data/raw").await?;
        
        // Phase 3: Clean documents
        run_clean("data/raw", "data/processed").await?;
        
        // Phase 4: Build corpus
        run_build("data/processed", "data/corpus/bee_corpus.txt").await?;
        
        info!("=== Pipeline Complete ===");
        Ok(())
    }
}
