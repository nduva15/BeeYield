# BeeYield Environment Variables - Quick Reference

## Copy-Paste Templates

### Development (.env)
```bash
# Copy and edit with your local values
VITE_SUPABASE_URL=https://your-dev-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key-here
VITE_SUPABASE_URL_BEEYIELD=https://beeyield-dev-ref.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=beeyield-dev-key
VITE_SUPABASE_URL_CEBA=https://ceba-dev-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-dev-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beeyield
POSTGRES_DB=beeyield
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dev_key
VITE_STRIPE_API_URL=https://api.stripe.com/v1
VITE_SUPER_ADMIN_EMAIL=dev@example.com
```

### Staging (.env.staging)
```bash
# Staging environment - use staging Supabase project
VITE_SUPABASE_URL=https://staging-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key-here
VITE_SUPABASE_URL_BEEYIELD=https://beeyield-staging-ref.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=beeyield-staging-anon-key
VITE_SUPABASE_URL_CEBA=https://ceba-staging-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-staging-anon-key
DATABASE_URL=postgresql://postgres:stagingpass@postgres:5432/beeyield_staging
POSTGRES_DB=beeyield_staging
POSTGRES_USER=postgres
POSTGRES_PASSWORD=stagingpass
VITE_API_URL=https://api-staging.beeyield.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_staging_key
VITE_STRIPE_API_URL=https://api.stripe.com/v1
VITE_SUPER_ADMIN_EMAIL=admin-staging@beeyield.com
```

### Production (.env.production) ⚠️ NEVER COMMIT
```bash
# Production environment - NEVER commit this file
# Store credentials in secure vault, not in version control
VITE_SUPABASE_URL=https://prod-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here
VITE_SUPABASE_URL_BEEYIELD=https://ezfccfypwmuvbpujkqrg.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI
VITE_SUPABASE_URL_CEBA=https://ceba-prod-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-prod-anon-key
DATABASE_URL=postgresql://produser:prodpass@postgres:5432/beeyield_prod
POSTGRES_DB=beeyield_prod
POSTGRES_USER=produser
POSTGRES_PASSWORD=prodpass
VITE_API_URL=https://api.beeyield.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_production_key
VITE_STRIPE_API_URL=https://api.stripe.com/v1
VITE_SUPER_ADMIN_EMAIL=admin@beeyield.com
```

---

## Variable Explanations

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Base Supabase project URL (Shop/Auth) | `https://project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Base Supabase anonymous key (Shop/Auth) | JWT token for public access |
| `VITE_SUPABASE_URL_BEEYIELD` | BeeYield backend Supabase URL (Hives, IoT) | `https://beeyield-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY_BEEYIELD` | BeeYield backend Supabase key | JWT token for BeeYield |
| `VITE_SUPABASE_URL_CEBA` | CEBA backend Supabase URL (Content, Admin) | `https://ceba-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY_CEBA` | CEBA backend Supabase key | JWT token for CEBA |
| `VITE_API_URL` | Backend API endpoint | `http://localhost:8000` or `https://api.beeyield.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_*` (dev) or `pk_live_*` (prod) |
| `VITE_STRIPE_API_URL` | Stripe API endpoint | Always `https://api.stripe.com/v1` |
| `VITE_SUPER_ADMIN_EMAIL` | Email address with admin access | `admin@example.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `POSTGRES_DB` | Database name | `beeyield`, `beeyield_staging`, `beeyield_prod` |
| `POSTGRES_USER` | Database user | `postgres`, `produser` |
| `POSTGRES_PASSWORD` | Database password | Strong password (>16 chars) |

---

## Deployment Commands

### Local Development
```bash
# 1. Create .env from template
cp .env.example .env
# 2. Edit .env with your values
# 3. Start services
docker compose -f docker-compose.dev.yml --env-file .env up --build
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Database: localhost:5432
```

### Docker Compose Staging
```bash
# Start staging environment
docker compose --env-file .env.staging -p beeyield-staging up -d
# View logs
docker compose -p beeyield-staging logs -f
```

### Docker Compose Production
```bash
# Start production environment
docker compose --env-file .env.production -p beeyield-prod up -d
# View logs
docker compose -p beeyield-prod logs -f frontend
docker compose -p beeyield-prod logs -f backend
```

### Kubernetes Production
```bash
# Create secrets
kubectl create namespace beeyield-prod
kubectl create secret generic beeyield-secrets -n beeyield-prod \
  --from-literal=SUPABASE_URL='https://prod-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='prod-key-here' \
  --from-literal=DATABASE_URL='postgresql://produser:prodpass@postgres:5432/beeyield_prod' \
  --from-literal=VITE_SUPABASE_ANON_KEY_BEEYIELD='eyJ...'

