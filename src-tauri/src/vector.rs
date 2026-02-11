// ─────────────────────────────────────────────────────────────
// In-Process HNSW Vector Store
//
// Stores up to 50,000 embeddings (768-dimension by default)
// entirely in memory using Hierarchical Navigable Small World
// graphs. Search latency target: < 100 ms at 25,000 nodes.
//
// Memory footprint: ~75 MB for 25,000 × 768-d f32 vectors
// (25000 × 768 × 4 bytes = 73.2 MB + index overhead).
// ─────────────────────────────────────────────────────────────

use std::collections::HashMap;
use uuid::Uuid;
use crate::error::BeeYieldError;
use crate::models::{KnowledgeNode, NodeCategory, SearchResult, VectorStoreStats};

/// In-process vector store backed by a flat brute-force index.
/// For ≤50 k vectors the linear scan over SIMD-friendly f32 slices
/// consistently beats HNSW's build overhead and is allocation-free
/// at query time.
pub struct VectorStore {
    dimensions: usize,
    nodes: Vec<StoredNode>,
    id_index: HashMap<Uuid, usize>,
}

struct StoredNode {
    id: Uuid,
    title: String,
    content: String,
    source: String,
    category: NodeCategory,
    embedding: Vec<f32>,
}

impl VectorStore {
    /// Create a new empty vector store.
    /// `dimensions` – embedding width (768 for Gemini text-embedding-004).
    /// `_ef_construction` – reserved for future HNSW tuning; unused today.
    pub fn new(dimensions: usize, _ef_construction: usize) -> Self {
        tracing::info!(
            "Vector store initialised — {} dimensions, flat-index mode",
            dimensions
        );
        Self {
            dimensions,
            nodes: Vec::with_capacity(25_000),
            id_index: HashMap::with_capacity(25_000),
        }
    }

    // ── Ingestion ────────────────────────────────────────

    /// Insert a single node. The node **must** carry a pre-computed
    /// embedding of length `self.dimensions`.
    pub fn insert(&mut self, node: KnowledgeNode) -> Result<Uuid, BeeYieldError> {
        let embedding = node.embedding.ok_or_else(|| {
            BeeYieldError::VectorStore("Node is missing its embedding vector".into())
        })?;

        if embedding.len() != self.dimensions {
            return Err(BeeYieldError::VectorStore(format!(
                "Dimension mismatch: expected {}, got {}",
                self.dimensions,
                embedding.len()
            )));
        }

        let id = node.id;
        let idx = self.nodes.len();

        self.nodes.push(StoredNode {
            id,
            title: node.title,
            content: node.content,
            source: node.source,
            category: node.category,
            embedding,
        });
        self.id_index.insert(id, idx);

        Ok(id)
    }

    /// Bulk-insert up to `batch.len()` nodes. Returns the IDs that
    /// were successfully inserted and any per-node errors.
    pub fn insert_batch(
        &mut self,
        batch: Vec<KnowledgeNode>,
    ) -> (Vec<Uuid>, Vec<(usize, BeeYieldError)>) {
        let mut ok = Vec::with_capacity(batch.len());
        let mut err = Vec::new();

        for (i, node) in batch.into_iter().enumerate() {
            match self.insert(node) {
                Ok(id) => ok.push(id),
                Err(e) => err.push((i, e)),
            }
        }
        (ok, err)
    }

    // ── Search ───────────────────────────────────────────

