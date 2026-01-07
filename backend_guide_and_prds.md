# BeeYield Backend Guide

## 1. Quick Start
1.  Navigate to `backend/`.
2.  Run `pip install -r requirements.txt`.
3.  Set up your `.env` file (copy `.env.example`).
4.  Run `uvicorn main:app --reload`.

## 2. Blockchain "HoneyChain"
We use a custom Smart Contract (`HoneyTraceability.sol`) to store immutable data.
- **Location**: `backend/blockchain/contracts/`
- **Service**: `backend/app/core/blockchain_service.py` handles the complexities of Web3.

## 3. Page PRDs

### Traceability Page
- **Endpoint**: `GET /api/v1/traceability/batch/{id}`
- **Logic**: Fetches directly from the Smart Contract using the `BlockchainService`.
- **Security**: Public Read.

### Shop Page
- **Endpoint**: `GET /api/v1/products`
- **Logic**: Fetches from Supabase (PostgreSQL).
- **Payment**: `POST /api/v1/checkout` (Stripe).

### Pollination Request
- **Endpoint**: `POST /api/v1/services/request`
- **Logic**: Stores valid leads in Supabase and triggers an email notification.

## 4. Next Steps
1.  **Deploy Contract**: Use Remix or `brownie` to deploy `HoneyTraceability.sol` to Polygon.
2.  **Env Vars**: Get your `BLOCKCHAIN_CONTRACT_ADDRESS` and add it to `.env`.
3.  **Frontend**: Update `Traceability.tsx` to `fetch('http://localhost:8000/api/v1/traceability/batch/1')`.
