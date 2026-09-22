# BeeYield — Precision Apiculture & Honey Traceability

[![Production Deployment](https://img.shields.io/badge/Production-Live-1B9157?style=flat&logo=vercel)](https://www.beeyield.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-Proprietary-black.svg)](LICENSE)

BeeYield is an enterprise apiculture platform designed to optimize pollination yields, monitor colony health in real time through IoT telemetry, and provide end-to-end honey traceability from hive to consumer.

---

## Key Platform Capabilities

### 1. Real-Time Hive Monitoring & Telemetry
* **Live Telemetry Sync**: Automatically loads real-time weight, internal brood temperature, humidity, and colony activity metrics immediately upon user sign-in.
* **Colony Health Alerts**: Automated warning triggers for temperature variance ($\sigma^2$), sudden weight drops (swarming or starvation indicator), and moisture anomalies.
* **Device Calibration**: Sensor binding and frequency management for field-deployed IoT hardware.

### 2. Precision Pollination & Honey Yield Modeling
* **Yield Projections**: Mathematical modeling connecting colony strength, floral bloom cycles, and weather patterns to predict honey production.
* **Forage Zone Management**: Radius and floral resource coverage mapping for apiary placement and nutrition optimization.
* **Colony Availability Forecasting**: Schedule hives for precision agricultural pollination contracts in Makueni, Kibwezi, and regional farms.

### 3. Digital Apiary & Operations Management
* **Comprehensive Inspection Logging**: Full record-keeping for queen status, frame counts, pest/disease presence, and corrective actions.
* **Harvest Management**: Batch-level tracking capturing moisture percentage, floral source, harvest date, and yield weights.
* **Task Scheduling**: Structured workflow management for super additions, seasonal treatments, feeding, and split scheduling.

### 4. Traceability & E-Commerce
* **Golden Thread Traceability**: Batch verification enabling retail consumers and commercial buyers to inspect origin apiaries, harvest dates, and laboratory test results.
* **Single-Page Checkout**: Streamlined ordering with automated shipping calculations, discount code validation, and delivery method selection.
* **Secure Multi-Channel Payments**: PCI-DSS compliant payment integration supporting Stripe (Cards, Apple Pay, Google Pay) and mobile money (M-Pesa).

### 5. Automated Reporting & Provenance Documentation
* **Client Audit Reports**: Client-side and server-rendered PDF exports summarizing colony health inspections, forage quality, and batch certifications.
* **Dynamic User Data**: Personalized insights filtered exclusively to authenticated beekeeper records without mock data contamination.

---

## Recent Platform Updates

* **Immediate Telemetry Loading**: Streamlined sign-in workflow so connected hive telemetry hydrates instantly without requiring manual page refreshes.
* **User Data Isolation**: Purged legacy mock datasets across Inspections, Harvests, Tasks, and Hive Health pages; all views now bind directly to user account records.
* **Modernized Dashboard UI/UX**: Unified all primary action buttons, dialogs, and navigation controls to a high-visibility emerald design system (`#1B9157`) with clear white typography.
* **Card Payment Integration**: Added dedicated card addition workflow with responsive modal overlays and authenticated tokenization.
* **Code Quality & Strict Linting**: Enforced strict ESLint standards across the entire TypeScript codebase with 0 errors and 0 warnings.
* **Security Hardening**: Sanitized all hardcoded secrets and environment placeholders, migrating sensitive keys to secure environment variables.
* **Streamlined Architecture**: Deprecated and purged obsolete experimental modules (Acoustic Transformer, Orchard Mapper, Billing invoices) to maintain high performance and low bundle sizes.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Radix UI Primitives |
| **State & Data** | TanStack React Query, Context API, Supabase Client |
| **Backend API** | Python (FastAPI), Uvicorn, Pydantic |
| **Database & Auth** | Supabase (PostgreSQL), Row Level Security (RLS) |
| **Payments** | Stripe Elements & API, Safaricom Daraja M-Pesa |
| **Hosting & CI/CD** | Vercel Edge Network, GitHub Actions CI Pipeline |

---

## Getting Started

### Prerequisites
* **Node.js**: v18.x or v20.x+
* **pnpm**: v9.x or v10.x (or `npm` / `yarn`)
* **Python**: 3.10+ (if running local backend services)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nduva15/BeeYield.git
   cd BeeYield
   ```

2. **Install frontend dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm run dev` | Starts the Vite local development server |
| `pnpm run build` | Compiles and builds the production bundle in `dist/` |
| `pnpm run lint` | Runs ESLint across all TypeScript and React files |
| `pnpm run type-check` | Runs the TypeScript compiler check (`tsc --noEmit`) |
| `pnpm run preview` | Previews the local production build |

---

## Security & Reliability

* **PCI-DSS Level 1**: Stripe Elements handles all card data collection directly in secure iframes; no sensitive payment data touches the application servers.
* **Zero Hardcoded Secrets**: All API tokens, secret keys, and credentials are kept strictly in environment variables and secret stores.
* **Strict Type Safety**: End-to-end type coverage across all models, API handlers, and UI components.

---

## Production

The live production application is deployed and accessible at:
**[https://www.beeyield.com](https://www.beeyield.com)**
