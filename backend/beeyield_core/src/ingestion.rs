//! Ingestion Engine — Port of `ingestion_pipelines.py`
//!
//! Handles:
//!   - Domain-specific transformations
//!   - Lakehouse statistics calculation
//!   - High-performance content hashing (duplicate detection)
//!
//! Architecture:
//!   Rust handles the CPU-intensive transformation of thousands of raw nodes.
//!   Python handles the I/O (loading files, Qdrant upsert).

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use std::collections::{HashMap, HashSet};
use sha2::{Sha256, Digest};

#[pyclass]
pub struct IngestionEngine;

#[pymethods]
impl IngestionEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Transform a batch of raw items according to domain rules.
    /// This replaces the Python `transform()` methods in a vectorized way.
    fn transform_batch<'py>(
        &self,
        py: Python<'py>,
        domain: &str,
        items: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyList>> {
        let result_list = PyList::empty_bound(py);

        for item in items.iter() {
            let raw: Bound<'_, PyDict> = item.downcast()?.clone();
            let transformed = match domain {
                "academic" => self.transform_academic(py, &raw)?,
                "iot_acoustic" => self.transform_iot(py, &raw)?,
                "geospatial" => self.transform_geospatial(py, &raw)?,
                "disease_stressor" => self.transform_disease(py, &raw)?,
                "traceability" => self.transform_traceability(py, &raw)?,
                _ => raw, // Default return raw if domain unknown
            };
            result_list.append(transformed)?;
        }

        Ok(result_list)
    }

    /// Calculate aggregate stats for the lakehouse nodes.
    /// Replaces the Python `Counter` logic.
    fn calculate_stats<'py>(
        &self,
        py: Python<'py>,
        nodes: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let mut total_nodes = 0;
        let mut domain_counts: HashMap<String, u32> = HashMap::new();
        let mut repo_counts: HashMap<String, u32> = HashMap::new();
        let mut continent_counts: HashMap<String, u32> = HashMap::new();
        let mut reliability_sum = 0.0;
        let mut reliability_count = 0;

        for item in nodes.iter() {
            let node: Bound<'_, PyDict> = item.downcast()?.clone();
            total_nodes += 1;

            let meta_obj = node.get_item("metadata")?;
            if let Some(meta) = meta_obj {
                let meta_dict: Bound<'_, PyDict> = meta.downcast()?.clone();
                
                if let Some(d) = meta_dict.get_item("knowledge_domain")? {
                    *domain_counts.entry(d.extract()?).or_insert(0) += 1;
                }
                if let Some(r) = meta_dict.get_item("source_repository")? {
                    *repo_counts.entry(r.extract()?).or_insert(0) += 1;
                }
                if let Some(c) = meta_dict.get_item("continent")? {
                    *continent_counts.entry(c.extract()?).or_insert(0) += 1;
                }
                if let Some(rel) = meta_dict.get_item("reliability_score")? {
                    reliability_sum += rel.extract::<f64>()?;
                    reliability_count += 1;
                }
            }
        }

        let stats = PyDict::new_bound(py);
        stats.set_item("total_nodes", total_nodes)?;
        stats.set_item("by_domain", domain_counts)?;
        stats.set_item("by_repository", repo_counts)?;
        stats.set_item("by_continent", continent_counts)?;
        stats.set_item("avg_reliability", if reliability_count > 0 { reliability_sum / reliability_count as f64 } else { 0.0 })?;
        
        Ok(stats)
    }

    /// Optimized duplicate detection using SHA-256 content hashes.
    fn filter_duplicates<'py>(
        &self,
        _py: Python<'py>,
        existing_hashes: HashSet<String>,
        new_nodes: &Bound<'py, PyList>,
    ) -> PyResult<Vec<usize>> {
        let mut keep_indices = Vec::new();
        for (i, item) in new_nodes.iter().enumerate() {
            let node: Bound<'_, PyDict> = item.downcast()?.clone();
            let content: String = node.get_item("content")?.ok_or_else(|| pyo3::exceptions::PyKeyError::new_err("content"))?.extract()?;
            
            let mut hasher = Sha256::new();
            hasher.update(content.as_bytes());
            let hash = format!("{:x}", hasher.finalize());

            if !existing_hashes.contains(&hash) {
                keep_indices.push(i);
            }
        }
        Ok(keep_indices)
    }
}

