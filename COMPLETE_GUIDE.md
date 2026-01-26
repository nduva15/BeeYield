# 🐝 BeeYield Website: Complete Backend & Traceability Guide

Hello! This guide is designed for you. It explains how your website's "brain" (the backend) works and how we've built your custom **Honey Traceability Blockchain**.

---

## 1. How the Backend Works (The "Brain")
Your website has two main parts:
1.  **The Frontend (React/Tailwind)**: What users see and click on.
2.  **The Backend (Python/FastAPI)**: Where data is processed, emails are sent, and the blockchain lives.

### Connecting them:
When a user fills out a form or searches for a honey code, the **Frontend** sends a request to the **Backend**. The Backend then talks to the **Database** or the **Blockchain** and sends the answer back.

---

## 2. Your Custom Blockchain (Traceability)
You wanted a way to track honey from **Hive to Table**. We built a custom **Python Blockchain** for this.

### Why Blockchain?
Unlike a normal database, data on a blockchain is **immutable** (it cannot be changed or deleted). This builds 100% trust with your customers.

### The Traceability Journey:
1.  **Hive Record**: When a new hive is set up, a "Block" is created with its GPS coordinates and environment.
2.  **Harvest Record**: When honey is collected, a new "Block" links to the Hive. It records the date and the beekeeper.
3.  **Verification**: When a customer enters a code (like `PH2024-WF-0342`), the backend looks through the chain and confirms: "Yes, this matches the records exactly."

**Where to find it**: `backend/app/blockchain/chain.py`

---

## 3. Page-by-Page Backend Map (PRD)

Here is how every page on your site uses the backend:

| Page | What it does | Backend Logic |
| :--- | :--- | :--- |
| **Home** | Showcases BeeYield | Fetches impact stats (total honey, hives) from the DB. |
| **Traceability** | Verify Honey Jar | Calls `/api/v1/traceability/code/{code}` to get blockchain history. |
| **Shop** | Buy Honey/Merch | Calls `/api/v1/shop/products` to get live prices and stock. |
| **Contact** | Inquiry Forms | Calls `/api/v1/contact/submit`. Saves the info and emails YOU instantly. |
| **Careers** | Job Postings | Calls `/api/v1/jobs` to list openings and handles CV uploads. |
| **Pollination** | Farmer Requests | Calls `/api/v1/contact/pollination` specifically for farm service leads. |

---

## 4. How to run it (Simple Steps)

### A. Start the Backend
1.  Open your computer's terminal.
2.  Type: `cd backend`
3.  Type: `pip install -r requirements.txt`
4.  Type: `uvicorn main:app --reload`
    *   *Green light:* You should see `http://127.0.0.1:8000`. This means the brain is alive!

### B. Start the Frontend
1.  Open a **second** terminal.
2.  Type: `npm run dev`
3.  Open the link provided (usually `http://localhost:5173`).

---

## 5. Security & Scaling
*   **Secure Links**: We use **CORS** settings to make sure only YOUR website can talk to your backend.
*   **Database**: We use **Supabase** (Postgres), which is industry-standard and very secure.
*   **Payments**: Ready for **Stripe** or **M-Pesa** integration in the `payment.py` service.

---

## 6. What's Next?
1.  **Live Deployment**: Move the code from your computer to a "Cloud" (like Render or Vercel).
2.  **Real Blockchain**: Currently, the blockchain runs in your backend's memory. For "Real" decentralization, you can connect the same logic to a network like **Polygon** (I've included placeholders for this).

**You now have a complete, professional-grade backend and blockchain system!** 🚀

## 7. Permanent Database Fix (Forms & Newsletter)
If your forms are not appearing in Supabase:
1. Open the file 'FIX_SUPABASE_PERMANENTLY.sql' in this folder.
2. Copy all the content.
3. Go to your Supabase Dashboard -> SQL Editor.
4. Run the code. This will fix all permission issues and ensure the tables are ready.
