use pyo3::prelude::*;
use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose, Engine as _};
use std::env;
use chrono::Local;

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
        }
    }

    /// Initiate an STK Push (M-Pesa Express)
    pub fn initiate_stk_push(&self, phone: String, amount: i64, account_ref: String) -> PyResult<String> {
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

        if status.is_success() {
            Ok(body)
        } else {
            Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(format!("M-Pesa API Error ({}): {}", status, body)))
        }
    }
}

impl MpesaEngine {
    fn get_oauth_token(&self) -> PyResult<String> {
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
            Ok(auth_res.access_token)
        } else {
            Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>("M-Pesa Auth Denied"))
        }
    }
}
