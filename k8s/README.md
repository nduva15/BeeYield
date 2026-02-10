# BeeYield Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the BeeYield application to a Kubernetes cluster.

## Architecture

The deployment consists of:

- **Frontend**: React/Vite application served by Nginx (3 replicas)
- **Backend**: FastAPI Python application (2 replicas)
- **PostgreSQL**: Database (1 replica with persistent storage)
- **Redis**: Cache layer (1 replica with persistent storage)
- **Ingress**: Routes external traffic to frontend and backend services

## Prerequisites

1. **Kubernetes Cluster**: A running Kubernetes cluster (v1.24+)
   - Local: Minikube, Kind, Docker Desktop
   - Cloud: EKS, GKE, AKS, or any managed Kubernetes

2. **kubectl**: Kubernetes CLI tool installed and configured
   ```bash
   kubectl version --client
   ```

3. **Ingress Controller**: NGINX Ingress Controller (or similar)
   ```bash
   # For NGINX Ingress Controller
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   ```

4. **Container Registry**: Docker images built and pushed to a registry
   - Docker Hub, Google Container Registry, AWS ECR, etc.

## Configuration

### 1. Update Secrets

Edit `k8s/secrets.yaml` and replace the following values:

```yaml
POSTGRES_PASSWORD: "your-secure-password"
DATABASE_URL: "postgresql://postgres:your-secure-password@beeyield-postgres:5432/beeyield"
VITE_SUPABASE_URL: "https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY: "your-supabase-anon-key"
SUPABASE_URL: "https://your-project.supabase.co"
SUPABASE_KEY: "your-supabase-anon-key"
```

**Security Note**: For production, use Kubernetes secrets management tools like:
- Sealed Secrets
- External Secrets Operator
- HashiCorp Vault
- Cloud provider secret managers (AWS Secrets Manager, GCP Secret Manager, Azure Key Vault)

### 2. Update Ingress Domains

Edit `k8s/ingress.yaml` and replace:
```yaml
- host: beeyield.example.com      # Your frontend domain
- host: api.beeyield.example.com  # Your API domain
```

### 3. Update Image Registry

Edit `k8s/kustomization.yaml` and update the image registry:
```yaml
images:
  - name: beeyield-frontend
    newName: your-registry.io/beeyield-frontend
    newTag: v1.0.0
  - name: beeyield-backend
    newName: your-registry.io/beeyield-backend
    newTag: v1.0.0
```

### 4. Storage Class

Check your cluster's available storage classes:
```bash
kubectl get storageclass
```

Update `k8s/postgres-pvc.yaml` and `k8s/redis-pvc.yaml` if needed:
```yaml
storageClassName: standard  # Replace with your storage class
```

## Building and Pushing Docker Images

### Frontend Image
```bash
cd /path/to/beeyield
docker build -t your-registry.io/beeyield-frontend:v1.0.0 \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-key \
  --build-arg VITE_API_URL=https://api.beeyield.example.com \
  -f Dockerfile .
docker push your-registry.io/beeyield-frontend:v1.0.0
```

### Backend Image
```bash
cd /path/to/beeyield/backend
docker build -t your-registry.io/beeyield-backend:v1.0.0 \
  -f Dockerfile .
docker push your-registry.io/beeyield-backend:v1.0.0
```

## Deployment Methods

### Method 1: Using Kustomize (Recommended)

Deploy all resources at once:
```bash
kubectl apply -k k8s/
```

Verify deployment:
```bash
kubectl get all -n beeyield
```

### Method 2: Using kubectl apply

Deploy resources in order:
```bash
# Create namespace and config
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Create persistent volumes
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/redis-pvc.yaml

# Deploy databases
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=beeyield-postgres -n beeyield --timeout=120s
kubectl wait --for=condition=ready pod -l app=beeyield-redis -n beeyield --timeout=120s

# Deploy applications
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress and autoscaling
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

## Verification

### Check Pod Status
```bash
kubectl get pods -n beeyield
```

Expected output:
```
NAME                                  READY   STATUS    RESTARTS   AGE
beeyield-backend-xxx-yyy              1/1     Running   0          2m
beeyield-backend-xxx-zzz              1/1     Running   0          2m
beeyield-frontend-xxx-aaa             1/1     Running   0          2m
beeyield-frontend-xxx-bbb             1/1     Running   0          2m
beeyield-frontend-xxx-ccc             1/1     Running   0          2m
beeyield-postgres-xxx-ddd             1/1     Running   0          3m
beeyield-redis-xxx-eee                1/1     Running   0          3m
```

### Check Services
```bash
kubectl get svc -n beeyield
```

### Check Ingress
```bash
kubectl get ingress -n beeyield
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/beeyield-backend -n beeyield

