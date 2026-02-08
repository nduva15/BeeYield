//! LaTeX artifact removal
//!
//! Removes common LaTeX commands and math notation from text.

use regex::Regex;
use once_cell::sync::Lazy;

static LATEX_PATTERNS: Lazy<Vec<Regex>> = Lazy::new(|| {
    vec![
        // \command{content} -> content
        Regex::new(r"\\(?:textbf|textit|emph|texttt|underline|textsc)\{([^}]*)\}").unwrap(),
        
        // \command{...} that should be removed entirely
        Regex::new(r"\\(?:cite|ref|label|footnote|bibliography|includegraphics)\{[^}]*\}").unwrap(),
        
        // Inline math $...$ -> remove
        Regex::new(r"\$[^$]+\$").unwrap(),
        
        // Display math $$...$$ -> remove
        Regex::new(r"\$\$[^$]+\$\$").unwrap(),
        
        // \begin{...}...\end{...} blocks
        Regex::new(r"\\begin\{[^}]+\}.*?\\end\{[^}]+\}").unwrap(),
        
        // Greek letters \alpha, \beta, etc.
        Regex::new(r"\\(?:alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|upsilon|phi|chi|psi|omega)").unwrap(),
        
        // Standalone commands
        Regex::new(r"\\[a-zA-Z]+\s*").unwrap(),
        
        // Curly braces artifacts
        Regex::new(r"[{}]").unwrap(),
    ]
});

/// Remove LaTeX artifacts from text
pub fn remove_latex(text: &str) -> String {
    let mut result = text.to_string();
    
    // First, extract content from formatting commands
    let extract_pattern = Regex::new(r"\\(?:textbf|textit|emph)\{([^}]*)\}").unwrap();
    result = extract_pattern.replace_all(&result, "$1").to_string();
    
    // Then remove everything else
    for pattern in LATEX_PATTERNS.iter().skip(1) {
        result = pattern.replace_all(&result, " ").to_string();
    }
    
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_textbf() {
        let text = "This is \\textbf{important} text.";
        let clean = remove_latex(text);
        assert!(clean.contains("important"));
        assert!(!clean.contains("\\textbf"));
    }

    #[test]
    fn test_math() {
        let text = "The equation $E = mc^2$ shows energy.";
        let clean = remove_latex(text);
        assert!(!clean.contains("$"));
        assert!(!clean.contains("mc^2"));
    }

    #[test]
    fn test_greek() {
        let text = "The variable \\alpha represents weight.";
        let clean = remove_latex(text);
        assert!(!clean.contains("\\alpha"));
    }
}
