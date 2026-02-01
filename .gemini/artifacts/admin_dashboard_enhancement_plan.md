# 🐝 BeeYield Admin Dashboard Enhancement Plan

## Executive Summary

Transform the Admin Dashboard into a **Central Command Center** that provides real-time visibility into ALL system activities across the BeeYield platform.

---

## 📊 Current State Analysis

### Existing Admin Dashboard Features:
- ✅ **Overview** - Basic stats (revenue, orders, honey kg, users)
- ✅ **Orders** - Order management with status updates
- ✅ **Products** - Shop product CRUD operations
- ✅ **Batches/Traceability** - Honey batch management
- ✅ **Farmers** - Farmer profiles management
- ✅ **Apiaries** - Apiary locations management
- ✅ **Hives** - Hive registry management
- ✅ **Pollination** - Pollination request management
- ✅ **Contact** - Contact form submissions
- ✅ **Newsletter** - Subscriber management
- ✅ **Team** - User/admin management (super admin only)

### Missing Features (To Be Implemented):
- ❌ **Tracing History** - Log of all traced codes/batches
- ❌ **Invoice Registry** - All generated invoices
- ❌ **PDF Generation Log** - All PDFs generated across the system
- ❌ **Excel Export Log** - All Excel files generated
- ❌ **Payments Registry** - All payment transactions
- ❌ **Activity Feed** - Real-time activity stream
- ❌ **Export Categories** - Categorized export history

---

## 🏗️ Proposed Architecture

### New Database Tables Required

