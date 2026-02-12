# Agentic Scraper Configuration

This file documents how to use the `beeyield_scraper` as an agentic scraper for large resource lists.

1. Place your seed URLs (one per line) in `resources.txt` or create a new `resources_200.txt` with up to 200 entries.
2. The scraper will:
   - Check `robots.txt` (simple parser) and skip disallowed paths.
   - Fetch pages with retries and exponential backoff.
   - Save HTML and discovered PDFs to `output/`.
   - Run requests in parallel using `rayon`.

Notes & next enhancements:
- Add domain-level rate limiting if you plan heavy crawling.
- Add a persistent queue (SQLite) for large runs and checkpointing.
- Consider switching to async (`tokio`) for higher throughput.
