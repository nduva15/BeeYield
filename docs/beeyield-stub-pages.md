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

