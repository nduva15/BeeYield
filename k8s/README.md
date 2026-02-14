# BeeYield Kubernetes Deployment Guide

## Architecture Overview

```
                         ┌─────────────┐
                         │   Ingress   │
                         └──────┬──────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
            ┌───────▼──────┐       ┌───────▼──────┐
            │   Frontend   │       │   Backend    │
            │  (3 replicas)│       │  (2 replicas)│
            └──────────────┘       └───────┬──────┘
                                           │
                            ┌──────────────┴──────────────┐
                            │                             │
                     ┌──────▼──────┐            ┌────────▼──────┐
                     │  PostgreSQL │            │     Redis     │
                     │  (1 replica)│            │  (1 replica)  │
                     └─────────────┘            └───────────────┘
```

## Prerequisites

- Kubernetes 1.24+ cluster (KIND included with Docker Desktop)
- Docker running and configured
- kubectl CLI installed
- Docker images built and available

## Quick Start

### 1. Create Namespaces

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Create Secrets & ConfigMaps

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
```

Update `k8s/secrets.yaml` with your actual values:
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_KEY`: Your Supabase anonymous key
- `DATABASE_URL`: PostgreSQL connection string

### 3. Create Persistent Volumes

```bash
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/redis-pvc.yaml
```

### 4. Deploy Databases

```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
```

Wait for database pods to be ready:
```bash
kubectl wait --for=condition=ready pod -l app=beeyield-postgres -n beeyield --timeout=300s
kubectl wait --for=condition=ready pod -l app=beeyield-redis -n beeyield --timeout=300s
```

### 5. Deploy Application

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/services.yaml
```

### 6. Set Up Ingress

```bash
kubectl apply -f k8s/ingress.yaml
```

Update domain names in `k8s/ingress.yaml` before applying:
- `beeyield.example.com` → your frontend domain
- `api.beeyield.example.com` → your API domain

### 7. Enable Auto-Scaling (Optional)

```bash
# First, ensure metrics-server is running
kubectl get deployment metrics-server -n kube-system

# Apply HPA
kubectl apply -f k8s/hpa.yaml
```

## Verification

Check all resources:
```bash
# Check namespaces
kubectl get namespace

# Check deployments
kubectl get deployments -n beeyield

# Check pods
kubectl get pods -n beeyield

# Check services
kubectl get services -n beeyield

# Check HPA status
kubectl get hpa -n beeyield

# Check ingress
kubectl get ingress -n beeyield
```

View logs:
```bash
# Frontend logs
kubectl logs -f deployment/beeyield-frontend -n beeyield

# Backend logs
kubectl logs -f deployment/beeyield-backend -n beeyield

# PostgreSQL logs
kubectl logs -f deployment/beeyield-postgres -n beeyield
```

## Docker to Kubernetes Image Publishing

### Build & Tag Images

```bash
# Build frontend
docker build -t beeyield-frontend:latest .
docker tag beeyield-frontend:latest your-registry/beeyield-frontend:latest

# Build backend
docker build -t beeyield-backend:latest ./backend
docker tag beeyield-backend:latest your-registry/beeyield-backend:latest
```

### Push to Registry

```bash
docker push your-registry/beeyield-frontend:latest
docker push your-registry/beeyield-backend:latest
```

### Update Deployments

Edit `k8s/frontend-deployment.yaml` and `k8s/backend-deployment.yaml`:
```yaml
image: your-registry/beeyield-frontend:latest  # Update this
imagePullPolicy: Always
```

Then apply:
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod for events
kubectl describe pod <pod-name> -n beeyield

# Check logs
kubectl logs <pod-name> -n beeyield

# Check events
kubectl get events -n beeyield --sort-by='.lastTimestamp'
```

### CrashLoopBackOff

```bash
# View detailed logs
kubectl logs <pod-name> -n beeyield --previous

# Check resource limits
kubectl describe pod <pod-name> -n beeyield
```

### Connection Issues

```bash
# Test PostgreSQL connectivity
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -- \
  psql -h beeyield-postgres -U postgres -c "SELECT 1"

# Test Redis connectivity
kubectl run -it --rm debug --image=redis:7-alpine --restart=Never -- \
  redis-cli -h beeyield-redis ping
```

## Resource Limits

Current resource requests/limits:

**Frontend**: 
- Request: 100m CPU, 128Mi memory
- Limit: 200m CPU, 256Mi memory

**Backend**:
- Request: 250m CPU, 256Mi memory
- Limit: 500m CPU, 512Mi memory

**PostgreSQL**:
- Request: 250m CPU, 256Mi memory
- Limit: 500m CPU, 512Mi memory

**Redis**:
- Request: 100m CPU, 128Mi memory
- Limit: 200m CPU, 256Mi memory

Adjust in deployment manifests as needed for your workload.

## Production Checklist

- [ ] Update image registry and tags
- [ ] Set production secrets (database passwords, API keys)
- [ ] Configure domain names in Ingress
- [ ] Enable TLS/SSL in Ingress
- [ ] Install metrics-server for HPA
- [ ] Configure backup strategy for PostgreSQL
- [ ] Set resource limits appropriately
- [ ] Enable network policies
- [ ] Configure pod disruption budgets
- [ ] Set up monitoring and logging

## Deploy Everything at Once

```bash
kubectl apply -f k8s/ --recursive
```

Or use Kustomize:
```bash
kubectl apply -k k8s/
```
