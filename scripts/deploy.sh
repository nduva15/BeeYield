#!/bin/bash
set -e

# BeeYield Deployment Script
# Usage: ./deploy.sh [environment] [version]

ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
NAMESPACE="beeyield-${ENVIRONMENT}"

echo "=================================="
echo "BeeYield Deployment Script"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Version: $VERSION"
echo "Namespace: $NAMESPACE"
echo "=================================="

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        echo "Error: kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        echo "Error: helm is not installed"
        exit 1
    fi
    
    echo "✓ Prerequisites check passed"
}

# Create namespace if it doesn't exist
create_namespace() {
    echo "Creating namespace if it doesn't exist..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    echo "✓ Namespace ready"
}

# Apply ConfigMaps and Secrets
apply_configs() {
    echo "Applying ConfigMaps and Secrets..."
    
    if [ ! -f "../k8s/secrets.yaml" ]; then
        echo "Warning: secrets.yaml not found, skipping..."
    else
        kubectl apply -f ../k8s/secrets.yaml -n $NAMESPACE
    fi
    
    kubectl apply -f ../k8s/configmaps.yaml -n $NAMESPACE
    echo "✓ Configs applied"
}

# Deploy databases
deploy_databases() {
    echo "Deploying databases..."
    kubectl apply -f ../k8s/databases.yaml -n $NAMESPACE
    
    # Wait for databases to be ready
    echo "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=300s
    
    echo "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s
    
    echo "✓ Databases deployed"
}

# Run database migrations
run_migrations() {
    echo "Running database migrations..."
    
    # Wait for backend pod to be ready
    kubectl wait --for=condition=ready pod -l app=backend -n $NAMESPACE --timeout=300s
    
    # Run migrations
    BACKEND_POD=$(kubectl get pod -l app=backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n $NAMESPACE $BACKEND_POD -- python -m alembic upgrade head
    
    echo "✓ Migrations completed"
}

# Deploy application
deploy_app() {
    echo "Deploying application..."
    
    # Update image versions
    kubectl set image deployment/frontend-blue frontend=ghcr.io/YOUR_ORG/YOUR_REPO-frontend:$VERSION -n $NAMESPACE
    kubectl set image deployment/backend-blue backend=ghcr.io/YOUR_ORG/YOUR_REPO-backend:$VERSION -n $NAMESPACE
    
    # Apply services and ingress
    kubectl apply -f ../k8s/services.yaml -n $NAMESPACE
    kubectl apply -f ../k8s/ingress.yaml -n $NAMESPACE
    
    # Apply HPA
    kubectl apply -f ../k8s/hpa.yaml -n $NAMESPACE
    
    # Wait for rollout
    echo "Waiting for frontend rollout..."
    kubectl rollout status deployment/frontend-blue -n $NAMESPACE
    
    echo "Waiting for backend rollout..."
    kubectl rollout status deployment/backend-blue -n $NAMESPACE
    
    echo "✓ Application deployed"
}

# Health check
health_check() {
    echo "Running health checks..."
    
    # Get service endpoints
    if [ "$ENVIRONMENT" == "production" ]; then
        FRONTEND_URL="https://beeyield.com"
        BACKEND_URL="https://api.beeyield.com"
    else
        FRONTEND_URL="https://${ENVIRONMENT}.beeyield.com"
        BACKEND_URL="https://api-${ENVIRONMENT}.beeyield.com"
    fi
    
    # Check frontend
    if curl -f -s -o /dev/null "$FRONTEND_URL"; then
        echo "✓ Frontend is healthy"
    else
        echo "✗ Frontend health check failed"
        exit 1
    fi
    
    # Check backend
    if curl -f -s -o /dev/null "$BACKEND_URL/health"; then
        echo "✓ Backend is healthy"
    else
        echo "✗ Backend health check failed"
        exit 1
    fi
}

# Main deployment flow
main() {
    check_prerequisites
    create_namespace
    apply_configs
    
    if [ "$ENVIRONMENT" != "production" ] || [ ! -z "$SKIP_DB" ]; then
        deploy_databases
    fi
    
    deploy_app
    
    if [ -z "$SKIP_MIGRATIONS" ]; then
        run_migrations
    fi
    
    sleep 10
    health_check
    
    echo "=================================="
    echo "✓ Deployment completed successfully!"
    echo "=================================="
}

main
