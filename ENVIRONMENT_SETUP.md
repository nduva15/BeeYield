# BeeYield Environment Setup Guide

This guide covers proper environment variable configuration for development, staging, and production deployments across Docker Compose, Kubernetes, and Vercel.

## ⚠️ CRITICAL SECURITY NOTE

**NEVER commit `.env` files or hardcode secrets in source code.** Always use:
- `.env` files (add to `.gitignore`)
- Secret management tools (Docker secrets, Kubernetes Secrets, Vercel environment variables)
- Encrypted vaults for production credentials

---

## 1. LOCAL DEVELOPMENT SETUP

### Create `.env` file (never commit this)

```bash
# .env (local development)
# --- BASE SUPABASE ---
VITE_SUPABASE_URL=https://your-dev-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key

# --- BEEYIELD BACKEND (Hives, IoT, Farmers) ---
VITE_SUPABASE_URL_BEEYIELD=https://beeyield-dev-ref.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=your-beeyield-dev-key

# --- CEBA BACKEND (Content, Admin) ---
VITE_SUPABASE_URL_CEBA=https://ceba-dev-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=your-ceba-dev-key

# --- DATABASE ---
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beeyield
POSTGRES_DB=beeyield
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# --- STRIPE ---
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-test-key

# --- ADMIN ---
VITE_SUPER_ADMIN_EMAIL=dev@example.com

# --- API ---
VITE_API_URL=http://localhost:8000
```

### Add to `.gitignore`

```gitignore
.env
.env.local
.env.*.local
.env.production
.env.staging
```

### Run Development Stack

```bash
# Copy example files
cp .env.example .env

# Start all services
docker compose -f docker-compose.dev.yml up --build

# Or with environment file
docker compose -f docker-compose.dev.yml --env-file .env up --build
```

---

## 2. DOCKER COMPOSE STAGING & PRODUCTION

### Create `.env.staging`

```bash
# .env.staging
# --- STAGING SUPABASE (Real staging project) ---
VITE_SUPABASE_URL=https://staging-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key-here

VITE_SUPABASE_URL_BEEYIELD=https://beeyield-staging-ref.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=beeyield-staging-anon-key

VITE_SUPABASE_URL_CEBA=https://ceba-staging-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-staging-anon-key

# --- STAGING DATABASE ---
DATABASE_URL=postgresql://postgres:stagingpass@postgres:5432/beeyield_staging
POSTGRES_DB=beeyield_staging
POSTGRES_USER=postgres
POSTGRES_PASSWORD=stagingpass

# --- STRIPE STAGING ---
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_staging_key
VITE_STRIPE_API_URL=https://api.stripe.com/v1

# --- API ---
VITE_API_URL=https://api-staging.beeyield.com
VITE_SUPER_ADMIN_EMAIL=admin-staging@beeyield.com
```

### Create `.env.production`

```bash
# .env.production (NEVER commit this)
# --- PRODUCTION SUPABASE ---
VITE_SUPABASE_URL=https://prod-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here

VITE_SUPABASE_URL_BEEYIELD=https://ezfccfypwmuvbpujkqrg.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI

VITE_SUPABASE_URL_CEBA=https://ceba-prod-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA=ceba-prod-anon-key

# --- PRODUCTION DATABASE ---
DATABASE_URL=postgresql://produser:prodpass@postgres:5432/beeyield_prod
POSTGRES_DB=beeyield_prod
POSTGRES_USER=produser
POSTGRES_PASSWORD=prodpass

# --- STRIPE LIVE ---
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_production_key
VITE_STRIPE_API_URL=https://api.stripe.com/v1

# --- API & ADMIN ---
VITE_API_URL=https://api.beeyield.com
VITE_SUPER_ADMIN_EMAIL=admin@beeyield.com
```

### Deploy with Docker Compose

```bash
# Staging
docker compose --env-file .env.staging -p beeyield-staging up -d

# Production
docker compose --env-file .env.production -p beeyield-prod up -d

# View logs
docker compose -p beeyield-prod logs -f frontend
docker compose -p beeyield-prod logs -f backend
```

