# BeeYield AI Development Guide

## Project Overview
BeeYield is a full-stack honey traceability and precision pollination platform serving farmers in Kibwezi, Kenya. The system tracks honey from hive to jar using a custom blockchain ("HoneyChain") and provides IoT-enabled hive monitoring, AI assistance, and e-commerce capabilities.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TanStack Router + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend**: Python 3.11 + FastAPI + Uvicorn
- **Databases**:
  - Supabase (Postgres) for transactional/auth data with Row-Level Security (RLS)
  - ClickHouse for analytics and time-series IoT telemetry
- **Blockchain**: Custom Python implementation (backend/app/blockchain/honey_chain.py)
- **AI**: Google Gemini API with local knowledge base fallback (backend/AI_ASSISTANT_GUIDE.md)

### Critical Architectural Decisions

**1. Dual Database Pattern**
- Supabase handles: users, farmers, apiaries, hives, harvests, products, orders
- ClickHouse handles: sensor readings, analytics events, page views
- **Why**: IoT generates massive time-series data unsuitable for Postgres; ClickHouse provides columnar storage and faster aggregations

**2. Custom Database Abstraction** (backend/app/db/supabase_db.py)
- Uses `httpx` client instead of Supabase SDK for critical paths
- **Why**: Avoids gRPC/DNS hangs observed with the Python Supabase library
- Helper functions: `db_select()`, `db_insert()`, `db_update()`, `db_delete()`, `db_upsert()`
- Always use these helpers in backend endpoints instead of raw Supabase SDK calls

**3. Offline-First Frontend**
- React Query with IndexedDB persistence (src/components/QueryClientProvider.tsx)
- Cart, wishlist, and auth state persist to `localStorage`
- Harvest forms save to `offline_submissions.json` when backend unavailable
- **Pattern**: handle loading/error states and provide fallback UI for API failures

**4. Authentication Flow**
- Supabase Auth handles registration/login
- Backend verifies JWT via `get_current_user()` (backend/app/core/security.py)
- Frontend: `AuthContext` provides `user`, `loading`, `signIn()`, `signOut()`
- Super admin email hardcoded: `timothynduva349@gmail.com` (src/pages/AdminAuth.tsx)

## Development Workflows

### Start the System (Windows)
- `npm run dev` runs frontend + backend concurrently
- `npm run dev:frontend` -> http://localhost:5173
- `npm run dev:backend` -> http://localhost:8000

### Backend
- Entry point: backend/main.py
- Initialize ClickHouse tables: `python init_clickhouse_tables.py`
- Health check: `GET http://localhost:8000/`
- API docs: `http://localhost:8000/docs`

### Frontend
- Build: `npm run build`
- Type-check: `npm run type-check`
- Lint: `npm run lint`

### Database / RLS
- RLS fixes and schema updates live in SQL files at repo root and supabase/
- If forms fail, run FIX_SUPABASE_PERMANENTLY.sql in Supabase SQL Editor

## Project-Specific Patterns

### API Endpoints
- Base: `/api/v1/`
- Routers: backend/app/api/api_v1/endpoints/
- Key groups:
  - `/beeyield/*` dashboard CRUD (auth required)
  - `/traceability/*` HoneyChain queries (public)
  - `/assistant/*` AI chat and analysis
  - `/shop/*` products/orders
  - `/auth/*` login/register

### Frontend Routing (TanStack Router)
- File-based routes in src/routes/
- Route tree is generated in src/routeTree.gen.ts — do not edit
- Protected routes use src/components/auth/ProtectedRoute.tsx

### Blockchain Integration
- HoneyChain is an immutable audit log, not a distributed blockchain
- Batch codes are sealed on create (harvest creation) and verified via Merkle hashes
- Main implementation: backend/app/blockchain/honey_chain.py

### AI Assistant
- Multi-source: HoneyChain, Supabase, IoT telemetry, local knowledge base
- Intent detection → data retrieval → Gemini response
- Fallback to local knowledge base if Gemini is unavailable
- See: backend/AI_ASSISTANT_GUIDE.md

### Environment Variables
- Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Backend: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_API_KEY`
- Analytics: `CLICKHOUSE_HOST`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`
- Reference: .env.example

## Common Pitfalls
- RLS blocks writes if policies missing (use RLS fix SQL)
- ClickHouse analytics calls are optional; handle `None` connection safely
- Supabase SDK can hang; prefer helper functions in backend/app/db/supabase_db.py
- HoneyChain records are immutable after seal

## Key Files
- backend/main.py — FastAPI app entry
- backend/app/api/api_v1/api.py — Router registration
- backend/app/db/supabase_db.py — DB helpers
- backend/app/blockchain/honey_chain.py — HoneyChain
- src/routes/__root.tsx — Root providers
- src/services/api.ts — API base URL helpers
- COMPLETE_GUIDE.md and QUICK_START.md — operational docs