// ─── Domain-Specific Transformers (Internal) ───

impl IngestionEngine {
    fn transform_academic<'py>(&self, py: Python<'py>, raw: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let abstract_text: String = raw.get_item("abstract")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let full_text: String = raw.get_item("full_text")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let content = if !full_text.is_empty() { full_text } else { abstract_text };

        let journal: String = raw.get_item("journal")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let pub_date: String = raw.get_item("publication_date")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "n.d.".to_string());
        let source = if !journal.is_empty() { format!("{} ({})", journal, pub_date) } else { "Academic Paper".to_string() };

        let dict = PyDict::new_bound(py);
        dict.set_item("content", content)?;
        dict.set_item("title", raw.get_item("title")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "Untitled Paper").into_any()))?;
        dict.set_item("source", source)?;
        dict.set_item("url", raw.get_item("url")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "").into_any()))?;
        dict.set_item("authors", raw.get_item("authors")?.unwrap_or_else(|| pyo3::types::PyList::empty_bound(py).into_any()))?;
        dict.set_item("publication_date", raw.get_item("publication_date")?.unwrap_or_else(|| py.None().bind(py).clone().into_any()))?;
        
        let meta = PyDict::new_bound(py);
        meta.set_item("doi", raw.get_item("doi")?.unwrap_or_else(|| py.None().bind(py).clone().into_any()))?;
        meta.set_item("tags", vec![journal, "academic".to_string(), "peer-reviewed".to_string()])?;
        if pub_date.len() >= 4 {
            meta.set_item("data_vintage", &pub_date[0..4])?;
        }
        dict.set_item("metadata", meta)?;
        
        Ok(dict)
    }

    fn transform_iot<'py>(&self, py: Python<'py>, raw: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let name: String = raw.get_item("dataset_name")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let state: String = raw.get_item("colony_state")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "unknown".to_string());
        let sensor: String = raw.get_item("sensor_type")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "unknown".to_string());
        let hz: i32 = raw.get_item("sample_rate_hz")?.map(|v| v.extract()).transpose()?.unwrap_or(0);
        let loc: String = raw.get_item("location")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let desc: String = raw.get_item("description")?.map(|v| v.extract()).transpose()?.unwrap_or_default();

        let content = format!(
            "Dataset: {}\nColony State: {}\nSensor: {} at {} Hz\nLocation: {}\n{}",
            name, state, sensor, hz, loc, desc
        );

        let dict = PyDict::new_bound(py);
        dict.set_item("content", content)?;
        dict.set_item("title", format!("{} — {}", name, state))?;
        dict.set_item("source", name.clone())?;
        dict.set_item("publication_date", raw.get_item("recording_date")?.unwrap_or_else(|| py.None().bind(py).clone().into_any()))?;
        
        let meta = PyDict::new_bound(py);
        meta.set_item("tags", vec![sensor, state, name, "iot".to_string(), "acoustic".to_string()])?;
        dict.set_item("metadata", meta)?;

        Ok(dict)
    }

    fn transform_geospatial<'py>(&self, py: Python<'py>, raw: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let species: String = raw.get_item("species")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let common: String = raw.get_item("common_name")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let lat: f64 = raw.get_item("latitude")?.map(|v| v.extract()).transpose()?.unwrap_or(0.0);
        let lng: f64 = raw.get_item("longitude")?.map(|v| v.extract()).transpose()?.unwrap_or(0.0);
        let country: String = raw.get_item("country")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let region: String = raw.get_item("region")?.map(|v| v.extract()).transpose()?.unwrap_or_default();
        let habitat: String = raw.get_item("habitat")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let obs_date: String = raw.get_item("observation_date")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let source_db: String = raw.get_item("source_db")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let occ_id: String = raw.get_item("occurrence_id")?.map(|v| v.extract()).transpose()?.unwrap_or_default();

        let content = format!(
            "Species: {} ({})\nLocation: {}, {} ({:.4}, {:.4})\nHabitat: {}\nObserved: {}\nSource: {} #{}",
            species, common, region, country, lat, lng, habitat, obs_date, source_db, occ_id
        );

        let dict = PyDict::new_bound(py);
        dict.set_item("content", content)?;
        dict.set_item("title", format!("{} — {}", species, country))?;
        dict.set_item("source", source_db.clone())?;
        if source_db.to_lowercase() == "gbif" {
            dict.set_item("url", format!("https://www.gbif.org/occurrence/{}", occ_id))?;
        }
        dict.set_item("publication_date", raw.get_item("observation_date")?.unwrap_or_else(|| py.None().bind(py).clone().into_any()))?;
        
        let meta = PyDict::new_bound(py);
        meta.set_item("tags", vec![species, habitat, "biodiversity".to_string(), "geospatial".to_string()])?;
        dict.set_item("metadata", meta)?;

        Ok(dict)
    }

    fn transform_disease<'py>(&self, py: Python<'py>, raw: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let disease: String = raw.get_item("disease")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let pathogen: String = raw.get_item("pathogen")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let host: String = raw.get_item("host_species")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Apis mellifera".to_string());
        let treatment: String = raw.get_item("treatment")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "None reported".to_string());
        let eff: f64 = raw.get_item("efficacy_pct")?.map(|v| v.extract()).transpose()?.unwrap_or(0.0);
        let cost: f64 = raw.get_item("cost_usd")?.map(|v| v.extract()).transpose()?.unwrap_or(0.0);
        let framework: String = raw.get_item("source_framework")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());

        let content = format!(
            "Disease: {}\nPathogen: {}\nHost: {}\nTreatment: {}\nEfficacy: {}%\nCost per Colony: ${:.2} USD\nFramework: {}",
            disease, pathogen, host, treatment, eff, cost, framework
        );

        let dict = PyDict::new_bound(py);
        dict.set_item("content", content)?;
        dict.set_item("title", format!("{} — {}", disease, pathogen))?;
        dict.set_item("source", framework.clone())?;
        
        let meta = PyDict::new_bound(py);
        meta.set_item("economic_impact_usd", cost)?;
        meta.set_item("tags", vec![pathogen, disease, treatment, "disease".to_string(), "stressor".to_string()])?;
        if let Some(yr) = raw.get_item("year")? {
            meta.set_item("data_vintage", yr.to_string())?;
        }
        dict.set_item("metadata", meta)?;

        Ok(dict)
    }

    fn transform_traceability<'py>(&self, py: Python<'py>, raw: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let name: String = raw.get_item("standard_name")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let method: String = raw.get_item("method")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());
        let body: String = raw.get_item("certifying_body")?.map(|v| v.extract()).transpose()?.unwrap_or_else(|| "Unknown".to_string());

        let content = format!(
            "Standard: {}\nMethod: {}\nCertifying Body: {}",
            name, method, body
        );

        let dict = PyDict::new_bound(py);
        dict.set_item("content", content)?;
        dict.set_item("title", format!("{} — {}", name, method))?;
        dict.set_item("source", body.clone())?;
        
        let meta = PyDict::new_bound(py);
        meta.set_item("tags", vec![method, name, "traceability".to_string(), "authentication".to_string(), "quality".to_string()])?;
        dict.set_item("metadata", meta)?;

        Ok(dict)
    }
}