---

## 3. KUBERNETES SETUP (Staging & Production)

### Create Kubernetes Secrets

**For Staging:**

```bash
# Create beeyield-staging namespace
kubectl create namespace beeyield-staging

# Create secrets for staging
kubectl create secret generic beeyield-secrets \
  --namespace=beeyield-staging \
  --from-literal=DATABASE_URL='postgresql://postgres:stagingpass@beeyield-postgres:5432/beeyield_staging' \
  --from-literal=SUPABASE_URL='https://staging-project-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='staging-anon-key-here' \
  --from-literal=VITE_SUPABASE_ANON_KEY_BEEYIELD='beeyield-staging-anon-key' \
  --from-literal=POSTGRES_PASSWORD='stagingpass'
```

**For Production:**

```bash
# Create beeyield-prod namespace
kubectl create namespace beeyield-prod

# Create secrets for production
kubectl create secret generic beeyield-secrets \
  --namespace=beeyield-prod \
  --from-literal=DATABASE_URL='postgresql://produser:prodpass@beeyield-postgres:5432/beeyield_prod' \
  --from-literal=SUPABASE_URL='https://prod-project-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='prod-anon-key-here' \
  --from-literal=VITE_SUPABASE_ANON_KEY_BEEYIELD='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI' \
  --from-literal=POSTGRES_PASSWORD='prodpass'
```

### Update Kubernetes ConfigMap

**File: `k8s/configmaps.yaml`**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: beeyield-staging
data:
  VITE_API_URL: "https://api-staging.beeyield.com"
  VITE_SUPABASE_URL: "https://staging-project-ref.supabase.co"
  VITE_SUPABASE_URL_BEEYIELD: "https://beeyield-staging-ref.supabase.co"
  VITE_STRIPE_PUBLISHABLE_KEY: "pk_test_staging_key"
  VITE_SUPER_ADMIN_EMAIL: "admin-staging@beeyield.com"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: beeyield-prod
data:
  VITE_API_URL: "https://api.beeyield.com"
  VITE_SUPABASE_URL: "https://prod-project-ref.supabase.co"
  VITE_SUPABASE_URL_BEEYIELD: "https://ezfccfypwmuvbpujkqrg.supabase.co"
  VITE_STRIPE_PUBLISHABLE_KEY: "pk_live_production_key"
  VITE_SUPER_ADMIN_EMAIL: "admin@beeyield.com"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: beeyield-staging
data:
  DATABASE_HOST: "beeyield-postgres"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "beeyield_staging"
  REDIS_HOST: "beeyield-redis"
  REDIS_PORT: "6379"
  LOG_LEVEL: "DEBUG"
  ENVIRONMENT: "staging"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: beeyield-prod
data:
  DATABASE_HOST: "beeyield-postgres"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "beeyield_prod"
  REDIS_HOST: "beeyield-redis"
  REDIS_PORT: "6379"
  LOG_LEVEL: "INFO"
  ENVIRONMENT: "production"
```

### Update Frontend Deployment with Environment Variables

**File: `k8s/frontend-deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beeyield-frontend
  namespace: beeyield-prod
  labels:
    app: beeyield-frontend
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: beeyield-frontend
  template:
    metadata:
      labels:
        app: beeyield-frontend
        tier: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/beeyield-frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          name: http
        env:
        # ConfigMap values (public)
        - name: VITE_API_URL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: VITE_API_URL
        - name: VITE_SUPABASE_URL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: VITE_SUPABASE_URL
        - name: VITE_SUPABASE_URL_BEEYIELD
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: VITE_SUPABASE_URL_BEEYIELD
        - name: VITE_STRIPE_PUBLISHABLE_KEY
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: VITE_STRIPE_PUBLISHABLE_KEY
        - name: VITE_SUPER_ADMIN_EMAIL
          valueFrom:
            configMapKeyRef:
              name: frontend-config
              key: VITE_SUPER_ADMIN_EMAIL
        # Secret values (sensitive)
        - name: VITE_SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: beeyield-secrets
              key: SUPABASE_KEY
        - name: VITE_SUPABASE_ANON_KEY_BEEYIELD
          valueFrom:
            secretKeyRef:
              name: beeyield-secrets
              key: VITE_SUPABASE_ANON_KEY_BEEYIELD
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 5
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: beeyield-frontend
  namespace: beeyield-prod
  labels:
    app: beeyield-frontend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
  selector:
    app: beeyield-frontend
