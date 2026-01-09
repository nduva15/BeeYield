# 🚀 Vercel Deployment Guide for BeeYield

This guide explains how to properly deploy the BeeYield website to Vercel with the custom domain beeyield.com.

## 📋 Prerequisites

- Vercel account connected to this GitHub repository
- Custom domain `beeyield.com` configured in Vercel
- Access to Vercel project settings

## ⚙️ Required Environment Variables in Vercel

**IMPORTANT**: You must set these environment variables in the Vercel Dashboard for the deployment to work correctly.

### Frontend Variables (Required at Build Time)
These variables must be set in Vercel Project Settings → Environment Variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Production URLs (already in .env, but can be overridden)
VITE_APP_URL=https://beeyield.com
VITE_API_URL=/api/v1
```

### Backend Variables (Required at Runtime)
These are needed for the Python API backend:

```bash
# Supabase
SUPABASE_URL=https://lqdxsgnoeickomhsgeco.supabase.co
SUPABASE_KEY=<service-role-key>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# ClickHouse Analytics
CLICKHOUSE_HOST=<your-clickhouse-host>
CLICKHOUSE_USER=default
CLICKHOUSE_PASSWORD=<your-password>
CLICKHOUSE_PORT=8443
CLICKHOUSE_SECURE=True
CLICKHOUSE_DATABASE=beeyield_analytics

# PostgreSQL (Supabase)
POSTGRES_URL=<postgres-connection-string>

# Security
SECRET_KEY=<random-secret-key-for-jwt>
ACCESS_TOKEN_EXPIRE_MINUTES=11520
```

## 🔧 Setup Steps in Vercel Dashboard

1. **Navigate to Project Settings**
   - Go to https://vercel.com/dashboard
   - Select your BeeYield project
   - Click on "Settings"

2. **Configure Environment Variables**
   - Click on "Environment Variables" in the left sidebar
   - Add all the variables listed above
   - Set the environment to "Production" (or "Production, Preview, Development" if you want them everywhere)

3. **Set Custom Domain**
   - Click on "Domains" in the left sidebar
   - Add `beeyield.com` and `www.beeyield.com`
   - Follow Vercel's instructions to configure DNS records

4. **Deploy**
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment
   - Wait for build to complete

## 🐛 Troubleshooting

### Website Not Loading
- **Check Build Logs**: Go to Vercel Dashboard → Deployments → Latest → View Logs
- **Verify Environment Variables**: Ensure all VITE_ variables are set in Vercel
- **Check Domain Configuration**: Verify DNS records are pointing to Vercel

### API Endpoints Returning 404
- **Check API Logs**: The Python backend logs appear in Function Logs
- **Verify Backend Environment Variables**: Ensure Supabase and database credentials are set
- **Test API Health**: Visit `https://beeyield.com/api/health` to check if API is running

### CORS Errors
- The CORS configuration in `api/index.py` includes:
  - `https://beeyield.com`
  - `https://www.beeyield.com`
  - `https://beeyield.vercel.app`
- If you need to add more domains, edit `api/index.py` and redeploy

## 📁 Local Development

For local development, create a `.env.local` file (already gitignored):

```bash
# Copy from .env.local.example and update with your values
cp .env.local.example .env.local

# Edit .env.local with your local settings
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## 🔐 Security Notes

- Never commit sensitive keys to git (service role keys, JWT secrets, etc.)
- The `.env` file in this repo contains production-safe values only
- Sensitive credentials must be set in Vercel Dashboard
- The `.env.local` file is gitignored for local development overrides

## 📞 Need Help?

If the website is still not working after following these steps:
1. Check Vercel build logs for errors
2. Check Function logs for API errors
3. Verify all environment variables are set correctly in Vercel Dashboard
4. Test API health endpoint: `https://beeyield.com/api/health`
