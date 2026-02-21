use pyo3::prelude::*;

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

/// BeeYield Core — Rust compute engine exposed to Python via PyO3.
///
/// Architecture:
///   Python holds #[pyclass] references → Rust owns all data.
///   No serialization on hot paths. Only primitives cross the FFI boundary.
#[pymodule]
fn beeyield_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
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
    m.add_class::<assistant::AssistantEngine>()?;
    Ok(())
}
