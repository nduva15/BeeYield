//! Neural Librarian: PDF Batch Processor (Rust)
//! 
//! Coordinates the C++ PDF-to-Semantic-Markdown parser to process 
//! hundreds of university research papers.

use std::process::Command;
use std::path::{Path, PathBuf};
use std::fs;
use anyhow::{Result, Context};
use glob::glob;

pub struct PDFProcessor {
    parser_path: PathBuf,
    output_dir: PathBuf,
}

impl PDFProcessor {
    pub fn new(parser_path: &str, output_dir: &str) -> Self {
        Self {
            parser_path: PathBuf::from(parser_path),
            output_dir: PathBuf::from(output_dir),
        }
    }

    /// Process a single PDF through the C++ parser
    pub fn process_file(&self, pdf_path: &Path) -> Result<String> {
        println!("📄 Processing: {:?}", pdf_path);
        
        let output = Command::new(&self.parser_path)
            .arg(pdf_path)
            .output()
            .context("Failed to execute C++ PDF parser")?;

        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow::anyhow!("Parser failed: {}", err));
        }

        let markdown = String::from_utf8_lossy(&output.stdout).to_string();
        Ok(markdown)
    }

    /// Batch process an entire directory of PDFs
    pub fn batch_process(&self, input_dir: &str) -> Result<usize> {
        let mut count = 0;
        fs::create_dir_all(&self.output_dir)?;

        let pattern = format!("{}/**/*.pdf", input_dir);
        for entry in glob(&pattern)? {
            let path = entry?;
            match self.process_file(&path) {
                Ok(markdown) => {
                    let mut output_path = self.output_dir.clone();
                    let filename = path.file_stem().unwrap().to_str().unwrap();
                    output_path.push(format!("{}.md", filename));
                    
                    fs::write(output_path, markdown)?;
                    count += 1;
                }
                Err(e) => eprintln!("❌ Error processing {:?}: {}", path, e),
            }
        }

        println!("✅ Batch complete. Processed {} university papers.", count);
        Ok(count)
    }
}

fn main() -> Result<()> {
    // Example usage for the Neural Librarian
    let processor = PDFProcessor::new(
        "./target/release/pdf_parser", // Assuming compiled C++ binary path
        "./data/processed_research"
    );

    processor.batch_process("./data/raw_university_papers")?;
    Ok(())
}
