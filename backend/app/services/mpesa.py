import warnings
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import base64
from app.core.config import settings

warnings.warn("MpesaService is DEPRECATED. Use the honey_rust.MpesaEngine instead.", DeprecationWarning)

class MpesaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_BUSINESS_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.base_url = "https://sandbox.safaricom.co.ke" if settings.DEBUG else "https://api.safaricom.co.ke"

    def get_access_token(self):
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(url, auth=HTTPBasicAuth(self.consumer_key, self.consumer_secret), timeout=30)
        if response.status_code == 200:
            return response.json()['access_token']
        return None

    def stk_push(self, phone, amount, reference, description):
        access_token = self.get_access_token()
        if not access_token:
            return {"error": "Failed to get access token"}

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{self.shortcode}{self.passkey}{timestamp}".encode()).decode()

        headers = {"Authorization": f"Bearer {access_token}"}
        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": self.shortcode,
            "PhoneNumber": phone,
            "CallBackURL": f"{settings.API_URL}/api/v1/shop/checkout/callback/mpesa",
            "AccountReference": reference,
            "TransactionDesc": description
        }

        url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        return response.json()

mpesa_service = MpesaService()
