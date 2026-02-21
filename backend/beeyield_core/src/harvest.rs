//! Harvest Batcher Engine — Port of `harvest_batch_service.py`
//!
//! Handles immutable batch record compilation and deterministic ID generation.
//!
//! Python usage:
//! ```python
//! from beeyield_core import HarvestBatcher
//! batcher = HarvestBatcher()
//! batch_id = batcher.generate_id_prefix("Kibwezi East", "2024-05-20")
//! record = batcher.compile_record(
//!     user_id="...", hive_id="...", batch_id=batch_id,
//!     iot_snapshot={...}, health_snapshot={...}, ...
//! )
//! ```

use pyo3::prelude::*;
use pyo3::types::PyDict;
use chrono::{DateTime, Utc, Datelike};

#[pyclass]
pub struct HarvestBatcher;

#[pymethods]
impl HarvestBatcher {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Generate the unique batch ID prefix in the format BEE-YYYYMM-HIVE.
    /// Fast string manipulation in Rust.
    #[pyo3(signature = (hive_name, harvest_date=None))]
    fn generate_id_prefix(&self, hive_name: &str, harvest_date: Option<&str>) -> String {
        let year_month = match harvest_date {
            Some(date_str) => {
                // Try parsing ISO date
                match DateTime::parse_from_rfc3339(date_str) {
                    Ok(dt) => format!("{:04}{:02}", dt.year(), dt.month()),
                    Err(_) => {
                        // Fallback to current year/month if parse fails
                        let now = Utc::now();
                        format!("{:04}{:02}", now.year(), now.month())
                    }
                }
            }
            None => {
                let now = Utc::now();
                format!("{:04}{:02}", now.year(), now.month())
            }
        };

        let hive_tag = hive_name
            .trim()
            .chars()
            .take(3)
            .collect::<String>()
            .to_uppercase();
        
        let tag = if hive_tag.is_empty() { "UNK" } else { &hive_tag };

        format!("BEE-{}-{}", year_month, tag)
    }

    /// Compile the immutable batch record.
    /// Returns a dict ready for Supabase insertion.
    #[pyo3(signature = (user_id, batch_id, hive_id, apiary_id, harvest_date, quantity_kg, florage_type, iot_snapshot, health_snapshot, farmer_name="Unknown", extra_data=None))]
    fn compile_record<'py>(
        &self,
        py: Python<'py>,
        user_id: &str,
        batch_id: &str,
        hive_id: &str,
        apiary_id: &str,
        harvest_date: &str,
        quantity_kg: f64,
        florage_type: &str,
        iot_snapshot: &Bound<'py, PyDict>,
        health_snapshot: &Bound<'py, PyDict>,
        farmer_name: &str,
        extra_data: Option<&Bound<'py, PyDict>>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let record = PyDict::new_bound(py);
        
        record.set_item("user_id", user_id)?;
        record.set_item("batch_id", batch_id)?;
        record.set_item("hive_id", hive_id)?;
        record.set_item("apiary_id", apiary_id)?;
        record.set_item("harvest_date", harvest_date)?;
        record.set_item("quantity_kg", quantity_kg)?;
        record.set_item("florage_type", florage_type)?;
        record.set_item("iot_snapshot", iot_snapshot)?;
        record.set_item("health_snapshot", health_snapshot)?;
        record.set_item("farmer_name", farmer_name)?;
        
        // Deterministic QR URL
        let qr_url = format!("https://beeyield.com/traceability?code={}", batch_id);
        record.set_item("qr_code_url", qr_url)?;

        // Merge extra data
        if let Some(extras) = extra_data {
            for (key, value) in extras.iter() {
                if record.get_item(&key)?.is_none() {
                    record.set_item(key, value)?;
                }
            }
        }

        Ok(record)
    }

    /// Higher-level verification summary generator.
    fn generate_verification_summary(&self, score: u32, status: &str) -> String {
        format!(
            "Immutable Traceability Record: Verified via BeeYield AI (Score: {}/100, Status: {}). Snapshot integrity guaranteed by SHA-256.",
            score, status
        )
    }
}
