// ─────────────────────────────────────────────────────────────
// HoneyChain Merkle Verification (Rust mirror)
//
// Verifies batch integrity against the Python HoneyChain by
// recomputing SHA-256 Merkle roots from the sealed batch data.
// This is a read-only verifier — chain writes remain in Python.
// ─────────────────────────────────────────────────────────────

use crate::error::BeeYieldError;
use crate::models::BatchVerification;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

pub struct HoneyVerifier {
    client: Client,
}

#[derive(Debug, Deserialize)]
struct ChainBlock {
    index: u64,
    batch_code: String,
    data: serde_json::Value,
    merkle_root: String,
    previous_hash: String,
    hash: String,
}

#[derive(Debug, Deserialize)]
struct ChainStatusResponse {
    chain_length: u64,
    is_valid: bool,
    last_block_hash: String,
}

impl HoneyVerifier {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    /// Verify a single batch by fetching its block from the Python
    /// backend and re-computing the Merkle root locally.
    pub async fn verify_batch(
        &self,
        backend_url: &str,
        batch_code: &str,
    ) -> Result<BatchVerification, BeeYieldError> {
        // Fetch the block from the Python HoneyChain API
        let url = format!(
            "{}/api/v1/traceability/verify/{}",
            backend_url, batch_code
        );

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| BeeYieldError::HoneyChain(format!("Backend unreachable: {e}")))?;

        if !resp.status().is_success() {
            return Err(BeeYieldError::HoneyChain(format!(
                "Batch {} not found in chain",
                batch_code
            )));
        }

        let block: ChainBlock = resp
            .json()
            .await
            .map_err(|e| BeeYieldError::HoneyChain(format!("Parse error: {e}")))?;

        // Re-compute Merkle root from the block data
        let recomputed_root = self.compute_merkle_root(&block.data)?;
        let roots_match = recomputed_root == block.merkle_root;

        // Verify block hash integrity
        let hash_valid = self.verify_block_hash(&block);
        let integrity_score = if roots_match && hash_valid {
            1.0
        } else if roots_match || hash_valid {
            0.5
        } else {
            0.0
        };

        Ok(BatchVerification {
            batch_code: batch_code.to_string(),
            is_valid: roots_match && hash_valid,
            merkle_root: block.merkle_root,
            block_index: block.index,
            chain_length: 0, // filled by caller if needed
            integrity_score,
            details: serde_json::json!({
                "merkle_match": roots_match,
                "hash_valid": hash_valid,
                "recomputed_root": recomputed_root,
                "block_hash": block.hash,
            }),
        })
    }

    /// Get the overall chain health status.
    pub async fn chain_status(
        &self,
        backend_url: &str,
    ) -> Result<ChainStatusResponse, BeeYieldError> {
        let url = format!("{}/api/v1/traceability/status", backend_url);

        let resp = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| BeeYieldError::HoneyChain(format!("Backend unreachable: {e}")))?;

        resp.json()
            .await
            .map_err(|e| BeeYieldError::HoneyChain(format!("Parse error: {e}")))
    }

    // ── Internal helpers ─────────────────────────────────

    /// Compute a Merkle root from a JSON value by hashing its
    /// serialized leaf nodes pairwise up to a single root.
    fn compute_merkle_root(&self, data: &serde_json::Value) -> Result<String, BeeYieldError> {
        let leaves = self.extract_leaves(data);
        if leaves.is_empty() {
            return Ok(hex::encode(Sha256::digest(b"")));
        }

        let mut hashes: Vec<Vec<u8>> = leaves
            .iter()
            .map(|leaf| Sha256::digest(leaf.as_bytes()).to_vec())
            .collect();

        while hashes.len() > 1 {
            let mut next_level = Vec::with_capacity((hashes.len() + 1) / 2);
            for pair in hashes.chunks(2) {
                let mut hasher = Sha256::new();
                hasher.update(&pair[0]);
                if pair.len() > 1 {
                    hasher.update(&pair[1]);
                } else {
                    hasher.update(&pair[0]); // duplicate odd leaf
                }
                next_level.push(hasher.finalize().to_vec());
            }
            hashes = next_level;
        }

        Ok(hex::encode(&hashes[0]))
    }

    /// Flatten a JSON value into a sorted list of canonical leaf strings.
    fn extract_leaves(&self, value: &serde_json::Value) -> Vec<String> {
        match value {
            serde_json::Value::Object(map) => {
                let mut leaves = Vec::new();
                let mut keys: Vec<&String> = map.keys().collect();
                keys.sort();
                for key in keys {
                    let child_leaves = self.extract_leaves(&map[key]);
                    for leaf in child_leaves {
                        leaves.push(format!("{}:{}", key, leaf));
                    }
                }
                leaves
            }
            serde_json::Value::Array(arr) => arr
                .iter()
                .flat_map(|v| self.extract_leaves(v))
                .collect(),
            other => vec![other.to_string()],
        }
    }

    /// Verify that a block's hash matches its contents.
    fn verify_block_hash(&self, block: &ChainBlock) -> bool {
        let payload = format!(
            "{}{}{}{}",
            block.index,
            block.previous_hash,
            serde_json::to_string(&block.data).unwrap_or_default(),
            block.merkle_root,
        );
        let computed = hex::encode(Sha256::digest(payload.as_bytes()));
        computed == block.hash
    }
}
