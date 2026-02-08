//! Text cleaning modules for the clean-room processing pipeline

pub mod citations;
pub mod latex;
pub mod html;

use anyhow::Result;

/// A cleaned text document
#[derive(Debug, Clone)]
pub struct CleanText {
    pub content: String,
    pub word_count: usize,
    pub chars_removed: usize,
}

impl CleanText {
    pub fn new(content: String, original_len: usize) -> Self {
        let word_count = content.split_whitespace().count();
        let chars_removed = original_len.saturating_sub(content.len());
        Self { content, word_count, chars_removed }
    }
}

/// Full cleaning pipeline
pub fn clean_text(raw: &str) -> CleanText {
    let original_len = raw.len();
    
    // Step 1: Remove HTML artifacts
    let text = html::strip_html(raw);
    
    // Step 2: Remove LaTeX artifacts
    let text = latex::remove_latex(&text);
    
    // Step 3: Strip academic citations
    let text = citations::strip_citations(&text);
    
    // Step 4: Normalize whitespace
    let text = normalize_whitespace(&text);
    
    CleanText::new(text, original_len)
}

/// Normalize whitespace: collapse multiple spaces/newlines
fn normalize_whitespace(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut last_was_space = false;
    
    for ch in text.chars() {
        if ch.is_whitespace() {
            if !last_was_space {
                result.push(' ');
                last_was_space = true;
            }
        } else {
            result.push(ch);
            last_was_space = false;
        }
    }
    
    result.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_full_pipeline() {
        let raw = "
            <p>Varroa mites (Smith et al., 2020) cause significant damage.
            The pathogen Nosema apis \\textbf{infects} colonies.</p>
        ";
        let clean = clean_text(raw);
        assert!(!clean.content.contains("Smith et al."));
        assert!(!clean.content.contains("\\textbf"));
        assert!(!clean.content.contains("<p>"));
    }
}
