//! Metadata Standardizer Engine — Port of `metadata_standardizer.py`
//!
//! Handles the compute-heavy operations:
//!   - Deterministic SHA-256 Global ID (GID) generation
//!   - Content hashing
//!   - Knowledge domain classification (regex-based)
//!   - Source repository detection
//!   - Reliability tier assignment
//!   - DOI extraction
//!   - Geography detection
//!   - Content chunking with overlap
//!   - Batch standardization
//!
//! Python usage:
//! ```python
//! from beeyield_core import MetadataEngine
//! engine = MetadataEngine()
//! gid = engine.compute_global_id("content...", "https://source.com")
//! domain = engine.detect_domain("text about varroa mites...", "researchgate.net")
//! nodes = engine.standardize_batch(raw_items)  # One FFI call → all computation in Rust
//! ```

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use regex::Regex;
use sha2::{Sha256, Digest as Sha2Digest};
use serde::{Deserialize, Serialize};

// ─── Constants ───

const CHUNK_SIZE: usize = 1500;
const CHUNK_OVERLAP: usize = 200;

// ─── Domain + Repository Enums (mirrored from Python) ───

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
enum KnowledgeDomain {
    Academic,
    IotAcoustic,
    GeospatialBiodiversity,
    DiseaseStressor,
    TraceabilityQuality,
    InternalOps,
    General,
}

