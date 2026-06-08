# BeeYield Deployment Checklist

Use this checklist before deploying to staging or production.

## Pre-Deployment (All Environments)

### Source Code & Build
- [ ] All changes committed to Git
- [ ] Latest dependencies installed (`pnpm install`)
- [ ] Code linted successfully (`pnpm lint`)
- [ ] TypeScript compilation successful (`pnpm type-check`)
- [ ] No console errors or warnings in build output
- [ ] Docker build succeeds locally

### Environment Variables
- [ ] `.env` files are in `.gitignore`
- [ ] All `VITE_*` variables are defined
- [ ] No hardcoded URLs or keys in source code
- [ ] Verified correct URLs for target environment:
  - [ ] `VITE_SUPABASE_URL` points to correct Supabase project
  - [ ] `VITE_SUPABASE_URL_BEEYIELD` points to correct BeeYield backend
  - [ ] `VITE_SUPABASE_URL_CEBA` points to correct CEBA backend
  - [ ] `VITE_API_URL` points to correct backend API
- [ ] Stripe keys are for the correct environment (test vs live)

### Backend Services
- [ ] PostgreSQL service is running and accessible
- [ ] Redis service is running and accessible
- [ ] Backend API is responding to health checks
- [ ] Backend can connect to all required databases
- [ ] Migration scripts are ready (if needed)

### Security
- [ ] No secrets in Git history
- [ ] All credentials are stored securely (not in code)
- [ ] Database passwords are strong (>16 chars, mixed case, numbers, symbols)
- [ ] API keys are rotated if needed
- [ ] Supabase credentials are for the correct project
- [ ] SSL certificates are valid (if applicable)

---

## Staging Deployment

### Pre-Deployment Staging Checklist
- [ ] Staging URLs configured correctly
- [ ] Staging Supabase project selected
- [ ] Staging database credentials set
- [ ] Test Stripe key (pk_test_*) configured
- [ ] Staging admin email verified

### Docker Compose Staging Deployment
```bash
# 1. Prepare environment
cp .env.production .env.staging
# Edit .env.staging with staging values

# 2. Pull latest images
docker compose --env-file .env.staging -p beeyield-staging pull

# 3. Build and start services
docker compose --env-file .env.staging -p beeyield-staging up -d

# 4. Verify services are running
docker compose -p beeyield-staging ps

# 5. Check logs for errors
docker compose -p beeyield-staging logs -f
```

### Kubernetes Staging Deployment
```bash
# 1. Create/update ConfigMaps
kubectl apply -f k8s/configmaps.yaml -n beeyield-staging

# 2. Create secrets if not already exist
kubectl create namespace beeyield-staging 2>/dev/null || true
kubectl create secret generic beeyield-secrets --namespace=beeyield-staging \
  --from-literal=SUPABASE_URL='https://staging-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='staging-key' \
  # ... other secrets

# 3. Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml -n beeyield-staging

# 4. Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n beeyield-staging

# 5. Monitor deployment
kubectl rollout status deployment/beeyield-frontend -n beeyield-staging
kubectl rollout status deployment/beeyield-backend -n beeyield-staging

# 6. Check pod status
kubectl get pods -n beeyield-staging
```

### Post-Staging Deployment Verification
- [ ] Frontend is accessible at staging URL
- [ ] Page loads without errors (check browser console)
- [ ] Auth login works and redirects correctly
- [ ] API calls to backend succeed
- [ ] Database queries return data
- [ ] All environment variables are correctly injected
- [ ] No console errors in browser DevTools
- [ ] Images and assets load correctly
- [ ] Responsive design works on mobile
- [ ] Forms submission works
- [ ] Supabase authentication is functional
- [ ] Admin dashboard is accessible

### Staging Smoke Tests
```bash
# Test frontend
curl -I https://staging.beeyield.com/

# Test backend health
curl https://api-staging.beeyield.com/health

# Test Supabase connectivity (from frontend console)
# In browser console:
# supabase.auth.getUser()  // Should work

# Test database connectivity (if backend exposes endpoint)
curl https://api-staging.beeyield.com/api/status
```

