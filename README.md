# 🐝 BeeYield: Precision Apiculture & Global Economic Ledger

BeeYield is an enterprise-grade ecosystem designed to transform traditional beekeeping into a **precision-engineered biological economy**. By integrating high-frequency IoT telemetry, Rust-accelerated biological calculus, and a "Golden Thread" traceability blockchain, it enables beekeepers to maximize pollination ROI and verify honey purity at a molecular level.

---

## 📐 The BeeYield Calculus (Mathematical Framework)

At the heart of BeeYield lies a suite of mathematical models that convert raw sensor noise into actionable economic intelligence.

### 1. Yield Dynamics & Nectar Flow ($dY/dt$)
We determine biological productivity through the **First Derivative of Continuous Hive Weight (CHW)**:

$$ \text{Nectar Flow Rate} = \frac{dW}{dt} $$

*   **Positive Flux ($\frac{dW}{dt} > 0$):** High-velocity nectar intake during peak forage windows.
*   **Net Forage Influx:** The definite integral of all positive flux over a specific bloom period:
    $$ Y_{total} = \int_{t_{start}}^{t_{end}} \max\left(0, \frac{dW}{dt}\right) dt $$

### 2. Pollination Saturation Index (PSI)
Pollination efficacy is modeled as an exponential decay function based on the distance ($d$) from the hive gateway:

$$ P(d) = P_0 e^{-\lambda d} $$

where:
*   $P_0$ is the initial pollination intensity at the hive exit.
*   $\lambda$ is the crop-specific biological decay constant (e.g., Almond $\lambda \approx 0.15$).
*   **Orchard Coverage:** Calculated via overlapping surface integrals of active pallet halos to ensure 100% saturation.

### 3. Hive Health Index (HHI)
A weighted composite score ($H$) evaluating colony stability:

$$ H = w_1 \cdot A_{stability} + w_2 \cdot T_{variance} + w_3 \cdot W_{trend} $$

*   $A_{stability}$: Acoustic stability score derived from MFCC harmonics.
*   $T_{variance}$: Internal thermal regulation consistency ($\sigma^2 < 1.5^\circ C$).

### 4. Enterprise Checkout & Logistics (Oxidized Commerce)
The shop system utilizes a **Single-Page Progressive Checkout** flow with high-fidelity validation:

*   **Logistics Algorithm ($C_{ship}$):**
    $$ C_{ship} = 
    \begin{cases} 
    0 & \text{if } \text{Total} \ge 5000 \text{ KES or } \text{Method} = \text{Pickup} \\
    350 & \text{otherwise}
    \end{cases} 
    $$
*   **Cryptographic Coupon Validation ($D$):**
    $$ \text{Total}_{final} = (\text{Total}_{items} \cdot (1 - \text{Discount}_{\%})) + C_{ship} $$
    *   *Hardcoded authorized codes:* `HONEY20` (20%), `WELCOME10` (10%), `BEEFREE` (15%).
*   **Idempotency & Security:** Every transaction is registered in the **Rust Billing Ledger** before hitting payment gateways, preventing double-billing during network jitter.

---

## 🧠 Advanced AI & Biological Decoding

### 1. Master-Bee 8B MLLM & BeeSound Core
Our proprietary systems utilize state-of-the-art architectures for both linguistic and acoustic intelligence.

*   **FP8 Mixed Precision Training:** 
    *   **Pipeline:** Utilizing **Float8 (E4M3/E5M2)** via Transformer Engine for 2x faster training throughput on H100 clusters.
    *   **Quantization:** Post-Training Quantization (PTQ) to 4-bit for internal mobile inference while maintaining >98% accuracy.
*   **BeeSound Model (Acoustic Decoding):**
    *   **Architecture:** Convolutional Recurrent Neural Network (CRNN) specialized in high-frequency apiary vibrations.
    *   **Training:** Retrained for 1 epoch on the **BeeSound-v2** dataset to achieve SOTA weights, exported to **ONNX** for high-concurrency Rust inference.
    *   **Preprocessing:** Log-Mel Spectrogram extraction with 128 bins and 10ms hop length.

### 2. Acoustic Feature Extraction
Signals are decoded directly in the **Rust Core** using:
*   **Mel-Frequency Cepstral Coefficients (MFCCs)**
*   **Spectral Centroid Analysis** to detect "Queen Piping" or "Swarm Excitation" patterns.

---

## 🛠 Strategic Technology Stack

| Layer | Technology | Specification |
| :--- | :--- | :--- |
| **Compute Core** | **Rust (honey_rust)** | Memory-safe processing of yield calculus and blockchain hashing. |
| **Backend API** | **FastAPI (Python)** | High-concurrency async orchestration and Pydantic validation. |
| **Logic Layer** | **PyO3 + Rust** | Zero-copy FFI for high-performance telemetry processing. |
| **Database** | **Supabase (PgSQL)** | Enterprise-grade PostgreSQL with Row-Level Security (RLS). |
| **Edge Compute** | **Tauri (Rust)** | Native sidecar execution for offline dataset searching. |
| **Frontend** | **React / Vite** | "Intelligent Hive" Design System with Framer Motion physics. |
| **Payments** | **M-Pesa / Stripe / Apple Pay** | Regional mobile money and global decentralized payments. |
| **Addresses** | **Google Maps API** | High-precision address autocompletion for last-mile delivery. |

---

## 🏗 System Components & Module Registry

### 1. Unified Dashboard (The Cockpit)
*   **Real-time Telemetry:** Live mapping of smart hives across Kibwezi and Makueni.
*   **IoT Anomaly Detection:** Automated thermal spike detection ($T > 42^\circ C$).

### 2. Traceability Engine (Golden Thread)
Every jar of honey is anchored to a unique **Merkle Root** on the BeeYield Ledger.
*   **Batch Selection Logic:** "1 unique batch per 2000g (2kg)" implemented in Rust to ensure geographic and biological diversity in every dispatch.

### 3. Integrated Enterprise Shop
*   **Frictionless Checkout:** Single-page glassmorphism UI with guest checkout by default.
*   **Address Intelligence:** Google-powered autocompletion minimizes delivery errors.
*   **Order Intelligence:** Dynamic sidebar with real-time VAT, shipping, and coupon calculations.

---

## 🚀 Recent Architecture Modernizations (Sprint Log)

*   **Checkout Redesign:** Completely overhauled the checkout process into a high-end, single-page experience. Integrated Stripe (Apple Pay/Google Pay) and M-Pesa into a unified flow.
*   **Oxidized Business Logic:** Moved price validation, coupon application, and shipping calculations from Python to the Rust `ShopEngine` for maximum reliability.
*   **Guest Checkout Enablement:** Implemented an optional-auth bridge allowing guest users to purchase honey via Stripe/M-Pesa without immediate account registration.
*   **Address Autocomplete Integration:** Integrated Google Places API for seamless shipping data entry and validation.
*   **M-Pesa Idempotency:** Implemented a Rust-powered billing ledger to track payment intent state and handle Daraja callbacks with 100% reliability.
*   **FP8 Training Strategy:** Documented the transition to FP8 mixed-precision training for the Master-Bee model.

---

## 📊 Deployment Requirements

*   **Runtime:** Node.js v20+ (Vite 5.x)
*   **Compute:** Python 3.11+, Rust 1.75+, Maturin
*   **AI Hardware:** CUDA 12.x for FP8/BFloat16 acceleration.
*   **Environment:** Required keys for Stripe, M-Pesa, Google Maps, and Supabase.

---

*Precision Tools for a Modern Apiary. Empowering the Next Generation of Pollination Intelligence.*