impl KnowledgeDomain {
    fn as_str(&self) -> &'static str {
        match self {
            Self::Academic => "academic",
            Self::IotAcoustic => "iot_acoustic",
            Self::GeospatialBiodiversity => "geospatial",
            Self::DiseaseStressor => "disease_stressor",
            Self::TraceabilityQuality => "traceability",
            Self::InternalOps => "internal_ops",
            Self::General => "general",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
enum SourceRepository {
    ResearchGate,
    Frontiers,
    PlosOne,
    Springer,
    Elsevier,
    EuPollinatorHub,
    MustB,
    Icipe,
    INaturalist,
    Gbif,
    NuHive,
    BuzzDataset,
    Osbh,
    BeeyieldInternal,
    Sentinel2,
    Custom,
}

impl SourceRepository {
    fn as_str(&self) -> &'static str {
        match self {
            Self::ResearchGate => "researchgate",
            Self::Frontiers => "frontiers",
            Self::PlosOne => "plos_one",
            Self::Springer => "springer",
            Self::Elsevier => "elsevier",
            Self::EuPollinatorHub => "eu_pollinator_hub",
            Self::MustB => "must_b_efsa",
            Self::Icipe => "icipe_african_ref_lab",
            Self::INaturalist => "inaturalist",
            Self::Gbif => "gbif",
            Self::NuHive => "nu_hive",
            Self::BuzzDataset => "buzz_dataset",
            Self::Osbh => "osbh",
            Self::BeeyieldInternal => "beeyield_internal",
            Self::Sentinel2 => "sentinel2_satellite",
            Self::Custom => "custom",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
enum ReliabilityTier {
    PeerReviewed,
    Institutional,
    Government,
    Community,
    Internal,
    Unverified,
}

impl ReliabilityTier {
    fn as_str(&self) -> &'static str {
        match self {
            Self::PeerReviewed => "peer_reviewed",
            Self::Institutional => "institutional",
            Self::Government => "government",
            Self::Community => "community",
            Self::Internal => "internal",
            Self::Unverified => "unverified",
        }
    }

    fn score(&self) -> f64 {
        match self {
            Self::PeerReviewed => 0.95,
            Self::Institutional => 0.85,
            Self::Government => 0.80,
            Self::Community => 0.60,
            Self::Internal => 0.70,
            Self::Unverified => 0.30,
        }
    }
}

// ─── Internal Node (Rust-owned, never crosses FFI until export) ───

#[derive(Debug, Clone)]
struct StandardizedNode {
    global_id: String,
    content_hash: String,
    domain: KnowledgeDomain,
    source_repo: SourceRepository,
    reliability_tier: ReliabilityTier,
    reliability_score: f64,
    title: String,
    source: String,
    url: String,
    doi: Option<String>,
    authors: Vec<String>,
    continent: String,
    country: String,
    region: String,
    content: String,
    chunk_index: usize,
    total_chunks: usize,
    word_count: usize,
    tags: Vec<String>,
}

// ─── PyO3 Class ───

#[pyclass]
pub struct MetadataEngine {
    doi_regex: Regex,
    author_regex: Regex,
    domain_patterns: Vec<(KnowledgeDomain, Regex)>,
    repo_patterns: Vec<(SourceRepository, Regex)>,
    geo_patterns: Vec<(&'static str, &'static str, &'static str, Regex)>,
}

#[pymethods]
impl MetadataEngine {
    #[new]
    fn new() -> PyResult<Self> {
        Ok(Self {
            doi_regex: Regex::new(r"10\.\d{4,}/[^\s]+").unwrap(),
            author_regex: Regex::new(r"(?:(?:Dr\.?|Prof\.?)\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})").unwrap(),
            domain_patterns: vec![
                (KnowledgeDomain::Academic, Regex::new(r"(?i)(?:abstract|journal|peer.?review|doi|publication|hypothesis|methodology|findings|conclusion)").unwrap()),
                (KnowledgeDomain::IotAcoustic, Regex::new(r"(?i)(?:sensor|iot|acoustic|mfcc|spectrogram|frequency|arduino|raspberry|mqtt)").unwrap()),
                (KnowledgeDomain::GeospatialBiodiversity, Regex::new(r"(?i)(?:latitude|longitude|habitat|species|coordinate|gps|ndvi|satellite|gbif)").unwrap()),
                (KnowledgeDomain::DiseaseStressor, Regex::new(r"(?i)(?:varroa|nosema|chalkbrood|pesticide|disease|pathogen|infestation|mortality)").unwrap()),
                (KnowledgeDomain::TraceabilityQuality, Regex::new(r"(?i)(?:traceability|batch|harvest|quality|certification|organic|label|qr.?code)").unwrap()),
                (KnowledgeDomain::InternalOps, Regex::new(r"(?i)(?:beeyield|internal|operations|dashboard|admin|deployment)").unwrap()),
            ],
            repo_patterns: vec![
                (SourceRepository::ResearchGate, Regex::new(r"(?i)researchgate").unwrap()),
                (SourceRepository::Frontiers, Regex::new(r"(?i)frontiersin").unwrap()),
                (SourceRepository::PlosOne, Regex::new(r"(?i)plos").unwrap()),
                (SourceRepository::Springer, Regex::new(r"(?i)springer|link\.springer").unwrap()),
                (SourceRepository::Elsevier, Regex::new(r"(?i)elsevier|sciencedirect").unwrap()),
                (SourceRepository::EuPollinatorHub, Regex::new(r"(?i)eu.?pollinator").unwrap()),
                (SourceRepository::MustB, Regex::new(r"(?i)must.?b|efsa").unwrap()),
                (SourceRepository::Icipe, Regex::new(r"(?i)icipe|african.?ref").unwrap()),
                (SourceRepository::INaturalist, Regex::new(r"(?i)inaturalist").unwrap()),
                (SourceRepository::Gbif, Regex::new(r"(?i)gbif").unwrap()),
                (SourceRepository::NuHive, Regex::new(r"(?i)nu.?hive").unwrap()),
                (SourceRepository::BuzzDataset, Regex::new(r"(?i)buzz.?dataset").unwrap()),
                (SourceRepository::Osbh, Regex::new(r"(?i)osbh").unwrap()),
                (SourceRepository::Sentinel2, Regex::new(r"(?i)sentinel").unwrap()),
                (SourceRepository::BeeyieldInternal, Regex::new(r"(?i)beeyield").unwrap()),
            ],
            geo_patterns: vec![
                ("Africa", "Kenya", "East Africa", Regex::new(r"(?i)kenya|nairobi|mombasa|kisumu").unwrap()),
                ("Africa", "Ethiopia", "East Africa", Regex::new(r"(?i)ethiopia|addis\s?ababa").unwrap()),
                ("Africa", "Tanzania", "East Africa", Regex::new(r"(?i)tanzania|dar\s?es\s?salaam").unwrap()),
                ("Africa", "Uganda", "East Africa", Regex::new(r"(?i)uganda|kampala").unwrap()),
                ("Africa", "South Africa", "Southern Africa", Regex::new(r"(?i)south\s?africa|capetown|johannesburg").unwrap()),
                ("Africa", "Nigeria", "West Africa", Regex::new(r"(?i)nigeria|lagos").unwrap()),
                ("Europe", "Germany", "Western Europe", Regex::new(r"(?i)germany|berlin|munich").unwrap()),
                ("Europe", "France", "Western Europe", Regex::new(r"(?i)france|paris|marseille").unwrap()),
                ("Europe", "UK", "Western Europe", Regex::new(r"(?i)united kingdom|england|london|wales|scotland").unwrap()),
                ("North America", "USA", "North America", Regex::new(r"(?i)united states|usa|california|new york|texas").unwrap()),
                ("Asia", "China", "East Asia", Regex::new(r"(?i)china|beijing|shanghai").unwrap()),
                ("Asia", "India", "South Asia", Regex::new(r"(?i)india|mumbai|delhi|bangalore").unwrap()),
                ("South America", "Brazil", "South America", Regex::new(r"(?i)brazil|são paulo|rio").unwrap()),
                ("Oceania", "Australia", "Oceania", Regex::new(r"(?i)australia|sydney|melbourne").unwrap()),
            ],
        })
    }

    /// Deterministic SHA-256 GID from content + source.
    fn compute_global_id(&self, content: &str, source: &str) -> String {
        self.compute_gid_internal(content, source)
    }

    /// SHA-256 content hash.
    fn compute_content_hash(&self, content: &str) -> String {
        self.compute_content_hash_internal(content)
    }

    /// Classify content into one of 7 knowledge domains.
    fn detect_domain(&self, content: &str, source: &str) -> String {
        let combined = format!("{} {}", content, source);
        self.detect_domain_internal(&combined).as_str().to_string()
    }

    /// Identify source repository from URL/source string.
    fn detect_source_repo(&self, url: &str, source: &str) -> String {
        self.detect_source_repo_internal(url, source).as_str().to_string()
    }

    /// Extract DOI from content or URL.
    fn extract_doi(&self, content: &str, url: &str) -> Option<String> {
        self.extract_doi_internal(content, url)
    }

    /// Extract likely author names from content.
    fn extract_authors(&self, content: &str) -> Vec<String> {
        self.extract_authors_internal(content)
    }

    /// Detect geography from content. Returns dict with continent/country/region.
    fn detect_geography<'py>(&self, py: Python<'py>, content: &str) -> PyResult<Bound<'py, PyDict>> {
        let (continent, country, region) = self.detect_geography_internal(content);
        let dict = PyDict::new_bound(py);
        dict.set_item("continent", continent)?;
        dict.set_item("country", country)?;
        dict.set_item("region", region)?;
        Ok(dict)
    }

    /// Assign reliability tier and score. Returns dict with tier/score.
    fn detect_reliability<'py>(
        &self,
        py: Python<'py>,
        domain: &str,
        source_repo: &str,
        has_doi: bool,
    ) -> PyResult<Bound<'py, PyDict>> {
        let (tier, score) = self.detect_reliability_from_strings(domain, source_repo, has_doi);
        let dict = PyDict::new_bound(py);
        dict.set_item("tier", tier.as_str())?;
        dict.set_item("score", score)?;
        Ok(dict)
    }

