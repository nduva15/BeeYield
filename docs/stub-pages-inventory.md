# Stubbed BeeYield views inventory (wiring targets)

This doc enumerates BeeYield-related views that still contain **mock data**, **`setTimeout` placeholders**, or **toast-only** actions, and defines concrete wiring targets (service methods + backend endpoints where needed).

## 1) `src/components/beeyield/PrecisionPollinationView.tsx`
- **Stub signals**: `mockGeoJSON`, toast-only export (`toast.promise(new Promise(setTimeout...))`)
- **Wire to**:
  - **Data**: `beeyieldService.getPollinationDeployments()` (already used) + `beeyieldService.getPollinationContractAnalytics()` (optional)
  - **Actions**:
    - Export CSV/PDF from *deployments + metrics* (client-side file generation) and log via `beeyieldService.logExport(...)`
    - Optional: server export endpoint `POST /api/v1/pollination/exports` if we later need secure templates / service-role access

## 2) `src/components/beeyield/PollinationIntelligence.tsx`
- **Stub signals**: `PREDICTION_DATA` constant, toast-only “Preparing Intelligence…”
- **Wire to**:
  - **Data**: `beeyieldService.getApiaries()` + `beeyieldService.getPollinationDeployments()`
  - **Actions**: generate an intelligence PDF via **Reports Engine**
    - `beeyieldService.generateReport({ report_type: 'season', parameters: { place_id } })`
    - Poll status via `GET /api/v1/beeyield/reports/status/{job_id}` and open returned `file_url`

## 3) `src/components/beeyield/HealthyHiveIndex.tsx`
- **Stub signals**: certificate download uses `setTimeout` only
- **Wire to**:
  - **Data**: derive metrics from `beeyieldService.getSensorReadings(...)`, `beeyieldService.getHives()`
  - **Actions**: generate “certification” PDF via Reports Engine
    - `beeyieldService.generateReport({ report_type: 'audit', parameters: { hive_id } })` + status polling

## 4) `src/components/beeyield/SensorHealthView.tsx`
- **Stub signals**: `generateHistoryData()` uses randomness for historical charts
- **Wire to**:
  - **Data**: `beeyieldService.getSensorReadings(hiveId, days)` aggregated by month/week for charts
  - **Actions**: resolve alerts via `beeyieldService.resolveSensorAlert(alertId, notes?)` (already exists)

## 5) `src/components/beeyield/RemainingViews.tsx` → `BluetoothView`
- **Stub signals**: pairing generates random IDs and delays with `setTimeout`
- **Wire to**:
  - **Data**: `beeyieldService.getPairedUsbDevices()`
  - **Actions**: replace “scan” stub with a real **Add/Pair device** flow:
    - create via `beeyieldService.pairUsbDevice({ device_uid, serial_number, firmware_version, device_type })`
    - optional future: Web Bluetooth scan (client-only; no backend)

## 6) `src/components/beeyield/MetersView.tsx`
- **Stub signals**: “AI” chat reply is a hardcoded `setTimeout`
- **Wire to**:
  - **Data**: keep `meterService.getMeters/getEvents/getBuildings()` (already real)
  - **Actions**: route chat to existing assistant backend (future) or remove this mini-chat in favor of `SmartAssistantView`

## 7) `src/components/beeyield/MetersPayments.tsx`
- **Stub signals**: fake loading delay
- **Wire to**:
  - **Data**: `meterService.getBillingRates()` without artificial delay
  - **Actions**: export CSV already real (client-side)

## 8) `src/components/beeyield/MetersReports.tsx`
- **Stub signals**: entirely local mock “reports”
- **Wire to**:
  - Replace with `ReportsExportsView` OR call Reports Engine like other exports

## 9) `src/components/beeyield/ContinuousMonitor.tsx`
- **Stub signals**: random alert injection with `Math.random()`
- **Wire to**:
  - **Data**: `beeyieldService.getSensorReadings(...)` + `beeyieldService.getSensorAlerts(...)` for real feed

## 10) `src/components/beeyield/VpmTicker.tsx`
- **Stub signals**: random VPM jitter
- **Wire to**:
  - **Data**: compute VPM from real `sensor_readings` where available (or keep as “demo mode” behind a flag)

## 11) `src/components/beeyield/VpmAutoCounter.tsx`
- **Stub signals**: random “bee dots” / counter points
- **Wire to**:
  - **Data**: use real device camera inference results if/when available (future endpoint)

## 12) `src/components/beeyield/HiveTelemetryView.tsx`
- **Stub signals**: random delta simulation
- **Wire to**:
  - **Data**: `beeyieldService.getSensorReadings(hiveId, days)` to plot real telemetry

## 13) `src/components/beeyield/AcousticMoodTransformer.tsx`
- **Stub signals**: random decibel/confidence simulation
- **Wire to**:
  - **Data**: `beeyieldService.getAcousticReadings(hiveId, days)` (already exists) + optional analysis endpoint

## 14) `src/components/beeyield/FleetSecurity.tsx`
- **Stub signals**: random vibration updates
- **Wire to**:
  - **Data**: `beeyieldService.getSensorAlerts(...)` + device readings

## 15) `src/components/beeyield/PredictiveSuccessEngine.tsx`
- **Stub signals**: static `PREDICTION_DATA`
- **Wire to**:
  - **Data**: derive projections from deployments + harvest history (future model endpoint)