# Deploy
kubectl apply -f k8s/configmaps.yaml -n beeyield-prod
kubectl apply -f k8s/frontend-deployment.yaml -n beeyield-prod
kubectl apply -f k8s/backend-deployment.yaml -n beeyield-prod

# Monitor
kubectl get pods -n beeyield-prod
kubectl logs -f -n beeyield-prod -l app=beeyield-frontend
```

---

## Verifying Environment Setup

### Frontend (Browser Console)
```javascript
// Check if Supabase is initialized
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_API_URL)

// Try Supabase auth
supabase.auth.getSession()
```

### Backend (Terminal)
```bash
# Check if backend can connect to database
docker compose -p beeyield-prod exec backend python -c "import psycopg2; conn = psycopg2.connect(os.environ['DATABASE_URL']); print('Database OK')"

# Check if backend can reach Supabase
curl -H "Authorization: Bearer $SUPABASE_KEY" https://project.supabase.co/rest/v1/
```

### Docker Compose
```bash
# View all environment variables in a container
docker compose -p beeyield-prod exec frontend env | grep VITE
docker compose -p beeyield-prod exec backend env | grep DATABASE
```

### Kubernetes
```bash
# Check if pod received environment variables
kubectl get pod <pod-name> -n beeyield-prod -o yaml | grep -A20 "env:"

# Verify pod can read secrets
kubectl exec -it <pod-name> -n beeyield-prod -- env | grep SUPABASE
```

---

## Common Issues & Fixes

### "Cannot find module" or "env variable undefined"
- [ ] Rerun `pnpm install`
- [ ] Restart Docker containers
- [ ] Rebuild Docker image: `docker compose build --no-cache`

### Supabase authentication fails
- [ ] Verify `VITE_SUPABASE_URL` is correct project URL
- [ ] Check `VITE_SUPABASE_ANON_KEY` is not expired
- [ ] Confirm Supabase project is active in dashboard
- [ ] Check browser console for CORS errors

### Backend cannot reach database
- [ ] Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
- [ ] Check PostgreSQL service is running: `docker compose ps postgres`
- [ ] Test connection: `psql postgresql://user:pass@localhost:5432/db`

### Frontend shows wrong API URL
- [ ] Verify `VITE_API_URL` is set during build
- [ ] Check nginx config is proxying correctly
- [ ] Confirm backend is accessible at that URL

### Kubernetes pods stuck pending
- [ ] Check resources available: `kubectl describe node`
- [ ] Verify image can be pulled: `kubectl describe pod <pod>`
- [ ] Check storage: `kubectl get pvc -n beeyield-prod`

---

## Security Checklist

Before deploying to production:

- [ ] No `.env` files in Git
- [ ] No credentials in source code
- [ ] Database passwords are strong (>16 chars)
- [ ] Supabase keys are for correct project
- [ ] Stripe keys are for correct environment (test vs live)
- [ ] All secrets stored in Kubernetes Secret or vault
- [ ] Access logs enabled and monitored
- [ ] Firewall rules restrict database access
- [ ] Backups are automated and tested
- [ ] SSL certificates are valid and renewed

---

## Files to Update

1. **Development:**
   - `.env` (local only, never commit)

2. **Staging:**
   - `.env.staging` (store securely, not in Git)

3. **Production:**
   - `.env.production` (store in vault, not in Git)
   - Vercel dashboard environment variables
   - Kubernetes Secrets

4. **Documentation:**
   - `ENVIRONMENT_SETUP.md` (this guide)
   - `DEPLOYMENT_CHECKLIST.md` (deployment steps)
   - Team wiki/runbook
