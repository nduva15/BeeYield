//! Rate Limiter — Port of `rate_limit_manager.py`
//!
//! High-precision timing with exponential backoff, jitter, and per-API
//! throttle tracking. All timing state is Rust-owned (`std::time::Instant`).
//!
//! Python usage:
//! ```python
//! from beeyield_core import RateLimiter
//! limiter = RateLimiter()
//!
//! # Check if we should throttle
//! wait_ms = limiter.should_throttle("openai", 500.0)
//! if wait_ms > 0:
//!     await asyncio.sleep(wait_ms / 1000.0)
//! limiter.record_call("openai")
//!
//! # Get backoff delay for retry
//! delay_ms = limiter.backoff_delay(attempt=2, base_delay_ms=1000.0, max_delay_ms=60000.0)
//! ```

use pyo3::prelude::*;
use pyo3::types::PyDict;
use rand::Rng;
use std::collections::HashMap;
use std::time::Instant;

// ─── Internal State ───

#[derive(Debug, Clone)]
struct ApiState {
    last_call: Instant,
    call_count: u64,
    consecutive_failures: u32,
}

// ─── PyO3 Class ───

/// High-performance rate limiter with exponential backoff and jitter.
/// Replaces `RateLimitManager` from `rate_limit_manager.py`.
///
/// Critical advantage: `std::time::Instant` is monotonic and nanosecond-precise.
/// Python's `time.time()` has millisecond granularity and can drift.
#[pyclass]
pub struct RateLimiter {
    apis: HashMap<String, ApiState>,
    created_at: Instant,
}

#[pymethods]
impl RateLimiter {
    #[new]
    fn new() -> Self {
        Self {
            apis: HashMap::new(),
            created_at: Instant::now(),
        }
    }

    /// Check if an API call should be throttled.
    /// Returns milliseconds to wait (0 = proceed immediately).
    fn should_throttle(&self, api_name: &str, min_interval_ms: f64) -> f64 {
        match self.apis.get(api_name) {
            Some(state) => {
                let elapsed_ms = state.last_call.elapsed().as_secs_f64() * 1000.0;
                if elapsed_ms < min_interval_ms {
                    min_interval_ms - elapsed_ms
                } else {
                    0.0
                }
            }
            None => 0.0,
        }
    }

    /// Record a successful API call.
    fn record_call(&mut self, api_name: &str) {
        let entry = self.apis.entry(api_name.to_string()).or_insert(ApiState {
            last_call: Instant::now(),
            call_count: 0,
            consecutive_failures: 0,
        });
        entry.last_call = Instant::now();
        entry.call_count += 1;
        entry.consecutive_failures = 0;
    }

    /// Record a failed API call.
    fn record_failure(&mut self, api_name: &str) {
        let entry = self.apis.entry(api_name.to_string()).or_insert(ApiState {
            last_call: Instant::now(),
            call_count: 0,
            consecutive_failures: 0,
        });
        entry.consecutive_failures += 1;
    }

    /// Calculate backoff delay with exponential growth + jitter.
    /// Returns delay in milliseconds.
    #[pyo3(signature = (attempt, base_delay_ms=1000.0, max_delay_ms=60000.0))]
    fn backoff_delay(
        &self,
        attempt: u32,
        base_delay_ms: f64,
        max_delay_ms: f64,
    ) -> f64 {
        let delay = (base_delay_ms * (2.0_f64).powi(attempt as i32)).min(max_delay_ms);
        let mut rng = rand::thread_rng();
        let jitter = rng.gen_range(0.0..delay * 0.1);
        delay + jitter
    }

    /// Check if an error message indicates a rate limit error.
    fn is_rate_limit_error(&self, error_message: &str) -> bool {
        let lower = error_message.to_lowercase();
        ["429", "rate limit", "quota", "too many requests", "resource_exhausted", "retry"]
            .iter()
            .any(|indicator| lower.contains(indicator))
    }

    /// Extract retry delay from error message (if present). Returns ms or 0.
    fn extract_retry_delay(&self, error_message: &str) -> f64 {
        let re = regex::Regex::new(r"(?i)retry.*?(\d+)s").ok();
        match re {
            Some(pattern) => {
                if let Some(caps) = pattern.captures(error_message) {
                    if let Some(m) = caps.get(1) {
                        if let Ok(secs) = m.as_str().parse::<f64>() {
                            return secs * 1000.0;
                        }
                    }
                }
                0.0
            }
            None => 0.0,
        }
    }

    /// Get statistics for all tracked APIs.
    fn get_stats<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyDict>> {
        let result = PyDict::new_bound(py);
        let call_counts = PyDict::new_bound(py);
        let last_calls = PyDict::new_bound(py);

        for (name, state) in &self.apis {
            call_counts.set_item(name, state.call_count)?;
            last_calls.set_item(name, state.last_call.elapsed().as_secs_f64())?;
        }

        result.set_item("call_counts", call_counts)?;
        result.set_item("last_calls_seconds_ago", last_calls)?;
        result.set_item("uptime_seconds", self.created_at.elapsed().as_secs_f64())?;

        Ok(result)
    }

    /// Get consecutive failure count for an API.
    fn failure_count(&self, api_name: &str) -> u32 {
        self.apis
            .get(api_name)
            .map(|s| s.consecutive_failures)
            .unwrap_or(0)
    }

    /// Reset all state for an API.
    fn reset(&mut self, api_name: &str) {
        self.apis.remove(api_name);
    }

    /// Reset all APIs.
    fn reset_all(&mut self) {
        self.apis.clear();
    }
}
