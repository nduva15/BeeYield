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
            let name_result = item_dict.get_item("product_name")?.or(item_dict.get_item("name")?);
            if let Some(name_bound) = name_result {
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

    /// Idempotency Protocol: "Never Trust the Client"
    /// 1. Check if the key exists in the billing_ledger.
    /// 2. If it does, return the existing record immediately.
    /// 3. If not, create a placeholder record and proceed.
    pub fn process_idempotent(&self, py: Python<'_>, idempotency_key: String, user_id: Option<String>, payload: &Bound<'_, PyDict>) -> PyResult<PyObject> {
        let db = py.import_bound("app.db.supabase_db")?;
        let db_select_sync = db.getattr("db_select_sync")?;
        let db_insert_sync = db.getattr("db_insert_sync")?;

        // Part 1: Check for existing transaction
        let mut filters = std::collections::HashMap::new();
        filters.insert("idempotency_key", idempotency_key.clone());
        
        let kwargs = PyDict::new_bound(py);
        kwargs.set_item("filters", filters)?;
        
        // Use sync SELECT
        let result_py = db_select_sync.call(("billing_ledger",), Some(&kwargs))?;
        let existing: Bound<'_, PyList> = result_py.downcast_into::<PyList>()?;
        
        if existing.len() > 0 {
            // Found cached transaction — return the first match
            return Ok(existing.get_item(0)?.to_object(py));
        }

        // Part 2: Proceed with new transaction record
        let mut payment_data = std::collections::HashMap::new();
        if let Some(uid) = user_id {
            payment_data.insert("user_id", uid);
        }
        payment_data.insert("idempotency_key", idempotency_key);
        payment_data.insert("payment_status", "processing".to_string());
        
        // Extract details from payload
        if let Some(amt) = payload.get_item("amount")? {
             payment_data.insert("amount", amt.extract::<String>()?);
        }
        if let Some(curr) = payload.get_item("currency")? {
             payment_data.insert("currency", curr.extract::<String>()?);
        }
        if let Some(desc) = payload.get_item("description")? {
             payment_data.insert("description", desc.extract::<String>()?);
        }
        payment_data.insert("transaction_type", "income".to_string());
        payment_data.insert("module_type", "shop".to_string());

        // Use sync INSERT
        let data_py = PyDict::new_bound(py);
        for (k, v) in payment_data {
            data_py.set_item(k, v)?;
        }
        
        let result = db_insert_sync.call(("billing_ledger", data_py), None)?;
        Ok(result.to_object(py))
    }

    /// Check if a combined weight exceeds the total harvest limit.
    pub fn is_in_stock(&self, current_sold_grams: i64, new_order_grams: i64) -> bool {
        current_sold_grams + new_order_grams <= self.total_harvest_limit_grams
    }

    /// Validate if an order can be marked as paid via Rust state machine logic.
    pub fn validate_transition(&self, current_status: &str, next_status: &str) -> bool {
        match (current_status, next_status) {
            ("pending", "processing") => true,
            ("processing", "completed") => true,
            ("processing", "failed") => true,
            ("completed", "refunded") => true,
            _ => false,
        }
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