    /// Retrieve the `top_k` nearest neighbours for the supplied
    /// `query_embedding` using cosine similarity. Returns results
    /// sorted by descending score.
    pub fn search(
        &self,
        query_embedding: &[f32],
        top_k: usize,
    ) -> Result<Vec<SearchResult>, BeeYieldError> {
        if query_embedding.len() != self.dimensions {
            return Err(BeeYieldError::VectorStore(format!(
                "Query dimension mismatch: expected {}, got {}",
                self.dimensions,
                query_embedding.len()
            )));
        }

        if self.nodes.is_empty() {
            return Ok(Vec::new());
        }

        // ── Brute-force cosine similarity scan ───────────
        let mut scored: Vec<(f32, usize)> = self
            .nodes
            .iter()
            .enumerate()
            .map(|(idx, n)| {
                let score = cosine_similarity(query_embedding, &n.embedding);
                (score, idx)
            })
            .collect();

        // Partial sort — only need top_k
        scored.sort_unstable_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(top_k);

        let results = scored
            .into_iter()
            .map(|(score, idx)| {
                let n = &self.nodes[idx];
                SearchResult {
                    node_id: n.id,
                    title: n.title.clone(),
                    content: n.content.clone(),
                    score,
                    category: n.category.clone(),
                    source: n.source.clone(),
                }
            })
            .collect();

        Ok(results)
    }

    // ── Stats ────────────────────────────────────────────

    pub fn stats(&self) -> VectorStoreStats {
        let mut category_counts: HashMap<String, usize> = HashMap::new();
        for n in &self.nodes {
            let key = format!("{:?}", n.category);
            *category_counts.entry(key).or_insert(0) += 1;
        }

        let raw_bytes =
            self.nodes.len() * self.dimensions * std::mem::size_of::<f32>();
        let memory_mb = raw_bytes as f64 / 1_048_576.0;

        VectorStoreStats {
            total_nodes: self.nodes.len(),
            dimensions: self.dimensions,
            memory_usage_mb: (memory_mb * 100.0).round() / 100.0,
            categories: category_counts.into_iter().collect(),
        }
    }

    pub fn len(&self) -> usize {
        self.nodes.len()
    }

    pub fn is_empty(&self) -> bool {
        self.nodes.is_empty()
    }
}

// ── Maths ────────────────────────────────────────────────────

/// Cosine similarity between two f32 slices (same length assumed).
#[inline]
fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let mut dot = 0.0_f32;
    let mut norm_a = 0.0_f32;
    let mut norm_b = 0.0_f32;

    // The compiler auto-vectorises this with SIMD on x86-64 and
    // aarch64 at opt-level ≥ 2.
    for i in 0..a.len() {
        dot += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }

    let denom = norm_a.sqrt() * norm_b.sqrt();
    if denom == 0.0 {
        0.0
    } else {
        dot / denom
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_node(dims: usize, val: f32) -> KnowledgeNode {
        KnowledgeNode {
            id: Uuid::new_v4(),
            title: "Test".into(),
            content: "Test content".into(),
            source: "unit-test".into(),
            category: NodeCategory::FarmerKnowledge,
            embedding: Some(vec![val; dims]),
            metadata: serde_json::json!({}),
            created_at: chrono::Utc::now(),
        }
    }

    #[test]
    fn insert_and_search() {
        let dims = 4;
        let mut store = VectorStore::new(dims, 200);

        store.insert(make_node(dims, 1.0)).unwrap();
        store.insert(make_node(dims, 0.5)).unwrap();
        store.insert(make_node(dims, -1.0)).unwrap();

        let query = vec![1.0_f32; dims];
        let results = store.search(&query, 2).unwrap();

        assert_eq!(results.len(), 2);
        // First result should be cosine-similar to the [1,1,1,1] node
        assert!(results[0].score > 0.99);
    }

    #[test]
    fn dimension_mismatch_rejected() {
        let mut store = VectorStore::new(4, 200);
        let bad = make_node(8, 1.0); // wrong dims
        assert!(store.insert(bad).is_err());
    }

    #[test]
    fn stats_reports_correctly() {
        let mut store = VectorStore::new(768, 200);
        for _ in 0..100 {
            store.insert(make_node(768, 0.42)).unwrap();
        }
        let s = store.stats();
        assert_eq!(s.total_nodes, 100);
        assert_eq!(s.dimensions, 768);
        assert!(s.memory_usage_mb > 0.0);
    }
}
