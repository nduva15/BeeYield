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
    #[pyo3(signature = (idempotency_key, user_id, payload))]
    pub fn process_idempotent(&self, py: Python<'_>, idempotency_key: String, user_id: Option<String>, payload: &Bound<'_, PyDict>) -> PyResult<PyObject> {
        let db = py.import_bound("app.db.supabase_db")?;
        let db_select_sync = db.getattr("db_select_sync")?;
        let db_insert_sync = db.getattr("db_insert_sync")?;

        // Part 1: Check for existing transaction
        let mut filter_map = std::collections::HashMap::new();
        filter_map.insert("idempotency_key", idempotency_key.clone());
        
        let filters_py = PyDict::new_bound(py);
        for (k, v) in filter_map {
            filters_py.set_item(k, v)?;
        }

        let kwargs = PyDict::new_bound(py);
        kwargs.set_item("filters", filters_py)?;
        
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

    /// Validate order prices against a reference price map.
    /// Never trust the client-side calculated total.
    pub fn validate_order_prices(&self, items: &Bound<'_, PyList>, price_map: &Bound<'_, PyDict>) -> PyResult<f64> {
        let mut calculated_total = 0.0;
        for item in items.iter() {
            let item_dict = item.downcast::<PyDict>()?;
            let product_id = item_dict.get_item("product_id")?.ok_or_else(|| PyErr::new::<pyo3::exceptions::PyKeyError, _>("product_id missing"))?.extract::<String>()?;
            let variant_id = item_dict.get_item("variant_id")?.ok_or_else(|| PyErr::new::<pyo3::exceptions::PyKeyError, _>("variant_id missing"))?.extract::<String>()?;
            let quantity = item_dict.get_item("quantity")?.ok_or_else(|| PyErr::new::<pyo3::exceptions::PyKeyError, _>("quantity missing"))?.extract::<i64>()?;

            // Fetch price from price_map[variant_id]
            if let Some(price_bound) = price_map.get_item(&variant_id)? {
                let price = price_bound.extract::<f64>()?;
                calculated_total += price * (quantity as f64);
            } else {
                return Err(PyErr::new::<pyo3::exceptions::PyValueError, _>(format!("Price not found for variant {}", variant_id)));
            }
        }
        Ok(calculated_total)
    }

    /// Sanitize order data before DB insertion.
    pub fn sanitize_order_data<'py>(&self, py: Python<'py>, data: &Bound<'py, PyDict>) -> PyResult<Bound<'py, PyDict>> {
        let sanitized = PyDict::new_bound(py);
        
        // Copy selectively and trim strings
        for (k, v) in data.iter() {
            if let Ok(val_str) = v.extract::<String>() {
                 sanitized.set_item(k, val_str.trim())?;
            } else {
                 sanitized.set_item(k, v)?;
            }
        }
        
        Ok(sanitized)
    }

    /// Apply an authorized coupon code.
    /// Returns (discount_amount, final_total)
    pub fn apply_coupon(&self, code: &str, current_total: f64) -> (f64, f64) {
        let code_upper = code.to_uppercase();
        let discount_percent = match code_upper.as_str() {
            "HONEY20" => 0.20,
            "WELCOME10" => 0.10,
            "BEEFREE" => 0.15,
            _ => 0.0,
        };
        
        let discount_amount = current_total * discount_percent;
        let final_total = current_total - discount_amount;
        (discount_amount, final_total)
    }

    /// Calculate shipping cost based on total weight and distance (simplified).
    /// Free shipping for orders above 5000 KES.
    pub fn calculate_shipping(&self, total_kes: f64, delivery_method: &str) -> f64 {
        if delivery_method == "pickup" {
            return 0.0;
        }
        
        if total_kes >= 5000.0 {
            0.0
        } else {
            350.0
        }
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