```

### Update Backend Deployment with Environment Variables

**File: `k8s/backend-deployment.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: beeyield-backend
  namespace: beeyield-prod
  labels:
    app: beeyield-backend
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: beeyield-backend
  template:
    metadata:
      labels:
        app: beeyield-backend
        tier: backend
    spec:
      initContainers:
      - name: wait-for-db
        image: postgres:16-alpine
        command: ['sh', '-c', 'until pg_isready -h beeyield-postgres -p 5432; do echo waiting for database; sleep 2; done;']
      containers:
      - name: backend
        image: your-registry/beeyield-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        env:
        # ConfigMap values
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: DATABASE_HOST
        - name: DATABASE_PORT
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: DATABASE_PORT
        - name: DATABASE_NAME
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: DATABASE_NAME
        - name: REDIS_HOST
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: REDIS_HOST
        - name: REDIS_PORT
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: REDIS_PORT
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: LOG_LEVEL
        - name: ENVIRONMENT
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: ENVIRONMENT
        # Secret values
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: beeyield-secrets
              key: DATABASE_URL
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: beeyield-secrets
              key: SUPABASE_URL
        - name: SUPABASE_KEY
          valueFrom:
            secretKeyRef:
              name: beeyield-secrets
              key: SUPABASE_KEY
        - name: PYTHONUNBUFFERED
          value: "1"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 5
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: beeyield-backend
  namespace: beeyield-prod
  labels:
    app: beeyield-backend
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
    protocol: TCP
    name: http
  selector:
    app: beeyield-backend
```

### Deploy to Kubernetes

```bash
# Update ConfigMaps
kubectl apply -f k8s/configmaps.yaml

# Deploy frontend and backend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml

# Verify deployments
kubectl get deployments -n beeyield-prod
kubectl get pods -n beeyield-prod
kubectl get secrets -n beeyield-prod

# View logs
kubectl logs -n beeyield-prod -l app=beeyield-frontend -f
```

---

## 4. VERCEL DEPLOYMENT

### Set Environment Variables in Vercel Dashboard

1. Go to your project settings → Environment Variables
2. Add the following for **Production**:

```
VITE_SUPABASE_URL = https://prod-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY = prod-anon-key-here
VITE_SUPABASE_URL_BEEYIELD = https://ezfccfypwmuvbpujkqrg.supabase.co
VITE_SUPABASE_ANON_KEY_BEEYIELD = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI
VITE_SUPABASE_URL_CEBA = https://ceba-prod-ref.supabase.co
VITE_SUPABASE_ANON_KEY_CEBA = ceba-prod-anon-key
VITE_API_URL = https://api.beeyield.com
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_production_key
VITE_SUPER_ADMIN_EMAIL = admin@beeyield.com
```

3. Add the same for **Preview** (staging) with staging values
4. For **Development**, use local `.env` file (not uploaded to Vercel)

---

## 5. RENDER.COM DEPLOYMENT

### Update `render.yaml`

```yaml
services:
  # Backend
  - type: web
    name: beeyield-api
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromService:
          type: pserv
          name: beeyield-postgres
          property: connectionString
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false

  # Frontend
  - type: web
    name: beeyield-web
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run preview
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        fromService:
          type: web
          name: beeyield-api
          property: host
      - key: VITE_SUPABASE_URL
        sync: false
      - key: VITE_SUPABASE_ANON_KEY
        sync: false

  # Database
  - type: pserv
    name: beeyield-postgres
    env: postgres
    plan: starter
    ipAllowList: []
    envVars:
      - key: POSTGRES_DB
        value: beeyield
      - key: POSTGRES_USER
        value: postgres
      - key: POSTGRES_PASSWORD
        sync: false
