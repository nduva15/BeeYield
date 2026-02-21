//! Acoustic Engine — Port of `acoustic_analyzer.py`
//!
//! Handles:
//!   - Audio Segmenting (2s windowing)
//!   - Result Aggregation (Majority voting with confidence weighting)
//!
//! Python usage:
//! ```python
//! from beeyield_core import AcousticEngine
//! engine = AcousticEngine()
//! segments = engine.segment_audio(audio_numpy, sr=22050)
//! final_result = engine.aggregate_results(segment_results)
//! ```

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use std::collections::HashMap;

#[pyclass]
pub struct AcousticEngine;

#[pymethods]
impl AcousticEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Segment audio into 2-second windows (BEE-SOUND-ANALYSIS standard).
    /// Input is a flat vec of f32 (from numpy).
    fn segment_audio(&self, audio: Vec<f32>, sr: usize) -> Vec<Vec<f32>> {
        let duration_samples = 2 * sr;
        if audio.len() < duration_samples {
            return vec![audio];
        }

        let mut segments = Vec::new();
        let mut start = 0;
        while start + duration_samples <= audio.len() {
            segments.push(audio[start..start + duration_samples].to_vec());
            start += duration_samples;
        }
        segments
    }

    /// Aggregate results using majority voting with confidence weighting.
    fn aggregate_results<'py>(
        &self,
        py: Python<'py>,
        results: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let mut votes: HashMap<String, usize> = HashMap::new();
        let mut confidence_sums: HashMap<String, f64> = HashMap::new();
        let mut piping_count = 0;

        for item in results.iter() {
            let res: Bound<'_, PyDict> = item.downcast()?.clone();
            
            let state: String = res.get_item("state")?.unwrap().extract()?;
            let confidence: f64 = res.get_item("confidence")?.unwrap().extract()?;
            let piping: bool = res.get_item("piping")?.unwrap().extract()?;

            if piping {
                piping_count += 1;
            }

            *votes.entry(state.clone()).or_insert(0) += 1;
            *confidence_sums.entry(state).or_insert(0.0) += confidence;
        }

        if votes.is_empty() {
            let empty = PyDict::new_bound(py);
            empty.set_item("state", "Unknown")?;
            empty.set_item("confidence", 0.0)?;
            return Ok(empty);
        }

        // Find winner (majority vote)
        let winner = votes.iter().max_by_key(|&(_, count)| count).unwrap().0;
        let avg_confidence = confidence_sums.get(winner).unwrap() / (*votes.get(winner).unwrap() as f64);

        let final_dict = PyDict::new_bound(py);
        final_dict.set_item("state", winner)?;
        final_dict.set_item("confidence", avg_confidence)?;
        final_dict.set_item("piping_segments", piping_count)?;
        final_dict.set_item("alert", piping_count > 0)?;
        final_dict.set_item("segments_analyzed", results.len())?;

        let details = PyDict::new_bound(py);
        for (state, count) in votes {
            let state_details = PyDict::new_bound(py);
            state_details.set_item("votes", count)?;
            state_details.set_item("avg_confidence", confidence_sums.get(&state).unwrap() / (count as f64))?;
            details.set_item(state, state_details)?;
        }
        final_dict.set_item("details", details)?;

        Ok(final_dict)
    }
}
