//! Traceability Engine — Port of `traceability_service.py`
//!
//! Handles:
//!   - Journey Timeline construction
//!   - Impact statistics aggregation
//!   - Batch code generation logic
//!
//! Python usage:
//! ```python
//! from beeyield_core import TraceabilityEngine
//! engine = TraceabilityEngine()
//! timeline = engine.build_timeline(harvest_data, apiary_data)
//! impact_stats = engine.calculate_impact(stats_list)
//! ```

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};

#[pyclass]
pub struct TraceabilityEngine;

#[pymethods]
impl TraceabilityEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Construct a standardized journey timeline from heterogeneous data blocks.
    fn build_timeline<'py>(
        &self,
        py: Python<'py>,
        harvest: &Bound<'py, PyDict>,
        apiary: &Bound<'py, PyDict>,
    ) -> PyResult<Bound<'py, PyList>> {
        let timeline = PyList::empty_bound(py);

        // Step 1: Distribution (Ready for You)
        let step1 = PyDict::new_bound(py);
        step1.set_item("title", "Ready for You")?;
        step1.set_item("date", harvest.get_item("created_at")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "Now").into_any()))?;
        step1.set_item("location", "BeeYield Distribution Center")?;
        let batch_code: String = harvest.get_item("batch_code")?.unwrap_or_else(|| harvest.get_item("id").unwrap().unwrap()).extract()?;
        step1.set_item("description", format!("Batch {} is safely bottled and ready. Purity and standards verified.", batch_code))?;
        step1.set_item("icon", "Jar")?;
        timeline.append(step1)?;

        // Step 2: Processing
        let step2 = PyDict::new_bound(py);
        step2.set_item("title", "Processing & Quality Check")?;
        step2.set_item("date", harvest.get_item("harvest_date")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "").into_any()))?;
        step2.set_item("location", "Makueni Processing Facility")?;
        let moisture = harvest.get_item("moisture_content_percent")?.unwrap_or_else(|| pyo3::types::PyFloat::new_bound(py, 17.5).into_any());
        let grade = harvest.get_item("color_grade")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "Premium").into_any());
        step2.set_item("description", format!("Cold-extracted. Moisture: {}%. Grade: {}.", moisture, grade))?;
        step2.set_item("icon", "Factory")?;
        timeline.append(step2)?;

        // Step 3: Harvest
        let step3 = PyDict::new_bound(py);
        step3.set_item("title", "Harvest Day")?;
        step3.set_item("date", harvest.get_item("harvest_date")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "").into_any()))?;
        step3.set_item("location", apiary.get_item("location_name")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "Local Apiary").into_any()))?;
        let florage = harvest.get_item("florage_type")?.unwrap_or_else(|| pyo3::types::PyString::new_bound(py, "Multifloral").into_any());
        let qty = harvest.get_item("quantity_kg")?.unwrap_or_else(|| pyo3::types::PyFloat::new_bound(py, 0.0).into_any());
        step3.set_item("description", format!("Ethically harvested from {} blooms. {}kg collected.", florage, qty))?;
        step3.set_item("icon", "Basket")?;
        timeline.append(step3)?;

        Ok(timeline)
    }

    /// Calculate impact stats from individual records.
    fn calculate_impact<'py>(
        &self,
        py: Python<'py>,
        records: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let mut total_kg = 0.0;
        let mut hive_ids = std::collections::HashSet::new();
        let mut farmer_ids = std::collections::HashSet::new();

        for item in records.iter() {
            let r: Bound<'_, PyDict> = item.downcast()?.clone();
            total_kg += r.get_item("quantity_kg")?.unwrap().extract::<f64>()?;
            if let Some(h) = r.get_item("hive_id")? {
                hive_ids.insert(h.extract::<String>()?);
            }
            if let Some(f) = r.get_item("farmer_id")? {
                farmer_ids.insert(f.extract::<String>()?);
            }
        }

        let dict = PyDict::new_bound(py);
        dict.set_item("total_honey_kg", total_kg)?;
        dict.set_item("hive_count", hive_ids.len())?;
        dict.set_item("beekeepers", farmer_ids.len())?;
        dict.set_item("trees_planted", (total_kg / 10.0).floor() as u64)?; // 1 tree per 10kg
        Ok(dict)
    }
}