```

Then set environment variables in Render dashboard under Service → Environment:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_ANON_KEY_BEEYIELD`
- `POSTGRES_PASSWORD`

---

## 6. VERIFICATION CHECKLIST

Before deploying, verify:

### Environment Variables
- [ ] All `VITE_*` variables are correctly set for the target environment
- [ ] Supabase URLs and keys are for the correct project
- [ ] API URLs point to the correct backend environment
- [ ] Database credentials are correct and secure

### Security
- [ ] `.env` files are in `.gitignore`
- [ ] No secrets are committed to Git
- [ ] Kubernetes Secrets are created before deployment
- [ ] Docker Compose uses `env_file` or `--env-file` flag
- [ ] Vercel environment variables are set for each environment

### Testing
- [ ] Auth callbacks work correctly (`/auth/callback`)
- [ ] API requests route to the correct backend
- [ ] Supabase connectivity is verified
- [ ] Frontend can reach backend at configured `VITE_API_URL`

### Deployment
- [ ] Frontend builds successfully with all variables baked in
- [ ] Backend receives correct database URL
- [ ] Services can communicate with each other

---

## 7. TROUBLESHOOTING

### Frontend shows "Cannot connect to Supabase"
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set during build
- Check browser console for actual error
- Verify Supabase project is running

### Backend cannot reach database
- Check `DATABASE_URL` format is correct
- Verify PostgreSQL service is running
- Check network connectivity between services

### Auth callbacks fail
- Ensure `VITE_API_URL` is accessible from browser
- Check CORS headers in nginx configuration
- Verify redirect URL is whitelisted in Supabase

### Docker Compose services don't see environment variables
- Use `docker compose --env-file .env.staging up`
- Don't set `VITE_*` variables in `environment:` section for frontend (use `args:` in build)

### Kubernetes pods can't access secrets
- Verify Secret exists: `kubectl get secrets -n beeyield-prod`
- Check pod events: `kubectl describe pod <pod-name> -n beeyield-prod`
- Verify secret keys match env variable names

---

## 8. ENVIRONMENT VARIABLES REFERENCE

| Variable | Purpose | Where Set | Example |
|----------|---------|-----------|---------|
| `VITE_SUPABASE_URL` | Main Supabase project URL | Docker args, K8s ConfigMap | `https://project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Main Supabase anon key | Docker args, K8s Secret | JWT token |
| `VITE_SUPABASE_URL_BEEYIELD` | BeeYield backend Supabase URL | Docker args, K8s ConfigMap | `https://beeyield-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY_BEEYIELD` | BeeYield backend anon key | Docker args, K8s Secret | JWT token |
| `VITE_API_URL` | Backend API endpoint | Docker args, K8s ConfigMap | `https://api.beeyield.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Docker args, K8s ConfigMap | `pk_live_*` |
| `VITE_SUPER_ADMIN_EMAIL` | Super admin email | Docker args, K8s ConfigMap | `admin@beeyield.com` |
| `DATABASE_URL` | PostgreSQL connection | K8s Secret, .env | `postgresql://user:pass@host:5432/db` |
| `SUPABASE_URL` | Backend Supabase URL | K8s Secret, .env | `https://project.supabase.co` |
| `SUPABASE_KEY` | Backend Supabase key | K8s Secret, .env | JWT token |

---

## Quick Start Commands

```bash
# Local development
cp .env.example .env
# Edit .env with your values
docker compose -f docker-compose.dev.yml --env-file .env up --build

# Staging (Docker Compose)
docker compose --env-file .env.staging -p beeyield-staging up -d

# Production (Docker Compose)
docker compose --env-file .env.production -p beeyield-prod up -d

# Kubernetes staging
kubectl apply -f k8s/configmaps.yaml -n beeyield-staging
kubectl apply -f k8s/frontend-deployment.yaml -n beeyield-staging

# Kubernetes production
kubectl apply -f k8s/configmaps.yaml -n beeyield-prod
kubectl apply -f k8s/frontend-deployment.yaml -n beeyield-prod
```
