//! Pollination Engine — Port of `pollination_service.py`
//!
//! Handles:
//!   - Pollination Requirement Calculations (FPA, Strength, Coverage)
//!   - Bloom-period colony simulation with management modifiers
//!   - Analytics Aggregation for Contracts and Hive Assignments
//!
//! Python usage:
//! ```python
//! from beeyield_core import PollinationEngine
//! engine = PollinationEngine()
//! results = engine.calculate_needs(
//!     crop_type="Avocado",
//!     acreage=10.5,
//!     avg_frames=8.5,
//!     weather_factor=0.9,
//!     target_fpa=2.0,
//! )
//! bloom = engine.simulate_bloom(
//!     frame_count=10,
//!     orientation="East",
//!     has_cover_crop=True,
//!     bloom_period_days=21,
//! )
//! stats = engine.calculate_analytics(contracts_list, sensor_data_list)
//! ```

use pyo3::exceptions::PyValueError;
use pyo3::prelude::*;
use pyo3::types::PyDict;

const STRONG_COLONY_BONUS_HOURS: f64 = 0.75;
const ORIENTATION_BONUS_HOURS: f64 = 44.2 / 60.0;
const COVER_CROP_MULTIPLIER: f64 = 1.10;
const DEFAULT_BEES_PER_FRAME: u32 = 3_000;
const DEFAULT_BASE_FLIGHT_HOURS: f64 = 8.0;

#[derive(Debug, Clone, PartialEq)]
struct BloomSimulationMetrics {
    frame_count: u32,
    orientation: String,
    bees_per_frame: u32,
    total_bees: u32,
    active_foragers: u32,
    forager_ratio: f64,
    daily_flight_hours: f64,
    total_forager_hours: f64,
    bloom_period_days: u32,
    estimated_bloom_forager_hours: f64,
    orientation_bonus_minutes: f64,
    colony_strength_bonus_minutes: f64,
    has_cover_crop: bool,
    pesticide_stewardship: bool,
}

fn round_to(value: f64, decimals: i32) -> f64 {
    let factor = 10_f64.powi(decimals);
    (value * factor).round() / factor
}

fn normalize_orientation_label(orientation: &str) -> String {
    let trimmed = orientation.trim();

    if trimmed.eq_ignore_ascii_case("east") {
        "East".to_string()
    } else if trimmed.eq_ignore_ascii_case("south") {
        "South".to_string()
    } else if trimmed.eq_ignore_ascii_case("west") {
        "West".to_string()
    } else if trimmed.eq_ignore_ascii_case("north") {
        "North".to_string()
    } else if trimmed.is_empty() {
        "East".to_string()
    } else {
        let mut chars = trimmed.chars();
        match chars.next() {
            Some(first) => {
                let first = first.to_ascii_uppercase();
                let remainder = chars.as_str().to_ascii_lowercase();
                format!("{first}{remainder}")
            }
            None => "East".to_string(),
        }
    }
}

fn orientation_has_bonus(orientation: &str) -> bool {
    orientation.eq_ignore_ascii_case("east") || orientation.eq_ignore_ascii_case("south")
}

fn bloom_forager_ratio(frame_count: u32, has_cover_crop: bool) -> f64 {
    let mut forager_ratio = if frame_count <= 6 {
        0.20
    } else if frame_count >= 10 {
        0.24
    } else {
        0.22
    };

    if has_cover_crop {
        forager_ratio *= COVER_CROP_MULTIPLIER;
    }

    forager_ratio
}

fn daily_flight_hours(frame_count: u32, orientation: &str, base_flight_hours: f64) -> (f64, f64, f64) {
    let colony_strength_bonus_minutes = if frame_count >= 10 { 45.0 } else { 0.0 };
    let orientation_bonus_minutes = if orientation_has_bonus(orientation) { 44.2 } else { 0.0 };
    let daily_hours = round_to(
        base_flight_hours
            + if frame_count >= 10 {
                STRONG_COLONY_BONUS_HOURS
            } else {
                0.0
            }
            + if orientation_has_bonus(orientation) {
                ORIENTATION_BONUS_HOURS
            } else {
                0.0
            },
        2,
    );

    (daily_hours, orientation_bonus_minutes, colony_strength_bonus_minutes)
}

