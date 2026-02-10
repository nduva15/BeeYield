# BeeYield PRD Checklist Matrix

Legend
- CRUD: OK, Partial, Missing
- Exports: PDF, Excel, CSV status (OK, Partial, Missing)
- Backend: list of required endpoints

## BeeYield Dashboard (User)
| Page or Tab | Key actions | Backend endpoints | CRUD | Exports | Placeholders or gaps |
| --- | --- | --- | --- | --- | --- |
| BeeYield Dashboard root | Load devices, readings | /iot/devices, /iot/readings [backend/app/api/api_v1/endpoints/iot.py](backend/app/api/api_v1/endpoints/iot.py) | OK (read) | N/A | Device data restricted to demo user only [backend/app/api/api_v1/endpoints/iot.py](backend/app/api/api_v1/endpoints/iot.py) |
| My Places | Create, edit, delete apiaries | /beeyield/apiaries [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | OK | N/A | Add Hive button in detail view not wired [src/components/beeyield/MyPlacesView.tsx](src/components/beeyield/MyPlacesView.tsx) |
| BeeYield Hives | Create, edit, delete hives; request inspection task; export Excel | /beeyield/hives, /beeyield/tasks [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | OK | Excel OK (client-side) | Signal health and some stats are mock (signal health) [src/components/beeyield/BeeYieldHivesView.tsx](src/components/beeyield/BeeYieldHivesView.tsx) |
| Inspections | Create, edit, delete inspections | /beeyield/inspections [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | OK | N/A | None |
| Harvests | Create, edit, delete harvests | /beeyield/harvests [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | OK | N/A | None |
| Tasks | Create tasks, calendar view | /beeyield/tasks [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | OK | N/A | None |
| My Notes | Create and list notes (Supabase directly) | Supabase notes table (no API) [src/components/beeyield/MyNotesView.tsx](src/components/beeyield/MyNotesView.tsx) | Partial | N/A | Direct Supabase access; no backend endpoint |
| My Requests | Filter dropdowns only | None | Missing | N/A | No data source; empty arrays [src/components/beeyield/MyRequestsView.tsx](src/components/beeyield/MyRequestsView.tsx) |
| My Devices | View devices; assign device | /iot/devices, /iot/readings [backend/app/api/api_v1/endpoints/iot.py](backend/app/api/api_v1/endpoints/iot.py) | Partial | N/A | Assign device modal not linked to backend [src/components/beeyield/AddDeviceModal.tsx](src/components/beeyield/AddDeviceModal.tsx) |
| Measurement Data (Online/Bluetooth/USB) | Select hive, scan Bluetooth, USB info | /beeyield/apiaries, /beeyield/hives [backend/app/api/api_v1/endpoints/beeyield.py](backend/app/api/api_v1/endpoints/beeyield.py) | Partial | N/A | Bluetooth fallback, USB is static [src/components/beeyield/RemainingViews.tsx](src/components/beeyield/RemainingViews.tsx) |
| Server Status | View API status | None | Missing | N/A | Mock data only [src/components/beeyield/ServerStatusView.tsx](src/components/beeyield/ServerStatusView.tsx) |
| Support Center | Submit ticket, list tickets | None | Missing | N/A | Simulated API and local state only [src/components/beeyield/SupportCenterView.tsx](src/components/beeyield/SupportCenterView.tsx) |
| Billing | View analytics, export CSV | None | Missing | CSV Partial | Empty datasets, CSV export on empty data [src/components/beeyield/BillingView.tsx](src/components/beeyield/BillingView.tsx) |
| Meters Dashboard | View meters, events, buildings | /meters/* [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py) | OK (read) | N/A | Usage trend is static sample data [src/components/beeyield/MetersView.tsx](src/components/beeyield/MetersView.tsx) |
| Meters Reports | Generate and download reports | None | Missing | PDF Partial | Client-side jsPDF with mock data [src/components/beeyield/MetersReports.tsx](src/components/beeyield/MetersReports.tsx) |
| Settings | Update preferences, thresholds | /settings, /settings/notifications, /settings/hives [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py) | OK | N/A | Account deletion is informational only [src/components/beeyield/SettingsView.tsx](src/components/beeyield/SettingsView.tsx) |
| Precision Pollination | Calculate and view analytics | /pollination/* [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py) | Partial | PDF Missing | Uses fallback hive data when API missing [src/components/beeyield/PrecisionPollinationView.tsx](src/components/beeyield/PrecisionPollinationView.tsx) |
| AI Assistant | Chat with AI | /assistant/* [backend/app/api/api_v1/api.py](backend/app/api/api_v1/api.py) | OK | N/A | None |

## Admin Dashboard
| Page or Tab | Key actions | Backend endpoints | CRUD | Exports | Placeholders or gaps |
| --- | --- | --- | --- | --- | --- |
| Overview | Stats and charts | /admin/* [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | OK (read) | Missing | Exports buttons have no handler [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx#L1288-L1320) |
| Orders | List, update status, delete | /admin/orders [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | OK | N/A | None |
| Products | Create, edit, delete | /admin/products [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | OK | Missing | Export buttons not wired [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx#L1288-L1320) |
| Batches (traceability) | Create, edit, delete | /admin/batches (traceability service) [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | OK | N/A | None |
| Farmers, Apiaries, Hives | CRUD | /admin/* [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | OK | N/A | None |
| Pollination Requests | Read, delete | /admin/pollination [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | Partial | N/A | None |
| Contact Requests | Read, delete | /admin/contact [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | Partial | N/A | None |
| Newsletter | Read, delete | /admin/newsletter [backend/app/api/api_v1/endpoints/admin.py](backend/app/api/api_v1/endpoints/admin.py) | Partial | N/A | None |
| Activity, Documents, Payments, Invoices | Read logs, stats | /admin/activity-logs, /admin/documents, /admin/invoices [backend/app/api/api_v1/endpoints/admin_extended.py](backend/app/api/api_v1/endpoints/admin_extended.py) | OK (read) | N/A | None |
| Seeding tools | Seed shop, traceability, apiary data | None | Missing | N/A | Stubbed methods return success without action [src/services/adminService.ts](src/services/adminService.ts) |

## Buyer Dashboard (My Account)
| Page or Tab | Key actions | Backend endpoints | CRUD | Exports | Placeholders or gaps |
| --- | --- | --- | --- | --- | --- |
| Orders | List, track, download invoice | /shop/orders, /shop/orders/{id}/tracking, /shop/orders/{id}/invoice [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | OK | PDF OK | None |
| Addresses | Add, delete | /shop/addresses [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | Partial | N/A | Update uses add-only flow [src/pages/BuyerDashboard.tsx](src/pages/BuyerDashboard.tsx) |
| Payment Methods | Add, delete | /shop/payment-methods [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | Partial | N/A | None |
| Profile | Update via Supabase | Supabase auth | Partial | N/A | Direct Supabase update [src/pages/BuyerDashboard.tsx](src/pages/BuyerDashboard.tsx) |

## Commerce
| Page | Key actions | Backend endpoints | CRUD | Exports | Placeholders or gaps |
| --- | --- | --- | --- | --- | --- |
| Shop | Browse products | /shop/products [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | OK (read) | N/A | None |
| Checkout | Place order, Stripe, Mpesa, invoice | /shop/checkout/init, /payments/stripe/* [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | OK | PDF OK | Coupon system unavailable [src/pages/Checkout.tsx](src/pages/Checkout.tsx#L130-L150) |
| Receipt | View order, download invoice | /shop/orders/{id}, /shop/orders/{id}/invoice [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py) | OK | PDF OK | None |

## Public Pages
| Page | Key actions | Backend endpoints | CRUD | Exports | Placeholders or gaps |
| --- | --- | --- | --- | --- | --- |
| Contact | Submit inquiry | /contact/submit [backend/app/api/api_v1/endpoints/contact.py](backend/app/api/api_v1/endpoints/contact.py) | Create OK | N/A | None |
| Pollination Request | Submit request | /contact/pollination [backend/app/api/api_v1/endpoints/contact.py](backend/app/api/api_v1/endpoints/contact.py) | Create OK | N/A | None |
| Traceability | Trace batch, download PDF | /traceability/code/{code} [backend/app/api/api_v1/endpoints/traceability.py](backend/app/api/api_v1/endpoints/traceability.py) | Read OK | PDF Partial | Fallback mock data when backend missing [src/services/traceabilityService.ts](src/services/traceabilityService.ts) |
| Impact | Download PDF report | None | N/A | PDF Partial | Client-side jsPDF only [src/pages/Impact.tsx](src/pages/Impact.tsx) |
| ESG | Download PDF report | None | N/A | PDF Partial | Client-side jsPDF only [src/pages/ESG.tsx](src/pages/ESG.tsx) |
| Blogs | List and read posts | /blog/posts, /blog/posts/{slug} [backend/app/api/api_v1/endpoints/blog.py](backend/app/api/api_v1/endpoints/blog.py) | Read OK | N/A | None |
| Media | List media | /media, /media/featured [backend/app/api/api_v1/endpoints/media.py](backend/app/api/api_v1/endpoints/media.py) | Read OK | N/A | None |
| Careers | List jobs, apply | /careers, /careers/apply [backend/app/api/api_v1/endpoints/careers.py](backend/app/api/api_v1/endpoints/careers.py) | Create OK | N/A | None |
| About, Team, Services, Crops, Learn, Global Hive Network | Read-only content | /company/*, /services/* [backend/app/api/api_v1/endpoints/company.py](backend/app/api/api_v1/endpoints/company.py), [backend/app/api/api_v1/endpoints/services.py](backend/app/api/api_v1/endpoints/services.py) | Read OK | N/A | Several pages use static data instead of services endpoints (wire-up recommended) |

## Export Coverage Summary
- PDF OK: Invoices from /shop/orders/{id}/invoice [backend/app/api/api_v1/endpoints/shop.py](backend/app/api/api_v1/endpoints/shop.py)
- PDF Partial: Traceability, Impact, ESG, Meters reports (client-side only) [src/pages/Traceability.tsx](src/pages/Traceability.tsx), [src/pages/Impact.tsx](src/pages/Impact.tsx), [src/pages/ESG.tsx](src/pages/ESG.tsx), [src/components/beeyield/MetersReports.tsx](src/components/beeyield/MetersReports.tsx)
- Excel Partial: Hives export client-side only [src/components/beeyield/BeeYieldHivesView.tsx](src/components/beeyield/BeeYieldHivesView.tsx)
- CSV Partial: Billing analytics export on empty data [src/components/beeyield/BillingView.tsx](src/components/beeyield/BillingView.tsx)
- Admin exports Missing: buttons without handlers [src/pages/AdminDashboard.tsx](src/pages/AdminDashboard.tsx#L1288-L1320)
