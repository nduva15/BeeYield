//! Pollination Engine — Port of `pollination_service.py`
//!
//! Handles:
//!   - Pollination Requirement Calculations (FPA, Strength, Coverage)
//!   - Analytics Aggregation for Contracts and Hive Assignments
//!
//! Python usage:
//! ```python
//! from beeyield_core import PollinationEngine
//! engine = PollinationEngine()
//! results = engine.calculate_needs(acreage=10.5, crop="Avocado", avg_frames=8.5, weather_factor=0.9)
//! stats = engine.calculate_analytics(contracts_list, sensor_data_list)
//! ```

use pyo3::prelude::*;
use pyo3::types::PyDict;

#[pyclass]
pub struct PollinationEngine;

#[pymethods]
impl PollinationEngine {
    #[new]
    fn new() -> Self {
        Self
    }

    /// Calculate pollination requirements based on crop and acreage.
    /// Ported from `PollinationService.calculate_pollination_needs`.
    fn calculate_needs<'py>(
        &self,
        py: Python<'py>,
        crop_type: &str,
        acreage: f64,
        avg_frames: f64,
        weather_factor: f64,
        target_fpa: f64,
    ) -> PyResult<Bound<'py, PyDict>> {
        // Calculate colony strength multiplier
        // strength_multiplier = (avg_frames / 8)^1.35
        let strength_multiplier = (avg_frames / 8.0).powf(1.35);
        let effective_fob = avg_frames * strength_multiplier;
        
        // Apply weather penalty
        let adjusted_fob = effective_fob * weather_factor;
        
        // Calculate hives needed
        let total_fpa_required = target_fpa * acreage;
        let hives_needed = (total_fpa_required / adjusted_fob).ceil() as u32;
        
        // Calculate actual FPA with the hives needed
        let actual_fpa = (hives_needed as f64 * avg_frames * weather_factor) / acreage;
        
        // Calculate coverage health percentage
        let coverage_health = (actual_fpa / target_fpa * 100.0).round().min(100.0) as u32;
        
        // Calculate foraging efficiency
        let foraging_efficiency = (75.0 + (avg_frames - 6.0) * 3.2).round().min(98.0) as u32;
        
        // Determine strength category
        let (strength_category, forage_range) = if avg_frames >= 11.0 {
            ("ELITE", "1.8 km")
        } else if avg_frames >= 9.0 {
            ("OPTIMAL", "1.5 km")
        } else if avg_frames >= 7.0 {
            ("STANDARD", "1.2 km")
        } else {
            ("MINIMUM", "1.0 km")
        };

        let result = PyDict::new_bound(py);
        result.set_item("crop_type", crop_type)?;
        result.set_item("acreage", acreage)?;
        result.set_item("target_fpa", target_fpa)?;
        result.set_item("hives_needed", hives_needed)?;
        result.set_item("actual_fpa", (actual_fpa * 10.0).round() / 10.0)?;
        result.set_item("total_fpa_required", total_fpa_required.round() as u64)?;
        result.set_item("coverage_health_percent", coverage_health)?;
        result.set_item("foraging_efficiency_percent", foraging_efficiency)?;
        result.set_item("strength_category", strength_category)?;
        result.set_item("forage_range_km", forage_range)?;

        Ok(result)
    }

    /// Aggregate analytics data.
    fn calculate_analytics<'py>(
        &self,
        py: Python<'py>,
        contracts: &Bound<'py, pyo3::types::PyList>,
        sensor_data: &Bound<'py, pyo3::types::PyList>,
    ) -> PyResult<Bound<'py, PyDict>> {
        let mut active_count = 0;
        let mut total_acres = 0.0;
        let mut total_fpa_sum = 0.0;
        let mut coverage_health_sum = 0.0;
        let mut total_revenue = 0.0;
        let mut total_hives_deployed = 0;

        for item in contracts.iter() {
            let c: Bound<'_, PyDict> = item.downcast()?.clone();
            let status: String = c.get_item("status")?.unwrap().extract()?;
            
            if status == "active" {
                active_count += 1;
                let acreage: f64 = c.get_item("farm_size_acres")?.unwrap().extract()?;
                total_acres += acreage;
                
                let actual_fpa: f64 = c.get_item("actual_fpa")?.unwrap().extract()?;
                let target_fpa: f64 = c.get_item("target_fpa")?.unwrap().extract()?;
                
                total_fpa_sum += actual_fpa;
                coverage_health_sum += (actual_fpa / target_fpa * 100.0).min(100.0);
                
                let deployed: u32 = c.get_item("hive_count_deployed")?.unwrap().extract()?;
                total_hives_deployed += deployed;
            }

            let pay_status: String = c.get_item("payment_status")?.unwrap().extract()?;
            if pay_status == "paid" {
                let amount: f64 = c.get_item("payment_amount")?.unwrap().extract()?;
                total_revenue += amount;
            }
        }

        let mut healthy = 0;
        let mut warning = 0;
        let mut critical = 0;

        for item in sensor_data.iter() {
            let s: Bound<'_, PyDict> = item.downcast()?.clone();
            let status: String = s.get_item("status")?.unwrap().extract()?;
            match status.as_str() {
                "healthy" => healthy += 1,
                "warning" => warning += 1,
                "critical" => critical += 1,
                _ => (),
            }
        }

        let result = PyDict::new_bound(py);
        result.set_item("total_contracts", contracts.len())?;
        result.set_item("active_contracts", active_count)?;
        result.set_item("total_hives_deployed", total_hives_deployed)?;
        result.set_item("total_acres_covered", total_acres)?;
        result.set_item("average_fpa", if active_count > 0 { (total_fpa_sum / active_count as f64 * 100.0).round() / 100.0 } else { 0.0 })?;
        result.set_item("coverage_health_percent", if active_count > 0 { (coverage_health_sum / active_count as f64 * 10.0).round() / 10.0 } else { 0.0 })?;
        result.set_item("healthy_hives", healthy)?;
        result.set_item("warning_hives", warning)?;
        result.set_item("critical_hives", critical)?;
        result.set_item("total_revenue", total_revenue)?;

        Ok(result)
    }
}
