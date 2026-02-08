use spider::website::Website;
use spider::tokio;
use text_splitter::TextSplitter;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::Path;
use chrono::Utc;

/// Configuration for the recursive company scraper
pub struct CompanyScraperConfig {
    pub start_url: String,
    pub output_dir: String,
}

/// Recursive Scraper tailored for BeeYield proprietary data
/// Tags data with `is_internal: true` and prioritizes /team, /harvests, /blog
pub async fn scrape_company_site(config: CompanyScraperConfig) -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting Recursive Company Scrape: {}", config.start_url);

    let mut website = Website::new(&config.start_url);
    
    // Configure aggressive but polite crawling
    website.configuration.user_agent = Some(Box::new("BeeYield-Enterprise-Bot/1.0"));
    website.configuration.respect_robots_txt = true;
    website.configuration.delay = 500; // 500ms delay to be nice to our own server

    // Scrape the entire site
    website.scrape().await;

    let output_path = Path::new(&config.output_dir);
    fs::create_dir_all(output_path)?;

    // Setup text splitter (512 tokens approx ~ 2000 chars)
    let splitter = TextSplitter::default().with_trim_chunks(true);

    let mut page_count = 0;

    for page in website.get_pages() {
        if let Some(pages) = page {
            let url = pages.get_url();
            let html = pages.get_html();
            
            // Convert HTML to Markdown (simplified for now, ideally use a crate like html2md)
            // For now, we'll strip tags to get raw text, in production we'd use html2md
            let clean_text = strip_html_tags(html);
            
            if clean_text.trim().is_empty() {
                continue;
            }

            // Detect Page Type
            let page_type = if url.contains("/team") {
                "TEAM_BIO"
            } else if url.contains("/harvests") {
                "HARVEST_DATA"
            } else if url.contains("/blog") {
                "INTERNAL_NEWS"
            } else {
                "GENERAL_INTERNAL"
            };

            // Chunk and save
            let chunks = splitter.chunks(&clean_text, 2000); // chunk by chars roughly
            
            for (i, chunk) in chunks.enumerate() {
                let filename = format!(
                    "{}_{}_{}.md", 
                    page_type, 
                    url.replace("https://", "").replace("/", "_").replace(".", "_"), 
                    i
                );
                let file_path = output_path.join(filename);

                let content = format!(
                    "---\n\
                    source: {}\n\
                    url: {}\n\
                    date: {}\n\
                    is_internal: true\n\
                    verified: true\n\
                    type: {}\n\
                    ---\n\n\
                    {}", 
                    "BeeYield Official Site", url, Utc::now().to_rfc3339(), page_type, chunk
                );

                let mut file = OpenOptions::new()
                    .write(true)
                    .create(true)
                    .truncate(true)
                    .open(file_path)?;
                file.write_all(content.as_bytes())?;
            }
            page_count += 1;
        }
    }

    println!("✅ Scraped {} internal company pages.", page_count);
    Ok(())
}

fn strip_html_tags(html: &str) -> String {
    // Very basic stripper, in prod use `scraper` crate properly
    let mut result = String::new();
    let mut inside_tag = false;
    for c in html.chars() {
        if c == '<' {
            inside_tag = true;
        } else if c == '>' {
            inside_tag = false;
            result.push(' ');
        } else if !inside_tag {
            result.push(c);
        }
    }
    // Collapse whitespace
    result.split_whitespace().collect::<Vec<&str>>().join(" ")
}
