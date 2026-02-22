//! Shop Engine — Port of `shop_service.py`
//!
//! Handles:
//!   - Product weight calculations
//!   - Batch assignment logic (Smart Batching)
//!   - Total honey sold statistics
//!   - Order data sanitization
//!
//! Architecture:
//!   Rust handles the inventory logic and batch selection.
//!   Python handles the DB CRUD and M-Pesa/Payment integrations.

use pyo3::prelude::*;
use pyo3::types::{PyDict, PyList};
use rand::seq::SliceRandom;
use rand::thread_rng;

#[pyclass]
pub struct ShopEngine {
    total_harvest_limit_grams: i64,
}

#[pymethods]
impl ShopEngine {
    #[new]
    pub fn new(total_harvest_limit_grams: i64) -> Self {
        Self {
            total_harvest_limit_grams,
        }
    }

    /// Calculate total grams from a list of order items.
    pub fn calculate_total_weight(&self, items: &Bound<'_, PyList>) -> PyResult<i64> {
        let mut total_grams = 0;
        for item in items.iter() {
            let item_dict = item.downcast::<PyDict>()?;
            if let Some(name_bound) = item_dict.get_item("product_name")? {
                let name = name_bound.extract::<String>()?.to_lowercase();
                if name.contains("honey") || name.contains("acacia") || name.contains("blossom") {
                    let size_str = match item_dict.get_item("variant_size")? {
                        Some(v) => v.extract::<String>()?.to_lowercase(),
                        None => "500g".to_string(),
                    };
                    let qty = match item_dict.get_item("quantity")? {
                        Some(v) => v.extract::<i64>()?,
                        None => 1,
                    };
                    total_grams += self.parse_size_to_grams(&size_str) * qty;
                }
            }
        }
        Ok(total_grams)
    }

    /// Select batches for a list of items based on total weight.
    /// Implements the "1 unique batch per ~600g" logic.
    fn select_batches<'py>(
        &self,
        py: Python<'py>,
        items: &Bound<'py, PyList>,
        available_hive_codes: Vec<String>,
    ) -> PyResult<Bound<'py, PyList>> {
        let mut total_honey_weight = 0;
        for item in items.iter() {
            let item_dict = item.downcast::<PyDict>()?;
            if let Some(name_bound) = item_dict.get_item("product_name")?.or(item_dict.get_item("name")?) {
                let name = name_bound.extract::<String>()?.to_lowercase();
                if name.contains("honey") || name.contains("acacia") || name.contains("blossom") {
                    let size_str = match item_dict.get_item("variant_size")? {
                        Some(v) => v.extract::<String>()?.to_lowercase(),
                        None => "500g".to_string(),
                    };
                    let qty = match item_dict.get_item("quantity")? {
                        Some(v) => v.extract::<i64>()?,
                        None => 1,
                    };
                    total_honey_weight += self.parse_size_to_grams(&size_str) * qty;
                }
            }
        }

        let mut batches = std::collections::HashSet::new();
        if total_honey_weight > 0 && !available_hive_codes.is_empty() {
            let avg_batch_size = 600;
            let mut num_hives_needed = (total_honey_weight as f64 / avg_batch_size as f64).ceil() as usize;
            
            let mut rng = thread_rng();
            if num_hives_needed > 1 {
                num_hives_needed += *[0, 1].choose(&mut rng).unwrap();
            }
            
            let count = num_hives_needed.min(available_hive_codes.len());
            let mut available = available_hive_codes.clone();
            available.shuffle(&mut rng);
            
            for hive_code in available.into_iter().take(count) {
                let base_code = hive_code.replace("-2026", "");
                batches.insert(format!("{}-2026", base_code));
            }
        }

        let result = PyList::empty_bound(py);
        let mut sorted_batches: Vec<String> = batches.into_iter().collect();
        sorted_batches.sort();
        for b in sorted_batches {
            result.append(b)?;
        }
        Ok(result)
    }

    /// Check if a combined weight exceeds the total harvest limit.
    fn is_in_stock(&self, current_sold_grams: i64, new_order_grams: i64) -> bool {
        current_sold_grams + new_order_grams <= self.total_harvest_limit_grams
    }

    /// Functional helper to validate if an order can be marked as paid.
    fn set_order_paid(&self, current_status: &str) -> bool {
        current_status == "pending" || current_status == "processing"
    }
}

impl ShopEngine {
    fn parse_size_to_grams(&self, size_str: &str) -> i64 {
        if size_str.contains("1kg") { 1000 }
        else if size_str.contains("500g") { 500 }
        else if size_str.contains("250g") { 250 }
        else { 500 } // Default
    }
}
