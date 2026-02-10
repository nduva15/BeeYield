#!/bin/bash
set -e

# Database Restore Script
# Usage: ./restore-database.sh [environment] [backup-file]

ENVIRONMENT=${1:-production}
BACKUP_FILE=$2
NAMESPACE="beeyield-${ENVIRONMENT}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Error: Backup file is required"
    echo "Usage: ./restore-database.sh [environment] [backup-file]"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=================================="
echo "BeeYield Database Restore"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Backup file: $BACKUP_FILE"
echo "=================================="

# Confirm restore
read -p "Are you sure you want to restore? This will overwrite existing data. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Get PostgreSQL pod
POSTGRES_POD=$(kubectl get pod -l app=postgres -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POSTGRES_POD" ]; then
    echo "Error: PostgreSQL pod not found"
    exit 1
fi

echo "Restoring to pod: $POSTGRES_POD"

# Drop existing connections
echo "Dropping existing connections..."
kubectl exec -n $NAMESPACE $POSTGRES_POD -- \
    psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'beeyield' AND pid <> pg_backend_pid();"

# Drop and recreate database
echo "Recreating database..."
kubectl exec -n $NAMESPACE $POSTGRES_POD -- \
    psql -U postgres -c "DROP DATABASE IF EXISTS beeyield;"

kubectl exec -n $NAMESPACE $POSTGRES_POD -- \
    psql -U postgres -c "CREATE DATABASE beeyield;"

# Restore backup
echo "Restoring data..."
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | kubectl exec -i -n $NAMESPACE $POSTGRES_POD -- \
        psql -U postgres beeyield
else
    cat $BACKUP_FILE | kubectl exec -i -n $NAMESPACE $POSTGRES_POD -- \
        psql -U postgres beeyield
fi

echo "=================================="
echo "✓ Restore completed successfully!"
echo "=================================="

# Run migrations to ensure schema is up to date
read -p "Run migrations to update schema? (yes/no): " run_migrations
if [ "$run_migrations" == "yes" ]; then
    echo "Running migrations..."
    BACKEND_POD=$(kubectl get pod -l app=backend -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    kubectl exec -n $NAMESPACE $BACKEND_POD -- python -m alembic upgrade head
    echo "✓ Migrations completed"
fi
