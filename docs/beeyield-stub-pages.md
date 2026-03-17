## BeeYield: stubbed/placeholder views inventory

This is a working inventory of BeeYield dashboard views that still contain stubbed UX (timeouts, mock fallbacks, toast-only buttons, non-persisting forms) and the intended wiring target for each.

### 1) `src/components/beeyield/CheckoutDrawer.tsx`
- **Stub symptom**: hardcoded `user_id: 'current_user_id'`; simulated “success” for card payments; polling loop sleeps.
- **Wiring target**
  - **Frontend**: use authenticated user id (from `useAuth`) instead of a placeholder.
  - **Backend**: keep using existing `/api/v1/shop/checkout/init` + `/api/v1/shop/checkout/status/{idempotencyKey}` via `beeyieldService.checkout()` / `beeyieldService.getCheckoutStatus()`.

### 2) `src/components/beeyield/MetersListBase.tsx`
- **Stub symptom**: “ENROLL_DEVICE / COMMIT_ENROLLMENT” form has no state + no submit action; export has an artificial 1s delay.
- **Wiring target**
  - **Frontend**: bind enroll form to state + call `meterService.createMeter(...)` (and refresh meters list).
  - **Backend**: use existing Meters API (already used by `meterService` for list/read).

### 3) `src/components/beeyield/MetersView.tsx`
- **Stub symptom**: tab transitions and some subviews use timeouts for “sync” feel; some actions are UI-only.
- **Wiring target**
  - **Frontend**: standardize refresh actions to call `meterService.*` reads and remove unnecessary timeouts.
  - **Backend**: existing meters endpoints.

### 4) `src/components/beeyield/MetersPayments.tsx`
- **Stub symptom**: simulated payment actions using `setTimeout`.
- **Wiring target**
  - **Frontend**: wire actions to existing payments endpoints (Stripe) or meters billing ledger endpoints (where appropriate).
  - **Backend**: `/api/v1/payments/stripe/*` or `/api/v1/beeyield/billing/*` depending on action.

### 5) `src/components/beeyield/MetersReports.tsx`
- **Stub symptom**: “generate/export” uses `setTimeout` placeholders.
- **Wiring target**
  - **Frontend**: use Reports Engine via `beeyieldService.generateReport()` / `waitForReport()` and show download when completed.
  - **Backend**: `/api/v1/reports/generate` + `/api/v1/reports/status/{job_id}`.

### 6) `src/components/beeyield/SeasonSummary.tsx`
- **Stub symptom**: export “done” state is timer-driven; underlying export may not generate a real file.
- **Wiring target**
  - **Frontend**: generate a “season” report through Reports Engine and download on completion.
  - **Backend**: `/api/v1/reports/*`.

### 7) `src/components/beeyield/HealthyHiveIndex.tsx`
- **Stub symptom**: certificate generation uses a timeout.
- **Wiring target**
  - **Frontend**: generate a compliance/audit PDF via Reports Engine (type `audit` or `season`) and download.
  - **Backend**: `/api/v1/reports/*`.

### 8) `src/components/beeyield/PollinationIntelligence.tsx`
- **Stub symptom**: analytics fetch uses artificial delay; analytics values may be mocked in `beeyieldService.getPollinationContractAnalytics()`.
- **Wiring target**
  - **Frontend**: call a real analytics method (Supabase aggregation or backend endpoint).
  - **Backend**: if role/secret needed, add `/api/v1/pollination/analytics` (otherwise compute from Supabase client queries).

### 9) `src/components/beeyield/PollinationEngine.tsx`
- **Stub symptom**: debounce via `setTimeout` is fine; primary risk is “save plan” toast-only.
- **Wiring target**
  - **Frontend**: persist plan to `pollination_deployments`/`pollination_contracts` via `beeyieldService` methods.
  - **Backend**: Supabase tables (direct) or `/api/v1/pollination/*` if validation needed.

### 10) `src/components/beeyield/PrecisionPollinationView.tsx`
- **Stub symptom**: optimization falls back to randomized placements if the edge function isn’t deployed.
- **Wiring target**
  - **Frontend**: keep fallback, but label it clearly and ensure “Commit tasks” always creates real tasks (already uses `beeyieldService.createTask`).
  - **Backend**: (optional) add a FastAPI optimizer endpoint as a fallback if edge function is unavailable.

### 11) `src/components/beeyield/UsbHubDashboard.tsx`
- **Stub symptom**: scanning/connectivity steps use small sleeps; may not pull real connected hub inventory.
- **Wiring target**
  - **Frontend**: load hub inventory from backend + show real status; actions call backend.
  - **Backend**: add `/api/v1/iot/hubs` (or `/api/v1/beeyield/iot/*`) if not already present.

### 12) `src/components/beeyield/BluetoothConnectivityView.tsx`
- **Stub symptom**: scan/connect uses artificial waits; device list may be simulated.
- **Wiring target**
  - **Frontend**: call `/api/v1/beeyield/bluetooth/*` endpoints and surface errors clearly.
  - **Backend**: existing `bluetooth` router already mounted at `/api/v1/beeyield/bluetooth`.

