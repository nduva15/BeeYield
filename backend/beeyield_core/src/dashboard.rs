//! Dashboard analytics engine — moves dashboard aggregates out of Python.
//!
//! Consumes lists of dicts (apiaries, hives, harvests, tasks) and returns
//! the same stats shape expected by the BeeYield dashboard.

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};

#[pyclass]
pub struct DashboardEngine;

#[pymethods]
impl DashboardEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Compute dashboard aggregates.
    #[pyo3(signature = (apiaries, hives, harvests, tasks))]
    fn compute_stats<'py>(
        &self,
        py: Python<'py>,
        apiaries: &Bound<'py, PyList>,
        hives: &Bound<'py, PyList>,
        harvests: &Bound<'py, PyList>,
        tasks: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let total_apiaries = apiaries.len();
        let total_hives = hives.len();
        let total_harvests = harvests.len();
        let total_tasks = tasks.len();

        // Sum helpers
        let mut total_honey_kg: f64 = 0.0;
        for item in harvests.iter() {
            let dict: Bound<'_, PyDict> = item.downcast()?.clone();
            let qty: f64 = dict
                .get_item("quantity_kg")?
                .and_then(|v| v.extract().ok())
                .unwrap_or(0.0);
            total_honey_kg += qty;
        }

        let mut total_acres: f64 = 0.0;
        for item in apiaries.iter() {
            let dict: Bound<'_, PyDict> = item.downcast()?.clone();
            let acres: f64 = dict
                .get_item("size_acres")?
                .and_then(|v| v.extract().ok())
                .unwrap_or(0.0);
            total_acres += acres;
        }

        let pending_tasks = tasks
            .iter()
            .filter(|t| {
                t.downcast::<PyDict>()
                    .ok()
                    .and_then(|d| d.get_item("status").ok().flatten())
                    .and_then(|s| s.extract::<String>().ok())
                    .map(|s| s.eq_ignore_ascii_case("pending"))
                    .unwrap_or(false)
            })
            .count();

        let active_hives = hives
            .iter()
            .filter(|h| {
                h.downcast::<PyDict>()
                    .ok()
                    .and_then(|d| d.get_item("status").ok().flatten())
                    .and_then(|s| s.extract::<String>().ok())
                    .map(|s| {
                        let lower = s.to_lowercase();
                        lower.contains("active") || lower.contains("healthy")
                    })
                    .unwrap_or(false)
            })
            .count();

        let active_apiaries = apiaries
            .iter()
            .filter(|a| {
                a.downcast::<PyDict>()
                    .ok()
                    .and_then(|d| d.get_item("status").ok().flatten())
                    .and_then(|s| s.extract::<String>().ok())
                    .map(|s| s.eq_ignore_ascii_case("active"))
                    .unwrap_or(false)
            })
            .count();

        let result = PyDict::new_bound(py);
        result.set_item("total_apiaries", total_apiaries)?;
        result.set_item("total_hives", total_hives)?;
        result.set_item("active_hives", active_hives)?;
        result.set_item("total_harvests", total_harvests)?;
        result.set_item("total_honey_kg", total_honey_kg)?;
        result.set_item("total_acres", total_acres)?;
        result.set_item("total_tasks", total_tasks)?;
        result.set_item("pending_tasks", pending_tasks)?;
        result.set_item("active_apiaries", active_apiaries)?;

        Ok(result)
    }
}
