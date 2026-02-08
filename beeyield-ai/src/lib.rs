//! BeeYield AI - High-Speed Bee Research Data Ingestor
//!
//! This crate provides concurrent scraping and processing of bee research
//! papers from multiple academic sources to build a training corpus.

pub mod scrapers;
pub mod cleaners;
pub mod pipeline;
pub mod company_scraper;

pub use pipeline::Pipeline;
