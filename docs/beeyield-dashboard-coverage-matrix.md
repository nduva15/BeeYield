# BeeYield Dashboard Coverage Matrix

Last updated: 2026-04-06

Legend:

- `Complete`: backend + UI flow are wired and the page uses the BeeYield dashboard shell/header pattern.
- `Operational`: workflow is complete for the intended product behavior, even if the entity is system-generated rather than manually created.
- `Partial`: backend exists, but the page still mixes direct service state, legacy layout, or narrower UI coverage.

## Core Operations

| View | Component | Frontend data layer | Backend / service surface | CRUD status | UI status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Home | `src/components/beeyield/DashboardHomeView.tsx` | Dashboard route-level hooks in `useApiaries`, `useHives`, `useDevices`, `useSensorReadings`, `useSensorAlerts` | `beeyield.py`, IoT endpoints, report summaries | Operational | Complete | Primary visual reference for BeeYield dashboard pages. |
| Apiaries | `src/components/beeyield/MyPlacesView.tsx` | `useApiaries`, `useCreateApiary`, `useUpdateApiary`, `useDeleteApiary`, `useHivesWithTelemetry` | `beeyieldService.get/create/update/deleteApiary`, backend `beeyield.py` apiary routes | Complete | Complete | Includes create/edit/delete, detail drill-in, and linked hive overview. |
| Hives | `src/components/beeyield/BeeYieldHivesView.tsx` | `useHives`, `useUpdateHive`, `useApiaries`, `useHarvests` | `beeyieldService.get/create/update/deleteHive`, `createTask`, backend `beeyield.py` hive routes | Complete | Complete | Wrapped in `BeeYieldPageShell`; supports add/edit, notes update, inspection task creation, exports, and detail view. |
| Inspections | `src/components/beeyield/InspectionsView.tsx` | `useInspections`, `useCreateInspection`, `useUpdateInspection`, `useDeleteInspection`, `useTasks` | `beeyieldService` inspections + tasks endpoints, backend `beeyield.py` inspection routes | Complete | Complete | Full inspection record management with task linkage. |
| Harvests | `src/components/beeyield/HarvestsView.tsx` | `useHarvests`, `useCreateHarvest`, `useUpdateHarvest`, `useDeleteHarvest`, `useApiaries`, `useHives` | `beeyieldService` harvest + batch endpoints, backend `beeyield.py` harvest routes | Complete | Complete | Create/edit/delete harvests plus batch traceability and CSV export. |
| Devices | `src/components/beeyield/MyDevicesView.tsx` | `useDevices`, local UI state for edit mode | `beeyieldService.get/create/update/deleteDevice`, backend IoT/device routes | Complete | Complete | Add/edit/delete now supported through shared modal flow. |
| Notes | `src/components/beeyield/MyNotesView.tsx` | `useNotes`, `useCreateNote`, `useUpdateNote`, `useDeleteNote`, `useApiaries`, `useHives` | `beeyieldService` note endpoints, backend notes routes | Complete | Complete | Create/edit/delete plus filters by apiary/hive. |
| Requests | `src/components/beeyield/MyRequestsView.tsx` | `useRequests`, `useCreateRequest`, `useUpdateRequest`, `useDeleteRequest`, `useRequestComments`, `useAddRequestComment` | `beeyieldService` request + comment endpoints, backend `requests.py` | Complete | Complete | CRUD plus threaded comments in detail panel. |
| Tasks | `src/components/beeyield/MyTaskView.tsx` | `useTasks`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useApiaries`, `useHives` | `beeyieldService` task endpoints, backend `beeyield.py` task routes | Complete | Complete | Standardized onto BeeYield shell/header and now supports delete from edit flow. |
| Alerts | `src/components/beeyield/SensorAlertsView.tsx` | `useSensorAlerts`, `useResolveAlert`, `useApiaries`, `useHives` | `beeyieldService.getSensorAlerts`, `resolveSensorAlert`, backend alert/IoT routes | Operational | Complete | Alerts are system-generated, so UI intentionally supports list/filter/resolve rather than manual create. |

## Reporting, Finance, and Platform

| View | Component | Frontend data layer | Backend / service surface | CRUD status | UI status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Reports & Exports | `src/components/beeyield/ReportsExportsView.tsx` | `useGeneratedReports`, `useScheduledReports`, `useCreateScheduledReport`, `useUpdateScheduledReport`, `useDeleteScheduledReport` | `beeyieldService` report endpoints, backend `reports.py` | Complete | Complete | Scheduled reports now support create/edit/pause/resume/delete. |
| Billing | `src/components/beeyield/BillingView.tsx` | `beeyieldService` transaction and billing overview methods | `beeyieldService.create/update/deleteTransaction`, `submitToETIMS`, backend billing routes | Complete | Complete | Ledger entry create/edit/delete and corrected eTIMS sync path. |
| Integrations | `src/components/beeyield/IntegrationsView.tsx` | `beeyieldService` integration config + audit methods | Backend integrations routes for QuickBooks, Shopify, eTIMS | Operational | Complete | Standardized onto BeeYield shell/tab bar; supports connect/disconnect, config update, sync, and audit visibility. |
| Meters dashboard | `src/components/beeyield/MetersView.tsx` | `useMetersDashboard` | `meterService.getMeters/getEvents/getBuildings`, backend `/meters/*` routes | Operational | Complete | Main dashboard now uses query hooks instead of ad hoc fetch state. |
| Meter alarms | `src/components/beeyield/MetersAlarms.tsx` | Component-local meter flows | `meterService` events endpoints | Operational | Complete | Event review / resolution flow. |
| Meter payments | `src/components/beeyield/MetersPayments.tsx` | Component-local meter billing flows | `meterService` billing-rate and payment surfaces | Operational | Complete | Uses BeeYield shell pattern. |
| Meter settings | `src/components/beeyield/MetersSettings.tsx` | Component-local meter config flows | `meterService` building/rate/device surfaces | Operational | Complete | Uses BeeYield shell pattern. |
| Meter list / measurements | `src/components/beeyield/MetersListBase.tsx`, `src/components/beeyield/MetersMeasurements.tsx` | Meter subview state + service access | `meterService` device/reading routes | Partial | Complete | UI is standardized, but deeper hook normalization across every meter subview remains a follow-up opportunity. |
| Settings | `src/components/beeyield/SettingsView.tsx` | Auth/settings contexts + `beeyieldService` billing/profile methods | Profile, module flags, alerts, payment methods, billing overview | Operational | Complete | Full user-facing management flow; not every section maps to a classic CRUD table. |

## Route-Level Notes

| Dashboard tab id | Primary component | Status |
| --- | --- | --- |
| `home` | `DashboardHomeView` | Complete |
| `places` | `MyPlacesView` | Complete |
| `beeyield` | `BeeYieldHivesView` | Complete |
| `inspections` | `InspectionsView` | Complete |
| `harvests` | `HarvestsView` | Complete |
| `devices` | `MyDevicesView` | Complete |
| `notes` | `MyNotesView` | Complete |
| `requests` | `MyRequestsView` | Complete |
| `task` | `MyTaskView` | Complete |
| `sensor-alerts` | `SensorAlertsView` | Operational |
| `reports-exports` | `ReportsExportsView` | Complete |
| `billing` | `BillingView` | Complete |
| `integrations` | `IntegrationsView` | Operational |
| `meters-*` | `MetersView` + meter subviews | Operational / Partial by subview |
| `settings` | `SettingsView` | Operational |

## Follow-up Candidates

- Normalize the remaining meter subviews behind shared hooks if we want full parity with the rest of the BeeYield data layer.
- Extend the same matrix to the analytics / AI / tactical tabs if those pages need explicit backend-verification signoff, since many of them are insight surfaces rather than CRUD entities.
