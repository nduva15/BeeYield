# BeeYield Agentic Scraper

This is a lightweight async Rust scraper scaffold designed to harvest metadata (title, author, date, DOI) and discover PDF links from a list of seed sites.

Usage

Build (requires Rust toolchain):

```bash
cd tools/rust_scraper
cargo build --release
```

Run (reads `resources_200.txt` and writes into `output/`):

```bash
cargo run --release
```

Notes
- The scraper is intentionally conservative about robots.txt; expand the `allowed_by_robots` logic for production.
- The scaffold writes per-site JSONL files into `output/` and attempts to download discovered PDFs.
- If you hit disk or build issues, you can run the scraper in a container or on a remote machine with more space.
# BeeYield Rust Scraper

Simple blocking Rust scraper to fetch HTML pages from an authoritative resources list and save them to `tools/rust_scraper/output`.

Prerequisites:
- Rust toolchain (stable)

Run:

```bash
cd tools/rust_scraper
cargo build --release
cargo run --release
```

Output will be written to `tools/rust_scraper/output/` as numbered HTML files.
