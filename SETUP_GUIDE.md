# 🚀 Quick Setup Guide - BeeYield

This guide will help you set up all the necessary connections and API keys for BeeYield.

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

## 🔑 Step 1: Get Your API Keys

### 1.1 Supabase (Required) ✅

**What it's for:** Database, authentication, file storage

1. Go to [supabase.com](https://supabase.com)
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy these values:
   - Project URL → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to Settings → Database
6. Copy the connection strings → `POSTGRES_URL`, etc.

**Cost:** Free tier available (up to 500MB database, 1GB file storage)

### 1.2 ClickHouse (Required) ✅

**What it's for:** Analytics and metrics tracking

1. Go to [clickhouse.cloud](https://clickhouse.cloud)
2. Create a free account
3. Create a new service
4. Copy these values:
   - Host → `CLICKHOUSE_HOST`
   - Password → `CLICKHOUSE_PASSWORD`
   - Database name → `CLICKHOUSE_DATABASE`

**Cost:** Free tier available (50GB data processing/month)

### 1.3 Stripe (Optional - For International Payments) 💳

**What it's for:** Credit/debit card payments from international customers

1. Go to [stripe.com](https://stripe.com)
2. Create an account
3. Go to Developers → API keys
4. Copy these values:
   - Publishable key → `STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
5. Set up webhooks:
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/v1/shop/checkout/callback/stripe`
   - Copy Signing secret → `STRIPE_WEBHOOK_SECRET`

**Cost:** 2.9% + $0.30 per successful transaction

**Skip if:** You only want to use M-Pesa for Kenyan customers

### 1.4 M-Pesa (Optional - For Kenyan Payments) 📱

**What it's for:** Mobile money payments from Kenyan customers via Safaricom

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account
3. Create an app (use Sandbox for testing)
4. Go to your app and copy:
   - Consumer Key → `MPESA_CONSUMER_KEY`
   - Consumer Secret → `MPESA_CONSUMER_SECRET`
5. For Lipa na M-Pesa Online:
   - Get your Business Shortcode → `MPESA_BUSINESS_SHORTCODE`
   - Get your Passkey → `MPESA_PASSKEY`
6. Set callback URL → `MPESA_CALLBACK_URL`

**Cost:** M-Pesa charges apply (check with Safaricom)

**Skip if:** You only want international payments via Stripe

### 1.5 Email Service (Optional - For Notifications) 📧

**Option A: Resend (Recommended for production)**

**What it's for:** Sending order confirmations, notifications, etc.

1. Go to [resend.com](https://resend.com)
2. Create an account
3. Add and verify your domain
4. Create an API key
5. Copy the key → `RESEND_API_KEY`

**Cost:** 3,000 emails/month free, then $20/month for 50,000 emails

**Option B: Gmail SMTP (Good for testing)**

1. Enable 2-Factor Authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate an App Password
4. Use these values:
   - `SMTP_SERVER=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASSWORD=your_16_char_app_password`

**Cost:** Free (with Gmail account limits)

**Skip if:** You don't need automated emails (orders will still work, but no confirmations sent)

## ⚙️ Step 2: Configure Environment Variables

### 2.1 Create .env files

```bash
# Copy the example file
cp .env.example .env

# Also for backend
cp backend/.env.example backend/.env  # (if exists, otherwise just edit backend/.env)
```

### 2.2 Edit .env files

Open `.env` and `backend/.env` in your text editor and fill in the values from Step 1.

**Important:** Generate a secure SECRET_KEY:

```bash
# Run this command to generate a random key
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Copy the output to SECRET_KEY in your .env file
```

### 2.3 Verify your configuration

Run the connection test script:

```bash
# Make sure you're in the project root
python test_all_connections.py
```

This will check all your connections and tell you what's missing.

## 🗄️ Step 3: Set Up Databases

### 3.1 Supabase Tables

1. Go to your Supabase project dashboard
2. Go to SQL Editor
3. Run the migration files in `backend/migrations/` or `backend/db/` folder
4. Create storage buckets:
   - `resumes` (for job applications)
   - `product-images` (for product photos)
   - `media` (for general uploads)

### 3.2 ClickHouse Tables

Run the initialization script:

```bash
cd backend
python init_clickhouse_tables.py
```

## 🚀 Step 4: Run the Application

### 4.1 Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 4.2 Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4.3 Access the Application

- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs
- Backend Health: http://localhost:8000/api/health

## 📦 Step 5: Deploy to Production

### 5.1 Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard:
   - All `VITE_*` variables
   - All backend variables (for serverless API)
5. Deploy!

**Add these environment variables in Vercel:**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL=/api/v1
VITE_APP_URL=https://your-app.vercel.app

# For serverless API
SUPABASE_URL
SUPABASE_KEY
CLICKHOUSE_HOST
CLICKHOUSE_PASSWORD
SECRET_KEY
# ... and any payment/email keys you configured
```

### 5.2 Deploy Backend to Render (Alternative)

If you prefer a separate backend:

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (all backend variables)
6. Deploy!

## ✅ Verification Checklist

After setup, verify these work:

- [ ] Can access the website
- [ ] Can view products in the shop
- [ ] Can search for honey traceability codes
- [ ] Can register/login with email
- [ ] Can add products to cart
- [ ] Can place an order (test payment in sandbox mode)
- [ ] Receive order confirmation email (if email configured)
- [ ] Can upload CV on careers page
- [ ] Contact form submissions work

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
npm install
```

**"Connection refused" to database**
- Check your Supabase/ClickHouse credentials
- Verify network connectivity
- Check if services are running

**"CORS error" in browser**
- Update CORS origins in `backend/app/core/config.py`
- Add your deployment URL to allowed origins

**"Invalid API key" errors**
- Verify you copied the full key (no spaces)
- Check you're using the right key (anon vs service_role)
- Regenerate the key if needed

**Payments not working**
- Check if you're in test/sandbox mode
- Verify webhook endpoints are correct
- Check API key format (test keys start with `sk_test_`)

### Getting Help

1. Run the connection test: `python test_all_connections.py`
2. Check the detailed checklist: `CONNECTIONS_CHECKLIST.md`
3. Review the application logs
4. Check Supabase/ClickHouse dashboard for errors

## 📚 Additional Resources

- [BeeYield Complete Guide](COMPLETE_GUIDE.md)
- [Connections Checklist](CONNECTIONS_CHECKLIST.md)
- [Backend Documentation](backend_guide_and_prds.md)

## 🎉 You're All Set!

Once you've completed all the required steps (Supabase, ClickHouse, SECRET_KEY), your BeeYield application should be fully functional!

The optional services (Stripe, M-Pesa, Email) can be added later as needed.

**Next Steps:**
1. Seed some test data (products, honey batches)
2. Test the traceability feature
3. Customize branding and content
4. Add your products to the shop
5. Go live! 🚀

---

**Need help?** Check the troubleshooting section or review the logs for specific error messages.
