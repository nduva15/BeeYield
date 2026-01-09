# 🔌 BeeYield Connections & API Keys Checklist

This document provides a comprehensive overview of all external connections, services, and API keys required for the BeeYield platform to function fully.

---

## ✅ Status Legend
- ✅ **Configured & Working** - Service is properly set up
- ⚠️ **Partially Configured** - Some keys provided but might need testing
- ❌ **Not Configured** - Service needs API keys/credentials
- 🔧 **Optional** - Service is optional and has mock/fallback behavior

---

## 1. 🗄️ Database Connections

### 1.1 Supabase (PostgreSQL) - ✅ Configured
**Purpose:** Primary database for user data, products, orders, careers, and application data

**Required Environment Variables:**
```env
# Frontend (.env)
VITE_SUPABASE_URL=https://lqdxsgnoeickomhsgeco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (backend/.env)
SUPABASE_URL=https://lqdxsgnoeickomhsgeco.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role_key)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=Jm1c7ycmRSfourwx7N2Tfo5h1kKWQLbomZaM6ZzusAzBkUiLM6+HrddK6H4dU/AaebRwBDwYbfO3exb6tK6K8Q==

# Postgres Direct Connection
POSTGRES_URL=postgres://postgres.lqdxsgnoeickomhsgeco:mQXu0jYEAbJIQMMZ@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgres://postgres.lqdxsgnoeickomhsgeco:mQXu0jYEAbJIQMMZ@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://postgres.lqdxsgnoeickomhsgeco:mQXu0jYEAbJIQMMZ@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_USER=postgres
POSTGRES_HOST=db.lqdxsgnoeickomhsgeco.supabase.co
POSTGRES_PASSWORD=mQXu0jYEAbJIQMMZ
POSTGRES_DATABASE=postgres
DATABASE_URL=<same as POSTGRES_URL>
```

**Current Status:** ✅ All credentials are configured in both root and backend `.env` files

**Test Command:**
```bash
python test_supabase.py
```

**Used By:**
- Authentication system
- User management
- Product catalog
- Order management
- Careers and applications
- Contact forms
- File storage (Supabase Storage buckets)

**Storage Buckets Required:**
- `resumes` - For job application CVs
- `product-images` - For honey/merchandise product images
- `media` - For general media files

---

### 1.2 ClickHouse - ✅ Configured
**Purpose:** Analytics database for tracking user behavior, page views, and business metrics

**Required Environment Variables:**
```env
CLICKHOUSE_HOST=u4ts8yi7vf.eu-west-1.aws.clickhouse.cloud
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=u0.LRX.Be~B4N
CLICKHOUSE_PORT=8443
CLICKHOUSE_SECURE=True
CLICKHOUSE_DATABASE=beeyield_analytics
```

**Current Status:** ✅ Credentials configured in both root and backend `.env` files

**Test Command:**
```bash
python test_clickhouse.py
```

**Used By:**
- Analytics tracking
- Page view statistics
- User behavior metrics
- Business intelligence dashboards

**Tables Required:** Check `backend/init_clickhouse_tables.py` for schema

---

## 2. 💳 Payment Gateways

### 2.1 Stripe - ❌ Not Configured
**Purpose:** International credit/debit card payments

**Required Environment Variables:**
```env
# Backend (backend/.env)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Current Status:** ❌ Not configured (Optional in `backend/app/core/config.py`)

**Where to Get Keys:**
1. Sign up at https://stripe.com
2. Go to Developers → API Keys
3. Copy publishable and secret keys
4. Set up webhooks and copy webhook secret

**Used By:**
- International customer payments
- Subscription handling (if implemented)
- `/api/v1/shop/checkout` endpoint

**Fallback Behavior:** In DEBUG mode, mock payment intents are created

---

### 2.2 M-Pesa (Safaricom) - ❌ Not Configured
**Purpose:** Mobile money payments for Kenyan customers

**Required Environment Variables:**
```env
# Backend (backend/.env)
MPESA_CONSUMER_KEY=<your_consumer_key>
MPESA_CONSUMER_SECRET=<your_consumer_secret>
MPESA_PASSKEY=<your_lipa_na_mpesa_passkey>
MPESA_BUSINESS_SHORTCODE=<your_shortcode>
MPESA_CALLBACK_URL=<your_domain>/api/v1/shop/checkout/callback/mpesa
```

**Current Status:** ❌ Not configured (Optional in `backend/app/core/config.py`)

**Where to Get Keys:**
1. Register at https://developer.safaricom.co.ke
2. Create an app (Sandbox for testing, Production for live)
3. Get Consumer Key and Consumer Secret
4. For Lipa na M-Pesa Online, get Business Shortcode and Passkey
5. Configure callback URL

**Used By:**
- Kenyan customer mobile payments
- `/api/v1/shop/checkout/mpesa` endpoint
- `backend/app/services/mpesa.py`

**Fallback Behavior:** In DEBUG mode, mock M-Pesa responses are returned

**Note:** Sandbox uses `https://sandbox.safaricom.co.ke`, Production uses `https://api.safaricom.co.ke`