    /// Split long content into overlapping chunks (for embedding).
    fn chunk_content(&self, content: &str) -> Vec<String> {
        chunk_with_overlap(content, CHUNK_SIZE, CHUNK_OVERLAP)
    }

    /// Standardize a single raw data dict → list of node dicts.
    fn standardize<'py>(&self, py: Python<'py>, raw_data: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyList>> {
        let nodes = self.standardize_internal(raw_data)?;
        let py_nodes: Vec<Bound<'py, PyDict>> = nodes.iter()
            .map(|n| node_to_pydict(py, n))
            .collect::<PyResult<_>>()?;
        let result = PyList::new_bound(py, &py_nodes);
        Ok(result)
    }

    /// Batch standardize — ONE FFI call for N items. All processing in Rust.
    fn standardize_batch<'py>(
        &self,
        py: Python<'py>,
        raw_items: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let mut all_nodes: Vec<StandardizedNode> = Vec::new();
        let mut errors: Vec<String> = Vec::new();

        for item in raw_items.iter() {
            let dict: Bound<'py, PyDict> = item.downcast()?.clone();
            match self.standardize_internal(&dict) {
                Ok(nodes) => all_nodes.extend(nodes),
                Err(e) => errors.push(format!("{}", e)),
            }
        }

        let result = PyDict::new_bound(py);
        let py_nodes: Vec<Bound<'py, PyDict>> = all_nodes.iter()
            .map(|n| node_to_pydict(py, n))
            .collect::<PyResult<_>>()?;
        let nodes_list = PyList::new_bound(py, &py_nodes);
        result.set_item("nodes", nodes_list)?;
        result.set_item("count", all_nodes.len())?;
        result.set_item("errors", &errors)?;
        Ok(result)
    }
}