---

## Production Deployment

### Pre-Production Checklist
- [ ] All staging tests passed
- [ ] Product owner approved the release
- [ ] Change log is documented
- [ ] Rollback plan is in place
- [ ] On-call team is notified
- [ ] Monitoring and alerts are configured
- [ ] Backup of production database exists

### Production Environment Variables
- [ ] Production Supabase project configured
- [ ] Production database credentials set
- [ ] Live Stripe key (pk_live_*) configured
- [ ] Production API URL configured
- [ ] Production admin email verified
- [ ] Analytics tracking enabled (if applicable)
- [ ] Error tracking configured (Sentry)

### Docker Compose Production Deployment

**Preparation:**
```bash
# 1. Backup current production data
docker compose -p beeyield-prod exec postgres pg_dump -U postgres beeyield_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Prepare environment
cp .env.production .env.prod.live
# ⚠️ NEVER commit this file - keep in secure location only
```

**Deployment:**
```bash
# 1. Pull latest images with digest (ensures consistency)
docker compose --env-file .env.prod.live -p beeyield-prod pull

# 2. Deploy with zero-downtime (if possible)
# Option A: Rolling restart
docker compose --env-file .env.prod.live -p beeyield-prod up -d

# Option B: Blue-green deployment
docker compose --env-file .env.prod.live -p beeyield-prod-new up -d
# Verify new deployment works
# Then switch traffic and tear down old
docker compose -p beeyield-prod down

# 3. Verify deployment
docker compose -p beeyield-prod ps
docker compose -p beeyield-prod logs

# 4. Monitor error rate
# Check logs for 5xx errors
docker compose -p beeyield-prod logs --tail=100 | grep -i error
```

### Kubernetes Production Deployment

**Preparation:**
```bash
# 1. Backup database
kubectl exec -n beeyield-prod beeyield-postgres-0 -- pg_dump -U postgres beeyield_prod > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# 2. Get current deployment status
kubectl get deployments -n beeyield-prod
kubectl get pods -n beeyield-prod
```

**Deployment:**
```bash
# 1. Update secrets if credentials changed
kubectl delete secret beeyield-secrets -n beeyield-prod
kubectl create secret generic beeyield-secrets --namespace=beeyield-prod \
  --from-literal=DATABASE_URL='...' \
  --from-literal=SUPABASE_KEY='...' \
  # ... other secrets

# 2. Apply ConfigMaps
kubectl apply -f k8s/configmaps.yaml -n beeyield-prod

# 3. Deploy frontend (gradual rollout)
kubectl apply -f k8s/frontend-deployment.yaml -n beeyield-prod

# 4. Monitor frontend rollout
kubectl rollout status deployment/beeyield-frontend -n beeyield-prod

# 5. Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n beeyield-prod

# 6. Monitor backend rollout
kubectl rollout status deployment/beeyield-backend -n beeyield-prod

# 7. Verify all pods are running
kubectl get pods -n beeyield-prod
kubectl get pods -n beeyield-prod -o wide
```

### Post-Production Deployment Verification