---

## 3. 📧 Email Service

### 3.1 SMTP / Resend - ❌ Not Configured
**Purpose:** Transactional emails (order confirmations, contact form notifications, application receipts)

**Option A: SMTP (Gmail, SendGrid, etc.)**
```env
# Backend (backend/.env)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@beeyield.com
```

**Option B: Resend (Recommended for production)**
```env
# Backend (backend/.env)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=noreply@beeyield.com
EMAIL_FROM_NAME=BeeYield
```

**Current Status:** ❌ Not configured (Optional in `backend/app/core/config.py`)

**Where to Get Keys:**

**For Gmail SMTP:**
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `SMTP_PASSWORD`

**For Resend:**
1. Sign up at https://resend.com
2. Add and verify your domain
3. Create an API key
4. Copy the key (starts with `re_`)

**Used By:**
- Order confirmations (`backend/app/services/email_service.py`)
- Contact form submissions
- Career application receipts
- Password reset emails
- Notification emails

**Fallback Behavior:** When not configured, emails are logged to console with mock service

---

## 4. ⛓️ Blockchain Service

### 4.1 Web3/Ethereum (Deprecated) - 🔧 Optional
**Purpose:** External blockchain integration for honey traceability

**Required Environment Variables:**
```env
# Backend (backend/.env)
BLOCKCHAIN_URL=http://127.0.0.1:8545  # or Infura/Alchemy URL
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_PRIVATE_KEY=0x...
BLOCKCHAIN_ACCOUNT=0x...
```

**Current Status:** 🔧 Deprecated/Optional - The project uses a custom Python blockchain implementation

**Note:** The active blockchain implementation is in `backend/app/blockchain/honey_chain.py` (Python-based). The Web3 service in `backend/app/core/blockchain_service.py` is marked as deprecated and kept for reference only.

**If you want to use external blockchain (Ethereum/Polygon):**
1. Get RPC URL from:
   - Infura: https://infura.io
   - Alchemy: https://www.alchemy.com
   - QuickNode: https://www.quicknode.com
2. Deploy smart contract and get contract address
3. Set up account with private key
4. Configure environment variables

**Used By:**
- Honey traceability system (currently uses Python implementation)
- `/api/v1/traceability/*` endpoints

---

## 5. 🔐 Application Security

### 5.1 Secret Key - ⚠️ Needs Production Update
**Purpose:** JWT token signing and session security

**Required Environment Variables:**
```env
# Backend (backend/.env)
SECRET_KEY=change_this_to_a_random_secret_string_for_production
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days
```

**Current Status:** ⚠️ Using default/development key

**⚠️ SECURITY WARNING:** The current SECRET_KEY is a placeholder and MUST be changed for production!

**How to Generate a Secure Key:**
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# OpenSSL
openssl rand -base64 64

# Or online (use with caution)
# https://generate-secret.vercel.app/64
```

**Action Required:** Generate and set a new SECRET_KEY before deploying to production

---

## 6. 🌐 Application URLs

### 6.1 Development URLs
```env
# Root .env
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000/api/v1

# Backend .env
APP_URL=http://localhost:5173
API_URL=http://localhost:8000
```

### 6.2 Production URLs
```env
# .env.production
VITE_APP_URL=https://beeyield.vercel.app
VITE_API_URL=/api/v1  # Relative URL for Vercel deployment
```

**Current Status:** ✅ Configured for both environments

---

## 7. 🚀 Deployment Configuration

### 7.1 Vercel (Frontend + Serverless API)
**Status:** ✅ Configured via `vercel.json`

**Required Environment Variables in Vercel Dashboard:**
Set these in your Vercel project settings:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL=/api/v1

# For serverless API functions
SUPABASE_URL
SUPABASE_KEY
SUPABASE_JWT_SECRET
CLICKHOUSE_HOST
CLICKHOUSE_USER
CLICKHOUSE_PASSWORD
CLICKHOUSE_PORT
CLICKHOUSE_SECURE
CLICKHOUSE_DATABASE
SECRET_KEY
POSTGRES_URL
# Add payment/email keys if configured
```