// ─── Internal Logic (never crosses FFI) ───

impl MetadataEngine {
    fn standardize_internal(
        &self,
        raw: &Bound<'_, PyDict>,
    ) -> PyResult<Vec<StandardizedNode>> {
        let content: String = raw
            .get_item("content")?
            .map(|v| v.extract::<String>())
            .transpose()?
            .unwrap_or_default();

        let title: String = raw
            .get_item("title")?
            .map(|v| v.extract::<String>())
            .transpose()?
            .unwrap_or_else(|| content.chars().take(80).collect());

        let source: String = raw
            .get_item("source")?
            .map(|v| v.extract::<String>())
            .transpose()?
            .unwrap_or_default();

        let url: String = raw
            .get_item("url")?
            .map(|v| v.extract::<String>())
            .transpose()?
            .unwrap_or_default();

        if content.is_empty() {
            return Err(pyo3::exceptions::PyValueError::new_err(
                "Content field is required",
            ));
        }

        // All compute happens here in Rust
        let combined = format!("{} {}", &content, &source);
        let domain = self.detect_domain_internal(&combined);
        let source_repo = self.detect_source_repo_internal(&url, &source);
        let doi = self.extract_doi_internal(&content, &url);
        let has_doi = doi.is_some();
        let reliability = self.detect_reliability_internal(domain, source_repo, has_doi);
        let authors = self.extract_authors_internal(&content);
        let (continent, country, region) = self.detect_geography_internal(&content);
        let word_count = content.split_whitespace().count();
        let content_hash = self.compute_content_hash_internal(&content);

        let chunks = chunk_with_overlap(&content, CHUNK_SIZE, CHUNK_OVERLAP);
        let total_chunks = chunks.len();

        let nodes: Vec<StandardizedNode> = chunks
            .into_iter()
            .enumerate()
            .map(|(i, chunk)| {
                let gid = self.compute_gid_internal(&chunk, &source);
                StandardizedNode {
                    global_id: gid,
                    content_hash: content_hash.clone(),
                    domain,
                    source_repo,
                    reliability_tier: reliability.0,
                    reliability_score: reliability.1,
                    title: title.clone(),
                    source: source.clone(),
                    url: url.clone(),
                    doi: doi.clone(),
                    authors: authors.clone(),
                    continent: continent.clone(),
                    country: country.clone(),
                    region: region.clone(),
                    content: chunk,
                    chunk_index: i,
                    total_chunks,
                    word_count,
                    tags: Vec::new(),
                }
            })
            .collect();

        Ok(nodes)
    }

    fn compute_gid_internal(&self, content: &str, source: &str) -> String {
        let mut hasher = Sha256::new();
        Sha2Digest::update(&mut hasher, content.as_bytes());
        Sha2Digest::update(&mut hasher, b"|");
        Sha2Digest::update(&mut hasher, source.as_bytes());
        let result = hasher.finalize();
        format!("GID-{}", hex::encode(&result[..16]))
    }

    fn compute_content_hash_internal(&self, content: &str) -> String {
        let mut hasher = Sha256::new();
        Sha2Digest::update(&mut hasher, content.as_bytes());
        hex::encode(hasher.finalize())
    }

    fn detect_domain_internal(&self, combined: &str) -> KnowledgeDomain {
        let mut best = KnowledgeDomain::General;
        let mut best_score = 0usize;
        for (domain, pattern) in &self.domain_patterns {
            let score = pattern.find_iter(combined).count();
            if score > best_score {
                best_score = score;
                best = *domain;
            }
        }
        best
    }

    fn detect_source_repo_internal(&self, url: &str, source: &str) -> SourceRepository {
        let combined = format!("{} {}", url, source);
        for (repo, pattern) in &self.repo_patterns {
            if pattern.is_match(&combined) {
                return *repo;
            }
        }
        SourceRepository::Custom
    }

