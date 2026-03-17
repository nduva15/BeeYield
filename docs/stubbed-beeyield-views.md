## BeeYield stubbed views inventory

This file enumerates BeeYield dashboard views that still contain **stubbed behavior** (mock/random data, `setTimeout` placeholders, or toast-only actions) and defines **wiring targets** (frontend service methods and/or backend endpoints) to make each page functional.

### 1) `src/components/beeyield/RemainingViews.tsx` — `BluetoothView`

- **Stub signals**: `setTimeout(...)` + `Math.random(...)` in `handlePairing()` that fabricates a “paired” device.
- **Wiring target**
  - **Frontend**: replace the fake pairing flow with `beeyieldService.registerBluetoothDevice(...)` and `beeyieldService.getBluetoothDevices()`.
  - **Backend**: use existing Bluetooth API:
    - `GET /api/v1/beeyield/bluetooth/devices`
    - `POST /api/v1/beeyield/bluetooth/devices`

### 2) `src/components/beeyield/BluetoothConnectivityView.tsx`

- **Stub signals**: `handleSync()` uses a `setTimeout(...)` and always reports “No new data found.”
- **Wiring target**
  - **Frontend**: add `beeyieldService.syncBluetoothReadings(payload)` that POSTs buffered readings.
  - **Backend**: use existing endpoint:
    - `POST /api/v1/beeyield/bluetooth/sync`

### 3) `src/components/beeyield/IntegrationsView.tsx`

- **Stub signals**: “Update Parameters” button only does `toast.success("Policy Updated")`.
- **Wiring target**
  - **Frontend**: call `beeyieldService.upsertIntegrationConfig(...)` with the edited values (Shopify shop domain / QuickBooks account mapping).
  - **Backend**: use the existing integrations router (currently under `/api/v1/integrations/*`).

### 4) `src/components/beeyield/ForagingOptimizer.tsx`

- **Stub signals**: hardcoded simulated chart data (`FORAGING_MATH`) and “commit” that only stores to `localStorage`.
- **Wiring target**
  - **Frontend**: compute charts from real sensor/forage sources, or fetch a foraging timeseries.
  - **Backend**: use existing forage endpoints as the first step:
    - `GET /api/v1/forage/potential?apiary_id=...`
    - (optional) replace mock weather in `GET /api/v1/forage/weather` with a real provider later.

### 5) `src/components/beeyield/SensorHealthView.tsx`

- **Stub signals**: `generateHistoryData(...)` uses `Math.random()` to generate vitals history.
- **Wiring target**
  - **Frontend**: build the “history” series by aggregating real readings returned from:
    - `beeyieldService.getSensorReadings(hiveId?, limit?)`
  - **Backend**: no new endpoints required if `getSensorReadings` already queries real tables.

### 6) `src/components/beeyield/MyDevicesView.tsx`

- **Stub signals**: on create failure, fabricates a temporary device with `Math.random()` and claims it’s “cached locally.”
- **Wiring target**
  - **Frontend**: remove the local-cache fallback; surface a real error state and keep the modal open.
  - **Backend**: use existing device create/update/delete endpoints already used by `beeyieldService.createDevice(...)`.

### 7) `src/components/beeyield/PrecisionPollinationView.tsx`

- **Stub signals**: map uses `mockOrchardPolygon` instead of the computed orchard polygon; duplicate `useEffect` for apiary load.
- **Wiring target**
  - **Frontend**: render the real `orchardPolygon`/`orchardGeoJSON` and remove duplicate loading logic.
  - **Backend**: no new endpoints required; it already uses:
    - `beeyieldService.getPollinationDeployments()`
    - `beeyieldService.optimizePollinationPlacement(...)` (edge function)

### 8) `src/components/beeyield/FlightMapView.tsx`

- **Stub signals**: mixes multiple fallback data sources; some derived layers are still heuristic / placeholder.
- **Wiring target**
  - **Frontend**: standardize on a single “place” source and drive heat/route layers from real readings + forage/weather calls.
  - **Backend**: reuse:
    - `GET /api/v1/forage/potential`
    - `GET /api/v1/forage/weather` (or replace with real weather integration later)

### 9) `src/components/beeyield/SmartAssistantView.tsx`

- **Stub signals**: conversational actions are typically toast-only or simulated “assistant” output in UI.
- **Wiring target**
  - **Frontend**: route prompts through `beeyieldService` to the existing assistant/AI endpoints.
  - **Backend**: use existing AI/assistant endpoints (already routed via Python backend base URL).

### 10) `src/components/beeyield/LabelGeneratorView.tsx`

- **Stub signals**: generation/download actions may be UI-only depending on environment.
- **Wiring target**
  - **Frontend**: ensure “Generate” calls the labels/AI endpoint and stores the created label row.
  - **Backend**: use existing `/api/v1/labels/*` routes already registered in `backend/app/api/api_v1/api.py`.

### 11) `src/components/beeyield/MetersPayments.tsx`

- **Stub signals**: simulated payment status / dummy flows (varies by tab).
- **Wiring target**
  - **Frontend**: connect to real checkout/invoice status via `beeyieldService.getCheckoutStatus(...)` and related billing endpoints.
  - **Backend**: reuse existing payments + billing endpoints (no new endpoints planned initially).

### 12) `src/components/beeyield/MetersReports.tsx`

- **Stub signals**: report/export actions sometimes rely on placeholders rather than the reports engine.
- **Wiring target**
  - **Frontend**: standardize on the Reports Engine contract via:
    - `beeyieldService.generateReport(...)`
    - `beeyieldService.waitForReport(...)`
    - `beeyieldService.downloadReport(...)`
  - **Backend**: reuse `/api/v1/reports/*` (already implemented).

### 13) `src/components/beeyield/UsbHubDashboard.tsx`

- **Stub signals**: simulated serial/USB telemetry in-browser (device availability varies by platform).
- **Wiring target**
  - **Frontend**: where supported, use Web Serial APIs; otherwise keep “read-only” UX and remove fake data generation.
  - **Backend**: none (local hardware integration).

### 14) `src/components/beeyield/CheckoutDrawer.tsx`

- **Stub signals**: “checkout complete” states can be simulated in some paths.
- **Wiring target**
  - **Frontend**: enforce payment confirmation by polling:
    - `beeyieldService.getCheckoutStatus(idempotencyKey)`
  - **Backend**: reuse existing shop/payments endpoints.

### 15) `src/components/beeyield/SettingsView.tsx` / `src/components/beeyield/SettingsIntegrationsView.tsx`

- **Stub signals**: settings toggles that don’t persist consistently.
- **Wiring target**
  - **Frontend**: persist to `beeyieldService.getIoTSettings()` / `beeyieldService.updateIoTSettings(...)` (or equivalent).
  - **Backend**: no new endpoints if Supabase table RLS supports the user settings writes.