# Frontend logs
kubectl logs -f deployment/beeyield-frontend -n beeyield

# Database logs
kubectl logs -f deployment/beeyield-postgres -n beeyield
```

### Test Connectivity

Port forward for local testing:
```bash
# Test frontend
kubectl port-forward -n beeyield svc/beeyield-frontend 8080:80

# Test backend
kubectl port-forward -n beeyield svc/beeyield-backend 8000:8000

# Test database
kubectl port-forward -n beeyield svc/beeyield-postgres 5432:5432
```

Then access:
- Frontend: http://localhost:8080
- Backend: http://localhost:8000
- Database: localhost:5432

## Scaling

### Manual Scaling
```bash
# Scale frontend
kubectl scale deployment beeyield-frontend --replicas=5 -n beeyield

# Scale backend
kubectl scale deployment beeyield-backend --replicas=4 -n beeyield
```

### Autoscaling

Horizontal Pod Autoscalers (HPA) are configured in `k8s/hpa.yaml`:
- Frontend: 3-10 replicas based on CPU/memory usage
- Backend: 2-8 replicas based on CPU/memory usage

View HPA status:
```bash
kubectl get hpa -n beeyield
```

## Database Migrations

Run migrations manually:
```bash
# Connect to backend pod
kubectl exec -it deployment/beeyield-backend -n beeyield -- /bin/bash

# Run migrations (adjust command based on your migration tool)
python migrate_db.py
```

Or create a Kubernetes Job:
```bash
kubectl create job --from=cronjob/db-migration db-migration-manual -n beeyield
```

## Backup and Restore

### PostgreSQL Backup
```bash
# Backup
kubectl exec -n beeyield deployment/beeyield-postgres -- \
  pg_dump -U postgres beeyield > backup.sql

# Restore
kubectl exec -i -n beeyield deployment/beeyield-postgres -- \
  psql -U postgres beeyield < backup.sql
```

### Redis Backup
```bash
# Trigger save
kubectl exec -n beeyield deployment/beeyield-redis -- redis-cli SAVE

# Copy backup file
kubectl cp beeyield/beeyield-redis-xxx:/data/dump.rdb ./redis-backup.rdb
```

## Monitoring

### Resource Usage
```bash
# Top pods
kubectl top pods -n beeyield

# Top nodes
kubectl top nodes
```

### Events
```bash
kubectl get events -n beeyield --sort-by='.lastTimestamp'
```

## Troubleshooting

### Pods Not Starting
```bash
# Describe pod
kubectl describe pod <pod-name> -n beeyield

# Check events
kubectl get events -n beeyield

# Check logs
kubectl logs <pod-name> -n beeyield
```

### Image Pull Errors
```bash
# Check if image exists in registry
# Verify imagePullSecrets if using private registry

# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=your-registry.io \
  --docker-username=your-username \
  --docker-password=your-password \
  -n beeyield

# Add to deployment spec
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
```

### Database Connection Issues
```bash
# Check database is running
kubectl get pods -l app=beeyield-postgres -n beeyield

# Test connection from backend pod
kubectl exec -it deployment/beeyield-backend -n beeyield -- \
  python -c "import psycopg2; psycopg2.connect('postgresql://postgres:password@beeyield-postgres:5432/beeyield')"
```

## Cleanup

### Delete All Resources
```bash
# Using kustomize
kubectl delete -k k8s/

# Or delete namespace (deletes everything)
kubectl delete namespace beeyield
```

### Keep Data, Delete Applications
```bash
kubectl delete deployment --all -n beeyield
kubectl delete service beeyield-frontend beeyield-backend -n beeyield
kubectl delete ingress beeyield-ingress -n beeyield
```

## Production Considerations

1. **Security**
   - Use network policies to restrict pod communication
   - Enable Pod Security Standards
   - Use non-root containers
   - Scan images for vulnerabilities
   - Rotate secrets regularly

2. **High Availability**
   - Run multiple replicas of stateless services
   - Use pod anti-affinity rules
   - Deploy across multiple availability zones
   - Consider database replication

3. **Monitoring**
   - Set up Prometheus and Grafana
   - Configure alerts for critical metrics
   - Use centralized logging (ELK, Loki)

4. **Backup**
   - Automate database backups
   - Test restore procedures regularly
   - Use volume snapshots

5. **TLS/SSL**
   - Enable TLS in ingress
   - Use cert-manager for automatic certificate management
   - Force HTTPS redirects

6. **Resource Limits**
   - Set appropriate resource requests and limits
   - Monitor actual usage and adjust
   - Use Quality of Service (QoS) classes

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Kustomize Documentation](https://kustomize.io/)
- [cert-manager](https://cert-manager.io/)
