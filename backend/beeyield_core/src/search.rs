//! Search Engine — Port of `streaming_search.py`
//!
//! Handles:
//!   - BM25 Keyword Matching (Phase 1)
//!   - Advanced Re-ranking (Phase 3)
//!   - Content-based Deduplication
//!
//! Architecture:
//!   Rust handles the heavy lifting of scoring thousands of in-memory nodes.
//!   Python orchestrates the SSE stream and calls LLM (Gemini).

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use std::collections::{HashMap, HashSet};

#[pyclass]
pub struct SearchEngine {
    k1: f64,
    b: f64,
}

#[pymethods]
impl SearchEngine {
    #[new]
    fn new() -> Self {
        Self { k1: 1.5, b: 0.75 }
    }

    /// BM25 ranking over a batch of nodes.
    /// Replaces the Python `_bm25_scan` for speed.
    fn bm25_search<'py>(
        &self,
        py: Python<'py>,
        query: &str,
        nodes: &Bound<'py, PyList>,
        limit: usize,
    ) -> PyResult<Bound<'py, PyList>> {
        let terms: HashSet<String> = query.to_lowercase().split_whitespace().map(|s| s.to_string()).collect();
        if terms.is_empty() {
            return Ok(PyList::empty_bound(py));
        }

        let mut doc_lengths = Vec::new();
        let mut df: HashMap<String, u32> = HashMap::new();
        let n_docs = nodes.len();

        // Pass 1: Statistics
        for item in nodes.iter() {
            let node = item.downcast::<PyDict>()?;
            let content: String = match node.get_item("content")? {
                Some(c) => c.extract::<String>()?.to_lowercase(),
                None => "".to_string(),
            };
            let words: Vec<&str> = content.split_whitespace().collect();
            doc_lengths.push(words.len());
            
            let doc_terms: HashSet<&str> = words.into_iter().collect();
            for term in &terms {
                if doc_terms.contains(term.as_str()) {
                    *df.entry(term.clone()).or_insert(0) += 1;
                }
            }
        }

        let avg_dl = if !doc_lengths.is_empty() {
            doc_lengths.iter().sum::<usize>() as f64 / n_docs as f64
        } else {
            1.0
        };

        // Pass 2: Scoring
        let mut scored = Vec::new();
        for (idx, item) in nodes.iter().enumerate() {
            let node = item.downcast::<PyDict>()?;
            let content: String = match node.get_item("content")? {
                Some(c) => c.extract::<String>()?.to_lowercase(),
                None => "".to_string(),
            };
            let dl = doc_lengths[idx] as f64;
            let mut score = 0.0;

            for term in &terms {
                let tf = content.matches(term).count() as f64;
                if tf == 0.0 { continue; }

                let d = *df.get(term).unwrap_or(&0) as f64;
                let idf = ((n_docs as f64 - d + 0.5) / (d + 0.5) + 1.0).ln();
                let tf_norm = (tf * (self.k1 + 1.0)) / (tf + self.k1 * (1.0 - self.b + self.b * dl / avg_dl));
                score += idf * tf_norm;
            }

            if score > 0.0 {
                scored.push((score, item));
            }
        }

        // Sort and Take
        scored.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        let result_list = PyList::empty_bound(py);
        for (score, item) in scored.into_iter().take(limit) {
            let dict = PyDict::new_bound(py);
            dict.set_item("score", score)?;
            dict.set_item("node", item)?;
            result_list.append(dict)?;
        }

        Ok(result_list)
    }

    /// Re-rank candidates using a multi-factor weighted heuristic.
    /// Replaces the Python `_rerank` method.
    fn rerank<'py>(
        &self,
        py: Python<'py>,
        query: &str,
        candidates: &Bound<'py, PyList>,
        top_k: usize,
    ) -> PyResult<Bound<'py, PyList>> {
        let terms: HashSet<String> = query.to_lowercase().split_whitespace().map(|s| s.to_string()).collect();
        let mut reranked = Vec::new();

        for item in candidates.iter() {
            let cand = item.downcast::<PyDict>()?;
            let orig_score: f64 = match cand.get_item("score")? {
                Some(s) => s.extract()?,
                None => 0.0,
            };
            let node = match cand.get_item("node")? {
                Some(n) => n.downcast::<PyDict>()?.clone(),
                None => continue,
            };
            
            let content: String = match node.get_item("content")? {
                Some(c) => c.extract::<String>()?.to_lowercase(),
                None => "".to_string(),
            };
            let meta = match node.get_item("metadata")? {
                Some(m) => m.downcast::<PyDict>()?.clone(),
                None => continue,
            };

            // Word overlap boost
            let doc_words: HashSet<&str> = content.split_whitespace().collect();
            let overlap = if !terms.is_empty() {
                terms.iter().filter(|t| doc_words.contains(t.as_str())).count() as f64 / terms.len() as f64
            } else {
                0.0
            };

            // Reliability
            let reliability: f64 = meta.get_item("reliability_score")?.map(|v| v.extract()).transpose()?.unwrap_or(0.5);

            // Recency boost
            let mut recency = 0.0;
            if content.contains("2026") { recency = 1.0; }
            else if content.contains("2025") { recency = 0.8; }
            else if content.contains("2024") { recency = 0.5; }

            // Weighting
            let final_score = (orig_score * 0.4) + (overlap * 0.3) + (reliability * 0.2) + (recency * 0.1);
            reranked.push((final_score, node));
        }

        reranked.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap());
        
        let result_list = PyList::empty_bound(py);
        for (score, node) in reranked.into_iter().take(top_k) {
            let dict = PyDict::new_bound(py);
            dict.set_item("score", score)?;
            dict.set_item("node", node)?;
            result_list.append(dict)?;
        }

        Ok(result_list)
    }

    /// Content-based deduplication using MD5 signatures.
    fn deduplicate<'py>(
        &self,
        py: Python<'py>,
        results: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyList>> {
        use md5;
        let mut seen = HashSet::new();
        let deduped = PyList::empty_bound(py);

        for item in results.iter() {
            let result_obj = item.downcast::<PyDict>()?;
            let node_any = match result_obj.get_item("node")? {
                Some(n) => n,
                None => continue,
            };
            let node = node_any.downcast::<PyDict>()?;
            let content: String = match node.get_item("content")? {
                Some(c) => c.extract()?,
                None => "".to_string(),
            };
            
            // Signature of first 200 chars to allow small variations
            let snippet = content.chars().take(200).collect::<String>();
            let sig = format!("{:x}", md5::compute(snippet.as_bytes()));

            if !seen.contains(&sig) {
                seen.insert(sig);
                deduped.append(result_obj)?;
            }
        }
        Ok(deduped)
    }
}
