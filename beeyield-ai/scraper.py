"""
Scheduled Scraper for Daily News Ingestion
============================================
Cron-like scheduler for daily/weekly/monthly scraping tasks.
"""

import json
import asyncio
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

from rag.ingestion import DocumentIngester


class ScheduledScraper:
    """
    Scheduled scraper for BeeYield AI news sources.
    
    Runs daily scrapes of configured sources and ingests into vector store.
    """
    
    def __init__(self, sources_path: str = "sources.json"):
        self.sources_path = Path(sources_path)
        self.sources = self._load_sources()
        self.ingester = DocumentIngester()
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": "BeeYieldAI/1.0 (Educational Research)"}
        )
    
    def _load_sources(self) -> Dict[str, Any]:
        """Load sources configuration."""
        if self.sources_path.exists():
            with open(self.sources_path, 'r') as f:
                return json.load(f)
        return {"sources": {}}
    
    async def scrape_url(self, url: str) -> Optional[str]:
        """Scrape a URL and extract main content."""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove unwanted elements
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                tag.decompose()
            
            # Try to find main content
            main = (
                soup.find('article') or
                soup.find('main') or
                soup.find(class_=['content', 'post', 'article-body']) or
                soup.find('body')
            )
            
            if main:
                return main.get_text(separator='\n', strip=True)
            return soup.get_text(separator='\n', strip=True)
            
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            return None
    
    async def validate_content(self, content: str) -> bool:
        """
        Validate if content is high-quality research vs garbage.
        Uses simple heuristics (would use Judge model in production).
        """
        # Simple quality heuristics
        if len(content) < 200:
            return False
        
        # Check for research-like keywords
        quality_keywords = [
            "bee", "hive", "honey", "varroa", "apiary", "queen",
            "brood", "colony", "forage", "pollination", "nectar"
        ]
        
        content_lower = content.lower()
        keyword_count = sum(1 for kw in quality_keywords if kw in content_lower)
        
        # Need at least 3 relevant keywords
        return keyword_count >= 3
    
    async def run_daily_scrape(self) -> Dict[str, int]:
        """Run daily scraping of configured sources."""
        results = {}
        schedule = self.sources.get("scrape_schedule", {})
        daily_sources = schedule.get("daily", [])
        
        all_sources = {}
        for category in self.sources.get("sources", {}).values():
            for source in category:
                all_sources[source["id"]] = source
        
        for source_id in daily_sources:
            source = all_sources.get(source_id)
            if not source or source.get("type") != "scrape":
                continue
            
            url = source.get("url")
            if not url:
                continue
            
            print(f"Scraping: {source['name']}")
            
            content = await self.scrape_url(url)
            if content and await self.validate_content(content):
                chunks = self.ingester.ingest_scraped_content(
                    content=content,
                    source_id=source_id,
                    source_name=source["name"],
                    url=url,
                    source_type="company" if source.get("is_company") else "news",
                    verified=source.get("verified", True),
                )
                results[source_id] = chunks
            else:
                results[source_id] = 0
            
            # Rate limit
            await asyncio.sleep(source.get("rate_limit_ms", 1000) / 1000)
        
        return results
    
    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()


async def run_scheduled_scrape():
    """Main entry point for scheduled scraping."""
    scraper = ScheduledScraper()
    
    try:
        print(f"Starting scheduled scrape at {datetime.now()}")
        results = await scraper.run_daily_scrape()
        
        print("\nScrape Results:")
        for source, chunks in results.items():
            print(f"  {source}: {chunks} chunks")
        
        total = sum(results.values())
        print(f"\nTotal chunks ingested: {total}")
        
    finally:
        await scraper.close()


if __name__ == "__main__":
    asyncio.run(run_scheduled_scrape())
