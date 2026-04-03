//! Admin dashboard analytics engine — moves high-level aggregates to Rust.
use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};

#[pyclass]
pub struct AdminDashboardEngine;

#[pymethods]
impl AdminDashboardEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Compute admin dashboard statistics from raw lists.
    #[pyo3(signature = (orders, products, users, batches, apiaries, hives, pollination_contracts))]
    fn compute_stats<'py>(
        &self,
        py: Python<'py>,
        orders: &Bound<'py, PyList>,
        products: &Bound<'py, PyList>,
        users: &Bound<'py, PyList>,
        batches: &Bound<'py, PyList>,
        apiaries: &Bound<'py, PyList>,
        hives: &Bound<'py, PyList>,
        pollination_contracts: &Bound<'py, PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let total_orders = orders.len();
        let total_products = products.len();
        let total_users = users.len();
        let total_batches = batches.len();
        let total_apiaries = apiaries.len();
        let total_hives = hives.len();
        let total_pollination = pollination_contracts.len();

        let pending_orders = orders
            .iter()
            .filter(|o| {
                o.downcast::<PyDict>()
                    .ok()
                    .and_then(|d| d.get_item("status").ok().flatten())
                    .and_then(|s| s.extract::<String>().ok())
                    .map(|s| s.eq_ignore_ascii_case("pending"))
                    .unwrap_or(false)
            })
            .count();

        let active_products = products
            .iter()
            .filter(|p| {
                p.downcast::<PyDict>()
                    .ok()
                    .and_then(|d| d.get_item("is_active").ok().flatten())
                    .and_then(|v| v.extract::<bool>().ok())
                    .unwrap_or(false)
            })
            .count();

        let mut total_revenue: f64 = 0.0;
        for o in orders.iter() {
            if let Ok(d) = o.downcast::<PyDict>() {
                if let Some(status) = d.get_item("status").ok().flatten() {
                    if let Ok(s) = status.extract::<String>() {
                        if s.eq_ignore_ascii_case("cancelled") {
                            continue;
                        }
                    }
                }
                let amt: f64 = d
                    .get_item("total_amount")
                    .ok()
                    .flatten()
                    .and_then(|v| v.extract().ok())
                    .unwrap_or(0.0);
                total_revenue += amt;
            }
        }

        let mut total_honey_kg: f64 = 0.0;
        for b in batches.iter() {
            if let Ok(d) = b.downcast::<PyDict>() {
                let qty: f64 = d
                    .get_item("quantity_kg")
                    .ok()
                    .flatten()
                    .and_then(|v| v.extract().ok())
                    .or_else(|| {
                        d.get_item("total_quantity_kg")
                            .ok()
                            .flatten()
                            .and_then(|v| v.extract().ok())
                    })
                    .unwrap_or(0.0);
                total_honey_kg += qty;
            }
        }

        let mut total_acres: f64 = 0.0;
        for p in pollination_contracts.iter() {
            if let Ok(d) = p.downcast::<PyDict>() {
                let acres: f64 = d
                    .get_item("farm_size_acres")
                    .ok()
                    .flatten()
                    .and_then(|v| v.extract().ok())
                    .unwrap_or(0.0);
                total_acres += acres;
            }
        }

        let out = PyDict::new_bound(py);
        out.set_item("total_orders", total_orders)?;
        out.set_item("total_products", total_products)?;
        out.set_item("total_users", total_users)?;
        out.set_item("total_batches", total_batches)?;
        out.set_item("total_apiaries", total_apiaries)?;
        out.set_item("total_hives", total_hives)?;
        out.set_item("total_pollination", total_pollination)?;
        out.set_item("pending_orders", pending_orders)?;
        out.set_item("active_products", active_products)?;
        out.set_item("total_revenue_kes", total_revenue)?;
        out.set_item("total_honey_kg", total_honey_kg)?;
        out.set_item("total_acres", total_acres)?;
        out.set_item("last_updated", chrono::Utc::now().to_rfc3339())?;
        Ok(out)
    }
}