### 7.2 Render (Backend API)
**Status:** ✅ Configured via `render.yaml`

**Required:** Create an environment group named `beeyield-secrets` with all backend environment variables

---

## 8. 📋 Quick Setup Checklist

### Essential (Required for Basic Functionality)
- [x] **Supabase:** Database connection configured
- [x] **ClickHouse:** Analytics database configured
- [ ] **SECRET_KEY:** Generate and set a production-ready secret key
- [x] **CORS Origins:** Configured for deployment domains

### Important (Required for Full Features)
- [ ] **Stripe:** Configure for international payments
- [ ] **M-Pesa:** Configure for Kenyan mobile payments
- [ ] **Email Service:** Configure SMTP or Resend for transactional emails

### Optional (Enhanced Features)
- [ ] **External Blockchain:** Configure if not using Python implementation
- [ ] **Custom Domain:** Point domain to Vercel/Render deployments

---

## 9. 🧪 Testing Connections

### Test All Connections Script
Create a comprehensive test script:

```bash
# Install dependencies first
cd backend
pip install -r requirements.txt

# Test Supabase
python test_supabase.py

# Test ClickHouse
python test_clickhouse.py

# Test Backend Server
uvicorn main:app --reload
# Visit http://localhost:8000/docs

# Test Frontend
cd ..
npm install
npm run dev
# Visit http://localhost:5173
```

### Health Check Endpoints
Once the backend is running:
- **API Health:** http://localhost:8000/api/health
- **API Docs:** http://localhost:8000/api/docs
- **Database Status:** Check via Supabase dashboard

---

## 10. 🔍 Missing Configuration Summary

Based on the current state, here's what you're missing:

### Critical for Production ⚠️
1. **SECRET_KEY** - Must be changed from default value
2. **Email Service** - No transactional emails will be sent (orders, notifications)
3. **Payment Gateways** - No actual payment processing (only mock in DEBUG mode)

### Impact of Missing Configurations

**Without Email Service:**
- ✅ Users can still place orders
- ❌ Users won't receive order confirmation emails
- ❌ You won't receive contact form notifications
- ❌ Job applicants won't receive confirmation emails

**Without Stripe:**
- ✅ Kenyan users can use M-Pesa (when configured)
- ❌ International customers cannot pay
- ❌ Credit/debit card payments won't work

**Without M-Pesa:**
- ✅ International users can use Stripe (when configured)
- ❌ Kenyan mobile money payments won't work
- ❌ Most local customers prefer M-Pesa

**With Default SECRET_KEY:**
- ⚠️ Security risk: JWT tokens could potentially be forged
- ⚠️ All tokens will be invalidated when you change the key
- ⚠️ Users will need to log in again after key change

---

## 11. 📞 Support & Resources

### Documentation Links
- **Supabase:** https://supabase.com/docs
- **ClickHouse:** https://clickhouse.com/docs
- **Stripe:** https://stripe.com/docs/api
- **M-Pesa:** https://developer.safaricom.co.ke/docs
- **Resend:** https://resend.com/docs
- **Vercel:** https://vercel.com/docs
- **Render:** https://render.com/docs

### Getting Help
- Check application logs for specific error messages
- Use the test scripts to isolate connection issues
- Review environment variable names for typos
- Ensure all secrets are properly copied (no extra spaces/newlines)

---

## 12. 🔒 Security Best Practices

1. **Never commit `.env` files to git** (already in `.gitignore`)
2. **Use different keys for development and production**
3. **Rotate secrets regularly** (every 90 days recommended)
4. **Use environment-specific configurations**
5. **Keep Supabase service role key secure** (backend only)
6. **Enable row-level security (RLS) in Supabase**
7. **Set up webhook signature verification** (Stripe, M-Pesa)
8. **Use HTTPS in production** (enforced by Vercel/Render)

---

**Last Updated:** 2026-01-09
**Project:** BeeYield - Honey Traceability & E-commerce Platform
**Version:** 1.0.0
