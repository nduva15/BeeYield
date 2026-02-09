# BeeYield Pages PRD - Backend Coverage Audit

## Scope
- Includes dashboard and public pages.
- Focus: backend coverage, CRUD completeness, placeholders, and export/report readiness (PDF, Excel, CSV).
- This document references the current codebase state and identifies missing or partial backend integrations.

## Route Inventory
Routes originate from [src/routeTree.gen.ts](src/routeTree.gen.ts).

### Dashboard Routes
- /beeyield-dashboard -> BeeYieldDashboard [src/pages/BeeYieldDashboard.tsx](src/pages/BeeYieldDashboard.tsx)
- /admin -> AdminDashboard [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx)
- /admin/login -> AdminAuth [src/pages/AdminAuth.tsx](src/pages/AdminAuth.tsx)
- /my-account -> BuyerDashboard [src/pages/BuyerDashboard.tsx](src/pages/BuyerDashboard.tsx)

### Commerce Routes
- /shop -> Shop [src/pages/Shop.tsx](src/pages/Shop.tsx)
- /checkout -> Checkout [src/pages/Checkout.tsx](src/pages/Checkout.tsx)
- /receipt/:orderId -> Receipt [src/pages/Receipt.tsx](src/pages/Receipt.tsx)

### Public Content Routes
- / -> Home [src/pages/Index.tsx](src/pages/Index.tsx)
- /about -> About [src/pages/About.tsx](src/pages/About.tsx)
- /impact -> Impact [src/pages/Impact.tsx](src/pages/Impact.tsx)
- /esg -> ESG [src/pages/ESG.tsx](src/pages/ESG.tsx)
- /team -> Team [src/pages/Team.tsx](src/pages/Team.tsx)
- /blogs -> Blogs [src/pages/Blogs.tsx](src/pages/Blogs.tsx)
- /media -> Media [src/pages/Media.tsx](src/pages/Media.tsx)
- /careers -> Careers [src/pages/Careers.tsx](src/pages/Careers.tsx)
- /contact -> Contact [src/pages/Contact.tsx](src/pages/Contact.tsx)
- /pollination-request -> PollinationRequest [src/pages/PollinationRequest.tsx](src/pages/PollinationRequest.tsx)
- /traceability -> Traceability [src/pages/Traceability.tsx](src/pages/Traceability.tsx)

## Backend Coverage Summary (by domain)