### 13) `src/components/beeyield/RemainingViews.tsx`
- **Stub symptom**: various dialogs/actions are UI-only (e.g., “Persist” doesn’t save).
- **Wiring target**
  - **Frontend**: route settings toggles to existing Settings persistence (Supabase `settings` tables or backend `/api/v1/settings/*`).
  - **Backend**: `/api/v1/settings/*` and/or Supabase direct.

### 14) `src/components/beeyield/IntegrationsView.tsx`
- **Stub symptom**: some minor actions are toast-only (e.g., policy update button); core connect flow is already wired.
- **Wiring target**
  - **Frontend**: replace toast-only actions with `beeyieldService.upsertIntegrationConfig(...)` so config changes persist.
  - **Backend**: `/api/v1/integrations/*` (already present).

### 15) `src/components/beeyield/BillingView.tsx`
- **Stub symptom**: upgrade flow is still toast-only in places.
- **Wiring target**
  - **Frontend**: route upgrades to Stripe checkout/session creation where applicable.
  - **Backend**: `/api/v1/payments/stripe/*`.

# BeeYield stub-page inventory (wiring targets)

This is the working inventory of BeeYield dashboard views that still contain **mock data**, **timeouts**, or **toast-only** actions, plus the intended wiring target (frontend service method + backend endpoint where applicable).

> Scope: views reachable from `src/pages/BeeYieldDashboard.tsx` and related BeeYield sub-views.

## Stubbed / placeholder views (prioritized)

| View | File | Current stub behavior | Wiring target (preferred) |
|---|---|---|---|
| Reports & Exports | `src/components/beeyield/ReportsExportsView.tsx` | Previously “instant-ready”; now correctly async. Remaining: download buttons should reflect job status consistently. | **Frontend**: `beeyieldService.generateReport/getGeneratedReports/getReportStatus/*scheduled*` → **Backend**: `/api/v1/beeyield/reports/*` |
| Sound analysis | `src/components/beeyield/SoundAnalysisView.tsx` | `setTimeout` “recording”, random verdict, fake progress | **Frontend**: `beeyieldService.analyzeAcoustic(file,hiveId?)` → **Backend**: `POST /api/v1/acoustic/analyze` |
| Precision Pollination (map + exports) | `src/components/beeyield/PrecisionPollinationView.tsx` | `mockGeoJSON` orchard polygon; export uses `setTimeout` promise; optimization uses mock orchard geometry | **Frontend**: extend to select a real field geometry (apiary/field) and call `beeyieldService.optimizePollinationPlacement()`; export via reports pipeline | **Backend**: existing pollination + reports endpoints; add “field geometry” storage if missing |
| Bluetooth pairing (RemainingViews) | `src/components/beeyield/RemainingViews.tsx` (`BluetoothView`) | `setTimeout` + random device UID/serial, then “pairUsbDevice” | **Frontend**: pair from real user input (UID/serial) or redirect to `BluetoothConnectivityView` (Web Bluetooth) | **Backend**: existing BeeYield pairing endpoints (via `beeyieldService.getPairedUsbDevices/pairUsbDevice`) |
| Meters AI chat | `src/components/beeyield/MetersView.tsx` | `setTimeout` canned assistant response | **Frontend**: either remove the “AI chat” stub or wire to an AI endpoint (same pattern as SmartAssistant) |
| USB hub dashboard | `src/components/beeyield/UsbHubDashboard.tsx` | short `setTimeout` loops / toast-only firmware simulation | **Frontend**: wire to real device operations where available; otherwise gate behind “requires hardware connected” and remove simulated success |
| Meters payments | `src/components/beeyield/MetersPayments.tsx` | `setTimeout` while loading billing rates; toast-only actions | **Frontend**: use `meterService` (or backend) for billing rates + export; remove timeouts |
| Checkout paper trail / verification | `src/components/beeyield/CheckoutDrawer.tsx` | `setTimeout` payment verification / paper trail placeholders | **Backend**: use payments endpoint (Stripe/M-Pesa verification) and real invoice generation |
| Health guide | `src/components/beeyield/HealthGuideView.tsx` | “Expanding mock data” indicates placeholder content | **Backend/DB**: source from persisted guides or curated content endpoint; remove hardcoded mock blocks |
| Master map | `src/pages/MasterMapView.tsx` | contains `access_token=mock` in map background | **Frontend**: replace with env-driven Mapbox token or remove hardcoded token usage |

## Toast-only actions to convert into real actions

| View | File | Stub action | Wiring target |
|---|---|---|---|
| Billing export ledger | `src/components/beeyield/BillingView.tsx` | “Export ledger” is mostly toast-driven | **Frontend**: export via `/api/v1/beeyield/reports/generate` (XLSX/CSV) using ledger scope |
| Integrations “Update Parameters” | `src/components/beeyield/IntegrationsView.tsx` | button triggers toast only | **Frontend**: call `beeyieldService.upsertIntegrationConfig()` with updated mapping/settings |
| Requests “detail” click | `src/components/beeyield/MyRequestsView.tsx` | toast-only “Accessing detail…” | **Frontend**: open a request detail drawer/modal; **Service**: fetch request by id or reuse list data |

## Notes

- This inventory is intentionally implementation-oriented: each row should map directly to a concrete code change.
- Items will be removed from this list as wiring is implemented and placeholders are eliminated.

