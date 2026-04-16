use reqwest::Client;
use scraper::{Html, Selector};
use serde::Serialize;
use std::sync::Arc;
use std::time::Duration;
use regex::Regex;
use tokio::sync::Semaphore;
use futures::stream::{FuturesUnordered, StreamExt};

#[derive(Serialize)]
struct DocRecord {
    source: String,
    url: String,
    title: Option<String>,
    author: Option<String>,
    date: Option<String>,
    doi: Option<String>,
    pdfs: Vec<String>,
}

async fn fetch_text(client: &Client, url: &str) -> Option<String> {
    let r = client.get(url).timeout(Duration::from_secs(15)).send().await;
    match r {
        Ok(resp) => match resp.text().await {
            Ok(t) => Some(t),
            Err(_) => None,
        },
        Err(_) => None,
    }
}

async fn allowed_by_robots(client: &Client, site_url: &str) -> bool {
    // naive robots check: fetch /robots.txt and deny only if Disallow: / for User-agent: *
    let robots_url = format!("{}/robots.txt", site_url.trim_end_matches('/'));
    if let Ok(resp) = client.get(&robots_url).timeout(Duration::from_secs(8)).send().await {
        if let Ok(body) = resp.text().await {
            let mut ua_star = false;
            for line in body.lines() {
                let l = line.trim().to_lowercase();
                if l.starts_with("user-agent:") && l.contains("*") { ua_star = true; }
                if ua_star && l.starts_with("disallow:") {
                    let path = l.trim_start_matches("disallow:").trim();
                    if path == "/" {
                        return false;
                    }
                }
            }
            // keep permissive by default
            return true;
        }
    }
    true
}

fn extract_metadata(html: &str) -> (Option<String>, Option<String>, Option<String>, Vec<String>) {
    let doc = Html::parse_document(html);
    let title_sel = Selector::parse("title").unwrap();
    let meta_sel = Selector::parse("meta").unwrap();
    let a_sel = Selector::parse("a").unwrap();

    let title = doc.select(&title_sel).next().map(|t| t.text().collect::<Vec<_>>().join(" "));
    let mut author = None;
    let mut date = None;
    let doi_re = Regex::new(r"10\.\d{4,9}/[-._;()/:A-Za-z0-9]+").ok();
    let mut doi = None;
    let mut pdfs = Vec::new();

    for m in doc.select(&meta_sel) {
        if let Some(name) = m.value().attr("name") {
            if name.eq_ignore_ascii_case("author") { author = m.value().attr("content").map(|s| s.to_string()); }
            if name.eq_ignore_ascii_case("date") || name.eq_ignore_ascii_case("pubdate") { date = m.value().attr("content").map(|s| s.to_string()); }
        }
        if let Some(prop) = m.value().attr("property") {
            if prop.eq_ignore_ascii_case("article:author") { author = m.value().attr("content").map(|s| s.to_string()); }
            if prop.eq_ignore_ascii_case("article:published_time") { date = m.value().attr("content").map(|s| s.to_string()); }
        }
        if doi.is_none() {
            if let Some(content) = m.value().attr("content") {
                if let Some(re) = &doi_re {
                    if let Some(mat) = re.find(content) { doi = Some(mat.as_str().to_string()); }
                }
            }
        }
    }

    for a in doc.select(&a_sel) {
        if let Some(href) = a.value().attr("href") {
            if href.to_lowercase().ends_with(".pdf") {
                pdfs.push(href.to_string());
            }
            if doi.is_none() {
                if let Some(re) = &doi_re {
                    if let Some(mat) = re.find(href) { doi = Some(mat.as_str().to_string()); }
                }
            }
        }
    }

    (title, author, date, pdfs)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let base = std::env::current_dir()?;
    let cfg_path = base.join("tools/rust_scraper/resources_200.txt");
    let out_dir = base.join("tools/rust_scraper/output");
    tokio::fs::create_dir_all(&out_dir).await.ok();

    let client = Client::builder().user_agent("BeeYieldAgent/1.0").build()?;
    let txt = tokio::fs::read_to_string(cfg_path).await?;
    let seeds: Vec<String> = txt.lines().map(|l| l.trim().to_string()).filter(|l| !l.is_empty()).collect();

    let sem = Arc::new(Semaphore::new(8));
    let mut futs = FuturesUnordered::new();

    for url in seeds.into_iter() {
        let client = client.clone();
        let out_dir = out_dir.clone();
        let permit = sem.clone().acquire_owned().await.unwrap();
        futs.push(tokio::spawn(async move {
            let _p = permit; // keeps semaphore permit alive for this task
            let site = if url.starts_with("http") { url.clone() } else { format!("https://{}", url) };
            if !allowed_by_robots(&client, &site).await { return None; }
            if let Some(html) = fetch_text(&client, &site).await {
                let (title, author, date, pdfs) = extract_metadata(&html);
                let rec = DocRecord { source: site.clone(), url: site.clone(), title, author, date, doi: None, pdfs: pdfs.clone() };
                // save JSONL
                let j = serde_json::to_string(&rec).unwrap_or_default();
                let fn_safe = site.replace("/", "_").replace(":", "_");
                let out_file = out_dir.join(format!("{}.jsonl", fn_safe));
                let _ = tokio::fs::write(&out_file, format!("{j}\n")).await;
                // attempt to download first PDF (if any)
                for p in pdfs.iter().take(2) {
                    let pdf_url = if p.starts_with("http") { p.clone() } else { format!("{}{}", site, p) };
                    if let Ok(resp) = client.get(&pdf_url).send().await {
                        if let Ok(bytes) = resp.bytes().await {
                            let fname = out_dir.join(format!("{}_{}.pdf", fn_safe, uuid::Uuid::new_v4().to_string()));
                            let _ = tokio::fs::write(&fname, &bytes).await;
                        }
                    }
                }
                return Some( (site, j) );
            }
            None
        }));
    }

    while let Some(r) = futs.next().await {
        if let Ok(Some((_site, j))) = r { println!("scraped: {}", j); }
    }

    Ok(())
}
