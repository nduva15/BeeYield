# Product Requirements Document (PRD): Backend Integration for BeeYield Views

## 1. Executive Summary
This document outlines the backend requirements for several "BeeYield" dashboard views that currently rely on hardcoded data, mock services, or partial implementations. The goal is to define the API contracts and data models required to make these views fully functional and user-specific.

## 2. In-Scope Components
The following components require backend development:
1.  **ComparisonsView.tsx** (building/hive comparisons)
2.  **AgroIntelligenceView.tsx** (satellite/weather insights & quick links)
3.  **MetersView.tsx** (time-series data & AI chat)
4.  **ReportsExportsView.tsx** (report generation logic - currently partial)

## 3. Detailed Requirements

### 3.1 Comparisons (`ComparisonsView.tsx`)
**Current State:**
- Completely hardcoded `comparisonData`.
- UI allows filtering by Entity (Building/Apiary), Medium (Water/Heat/Electricity), Date Range, and Comparison Target.

**Backend Requirements:**
- **Endpoint:** `GET /api/v1/analytics/compare`
- **Query Parameters:**
  - `entity_ids`: List of IDs to compare (e.g., `["hive_123", "apiary_456"]` or `["meter_main", "meter_apt12"]`).
  - `metric`: The specific metric to compare (e.g., `weight`, `temperature`, `water_usage`, `electricity_usage`).
  - `start_date` / `end_date`: ISO timestamps.
  - `interval`: Data granularity (`hour`, `day`, `week`).
- **Response Format:**
  ```json
  {
    "meta": { "metric": "water_usage", "unit": "m3" },
    "data": [
      { "timestamp": "2023-10-01T00:00:00Z", "entity_id": "meter_main", "value": 120.5 },
      { "timestamp": "2023-10-01T00:00:00Z", "entity_id": "meter_apt12", "value": 10.2 }
    ]
  }
  ```

### 3.2 Agro Intelligence (`AgroIntelligenceView.tsx`)
**Current State:**
- Fetches `getWeatherHistory` and `getSatelliteIndices` via `beeyieldService` (likely mocked or partial).
- "Quick Links" (e.g., Water Stress, Biodiversity) are UI-only placeholders.

**Backend Requirements:**
- **Enhanced Satellite Endpoint:** `GET /api/v1/agro/satellite/advanced`
  - Support precise indices: `NDVI`, `NDRE` (Nitrogen), `EVI` (Biomass), `MSI` (Moisture Stress).
  - **Input:** `apiary_id` or `polygon_coordinates`.
- **New Quick-Link Endpoints:**
  - `GET /api/v1/agro/phenology?apiary_id={id}`: Returns crop growth stage data.
  - `GET /api/v1/agro/biodiversity?apiary_id={id}`: Returns local flora diversity score and pollinator health index.
  - `GET /api/v1/agro/carbon?apiary_id={id}`: Returns estimated carbon sequestration metrics.
- **Story of the Field:** ensure `getWeatherHistory` aggregates data to provide "Resilience Score" and "Crop-Sync Delay".

### 3.3 Meters & Resources (`MetersView.tsx`)
**Current State:**
- Uses `meterService` for basic lists.
- **Usage Trend Chart:** Uses hardcoded `usageTrendData`.
- **Expert Oracle (AI Chat):** Purely frontend state mock.

**Backend Requirements:**
- **Time-Series Data:** `GET /api/v1/meters/{id}/readings`
  - **Query:** `start_date`, `end_date`, `resolution` (15min, hour, day).
  - **Response:** Array of `{ timestamp, value, unit }`.
- **Expert Oracle Endpoint:** `POST /api/v1/ai/oracle/query`
  - **Input:** `{ "query": "Which meter has the highest leak risk?", "context": { "user_id": "..." } }`
  - **Logic:** RAG (Retrieval Augmented Generation) over the user's meter events and recent readings.
  - **Response:** `{ "reply": "Meter 04 shows abnormal flow patterns (20% above avg) between 2AM-4AM.", "suggested_actions": ["Inspect Meter 04", "View Flow Chart"] }`

### 3.4 Reports & Exports (`ReportsExportsView.tsx`)
**Current State:**
- Service methods exist but implementation likely needs hardening.
- AI Insights (`generateReport` with type `ai_analysis`) needs a backend worker.

**Backend Requirements:**
- **Report Generation Worker:**
  - Background job runner (e.g., BullMQ/Celery) to handle long-running PDF generation.
  - Webhook or Polling endpoint for job status (`GET /api/v1/reports/jobs/{id}`).
- **Scheduled Reports:**
  - Cron scheduler to trigger report generation based on `ScheduledReport` records.
  - Email delivery service integration (SendGrid/SES).

## 4. Implementation Priority
1.  **Meters Time-Series**: Critical for the "Usage Trajectory" chart which is a primary dashboard feature.
2.  **Comparisons API**: enable the high-value analytics view.
3.  **Expert Oracle**: Adds clear "premium" AI value.
4.  **Agro Advanced Features**: Can be rolled out incrementally (`NDVI` first, then others).

## 5. Security & Authentication
- All endpoints must strictly enforce `user_id` scoping (Row Level Security).
- **Critical:** Ensure `beeyieldService` calls pass the authenticated user's ID/Context to these new endpoints to prevent cross-tenant data leaks.
