# BeeYield Deployment Pipeline

Complete CI/CD and deployment infrastructure for the BeeYield application.

## Overview

This deployment pipeline includes:

- **GitHub Actions Workflows**: Automated CI/CD with testing, building, and deployment
- **Kubernetes Manifests**: Production-ready Kubernetes configurations with blue-green deployment
- **Terraform Infrastructure**: Complete AWS infrastructure as code
- **Deployment Scripts**: Bash scripts for common operations

## Architecture

### Environments

- **Development**: Auto-deploys from `develop` branch
- **Staging**: Auto-deploys from `staging` branch  
- **Production**: Auto-deploys from `main` branch (with manual approval)

### Components

1. **Frontend**: React/Vite app served via NGINX
2. **Backend**: Python FastAPI application
3. **Database**: PostgreSQL (AWS RDS in production)
4. **Cache**: Redis (AWS ElastiCache in production)

## Quick Start

### Prerequisites

- AWS CLI configured
- kubectl installed
- Terraform >= 1.6
- Helm 3
- Docker

### 1. Setup Infrastructure

```bash
cd scripts
chmod +x *.sh
./setup-infrastructure.sh production
```

This will:
- Create AWS infrastructure (VPC, EKS, RDS, ElastiCache, etc.)
- Configure kubectl
- Install necessary Kubernetes addons

### 2. Configure Secrets

Update the following files with your actual values:

```bash
# Edit Kubernetes secrets
nano k8s/secrets.yaml

# Generate base64 encoded secrets:
echo -n "your-secret" | base64
```

Required secrets:
- `VITE_SUPABASE_ANON_KEY`
- `DATABASE_PASSWORD`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`

### 3. Deploy Application

```bash
./deploy.sh production latest
```

## GitHub Actions Workflows

### Main Pipeline (`.github/workflows/main-pipeline.yml`)

Comprehensive CI/CD pipeline with 5 stages:

1. **Code Quality**: Type checking, linting for frontend and backend
2. **Testing**: Unit tests, integration tests with test databases
3. **Security**: Trivy scans, dependency review
4. **Build**: Docker image builds and pushes to GHCR
5. **Deploy**: Environment-specific deployments with health checks

### Rollback Workflow (`.github/workflows/rollback.yml`)

Emergency rollback to any previous version:

```bash
# Via GitHub UI: Actions -> Rollback -> Run workflow
# Select environment and version
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL
KUBE_CONFIG_DEV (base64 encoded)
KUBE_CONFIG_STAGING (base64 encoded)
KUBE_CONFIG_PROD (base64 encoded)
SLACK_WEBHOOK
CODECOV_TOKEN
```

## Kubernetes Deployment

### Blue-Green Deployment

The setup uses blue-green deployment for zero-downtime releases:

```bash
# Deploy to green environment
kubectl set image deployment/frontend-green frontend=image:new-version

# Switch traffic to green
kubectl patch service frontend-service -p '{"spec":{"selector":{"version":"green"}}}'
```

### Auto-scaling

HPA configured for both frontend and backend:
- Min replicas: 3
- Max replicas: 10 (frontend) / 15 (backend)
- CPU threshold: 70%
- Memory threshold: 80%

### Monitoring

```bash
# Check system status
./monitor.sh production

# View logs
kubectl logs -f deployment/backend -n beeyield-prod

# Check metrics
kubectl top pods -n beeyield-prod
```

## Terraform Infrastructure

### Resources Created

- **VPC**: Multi-AZ with public/private/database subnets
- **EKS**: Managed Kubernetes cluster
- **RDS**: PostgreSQL with automated backups
- **ElastiCache**: Redis cluster
- **S3**: Asset storage and backups
- **CloudFront**: CDN for frontend
- **ACM**: SSL certificates
- **ECR**: Docker image registry

### Terraform Commands

```bash
cd terraform

# Initialize
terraform init

# Plan changes
terraform plan -var="environment=production"

# Apply changes
terraform apply -var="environment=production"

# Destroy (caution!)
terraform destroy -var="environment=production"
```

### Cost Estimation

Approximate monthly costs (production):
- EKS Cluster: $72
- EC2 Nodes (3x t3.large): ~$150
- RDS (db.t3.large): ~$180
- ElastiCache: ~$50
- Data Transfer: ~$50
- **Total**: ~$500/month

## Operational Scripts

### Deploy Application

```bash
./deploy.sh [environment] [version]
./deploy.sh production v1.2.3
```

### Rollback

```bash
./rollback.sh [environment] [version]
./rollback.sh production v1.2.2
```

### Database Operations

```bash
# Backup
./backup-database.sh production

# Restore
./restore-database.sh production backup-20260209-120000.sql.gz
```

### Monitoring

```bash
./monitor.sh production
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations tested
- [ ] Environment variables updated
- [ ] Backup created
- [ ] Team notified

### Post-Deployment

- [ ] Health checks passing
- [ ] Monitoring dashboards reviewed
- [ ] Error rates within threshold
- [ ] Performance metrics acceptable
- [ ] Smoke tests completed
- [ ] Team notified of success

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n beeyield-prod

# Check logs
kubectl logs <pod-name> -n beeyield-prod

# Check events
kubectl get events -n beeyield-prod --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test database connectivity from pod
kubectl exec -it <backend-pod> -n beeyield-prod -- bash
psql -h postgres-service -U postgres -d beeyield
```

### High Resource Usage

```bash
# Check resource usage
kubectl top pods -n beeyield-prod
kubectl top nodes

# Scale deployment
kubectl scale deployment/backend --replicas=5 -n beeyield-prod
```

### SSL Certificate Issues

```bash
# Check certificate status
kubectl describe certificate beeyield-tls -n beeyield-prod

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

## Security Best Practices

1. **Secrets Management**: Use AWS Secrets Manager or HashiCorp Vault
2. **Network Policies**: Implement Kubernetes network policies
3. **RBAC**: Configure role-based access control
4. **Image Scanning**: Trivy scans on every build
5. **SSL/TLS**: All traffic encrypted with cert-manager
6. **Backups**: Daily automated backups with retention

## Monitoring and Alerts

### Metrics to Monitor

- Pod health and restarts
- CPU and memory usage
- Request latency
- Error rates
- Database connections
- Cache hit rates

### Recommended Tools

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **AlertManager**: Alert routing
- **Datadog/New Relic**: APM (optional)

## Disaster Recovery

### Backup Strategy

- **Database**: Daily automated backups (30-day retention)
- **Application State**: Kubernetes manifests in Git
- **Infrastructure**: Terraform state in S3

### Recovery Process

1. Restore infrastructure from Terraform
2. Restore database from most recent backup
3. Deploy application from last known good version
4. Verify functionality
5. Switch DNS if needed

## Support

For issues or questions:
- Check troubleshooting guide above
- Review GitHub Actions logs
- Check Kubernetes events and logs
- Contact DevOps team

## License

Proprietary - BeeYield Platform