```sql
-- 1. ACTIVITY LOG (Master Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL, -- 'trace', 'invoice', 'pdf', 'excel', 'payment', 'order', 'export'
    action TEXT NOT NULL, -- 'created', 'viewed', 'downloaded', 'generated'
    entity_type TEXT NOT NULL, -- 'batch', 'order', 'product', 'farmer', etc.
    entity_id UUID,
    entity_reference TEXT, -- batch_code, order_number, etc.
    user_id UUID,
    user_email TEXT,
    metadata JSONB, -- Additional context data
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. GENERATED DOCUMENTS REGISTRY
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL, -- 'invoice', 'traceability_certificate', 'export_pdf', 'report'
    document_name TEXT NOT NULL,
    file_format TEXT NOT NULL, -- 'pdf', 'xlsx', 'csv'
    file_size_bytes INTEGER,
    file_url TEXT, -- If stored in Supabase Storage
    related_entity_type TEXT,
    related_entity_id UUID,
    related_entity_reference TEXT,
    generated_by_user_id UUID,
    generated_by_email TEXT,
    download_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. TRACING HISTORY
CREATE TABLE IF NOT EXISTS tracing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT NOT NULL,
    batch_id UUID REFERENCES honey_batches(id),
    traced_by_user_id UUID,
    traced_by_email TEXT,
    traced_from_ip TEXT,
    trace_source TEXT, -- 'qr_scan', 'manual_entry', 'website'
    device_info TEXT,
    location_data JSONB, -- Optional geolocation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    order_number TEXT,
    payment_method TEXT NOT NULL, -- 'mpesa', 'card', 'bank_transfer'
    transaction_id TEXT, -- External payment provider ID
    amount_kes DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    mpesa_receipt_number TEXT,
    card_last_four TEXT,
    payment_provider TEXT, -- 'safaricom', 'stripe', 'paystack'
    payer_phone TEXT,
    payer_email TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. USER ACCOUNTS REGISTRY (Enhanced)
CREATE TABLE IF NOT EXISTS account_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    account_type TEXT DEFAULT 'customer', -- 'customer', 'farmer', 'buyer', 'admin', 'super_admin'
    registration_source TEXT, -- 'website', 'mobile_app', 'admin_created'
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'email_verified', 'fully_verified'
    last_login_at TIMESTAMP WITH TIME ZONE,
    total_orders INTEGER DEFAULT 0,
    total_spent_kes DECIMAL(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

---

## 🎯 New Admin Dashboard Tabs

### 1. 📜 **Activity Log Tab** (NEW)
A real-time feed of ALL system activities:

**Features:**
- Live activity stream with infinite scroll
- Filter by activity type (traces, exports, payments, etc.)
- Filter by date range
- Filter by user
- Search by entity reference
- Export activity log to CSV/Excel

**UI Components:**
- Activity timeline with icons per type
- Quick stats cards (Today's traces, PDFs generated, etc.)
- Activity heatmap by hour/day

### 2. 🔍 **Tracing History Tab** (NEW)
Track all QR code scans and manual traces:

**Features:**
- Table of all traced batches with timestamp
- Trace source breakdown (QR vs Manual)
- Geographic trace map (if location available)
- Most traced batches leaderboard
- Trace trends chart (daily/weekly/monthly)

**Columns:**
| Batch Code | Honey Type | Traced By | Source | Device | Location | Timestamp |

### 3. 🧾 **Invoices Tab** (NEW)
Complete invoice registry:

**Features:**
- All generated invoices list
- Filter by status (paid/unpaid)
- Filter by date range
- Filter by customer
- Regenerate/resend invoice
- Download invoice PDF
- Invoice statistics dashboard

**Columns:**
| Invoice # | Order # | Customer | Amount | Status | Generated | Actions |

### 4. 📄 **Documents Tab** (NEW)
Registry of all generated PDFs and exports:

**Subcategories:**
1. **Traceability Certificates** - PDFs from `/traceability`
2. **Invoices** - Order invoices from buyer dashboard
3. **Reports** - ESG, Impact, Meter reports
4. **Excel Exports** - All XLS/XLSX exports
5. **CSV Exports** - All CSV exports

**Features:**
- Categorized document list
- Download history tracking
- Storage usage statistics
- Regenerate document option
- Bulk download

**Columns:**
| Document Name | Type | Format | Category | Generated By | Size | Downloads | Created |

### 5. 💰 **Payments Tab** (NEW)
Complete payment transaction history:

**Features:**
- All payment transactions
- Filter by payment method (M-Pesa, Card)
- Filter by status
- Payment trends chart
- Revenue breakdown by method
- Failed payments alerts
- Refund management

**Columns:**
| Transaction ID | Order # | Method | Amount | Status | Payer | Timestamp |

**Stats Cards:**
- Total Revenue Today
- Pending Payments
- M-Pesa vs Card split
- Average Order Value

### 6. 👥 **Accounts Tab** (ENHANCED)
All user accounts across the platform:

**Features:**
- Complete user registry
- Filter by account type
- Account verification status
- User activity summary
- Account creation trends
- Export user list

**Columns:**
| Email | Name | Type | Verified | Orders | Spent | Last Login | Status |

---

## 🔧 Implementation Phases

### Phase 1: Database Setup (Day 1)
1. Create new database tables via SQL migration
2. Create indexes for performance
3. Set up RLS policies
4. Create database functions for logging

### Phase 2: Backend API (Days 2-3)
1. Create activity logging service
2. Document generation tracking API
3. Tracing history API
4. Payment transactions API
5. Account registry API
6. Dashboard statistics aggregation API

### Phase 3: Frontend - Admin Service (Day 4)
1. Extend `adminService.ts` with new endpoints:
   - `getActivityLogs(filters)`
   - `getTracingHistory(filters)`
   - `getGeneratedDocuments(filters)`
   - `getPaymentTransactions(filters)`
   - `getAccountRegistry(filters)`
   - `getEnhancedDashboardStats()`

### Phase 4: Frontend - UI Components (Days 5-7)
1. Create new tab components:
   - `ActivityLogTab.tsx`
   - `TracingHistoryTab.tsx`
   - `DocumentsRegistryTab.tsx`
   - `PaymentsTab.tsx`
   - `AccountsTab.tsx`

2. Create shared components:
   - `ActivityFeedItem.tsx`
   - `DocumentCard.tsx`
   - `PaymentStatusBadge.tsx`
   - `DateRangePicker.tsx`
   - `ExportButton.tsx`

### Phase 5: Integration & Logging (Day 8)
1. Integrate activity logging across existing features:
   - Log when traceability is queried
   - Log when PDFs are generated
   - Log when exports are downloaded
   - Log payment events
   - Log user registrations

### Phase 6: Testing & Polish (Day 9-10)
1. End-to-end testing
2. Performance optimization
3. UI/UX refinements
4. Documentation

---

## 📁 File Structure

```
src/
├── components/
│   └── admin/
│       ├── tabs/
│       │   ├── ActivityLogTab.tsx       (NEW)
│       │   ├── TracingHistoryTab.tsx    (NEW)
│       │   ├── DocumentsRegistryTab.tsx (NEW)
│       │   ├── PaymentsTab.tsx          (NEW)
│       │   └── AccountsTab.tsx          (NEW)
│       ├── shared/
│       │   ├── ActivityFeedItem.tsx     (NEW)
│       │   ├── DocumentCard.tsx         (NEW)
│       │   ├── PaymentStatusBadge.tsx   (NEW)
│       │   └── AdminDataTable.tsx       (NEW)
│       └── (existing admin components)
├── services/
│   ├── adminService.ts                  (ENHANCED)
│   └── activityService.ts               (NEW)
├── pages/
│   └── AdminDashboard.tsx               (ENHANCED)
└── types/
    └── admin.types.ts                   (NEW)

