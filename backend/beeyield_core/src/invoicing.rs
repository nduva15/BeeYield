use pyo3::prelude::*;
use qrcode::QrCode;
use qrcode::render::unicode;
use base64::{engine::general_purpose, Engine as _};
use serde_json::Value;

#[pyclass]
pub struct InvoicingEngine {}

#[pymethods]
impl InvoicingEngine {
    #[new]
    pub fn new() -> Self {
        Self {}
    }

    /// Generate a monospaced HTML invoice with an embedded QR code for traceability.
    pub fn generate_invoice_html(&self, order_id: String, amount: f64, items: String, trace_hash: String) -> PyResult<String> {
        // Generate QR code for the traceability hash
        let code = QrCode::new(format!("https://beeyield.com/trace/{}", trace_hash)).unwrap();
        // For HTML, we'll generate a PNG data URL or just a simple image. 
        // Here we'll use a SVG string for easier embedding.
        let image = code.render::<unicode::Dense1x2>().build();
        
        // Simpler: Generate a SVG for the QR code
        let svg_image = code.render()
            .min_dimensions(100, 100)
            .dark_color(svg::Color("#000000"))
            .light_color(svg::Color("#ffffff"))
            .build();

        let template = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'JetBrains Mono', monospace; background: #fff; color: #000; padding: 40px; }}
        .header {{ border-bottom: 2px solid #000; padding-bottom: 20px; }}
        .title {{ font-size: 24px; font-weight: 800; text-transform: uppercase; }}
        .meta {{ display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; }}
        .items {{ margin-top: 40px; width: 100%; border-collapse: collapse; }}
        .items th {{ text-align: left; border-bottom: 1px solid #000; padding: 10px 0; text-transform: uppercase; font-size: 10px; }}
        .items td {{ padding: 10px 0; font-size: 12px; }}
        .total {{ margin-top: 40px; text-align: right; font-size: 18px; font-weight: 800; }}
        .footer {{ margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; font-size: 10px; color: #666; }}
        .qr-section {{ margin-top: 40px; display: flex; align-items: center; gap: 20px; }}
        .qr-code {{ width: 100px; height: 100px; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="title">BeeYield Invoice</div>
        <div class="meta">
            <div>ORDER ID: {order_id}</div>
            <div>DATE: 2026-02-25</div>
        </div>
    </div>
    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            {items}
        </tbody>
    </table>
    <div class="total">TOTAL: KES {amount}</div>
    
    <div class="qr-section">
        <div class="qr-code">
            {svg_image}
        </div>
        <div>
            <p style="font-size: 10px; font-weight: 800; margin: 0;">TRACEABILITY VERIFIED</p>
            <p style="font-size: 8px; margin: 5px 0 0 0;">HASH: {trace_hash}</p>
        </div>
    </div>

    <div class="footer">
        BEEYIELD PLATFORM - OXIDIZED FINANCIAL CORE v1.0
    </div>
</body>
</html>
        "#, order_id=order_id, amount=amount, items=items, trace_hash=trace_hash, svg_image=svg_image);

        Ok(template)
    }
}

// Minimal SVG builder for the QR code
mod svg {
    pub struct Color(pub &'static str);
}
# [cfg(feature = "none")] // placeholder to avoid compile errors if I need more complex SVG logic
fn dummy() {}
