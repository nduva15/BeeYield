#!/bin/bash
set -e

# BeeYield Rollback Script
# Usage: ./rollback.sh [environment] [version]

ENVIRONMENT=${1:-production}
VERSION=$2
NAMESPACE="beeyield-${ENVIRONMENT}"

if [ -z "$VERSION" ]; then
    echo "Error: Version is required"
    echo "Usage: ./rollback.sh [environment] [version]"
    exit 1
fi

echo "=================================="
echo "BeeYield Rollback Script"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Target Version: $VERSION"
echo "Namespace: $NAMESPACE"
echo "=================================="

# Confirm rollback
read -p "Are you sure you want to rollback to version $VERSION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

echo "Starting rollback..."

# Rollback frontend
echo "Rolling back frontend..."
kubectl set image deployment/frontend-blue \
    frontend=ghcr.io/YOUR_ORG/YOUR_REPO-frontend:$VERSION \
    -n $NAMESPACE

kubectl rollout status deployment/frontend-blue -n $NAMESPACE

# Rollback backend
echo "Rolling back backend..."
kubectl set image deployment/backend-blue \
    backend=ghcr.io/YOUR_ORG/YOUR_REPO-backend:$VERSION \
    -n $NAMESPACE

kubectl rollout status deployment/backend-blue -n $NAMESPACE

echo "=================================="
echo "✓ Rollback completed successfully!"
echo "=================================="

# Run health checks
sleep 10

if [ "$ENVIRONMENT" == "production" ]; then
    FRONTEND_URL="https://beeyield.com"
    BACKEND_URL="https://api.beeyield.com"
else
    FRONTEND_URL="https://${ENVIRONMENT}.beeyield.com"
    BACKEND_URL="https://api-${ENVIRONMENT}.beeyield.com"
fi

if curl -f -s -o /dev/null "$FRONTEND_URL" && curl -f -s -o /dev/null "$BACKEND_URL/health"; then
    echo "✓ Health checks passed"
else
    echo "✗ Health checks failed - please investigate"
    exit 1
fi