backend/
├── app/
│   ├── api/api_v1/
│   │   ├── activity.py                  (NEW)
│   │   ├── documents.py                 (NEW)
│   │   ├── payments_admin.py            (NEW)
│   │   └── accounts.py                  (NEW)
│   ├── schemas/
│   │   ├── activity.py                  (NEW)
│   │   ├── documents.py                 (NEW)
│   │   └── payments.py                  (NEW)
│   └── services/
│       ├── activity_service.py          (NEW)
│       └── document_service.py          (NEW)
└── db/
    └── admin_dashboard_tables.sql       (NEW)
```

---

## 🎨 UI/UX Design Specifications

### Color Scheme for New Tabs:
- **Activity Log**: Purple gradient (`#8B5CF6` → `#7C3AED`)
- **Tracing History**: Teal gradient (`#14B8A6` → `#0D9488`)
- **Documents**: Blue gradient (`#3B82F6` → `#2563EB`)
- **Payments**: Green gradient (`#22C55E` → `#16A34A`)
- **Accounts**: Orange gradient (`#F97316` → `#EA580C`)

### Key UI Elements:
1. **Stat Cards** - Glassmorphism with colored gradients
2. **Data Tables** - Sortable, filterable, with row actions
3. **Activity Feed** - Timeline with avatar, action, timestamp
4. **Charts** - Recharts AreaChart for trends
5. **Filters** - Collapsible filter panel with presets

---

## 📊 Dashboard Overview Enhancements

Add new overview cards:
1. **Traces Today** - QR scans + manual traces
2. **Documents Generated** - PDFs + Excels today
3. **Payment Volume** - Today's transaction total
4. **New Accounts** - Registrations today

Add new charts:
1. **Activity by Hour** - 24h activity heatmap
2. **Trace Origins** - Pie chart of trace sources
3. **Payment Methods** - M-Pesa vs Card breakdown
4. **Document Types** - PDF vs Excel vs CSV

---

## ✅ Success Criteria

1. Admin can view ALL traced codes with timestamps
2. Admin can see ALL generated invoices
3. Admin can see ALL PDF downloads
4. Admin can see ALL Excel exports
5. Admin can view ALL payment transactions
6. Admin can view ALL user accounts
7. Admin can filter and export all data
8. Real-time activity feed updates
9. Performance < 2 seconds for any query
10. Mobile-responsive dashboard

---

## 🚀 Quick Start

To begin implementation, run these commands:

```bash
# 1. Create the new database tables
cd backend/db
# Run admin_dashboard_tables.sql in Supabase SQL Editor

# 2. Start the backend
cd backend
.\venv\Scripts\python.exe main.py

# 3. Start the frontend
cd ..
npm run dev
```

---

## 📝 Notes

- All logging should be non-blocking (async)
- Implement pagination for large datasets
- Add caching for frequently accessed stats
- Consider implementing WebSocket for real-time updates
- Ensure GDPR compliance for user data display
