use pyo3::prelude::*;
use pyo3::types::PyDict;
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose, Engine as _};
use std::env;
use chrono::Local;
use serde_json::Value;

#[derive(Serialize, Deserialize, Debug)]
struct OAuthResponse {
    access_token: String,
    expires_in: String,
}

#[derive(Serialize, Debug)]
#[serde(rename_all = "PascalCase")]
struct StkPushRequest {
    business_short_code: String,
    password: String,
    timestamp: String,
    transaction_type: String,
    amount: String,
    party_a: String,
    party_b: String,
    phone_number: String,
    call_back_url: String,
    account_reference: String,
    transaction_desc: String,
}

#[pyclass]
pub struct MpesaEngine {
    client_key: String,
    client_secret: String,
    short_code: String,
    passkey: String,
    callback_url: String,
    cached_token: std::sync::RwLock<Option<(String, chrono::DateTime<Local>)>>,
}

#[pymethods]
impl MpesaEngine {
    #[new]
    pub fn new() -> Self {
        Self {
            client_key: env::var("MPESA_CONSUMER_KEY").unwrap_or_default(),
            client_secret: env::var("MPESA_CONSUMER_SECRET").unwrap_or_default(),
            short_code: env::var("MPESA_SHORTCODE").unwrap_or_default(),
            passkey: env::var("MPESA_PASSKEY").unwrap_or_default(),
            callback_url: env::var("MPESA_CALLBACK_URL").unwrap_or_default(),
            cached_token: std::sync::RwLock::new(None),
        }
    }

    /// Initiate an STK Push (M-Pesa Express)
    pub fn initiate_stk_push<'py>(&self, py: Python<'py>, phone: String, amount: i64, account_ref: String) -> PyResult<Bound<'py, PyDict>> {
        let token = self.get_oauth_token()?;
        let timestamp = Local::now().format("%Y%m%d%H%M%S").to_string();
        let password = general_purpose::STANDARD.encode(format!("{}{}{}", self.short_code, self.passkey, timestamp));

        let payload = StkPushRequest {
            business_short_code: self.short_code.clone(),
            password,
            timestamp,
            transaction_type: "CustomerPayBillOnline".to_string(),
            amount: amount.to_string(),
            party_a: phone.clone(),
            party_b: self.short_code.clone(),
            phone_number: phone,
            call_back_url: self.callback_url.clone(),
            account_reference: account_ref,
            transaction_desc: "BeeYield Product Payment".to_string(),
        };

        let client = Client::new();
        let response = client
            .post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest")
            .bearer_auth(token)
            .json(&payload)
            .send()
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("STK Push failed: {}", e)))?;

        let status = response.status();
        let body = response.text().unwrap_or_default();

        let dict = PyDict::new_bound(py);
        if status.is_success() {
            let res_json: Value = serde_json::from_str(&body).unwrap_or_default();
            dict.set_item("success", true)?;
            dict.set_item("CheckoutRequestID", res_json["CheckoutRequestID"].as_str().unwrap_or_default())?;
            dict.set_item("ResponseCode", res_json["ResponseCode"].as_str().unwrap_or_default())?;
        } else {
            dict.set_item("success", false)?;
            dict.set_item("error", body)?;
        }
        Ok(dict)
    }

    /// Parse and validate the M-Pesa Callback Result
    pub fn parse_callback_result<'py>(&self, py: Python<'py>, body: String) -> PyResult<Bound<'py, PyDict>> {
        let v: Value = serde_json::from_str(&body).map_err(|_| PyErr::new::<pyo3::exceptions::PyValueError, _>("Invalid JSON callback"))?;
        let dict = PyDict::new_bound(py);

        // Safaricom Result Structure: Body.stkCallback.ResultCode
        if let Some(res_code) = v.pointer("/Body/stkCallback/ResultCode") {
            dict.set_item("result_code", res_code.as_i64().unwrap_or(1))?;
        }

        if let Some(merchant_id) = v.pointer("/Body/stkCallback/MerchantRequestID") {
            dict.set_item("merchant_request_id", merchant_id.as_str().unwrap_or_default())?;
        }

        if let Some(checkout_id) = v.pointer("/Body/stkCallback/CheckoutRequestID") {
            dict.set_item("checkout_request_id", checkout_id.as_str().unwrap_or_default())?;
        }

        Ok(dict)
    }
}

impl MpesaEngine {
    fn get_oauth_token(&self) -> PyResult<String> {
        // 1. Check cache via read lock
        {
            if let Ok(cache) = self.cached_token.read() {
                if let Some((token, expiry)) = cache.as_ref() {
                    // Buffer of 60 seconds before actual expiry
                    if Local::now() < *expiry - chrono::Duration::seconds(60) {
                        return Ok(token.clone());
                    }
                }
            }
        }

        // 2. Fetch new token if missing or expired
        let client = Client::new();
        let response = client
            .get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials")
            .basic_auth(&self.client_key, Some(&self.client_secret))
            .send()
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("OAuth failed: {}", e)))?;

        if response.status().is_success() {
            let auth_res: OAuthResponse = response
                .json()
                .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("Failed to parse OAuth response: {}", e)))?;
            
            // 3. Cache the new token via write lock
            let token = auth_res.access_token;
            let expires_in: i64 = auth_res.expires_in.parse().unwrap_or(3599);
            let expiry = Local::now() + chrono::Duration::seconds(expires_in);

            if let Ok(mut cache) = self.cached_token.write() {
                *cache = Some((token.clone(), expiry));
            }
            
            Ok(token)
        } else {
            Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("M-Pesa Auth Denied"))
        }
    }
}
