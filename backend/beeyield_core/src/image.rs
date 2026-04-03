//! Image Analysis Engine — Port of `image_analysis_service.py`
//!
//! Handles:
//!   - Detection Result Aggregation
//!   - Disease Indicator Computation
//!   - Health Scoring logic
//!   - Non-Maximum Suppression (NMS) for overlapping boxes
//!   - Intelligent simulation logic (moved from Python)
//!
//! Python usage:
//! ```python
//! from beeyield_core import ImageEngine
//! engine = ImageEngine()
//! results = engine.aggregate_diseases(detections)
//! score, status = engine.calculate_health_score(detections, indicators)
//! filtered_boxes = engine.apply_nms(boxes, threshold=0.5)
//! ```

use pyo3::prelude::*;
use pyo3::types::PyDict;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BBox {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[pyclass]
pub struct ImageEngine;

#[pymethods]
impl ImageEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Aggregate disease indicators from individual bee detections.
    /// Returns a list of indicators (disease, probability, affected_bees, severity).
    fn aggregate_diseases<'py>(
        &self,
        py: Python<'py>,
        detections: &Bound<'py, pyo3::types::PyList>,
    ) -> PyResult<Vec<Bound<'py, PyDict>>> {
        let mut disease_counts: HashMap<String, usize> = HashMap::new();
        let mut disease_bees: HashMap<String, Vec<i32>> = HashMap::new();
        let mut total_classified = 0;

        for item in detections.iter() {
            let d: Bound<'_, PyDict> = item.downcast()?.clone();
            let health_res = d.get_item("health")?;
            let health: String = match health_res {
                Some(h) => h.extract()?,
                None => "Unknown".to_string(),
            };

            let id_res = d.get_item("id")?;
            let id: i32 = match id_res {
                Some(i) => i.extract()?,
                None => 0,
            };

            if health != "Unknown" {
                total_classified += 1;
            }

            if health != "Healthy" && health != "Unknown" {
                *disease_counts.entry(health.clone()).or_insert(0) += 1;
                disease_bees.entry(health).or_insert_with(Vec::new).push(id);
            }
        }

        let mut indicators = Vec::new();
        for (disease, count) in disease_counts {
            let probability = if total_classified > 0 {
                count as f64 / total_classified as f64
            } else {
                0.0
            };

            let severity = if probability > 0.3 {
                "Critical"
            } else if probability > 0.15 {
                "High"
            } else if probability > 0.05 {
                "Medium"
            } else {
                "Low"
            };

            let dict = PyDict::new_bound(py);
            dict.set_item("disease", disease.clone())?;
            dict.set_item("probability", (probability * 100.0).round() / 100.0)?;
            
            // Simplified affected bees mapping for PyO3
            let bees = disease_bees.get(&disease).cloned().unwrap_or_default();
            dict.set_item("affected_bees", bees)?;
            dict.set_item("severity", severity)?;
            indicators.push(dict);
        }

        // Sort by probability descending (in Python this is done after return, but we can do it here)
        Ok(indicators)
    }

    /// Deterministic health classification for detections.
    /// Adds `health` and `health_confidence` fields to each detection dict.
    fn classify_health<'py>(
        &self,
        py: Python<'py>,
        detections: &Bound<'py, pyo3::types::PyList>,
    ) -> PyResult<Vec<Bound<'py, PyDict>>> {
        let mut classified = Vec::new();
        for (idx, item) in detections.iter().enumerate() {
            let d: Bound<'_, PyDict> = item.downcast()?.clone();
            // Use confidence and a stable id-derived hash to pick a label (no randomness).
            let conf: f64 = d
                .get_item("confidence")?
                .and_then(|c| c.extract().ok())
                .unwrap_or(0.5);
            let id_hash = (idx as i32 + 1) % 10;

            let (health, h_conf) = if conf >= 0.9 {
                ("Healthy", (conf * 0.97).min(0.99))
            } else if conf >= 0.8 {
                if id_hash % 3 == 0 {
                    ("Varroa", 0.82)
                } else {
                    ("Healthy", conf * 0.9)
                }
            } else if conf >= 0.7 {
                if id_hash % 2 == 0 {
                    ("DWV", 0.76)
                } else {
                    ("Nosema", 0.74)
                }
            } else {
                ("Unknown", 0.6)
            };

            d.set_item("health", health)?;
            d.set_item("health_confidence", (h_conf * 100.0).round() / 100.0)?;
            classified.push(d);
        }
        Ok(classified)
    }

    /// Calculate overall health score (0-100) and status.
    fn calculate_health_score(&self, detections_count: usize, indicators: &Bound<'_, pyo3::types::PyList>) -> PyResult<(u32, String)> {
        if detections_count == 0 {
            return Ok((0, "Unknown".to_string()));
        }

        let mut score: i32 = 100;

        for item in indicators.iter() {
            let ind: Bound<'_, PyDict> = item.downcast()?.clone();
            let sev_res = ind.get_item("severity")?;
            let severity: String = match sev_res {
                Some(s) => s.extract()?,
                None => "Low".to_string(),
            };

            match severity.as_str() {
                "Critical" => score -= 40,
                "High" => score -= 25,
                "Medium" => score -= 15,
                "Low" => score -= 5,
                _ => (),
            }
        }

        let final_score = score.clamp(0, 100) as u32;
        let status = if final_score >= 80 {
            "Healthy"
        } else if final_score >= 50 {
            "Warning"
        } else {
            "Critical"
        };

        Ok((final_score, status.to_string()))
    }

    /// Generate operator recommendations based on status/diseases.
    fn generate_recommendations(
        &self,
        health_status: &str,
        indicators: &Bound<'_, pyo3::types::PyList>,
        bee_count: usize,
    ) -> PyResult<Vec<String>> {
        let mut recs = Vec::new();
        if bee_count == 0 {
            recs.push("No bees detected. Re-scan at the hive entrance during peak activity.".to_string());
            return Ok(recs);
        }

        match health_status {
            "Healthy" => {
                recs.push("Colony appears healthy. Continue regular monitoring every 7-10 days.".to_string());
            }
            "Warning" => {
                recs.push("Some health concerns detected. Perform a detailed inspection within 48 hours.".to_string());
            }
            _ => {
                recs.push("⚠️ CRITICAL: Immediate hive inspection and treatment recommended.".to_string());
            }
        }

        for item in indicators.iter() {
            let ind: Bound<'_, PyDict> = item.downcast()?.clone();
            let disease: String = ind.get_item("disease")?.and_then(|d| d.extract().ok()).unwrap_or_default();
            let prob: f64 = ind.get_item("probability")?.and_then(|p| p.extract().ok()).unwrap_or(0.0);

            if disease == "Varroa" && prob > 0.05 {
                recs.push(format!("Varroa risk (~{}%). Apply Oxalic/Formic acid per label.", (prob * 100.0).round() as i32));
            } else if disease == "DWV" && prob > 0.03 {
                recs.push("DWV indicators present. Treat mites and monitor brood pattern.".to_string());
            } else if disease == "Nosema" && prob > 0.03 {
                recs.push("Nosema possible. Improve ventilation and reduce moisture.".to_string());
            }
        }

        Ok(recs)
    }

    /// Fast Non-Maximum Suppression for detection boxes.
    fn apply_nms(&self, boxes: Vec<(f64, f64, f64, f64, f64)>, threshold: f64) -> Vec<usize> {
        let mut indices: Vec<usize> = (0..boxes.len()).collect();
        // Sort by score (5th element) descending
        indices.sort_by(|&a, &b| boxes[b].4.partial_cmp(&boxes[a].4).unwrap());

        let mut keep = Vec::new();
        while !indices.is_empty() {
            let i = indices.remove(0);
            keep.push(i);

            indices.retain(|&j| {
                let iou = compute_iou(&boxes[i], &boxes[j]);
                iou <= threshold
            });
        }
        keep
    }

    /// Intelligent simulation for bee detection.
    /// Moved from Python to Rust for consistent results across services.
    fn simulate_detections<'py>(
        &self,
        py: Python<'py>,
        width: i32,
        height: i32,
        brightness: f64,
        contrast: f64,
        yellow_ratio: f64,
        confidence_threshold: f64,
    ) -> PyResult<Bound<'py, pyo3::types::PyList>> {
        use rand::Rng;
        let mut rng = rand::thread_rng();

        let mut base_count = 25;
        if yellow_ratio > 0.05 { base_count += 20; }
        if contrast > 50.0 { base_count += 10; }
        if brightness > 100.0 && brightness < 200.0 { base_count += 5; }

        let estimated_count = (base_count as i32 + rng.gen_range(-10..15)).clamp(5, 80);
        let list = pyo3::types::PyList::empty_bound(py);

        let min_side = std::cmp::min(width, height) as f64;
        let min_size = f64::max(30.0, min_side / 20.0) as i32;
        let max_size = f64::max(50.0, min_side / 10.0) as i32;

        for i in 0..estimated_count {
            let box_w = rng.gen_range(min_size..max_size);
            let box_h = rng.gen_range(min_size..max_size + 10);
            let x = rng.gen_range(10..((width - box_w - 10).max(11)));
            let y = rng.gen_range(10..((height - box_h - 10).max(11)));

            let center_x = width as f64 / 2.0;
            let center_y = height as f64 / 2.0;
            let dist = ((x as f64 - center_x).powi(2) + (y as f64 - center_y).powi(2)).sqrt();
            let max_dist = (center_x.powi(2) + center_y.powi(2)).sqrt();
            let pos_factor = 1.0 - (dist / max_dist) * 0.3;

            let conf = (rng.gen_range(confidence_threshold..0.98) * pos_factor).clamp(confidence_threshold, 0.99);

            if conf >= confidence_threshold {
                let dict = PyDict::new_bound(py);
                dict.set_item("id", i + 1)?;
                dict.set_item("label", "Bee")?;
                dict.set_item("confidence", (conf * 100.0).round() / 100.0)?;
                
                let bbox = PyDict::new_bound(py);
                bbox.set_item("x", x)?;
                bbox.set_item("y", y)?;
                bbox.set_item("width", box_w)?;
                bbox.set_item("height", box_h)?;
                
                dict.set_item("bbox", bbox)?;
                list.append(dict)?;
            }
        }
        
        Ok(list)
    }
}

// ─── Internal Helpers ───

fn compute_iou(a: &(f64, f64, f64, f64, f64), b: &(f64, f64, f64, f64, f64)) -> f64 {
    let x1 = a.0.max(b.0);
    let y1 = a.1.max(b.1);
    let x2 = a.2.min(b.2);
    let y2 = a.3.min(b.3);

    let inter_area = (x2 - x1).max(0.0) * (y2 - y1).max(0.0);
    let a_area = (a.2 - a.0) * (a.3 - a.1);
    let b_area = (b.2 - b.0) * (b.3 - b.1);

    inter_area / (a_area + b_area - inter_area)
}