    fn extract_doi_internal(&self, content: &str, url: &str) -> Option<String> {
        let combined = format!("{} {}", content, url);
        self.doi_regex.find(&combined).map(|m| m.as_str().to_string())
    }

    fn extract_authors_internal(&self, content: &str) -> Vec<String> {
        self.author_regex
            .captures_iter(content)
            .take(10)
            .filter_map(|cap| cap.get(1).map(|m| m.as_str().to_string()))
            .collect()
    }

    fn detect_geography_internal(&self, content: &str) -> (String, String, String) {
        for (continent, country, region, pattern) in &self.geo_patterns {
            if pattern.is_match(content) {
                return (
                    continent.to_string(),
                    country.to_string(),
                    region.to_string(),
                );
            }
        }
        ("Unknown".into(), "Unknown".into(), "Unknown".into())
    }

    fn detect_reliability_internal(
        &self,
        domain: KnowledgeDomain,
        source_repo: SourceRepository,
        has_doi: bool,
    ) -> (ReliabilityTier, f64) {
        let tier = if has_doi {
            ReliabilityTier::PeerReviewed
        } else if source_repo == SourceRepository::BeeyieldInternal {
            ReliabilityTier::Internal
        } else {
            match domain {
                KnowledgeDomain::Academic | KnowledgeDomain::IotAcoustic => {
                    ReliabilityTier::Institutional
                }
                KnowledgeDomain::GeospatialBiodiversity => ReliabilityTier::Community,
                _ => ReliabilityTier::Unverified,
            }
        };
        (tier, tier.score())
    }

    fn detect_reliability_from_strings(
        &self,
        domain: &str,
        source_repo: &str,
        has_doi: bool,
    ) -> (ReliabilityTier, f64) {
        let tier = if has_doi {
            ReliabilityTier::PeerReviewed
        } else if source_repo == "beeyield_internal" {
            ReliabilityTier::Internal
        } else {
            match domain {
                "academic" | "iot_acoustic" => ReliabilityTier::Institutional,
                "geospatial" => ReliabilityTier::Community,
                _ => ReliabilityTier::Unverified,
            }
        };
        (tier, tier.score())
    }
}

// ─── Utility Functions ───

fn chunk_with_overlap(text: &str, max_size: usize, overlap: usize) -> Vec<String> {
    if text.len() <= max_size {
        return vec![text.to_string()];
    }

    let mut chunks = Vec::new();
    let bytes = text.as_bytes();
    let mut start = 0;

    while start < bytes.len() {
        let end = (start + max_size).min(bytes.len());

        let actual_end = if end < bytes.len() {
            let slice = &bytes[start..end];
            match slice.iter().rposition(|&b| b == b' ' || b == b'\n') {
                Some(pos) => start + pos + 1,
                None => end,
            }
        } else {
            end
        };

        let chunk = String::from_utf8_lossy(&bytes[start..actual_end]).to_string();
        chunks.push(chunk);

        if actual_end >= bytes.len() {
            break;
        }

        start = if actual_end > overlap {
            actual_end - overlap
        } else {
            actual_end
        };
    }

    chunks
}

fn node_to_pydict<'py>(py: Python<'py>, node: &StandardizedNode) -> PyResult<Bound<'py, PyDict>> {
    let dict = PyDict::new_bound(py);

    let meta = PyDict::new_bound(py);
    meta.set_item("global_id", &node.global_id)?;
    meta.set_item("knowledge_domain", node.domain.as_str())?;
    meta.set_item("source_repository", node.source_repo.as_str())?;
    meta.set_item("reliability_tier", node.reliability_tier.as_str())?;
    meta.set_item("reliability_score", node.reliability_score)?;
    meta.set_item("title", &node.title)?;
    meta.set_item("source", &node.source)?;
    meta.set_item("url", &node.url)?;
    meta.set_item("doi", &node.doi)?;
    meta.set_item("authors", &node.authors)?;
    meta.set_item("continent", &node.continent)?;
    meta.set_item("country", &node.country)?;
    meta.set_item("region", &node.region)?;
    meta.set_item("word_count", node.word_count)?;
    meta.set_item("tags", &node.tags)?;

    dict.set_item("metadata", meta)?;
    dict.set_item("content", &node.content)?;
    dict.set_item("content_hash", &node.content_hash)?;
    dict.set_item("chunk_index", node.chunk_index)?;
    dict.set_item("total_chunks", node.total_chunks)?;

    Ok(dict)
}
