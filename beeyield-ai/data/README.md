# BeeYield AI Data Directories

This directory contains the data pipeline for training BeeYield AI.

## Structure

```
data/
├── raw/          # Downloaded HTML/JSON from scraper
├── processed/    # Cleaned text files
└── corpus/       # Final training corpus
```

## Usage

1. **Scrape data**: `cargo run -- scrape --source all --max-docs 1000`
2. **Clean data**: `cargo run -- clean --input raw --output processed`
3. **Build corpus**: `cargo run -- build --input processed --output corpus/bee_corpus.txt`

## Corpus Format

The final corpus uses document markers:
```
<|doc|>
Document content here...
<|endofdoc|>
```
