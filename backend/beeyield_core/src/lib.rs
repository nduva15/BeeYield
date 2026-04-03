use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};

mod health;
mod standardizer;
mod rate_limit;
mod harvest;
mod image;
mod acoustic;
mod pollination;
mod traceability;
mod ingestion;
mod search;
mod shop;
mod assistant;
mod payments;
mod invoicing;
mod dashboard;

/// BeeYield Core — Rust compute engine exposed to Python via PyO3.
///
/// Architecture:
///   Python holds #[pyclass] references → Rust owns all data.
///   No serialization on hot paths. Only primitives cross the FFI boundary.
#[pymodule]
fn honey_rust(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<health::HiveHealthEngine>()?;
    m.add_class::<standardizer::MetadataEngine>()?;
    m.add_class::<rate_limit::RateLimiter>()?;
    m.add_class::<harvest::HarvestBatcher>()?;
    m.add_class::<image::ImageEngine>()?;
    m.add_class::<acoustic::AcousticEngine>()?;
    m.add_class::<pollination::PollinationEngine>()?;
    m.add_class::<traceability::TraceabilityEngine>()?;
    m.add_class::<ingestion::IngestionEngine>()?;
    m.add_class::<search::SearchEngine>()?;
    m.add_class::<shop::ShopEngine>()?;
    m.add_class::<assistant::Assistant>()?;
    m.add_class::<assistant::IntentDetector>()?;
    m.add_class::<payments::MpesaEngine>()?;
    m.add_class::<invoicing::InvoicingEngine>()?;
    m.add_class::<dashboard::DashboardEngine>()?;
    
    // Standalone functional helpers
    #[pyfunction]
    #[pyo3(signature = (order_id, status, payment_status=None, token=None))]
    fn rust_update_order_status(
        py: Python<'_>,
        order_id: String,
        status: String,
        payment_status: Option<String>,
        token: Option<String>,
    ) -> PyResult<PyObject> {
        let db = py.import_bound("app.db.supabase_db")?;
        let db_update = db.getattr("db_update")?;
        
        let mut update_data = std::collections::HashMap::new();
        update_data.insert("status", status);
        if let Some(ps) = payment_status {
            update_data.insert("payment_status", ps);
        }
        
        let filters = std::collections::HashMap::from([("id", order_id)]);
        
        let kwargs = PyDict::new_bound(py);
        kwargs.set_item("filters", filters)?;
        if let Some(t) = token {
            kwargs.set_item("token", t)?;
        }
        
        db_update.call(( "orders", update_data), Some(&kwargs))?.extract()
    }

    #[pyfunction]
    fn calc_yield(items: &Bound<'_, PyList>) -> PyResult<i64> {
        // Alias for the common weight calculation logic
        // We can just create a temporary ShopEngine or just use the logic directly
        let engine = shop::ShopEngine::new(50_000_000);
        engine.calculate_total_weight(items)
    }

    m.add_function(wrap_pyfunction!(rust_update_order_status, m)?)?;
    m.add_function(wrap_pyfunction!(calc_yield, m)?)?;

    Ok(())
}