### BeeYield Dashboard Domain
Primary service: [src/services/beeyieldService.ts](src/services/beeyieldService.ts)
- APIaries CRUD -> /beeyield/apiaries via [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py)
- Hives CRUD -> /beeyield/hives via [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py)
- Harvests CRUD -> /beeyield/harvests via [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py)
- Tasks CRUD -> /beeyield/tasks via [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py)
- Inspections CRUD -> /beeyield/inspections via [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py)
- IoT Devices & Readings -> /iot/devices, /iot/readings via [backend/app/api/api_v1/endpoints/iot.py](backend/app/api/api_v1/endpoints/iot.py)
- Pollination -> /pollination/* via [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py)
- Settings -> /settings via [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py)

Gaps and placeholders
- Device assignment modal explicitly says backend is not linked [src/components/beeyield/AddDeviceModal.tsx](src/components/beeyield/AddDeviceModal.tsx)
- Server status view is mock data only [src/components/beeyield/ServerStatusView.tsx](src/components/beeyield/ServerStatusView.tsx)
- Bluetooth view uses Web Bluetooth or fallback mock flow [src/components/beeyield/RemainingViews.tsx](src/components/beeyield/RemainingViews.tsx)
- Billing analytics uses empty datasets and CSV export on empty data [src/components/beeyield/BillingView.tsx](src/components/beeyield/BillingView.tsx)
- Meters reports use client-side jsPDF on mock data; no backend export [src/components/beeyield/MetersReports.tsx](src/components/beeyield/MetersReports.tsx)
- Precision pollination uses fallback hive generation when API data missing [src/components/beeyield/PrecisionPollinationView.tsx](src/components/beeyield/PrecisionPollinationView.tsx)
- Traceability uses mock fallback if backend is missing or incomplete [src/services/traceabilityService.ts](src/services/traceabilityService.ts)

### Admin Domain
Primary service: [src/services/adminService.ts](src/services/adminService.ts)
- Admin endpoints -> /admin/* via [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py)
- Admin extended logs -> /admin/* via [backend/app/api/api_v1/endpoints/admin_extended.py](backend/app/api/api_v1/endpoints/admin_extended.py)

Gaps and placeholders
- Seeding functions are stubs (return success without action) [src/services/adminService.ts](src/services/adminService.ts)
- Admin dashboard export buttons lack handlers (Excel/PDF) [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx#L1288-L1320)

### Buyer / Shop Domain
Primary service: [src/services/shopService.ts](src/services/shopService.ts)
- Products -> /shop/products via [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- Checkout -> /shop/checkout/init via [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- Orders -> /shop/orders via [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- Invoice PDF -> /shop/orders/{order_id}/invoice via [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- Stripe -> /payments/stripe/* via [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py)

Gaps and placeholders
- Coupon system always returns unavailable (no backend) [src/pages/Checkout.tsx](src/pages/Checkout.tsx#L130-L150)
- Buyer dashboard address edit uses add-only flow (no update endpoint) [src/pages/BuyerDashboard.tsx](src/pages/BuyerDashboard.tsx)

### Public Content Domain
Primary services
- Company data -> [src/services/companyService.ts](src/services/companyService.ts) with endpoints in [backend/app/api/api_v1/endpoints/company.py](backend/app/api/api_v1/endpoints/company.py)
- Services data -> [src/services/servicesService.ts](src/services/servicesService.ts) with endpoints in [backend/app/api/api_v1/endpoints/services.py](backend/app/api/api_v1/endpoints/services.py)
- Blog data -> [src/services/blogService.ts](src/services/blogService.ts) with endpoints in [backend/app/api/api_v1/endpoints/blog.py](backend/app/api/api_v1/endpoints/blog.py)
- Media data -> [src/services/mediaService.ts](src/services/mediaService.ts) with endpoints in [backend/app/api/api_v1/endpoints/media.py](backend/app/api/api_v1/endpoints/media.py)
- Careers -> [src/services/careersService.ts](src/services/careersService.ts) with endpoints in [backend/app/api/api_v1/endpoints/careers.py](backend/app/api/api_v1/endpoints/careers.py)
- Contact -> [src/services/contactService.ts](src/services/contactService.ts) with endpoints in [backend/app/api/api_v1/endpoints/contact.py](backend/app/api/api_v1/endpoints/contact.py)
- Traceability -> [src/services/traceabilityService.ts](src/services/traceabilityService.ts) with endpoints in [backend/app/api/api_v1/endpoints/traceability.py](backend/app/api/api_v1/endpoints/traceability.py)

Gaps and placeholders
- Impact and ESG PDF exports are client-side only; no backend reports or audit logs [src/pages/Impact.tsx](src/pages/Impact.tsx) and [src/pages/ESG.tsx](src/pages/ESG.tsx)
- Traceability PDF is client-side only [src/pages/Traceability.tsx](src/pages/Traceability.tsx)

## Data Model and RLS Needs (Supabase)
These tables require RLS and ownership checks for CRUD to fully work with the user-specific dashboard and admin flows.
- apiaries, apiary_shares
- hives
- harvests
- tasks
- inspections
- notes
- settings, notification_configs
- devices, sensor_readings (read-only for most users unless owner or admin)
- pollination_requests
- contact_submissions
- newsletter_subscribers
- orders, order_items
- products, product_variants
- profiles, roles (admin checks)
- activity_logs, generated_documents, invoice_registry

## Export and Report Coverage
- PDF invoices -> backend supported [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- Hive list Excel export -> client-side (XLSX) [src/components/beeyield/BeeYieldHivesView.tsx](src/components/beeyield/BeeYieldHivesView.tsx)
- Meters reports PDF -> client-side mock (jsPDF) [src/components/beeyield/MetersReports.tsx](src/components/beeyield/MetersReports.tsx)
- Billing analytics CSV -> client-side, empty data [src/components/beeyield/BillingView.tsx](src/components/beeyield/BillingView.tsx)
- Impact/ESG/Traceability PDFs -> client-side (jsPDF or react-pdf) [src/pages/Impact.tsx](src/pages/Impact.tsx), [src/pages/ESG.tsx](src/pages/ESG.tsx), [src/pages/Traceability.tsx](src/pages/Traceability.tsx)
- Admin exports -> buttons exist, no handlers [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx#L1288-L1320)

## Required PRD Outcomes Per Page
For each page, the checklist matrix in docs/PRD_CHECKLIST_MATRIX.md identifies:
- UI actions (forms, buttons)
- Backend endpoints expected
- CRUD readiness
- Export/report readiness (PDF, Excel, CSV)
- Placeholder or mock data indicators

Next step: implement missing endpoints and wire UI actions to those endpoints, then update this PRD to reflect completed coverage.
