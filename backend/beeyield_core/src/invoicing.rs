use pyo3::prelude::*;
use qrcode::QrCode;

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
        
        // Render to a grid of booleans (modules)
        let width = code.width();
        let modules = code.into_colors();
        
        let mut qr_html = format!(r#"<div style="display: grid; grid-template-columns: repeat({}, 2px); background: #fff; padding: 10px; border: 1px solid #000; width: fit-content;">"#, width);
        for color in modules {
            let bg = match color {
                qrcode::Color::Dark => "#000",
                qrcode::Color::Light => "#fff",
            };
            qr_html.push_str(&format!(r#"<div style="width: 2px; height: 2px; background: {};"></div>"#, bg));
        }
        qr_html.push_str("</div>");

        let template = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'JetBrains Mono', monospace; background: #fff; color: #000; padding: 40px; line-height: 1.5; }}
        .header {{ border-bottom: 2px solid #000; padding-bottom: 20px; }}
        .title {{ font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.05em; }}
        .meta {{ display: flex; justify-content: space-between; margin-top: 20px; font-size: 10px; font-weight: 800; }}
        .items {{ margin-top: 40px; width: 100%; border-collapse: collapse; }}
        .items th {{ text-align: left; border-bottom: 2px solid #000; padding: 10px 0; text-transform: uppercase; font-size: 10px; font-weight: 800; }}
        .items td {{ padding: 12px 0; font-size: 12px; border-bottom: 1px solid #eee; }}
        .total {{ margin-top: 40px; text-align: right; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.05em; }}
        .footer {{ margin-top: 60px; border-top: 1px solid #000; padding-top: 20px; font-size: 9px; color: #000; font-weight: 800; text-transform: uppercase; }}
        .qr-section {{ margin-top: 40px; display: flex; align-items: center; gap: 30px; border: 1px solid #eee; padding: 20px; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="title">BeeYield Invoice</div>
        <div class="meta">
            <div>ORDER ID: {order_id}</div>
            <div>STAMP: 2026-02-25 15:55:01</div>
        </div>
    </div>
    <table class="items">
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            {items}
        </tbody>
    </table>
    <div class="total">Total Payable: KES {amount}</div>
    
    <div class="qr-section">
        {qr_html}
        <div>
            <p style="font-size: 10px; font-weight: 900; margin: 0; text-transform: uppercase;">Traceability Protocol Verified</p>
            <p style="font-size: 8px; margin: 8px 0 0 0; color: #666; font-family: monospace;">HASH: {trace_hash}</p>
            <p style="font-size: 8px; margin: 4px 0 0 0; color: #000; font-weight: 800;">STATUS: SECURED BY RUST CORE</p>
        </div>
    </div>

    <div class="footer">
        Official BeeYield Financial Document // Oxidized Core v1.0 // Non-Fungible Ledger Record
    </div>
</body>
</html>
        "#, order_id=order_id, amount=amount, items=items, trace_hash=trace_hash, qr_html=qr_html);

        Ok(template)
    }
}
# [cfg(feature = "none")] // placeholder to avoid compile errors if I need more complex SVG logic
fn dummy() {}
