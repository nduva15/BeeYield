//! BeeYield AI Data Ingestor CLI
//!
//! Command-line interface for scraping, cleaning, and processing
//! bee research documents.

use clap::{Parser, Subcommand};
use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;
use anyhow::Result;

mod scrapers;
mod cleaners;
mod pipeline;

#[derive(Parser)]
#[command(name = "beeyield-ai")]
#[command(author = "BeeYield Team")]
#[command(version = "0.1.0")]
#[command(about = "High-speed bee research data ingestor", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scrape documents from academic sources
    Scrape {
        /// Source to scrape: pubmed, core, wikipedia, gutenberg
        #[arg(short, long)]
        source: String,

        /// Search query
        #[arg(short, long)]
        query: Option<String>,

        /// Maximum documents to fetch
        #[arg(short, long, default_value = "100")]
        max_docs: usize,

        /// Output directory
        #[arg(short, long, default_value = "data/raw")]
        output: String,
    },

    /// Clean and process raw documents
    Clean {
        /// Input directory with raw documents
        #[arg(short, long, default_value = "data/raw")]
        input: String,

        /// Output directory for cleaned text
        #[arg(short, long, default_value = "data/processed")]
        output: String,
    },

    /// Build the final training corpus
    Build {
        /// Input directory with processed documents
        #[arg(short, long, default_value = "data/processed")]
        input: String,

        /// Output corpus file
        #[arg(short, long, default_value = "data/corpus/bee_corpus.txt")]
        output: String,
    },

    /// Recursively scrape company website
    CompanyScrape {
        /// Company website URL
        #[arg(long, default_value = "https://beeyield.com")]
        url: String,

        /// Output directory for internal data
        #[arg(long, default_value = "data/company")]
        output: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)?;

    let cli = Cli::parse();

    match cli.command {
        Commands::Scrape { source, query, max_docs, output } => {
            info!("Starting scrape from {} (max {} docs)", source, max_docs);
            pipeline::run_scrape(&source, query.as_deref(), max_docs, &output).await?;
        }
        Commands::CompanyScrape { url, output } => {
            info!("Starting Enterprise Company Scrape: {}", url);
            let config = company_scraper::CompanyScraperConfig {
                start_url: url.clone(),
                output_dir: output.clone(),
            };
            if let Err(e) = company_scraper::scrape_company_site(config).await {
                error!("Company scrape failed: {}", e);
            }
        }
        Commands::Clean { input, output } => {
            info!("Cleaning documents from {} -> {}", input, output);
            pipeline::run_clean(&input, &output).await?;
        }
        Commands::Build { input, output } => {
            info!("Building corpus from {} -> {}", input, output);
            pipeline::run_build(&input, &output).await?;
        }
    }

    Ok(())
}
