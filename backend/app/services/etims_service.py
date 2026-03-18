import httpx
import json
import hashlib
import hmac
from datetime import datetime
from typing import Dict, Any
from app.core.config import settings

class ETIMSService:
    """
    KRA eTIMS Integration Service
    Handles JSON invoice signing, QR generation, and KRA gateway synchronization.
    """
    def __init__(self):
        self.api_key = settings.ETIMS_API_KEY
        self.base_url = settings.ETIMS_BASE_URL
        self.vscu_serial = settings.ETIMS_VSCU_SERIAL

    def generate_signature(self, data: Dict[str, Any]) -> str:
        """
        Generate cryptographic signature for eTIMS JSON.
        In production, this follows KRA VSCU v1.0 specifications using RSA/HMAC.
        """
        # Mocking signature generation for sandbox/demonstration
        payload_str = json.dumps(data, sort_keys=True)
        if not self.api_key:
            # Fallback for dev environments
            return f"MOCK_SIG_{hashlib.sha256(payload_str.encode()).hexdigest()[:16]}"
        
        signature = hmac.new(
            self.api_key.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature

    def generate_qr_url(self, invoice_id: str, signature: str) -> str:
        """
        Produce the KRA Verification QR URL.
        Standard pattern: https://etims.kra.go.ke/verify?id={invoice_id}&sig={signature}
        """
        return f"https://etims.kra.go.ke/verify?id={invoice_id}&vscu={self.vscu_serial}&ts={int(datetime.now().timestamp())}"

    async def submit_invoice(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map BeeYield billing_ledger entry to eTIMS JSON format and POST to gateway.
        """
        # 1. Map Data to eTIMS Schema
        etims_payload = {
            "vscuSerial": self.vscu_serial,
            "invoiceNumber": transaction.get("id"),
            "transactionDate": transaction.get("date"),
            "customerPin": transaction.get("metadata", {}).get("customer_pin", "P000000000Z"),
            "totalAmount": float(transaction.get("amount", 0)),
            "currency": transaction.get("currency", "KES"),
            "items": [
                {
                    "description": transaction.get("description"),
                    "quantity": 1,
                    "unitPrice": float(transaction.get("amount", 0)),
                    "vatRate": 16.0
                }
            ]
        }

        # 2. Sign the data
        signature = self.generate_signature(etims_payload)
        etims_payload["signature"] = signature

        # 3. Transmit to KRA (or sandbox)
        if settings.DEBUG:
            # Simulated Sandbox Response
            return {
                "success": True,
                "receipt_number": f"KRA-BY-{transaction.get('id')[:8].upper()}",
                "signature": signature,
                "qr_url": self.generate_qr_url(transaction.get("id"), signature),
                "message": "Validated by KRA Sandbox Proxy"
            }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/invoice/save",
                    json=etims_payload,
                    headers={"X-API-KEY": self.api_key}
                )
                
                if response.status_code == 200:
                    res_data = response.json()
                    return {
                        "success": True,
                        "receipt_number": res_data.get("receiptNumber"),
                        "signature": signature,
                        "qr_url": self.generate_qr_url(transaction.get("id"), signature)
                    }
                else:
                    return {
                        "success": False,
                        "error": f"KRA Gateway Error: {response.status_code}",
                        "details": response.text
                    }
            except Exception as e:
                return {
                    "success": False,
                    "error": "Connectivity Error",
                    "details": str(e)
                }

etims_service = ETIMSService()
