//! Citation stripping for academic papers
//!
//! Removes inline citations like:
//! - (Author, 2020)
//! - (Author et al., 2020)
//! - [1], [1-3], [1,2,3]
//! - Author (2020)

use regex::Regex;
use once_cell::sync::Lazy;

// Patterns for different citation styles
static PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // (Author et al., 2020) or (Author, 2020)
        Regex::new(r"\([A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}[a-z]?\)").unwrap(),
        
        // (Author and Author, 2020)
        Regex::new(r"\([A-Z][a-z]+\s+and\s+[A-Z][a-z]+,?\s*\d{4}[a-z]?\)").unwrap(),
        
        // Multiple citations (Author, 2020; Other, 2021)
        Regex::new(r"\((?:[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}[a-z]?;\s*)+[A-Z][a-z]+(?:\s+et\s+al\.?)?,?\s*\d{4}[a-z]?\)").unwrap(),
        
        // Numeric citations [1], [1,2], [1-3]
        Regex::new(r"\[\d+(?:[-,]\d+)*\]").unwrap(),
        
        // Superscript-like numeric ^1, ^1,2
        Regex::new(r"\^\d+(?:,\d+)*").unwrap(),
        
        // Author (2020) at end of sentence
        Regex::new(r"\b[A-Z][a-z]+\s+\(\d{4}[a-z]?\)").unwrap(),
    ]
});

/// Strip all citation patterns from text
pub fn strip_citations(text: &str) -> String {
    let mut result = text.to_string();
    
    for pattern in PATTERNS.iter() {
        result = pattern.replace_all(&result, "").to_string();
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_author_year() {
        let text = "Varroa mites (Smith, 2020) are harmful.";
        let clean = strip_citations(text);
        assert!(!clean.contains("2020"));
        assert!(clean.contains("Varroa mites"));
    }

    #[test]
    fn test_et_al() {
        let text = "Studies show (Johnson et al., 2019) that bees are affected.";
        let clean = strip_citations(text);
        assert!(!clean.contains("Johnson"));
        assert!(!clean.contains("2019"));
    }

    #[test]
    fn test_numeric() {
        let text = "As demonstrated [1,2,3] in previous work [4-7].";
        let clean = strip_citations(text);
        assert!(!clean.contains("[1,2,3]"));
        assert!(!clean.contains("[4-7]"));
    }
}