**Immediate (within 1 minute):**
- [ ] Frontend is serving (curl https://beeyield.com/)
- [ ] Backend is responding (curl https://api.beeyield.com/health)
- [ ] No immediate 5xx errors in logs

**Within 5 minutes:**
- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] API calls are successful
- [ ] Database queries return data
- [ ] No spike in error rate
- [ ] No spike in response time

**Within 30 minutes:**
- [ ] User can login
- [ ] Auth redirects work correctly
- [ ] Protected pages require authentication
- [ ] Dashboard loads with data
- [ ] Admin panel is accessible
- [ ] All forms are functional
- [ ] File uploads work (if applicable)
- [ ] No database connection errors
- [ ] No memory leaks visible

**Within 1 hour (full smoke test):**
- [ ] User registration works
- [ ] User login/logout works
- [ ] Password reset works
- [ ] Email notifications send (if applicable)
- [ ] Payment processing works (test transaction)
- [ ] File downloads work
- [ ] Complex queries complete in reasonable time
- [ ] Rate limiting is working
- [ ] CORS headers are correct
- [ ] Security headers are present

**Monitoring:**
```bash
# Watch logs for errors
kubectl logs -f -n beeyield-prod -l app=beeyield-frontend --tail=50

# Check pod resource usage
kubectl top pod -n beeyield-prod

# Check database connections
kubectl exec -n beeyield-prod beeyield-postgres-0 -- psql -U postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Check Redis usage
kubectl exec -n beeyield-prod beeyield-redis-0 -- redis-cli info stats
```

---

## Rollback Procedure

If production deployment fails or causes issues:

### Docker Compose Rollback
```bash
# 1. Stop current deployment
docker compose -p beeyield-prod down

# 2. Start previous version
docker compose --env-file .env.prod.live -p beeyield-prod up -d

# 3. Restore database if needed
docker compose -p beeyield-prod exec postgres psql -U postgres < backup_YYYYMMDD_HHMMSS.sql

# 4. Verify
docker compose -p beeyield-prod ps
```

### Kubernetes Rollback
```bash
# 1. Check rollout history
kubectl rollout history deployment/beeyield-frontend -n beeyield-prod

# 2. Rollback to previous version
kubectl rollout undo deployment/beeyield-frontend -n beeyield-prod
kubectl rollout undo deployment/beeyield-backend -n beeyield-prod

# 3. Monitor rollback
kubectl rollout status deployment/beeyield-frontend -n beeyield-prod
kubectl rollout status deployment/beeyield-backend -n beeyield-prod

# 4. Restore database if needed
# Restore from backup
kubectl cp backup_prod.sql beeyield-prod/beeyield-postgres-0:/tmp/
kubectl exec -n beeyield-prod beeyield-postgres-0 -- psql -U postgres < /tmp/backup_prod.sql
```

---

## Post-Deployment Monitoring

### Key Metrics to Track
- [ ] Error rate (target: <0.1%)
- [ ] Response time (p95: <2s, p99: <5s)
- [ ] CPU usage (target: <70%)
- [ ] Memory usage (target: <80%)
- [ ] Database connections (monitor pool)
- [ ] Disk space (alert at 80%)
- [ ] Request count per minute
- [ ] Failed login attempts
- [ ] API latency by endpoint

### Set Up Alerts For
- [ ] Service downtime
- [ ] High error rate (>1%)
- [ ] Slow response times (>5s)
- [ ] Out of memory (>90%)
- [ ] CPU spike (>85% sustained)
- [ ] Database connection pool exhausted
- [ ] Disk space critical (<5% free)

### Daily Monitoring Tasks
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Monitor database size
- [ ] Check backup status
- [ ] Verify security logs

---

## Deployment Sign-Off

**Completed by:** ___________________________  
**Date:** ___________________________  
**Time:** ___________________________  

**Staging Sign-Off:**
- [ ] All staging tests passed
- [ ] Product owner approved

**Production Sign-Off:**
- [ ] Staging deployment verified
- [ ] Production deployment completed
- [ ] All smoke tests passed
- [ ] Monitoring confirmed
- [ ] Team notified
- [ ] On-call team briefed

**Notes:**
```
_________________________________________________________________

_________________________________________________________________

_________________________________________________________________
```

---

## Quick Reference Commands

### Docker Compose
```bash
# View running services
docker compose -p beeyield-prod ps

# View logs
docker compose -p beeyield-prod logs -f service_name

# Execute command in container
docker compose -p beeyield-prod exec backend bash

# Stop all services
docker compose -p beeyield-prod down

# Restart single service
docker compose -p beeyield-prod restart frontend
```

### Kubernetes
```bash
# Check deployment status
kubectl get deployments -n beeyield-prod

# View pod logs
kubectl logs -f pod_name -n beeyield-prod

# Execute command in pod
kubectl exec -it pod_name -n beeyield-prod -- bash

# Scale deployment
kubectl scale deployment beeyield-frontend --replicas=5 -n beeyield-prod

# Get resource usage
kubectl top nodes
kubectl top pods -n beeyield-prod
```
