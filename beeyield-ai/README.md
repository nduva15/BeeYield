# BeeYield AI - Data Ingestor

High-speed concurrent scraper/parser for building the bee research corpus.

## Features

- 🚀 **Async concurrent scraping** via Tokio
- 📚 **Multi-source ingestion**: CORE.ac.uk, PubMed, Wikipedia, Project Gutenberg
- 🧹 **Clean-room processing**: Strips citations `(Author, YYYY)` and LaTeX artifacts
- ⚡ **Rate-limited** to respect API terms of service

## Project Structure

```
beeyield-ai/
├── Cargo.toml
├── data/
│   ├── raw/          # Downloaded HTML/PDF
│   ├── processed/    # Cleaned text files
│   └── corpus/       # Final training corpus
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── scrapers/     # Source-specific scrapers
│   ├── cleaners/     # Text cleaning pipeline
│   └── pipeline.rs   # Orchestration
└── model/            # PyTorch model (Python)
```

## Usage

```bash
# Build
cargo build --release

# Run scraper
cargo run -- scrape --source pubmed --query "Apis mellifera"

# Process and clean
cargo run -- clean --input data/raw --output data/processed
```

## Data Sources

| Source | API | Rate Limit |
|--------|-----|------------|
| CORE.ac.uk | REST API | 10 req/s |
| PubMed | E-utilities | 3 req/s |
| Wikipedia | REST API | 100 req/s |
| Project Gutenberg | Static | N/A |
