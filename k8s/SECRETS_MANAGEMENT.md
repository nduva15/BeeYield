# BeeYield Kubernetes Secrets Management

This file documents how to create and manage Kubernetes Secrets for BeeYield deployments.

## ⚠️ CRITICAL SECURITY NOTES

- **NEVER commit secret values to Git**
- **NEVER store this file in version control**
- Use a secure secret management system:
  - HashiCorp Vault
  - AWS Secrets Manager / Parameter Store
  - Azure Key Vault
  - Google Secret Manager
  - Sealed Secrets (Kubernetes-native)

---

## Creating Production Secrets

### 1. Create namespace (if not exists)
```bash
kubectl create namespace beeyield-prod
```

### 2. Create main Supabase/Database secrets
```bash
kubectl create secret generic beeyield-secrets \
  --namespace=beeyield-prod \
  --from-literal=SUPABASE_URL='https://prod-project-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI' \
  --from-literal=VITE_SUPABASE_ANON_KEY='prod-anon-key-here' \
  --from-literal=VITE_SUPABASE_ANON_KEY_BEEYIELD='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmNjZnlwd211dmJwdWprcXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjAxNzgsImV4cCI6MjA4MzMzNjE3OH0.y2Y_J_Rd45UNQjCV-qx1HzCmCyU2ozjTKH7iP5-WSsI' \
  --from-literal=VITE_SUPABASE_ANON_KEY_CEBA='ceba-prod-anon-key' \
  --from-literal=DATABASE_URL='postgresql://produser:prodpass@beeyield-postgres:5432/beeyield_prod' \
  --from-literal=POSTGRES_PASSWORD='prodpass'
```

### 3. Create Stripe secrets (if needed)
```bash
kubectl create secret generic stripe-secrets \
  --namespace=beeyield-prod \
  --from-literal=STRIPE_SECRET_KEY='sk_live_production_key'
```

### 4. Verify secrets were created
```bash
kubectl get secrets -n beeyield-prod
kubectl describe secret beeyield-secrets -n beeyield-prod
```

---

## Creating Staging Secrets

### 1. Create namespace
```bash
kubectl create namespace beeyield-staging
```

### 2. Create secrets for staging
```bash
kubectl create secret generic beeyield-secrets \
  --namespace=beeyield-staging \
  --from-literal=SUPABASE_URL='https://staging-project-ref.supabase.co' \
  --from-literal=SUPABASE_KEY='staging-anon-key-here' \
  --from-literal=VITE_SUPABASE_ANON_KEY='staging-anon-key-here' \
  --from-literal=VITE_SUPABASE_ANON_KEY_BEEYIELD='beeyield-staging-anon-key' \
  --from-literal=VITE_SUPABASE_ANON_KEY_CEBA='ceba-staging-anon-key' \
  --from-literal=DATABASE_URL='postgresql://postgres:stagingpass@beeyield-postgres:5432/beeyield_staging' \
  --from-literal=POSTGRES_PASSWORD='stagingpass'
```

---

## Managing Secrets Over Time

### Viewing a Secret
```bash
# View secret (base64 encoded)
kubectl get secret beeyield-secrets -n beeyield-prod -o yaml

# Decode a specific value
kubectl get secret beeyield-secrets -n beeyield-prod -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Updating a Secret
```bash
# Delete and recreate
kubectl delete secret beeyield-secrets -n beeyield-prod
kubectl create secret generic beeyield-secrets \
  --namespace=beeyield-prod \
  --from-literal=DATABASE_URL='new-connection-string' \
  # ... other literals
```

### Using External Secret Management
For production, integrate with external secret managers:

**Using HashiCorp Vault (Kubernetes Auth):**
- Install Vault Agent Injector
- Pod annotations automatically inject secrets
- Recommended for enterprise deployments

**Using AWS Secrets Manager:**
- Use IRSA (IAM Roles for Service Accounts)
- External Secrets Operator to sync to K8s Secrets

**Using Sealed Secrets:**
- Encrypt secrets at rest in etcd
- Only decrypt in the cluster where sealed

---

## Secret Rotation Strategy

### Monthly Rotation
```bash
# 1. Generate new secret in Supabase/provider
# 2. Create new K8s secret with old name
# 3. Test deployments
# 4. Delete old secret
# 5. Redeploy pods to use new secret

# Redeploy frontend
kubectl rollout restart deployment/beeyield-frontend -n beeyield-prod

# Redeploy backend
kubectl rollout restart deployment/beeyield-backend -n beeyield-prod

# Monitor logs to confirm success
kubectl logs -l app=beeyield-frontend -n beeyield-prod -f
```

---

## Troubleshooting

### Pod can't read secret
```bash
# Check secret exists
kubectl get secrets -n beeyield-prod

# Check pod is referencing correct secret
kubectl get pod <pod-name> -n beeyield-prod -o yaml | grep -A5 secretKeyRef

# Describe pod for errors
kubectl describe pod <pod-name> -n beeyield-prod

# Check container logs
kubectl logs <pod-name> -n beeyield-prod
```

### Secret key not found in pod
```bash
# List all keys in secret
kubectl get secret beeyield-secrets -n beeyield-prod -o jsonpath='{.data}' | jq 'keys'

# Verify pod env expects correct key name
kubectl get pod <pod-name> -n beeyield-prod -o yaml | grep -A2 secretKeyRef
```

---

## Best Practices

✅ **DO:**
- Use Kubernetes Secrets for all sensitive data
- Rotate secrets regularly (monthly minimum)
- Use strong passwords (>16 chars, mixed case, numbers, symbols)
- Store rotation procedures in your runbook
- Audit access to secrets (use RBAC)
- Enable audit logging in Kubernetes

❌ **DON'T:**
- Store secrets in ConfigMaps
- Commit secrets to Git
- Share secrets via Slack/email
- Use same credentials across environments
- Log secret values
- Hardcode secrets in application code

---

## Template: Secret Values to Update

Save this in a secure location (password manager, vault, encrypted file):

```
PRODUCTION SECRETS:
SUPABASE_URL: https://prod-project-ref.supabase.co
SUPABASE_KEY: [PRODUCTION_SUPABASE_KEY]
DATABASE_URL: postgresql://produser:[PRODUCTION_DB_PASS]@beeyield-postgres:5432/beeyield_prod
POSTGRES_PASSWORD: [PRODUCTION_DB_PASS]
STRIPE_SECRET_KEY: sk_live_[PRODUCTION_STRIPE_KEY]

STAGING SECRETS:
SUPABASE_URL: https://staging-project-ref.supabase.co
SUPABASE_KEY: [STAGING_SUPABASE_KEY]
DATABASE_URL: postgresql://postgres:[STAGING_DB_PASS]@beeyield-postgres:5432/beeyield_staging
POSTGRES_PASSWORD: [STAGING_DB_PASS]
STRIPE_SECRET_KEY: sk_test_[STAGING_STRIPE_KEY]
```