fn build_bloom_simulation(
    frame_count: u32,
    orientation: &str,
    bees_per_frame: u32,
    has_cover_crop: bool,
    pesticide_stewardship: bool,
    bloom_period_days: u32,
    base_flight_hours: f64,
) -> BloomSimulationMetrics {
    let total_bees = frame_count.saturating_mul(bees_per_frame);
    let forager_ratio = bloom_forager_ratio(frame_count, has_cover_crop);
    let active_foragers = if pesticide_stewardship {
        ((total_bees as f64) * forager_ratio) as u32
    } else {
        0
    };
    let orientation_label = normalize_orientation_label(orientation);
    let (daily_flight_hours, orientation_bonus_minutes, colony_strength_bonus_minutes) =
        daily_flight_hours(frame_count, &orientation_label, base_flight_hours);
    let total_forager_hours = round_to(active_foragers as f64 * daily_flight_hours, 2);
    let estimated_bloom_forager_hours = round_to(total_forager_hours * bloom_period_days as f64, 2);

    BloomSimulationMetrics {
        frame_count,
        orientation: orientation_label,
        bees_per_frame,
        total_bees,
        active_foragers,
        forager_ratio,
        daily_flight_hours,
        total_forager_hours,
        bloom_period_days,
        estimated_bloom_forager_hours,
        orientation_bonus_minutes,
        colony_strength_bonus_minutes,
        has_cover_crop,
        pesticide_stewardship,
    }
}

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
        let strength_multiplier = (avg_frames / 8.0).powf(1.35);
        let effective_fob = avg_frames * strength_multiplier;
        let adjusted_fob = effective_fob * weather_factor;
        let total_fpa_required = target_fpa * acreage;
        let hives_needed = (total_fpa_required / adjusted_fob).ceil() as u32;
        let actual_fpa = (hives_needed as f64 * avg_frames * weather_factor) / acreage;
        let coverage_health = (actual_fpa / target_fpa * 100.0).round().min(100.0) as u32;
        let foraging_efficiency = (75.0 + (avg_frames - 6.0) * 3.2).round().min(98.0) as u32;

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
        result.set_item("actual_fpa", round_to(actual_fpa, 1))?;
        result.set_item("total_fpa_required", total_fpa_required.round() as u64)?;
        result.set_item("coverage_health_percent", coverage_health)?;
        result.set_item("foraging_efficiency_percent", foraging_efficiency)?;
        result.set_item("strength_category", strength_category)?;
        result.set_item("forage_range_km", forage_range)?;

        Ok(result)
    }

    /// Simulate bloom-period pollination output for a single colony deployment.
    #[pyo3(signature = (
        frame_count,
        orientation = "East",
        bees_per_frame = DEFAULT_BEES_PER_FRAME,
        has_cover_crop = false,
        pesticide_stewardship = true,
        bloom_period_days = 1,
        base_flight_hours = DEFAULT_BASE_FLIGHT_HOURS
    ))]
    fn simulate_bloom<'py>(
        &self,
        py: Python<'py>,
        frame_count: u32,
        orientation: &str,
        bees_per_frame: u32,
        has_cover_crop: bool,
        pesticide_stewardship: bool,
        bloom_period_days: u32,
        base_flight_hours: f64,
    ) -> PyResult<Bound<'py, PyDict>> {
        if frame_count == 0 {
            return Err(PyValueError::new_err("frame_count must be greater than 0"));
        }
        if bees_per_frame == 0 {
            return Err(PyValueError::new_err("bees_per_frame must be greater than 0"));
        }
        if bloom_period_days == 0 {
            return Err(PyValueError::new_err("bloom_period_days must be greater than 0"));
        }
        if base_flight_hours < 0.0 {
            return Err(PyValueError::new_err("base_flight_hours must be non-negative"));
        }

        let metrics = build_bloom_simulation(
            frame_count,
            orientation,
            bees_per_frame,
            has_cover_crop,
            pesticide_stewardship,
            bloom_period_days,
            base_flight_hours,
        );

        let result = PyDict::new_bound(py);
        result.set_item("frame_count", metrics.frame_count)?;
        result.set_item("orientation", metrics.orientation)?;
        result.set_item("bees_per_frame", metrics.bees_per_frame)?;
        result.set_item("total_bees", metrics.total_bees)?;
        result.set_item("active_foragers", metrics.active_foragers)?;
        result.set_item("forager_ratio_percent", round_to(metrics.forager_ratio * 100.0, 2))?;
        result.set_item("daily_flight_hours", metrics.daily_flight_hours)?;
        result.set_item("total_forager_hours", metrics.total_forager_hours)?;
        result.set_item("bloom_period_days", metrics.bloom_period_days)?;
        result.set_item(
            "estimated_bloom_forager_hours",
            metrics.estimated_bloom_forager_hours,
        )?;
        result.set_item("orientation_bonus_minutes", metrics.orientation_bonus_minutes)?;
        result.set_item(
            "colony_strength_bonus_minutes",
            metrics.colony_strength_bonus_minutes,
        )?;
        result.set_item("has_cover_crop", metrics.has_cover_crop)?;
        result.set_item("pesticide_stewardship", metrics.pesticide_stewardship)?;

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
        result.set_item(
            "average_fpa",
            if active_count > 0 {
                round_to(total_fpa_sum / active_count as f64, 2)
            } else {
                0.0
            },
        )?;
        result.set_item(
            "coverage_health_percent",
            if active_count > 0 {
                round_to(coverage_health_sum / active_count as f64, 1)
            } else {
                0.0
            },
        )?;
        result.set_item("healthy_hives", healthy)?;
        result.set_item("warning_hives", warning)?;
        result.set_item("critical_hives", critical)?;
        result.set_item("total_revenue", total_revenue)?;

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::build_bloom_simulation;

    #[test]
    fn bloom_simulation_matches_suboptimal_reference_case() {
        let metrics = build_bloom_simulation(6, "West", 3_000, false, true, 1, 8.0);

        assert_eq!(metrics.total_bees, 18_000);
        assert_eq!(metrics.active_foragers, 3_600);
        assert_eq!(metrics.daily_flight_hours, 8.0);
        assert_eq!(metrics.total_forager_hours, 28_800.0);
        assert_eq!(metrics.orientation_bonus_minutes, 0.0);
        assert_eq!(metrics.colony_strength_bonus_minutes, 0.0);
    }

    #[test]
    fn bloom_simulation_applies_orientation_and_cover_crop_bonuses() {
        let metrics = build_bloom_simulation(10, "East", 3_000, true, true, 1, 8.0);

        assert_eq!(metrics.total_bees, 30_000);
        assert_eq!(metrics.active_foragers, 7_920);
        assert_eq!(metrics.daily_flight_hours, 9.49);
        assert_eq!(metrics.total_forager_hours, 75_160.8);
        assert_eq!(metrics.orientation_bonus_minutes, 44.2);
        assert_eq!(metrics.colony_strength_bonus_minutes, 45.0);
    }

    #[test]
    fn bloom_simulation_zeroes_foragers_when_pesticide_stewardship_fails() {
        let metrics = build_bloom_simulation(10, "East", 3_000, true, false, 1, 8.0);

        assert_eq!(metrics.active_foragers, 0);
        assert_eq!(metrics.total_forager_hours, 0.0);
        assert_eq!(metrics.estimated_bloom_forager_hours, 0.0);
    }

    #[test]
    fn bloom_period_hours_scale_with_bloom_window() {
        let metrics = build_bloom_simulation(10, "South", 3_000, true, true, 21, 8.0);

        assert_eq!(metrics.daily_flight_hours, 9.49);
        assert_eq!(metrics.total_forager_hours, 75_160.8);
        assert_eq!(metrics.estimated_bloom_forager_hours, 1_578_376.8);
    }
}
