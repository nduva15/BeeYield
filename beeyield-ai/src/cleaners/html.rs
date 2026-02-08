//! HTML stripping for web-scraped content

use regex::Regex;
use once_cell::sync::Lazy;

static HTML_TAG: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"<[^>]+>").unwrap()
});

static HTML_ENTITIES: Lazy<Vec<(&'static str, &'static str)>> = Lazy::new(|| {
    vec![
        ("&nbsp;", " "),
        ("&amp;", "&"),
        ("&lt;", "<"),
        ("&gt;", ">"),
        ("&quot;", "\""),
        ("&apos;", "'"),
        ("&#39;", "'"),
        ("&ndash;", "-"),
        ("&mdash;", "—"),
        ("&hellip;", "..."),
    ]
});

/// Strip HTML tags and decode common entities
pub fn strip_html(text: &str) -> String {
    // Remove all HTML tags
    let mut result = HTML_TAG.replace_all(text, " ").to_string();
    
    // Decode HTML entities
    for (entity, replacement) in HTML_ENTITIES.iter() {
        result = result.replace(entity, replacement);
    }
    
    // Decode numeric entities
    let numeric_entity = Regex::new(r"&#(\d+);").unwrap();
    result = numeric_entity.replace_all(&result, |caps: &regex::Captures| {
        let code: u32 = caps[1].parse().unwrap_or(0);
        char::from_u32(code).map(|c| c.to_string()).unwrap_or_default()
    }).to_string();
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_tags() {
        let html = "<p>Hello <strong>world</strong></p>";
        let clean = strip_html(html);
        assert!(clean.contains("Hello"));
        assert!(clean.contains("world"));
        assert!(!clean.contains("<"));
    }

    #[test]
    fn test_entities() {
        let html = "Tom &amp; Jerry &lt;3";
        let clean = strip_html(html);
        assert!(clean.contains("Tom & Jerry <3"));
    }
}
