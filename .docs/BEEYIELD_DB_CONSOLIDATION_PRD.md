# PRD: BeeYield Database Consolidation & Structural Intelligence

## 1. Executive Summary
The BeeYield platform has evolved with advanced features (AI Expert Systems, eTIMS compliance, Geospatial Saturation). However, the underlying database schema currently lacks several critical entities required to fully support these features beyond the UI/Service layer. This PRD outlines the missing database structures for pages, forms, and containers to ensure end-to-end persistence.

## 2. Missing Core Entities

### 2.1 Billing & Financials (`billing_ledger`)
*   **Purpose**: Persist eTIMS-synchronized invoices, revenue, and expenses.
*   **Columns**:
    *   `id` (UUID, PK)
    *   `transaction_type` (income | expense)
    *   `module_type` (Pollination | Honey | Sale)
    *   `amount` (Decimal)
    *   `currency` (String, default: KES)
    *   `etims_status` (pending | synced | failed)
    *   `etims_invoice_id` (String, nullable)
    *   `pdf_url` (String, link to generated document in storage)

### 2.2 IoT & Infrastructure (`infrastructure_registry`)
*   **Purpose**: Manage hardware gateways, scales, and acoustic nodes.
*   **Columns**:
    *   `id` (UUID, PK)
    *   `device_type` (gateway | weight_scale | acoustic_node)
    *   `serial_number` (String, Unique)
    *   `apiary_id` (FK -> apiaries)
    *   `calibration_offset` (Decimal, stores Tare values)
    *   `firmware_version` (String)
    *   `status` (online | offline | maintenance)

### 2.3 AI Health Repository (`health_audit_logs`)
*   **Purpose**: Store results from Computer Vision and Acoustic Pulse analysis.
*   **Columns**:
    *   `id` (UUID, PK)
    *   `hive_id` (FK -> hives)
    *   `analysis_type` (vision | acoustic)
    *   `mite_count` (Integer)
    *   `brood_coverage_pct` (Decimal)
    *   `spectral_classification` (String: swarming, optimal, queenless)
    *   `confidence_score` (Decimal)
    *   `image_path` (String, reference to storage)

## 3. UI-to-DB Mapping Plan

| Page Component | Missing Persistence | Action |
| :--- | :--- | :--- |
| **BillingView (Ledger)** | Syncs with `calculator_logs` but needs `billing_ledger` for eTIMS receipts. | Migrate storage of tax receipts. |
| **Geospatial (Hive Map)** | Marker positions are currently mock. | Add `lat/long` columns to `hives` table. |
| **Health Check (YOLO)** | Scan results disappear on refresh. | Connect "Inspection Complete" modal to `health_audit_logs`. |
| **Telemetry (Tare)** | Offset correction is transient. | Map "Tare" button to `infrastructure_registry.calibration_offset`. |

### 3.2 Form & Button Logic Mapping

| UI Element Type | Logic / Event | Proposed DB Target |
| :--- | :--- | :--- |
| **Finance Forms** | `Record Revenue/Expense` | `billing_ledger` (new) |
| **Calibration Buttons** | `handleTare`, `setOffset` | `infrastructure_registry` (new) |
| **Bulk Action Buttons** | `handleBulkExport` | `export_audit_logs` (new) |
| **Map Containers** | Geofence Boundary saves | `geofences` (existing/update) |
| **Scan Forms** | Image Upload / AI Result | `storage.buckets/health_audit_logs` |

## 4. Security & RLS
*   All new tables MUST include a `user_id` column.
*   Enforce "Own Data Only" policies for compliance with Kenyan Data Protection Act and GDPR.

## 5. Next Steps
1.  Generate Migration: `202602211018_infrastructure_and_billing.sql`.
2.  Update `beeyieldService.ts` to replace mocks with Supabase select/insert.
3.  Inject "Bulk PDF" logic to query the new `billing_ledger`.
