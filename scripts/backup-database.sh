#!/bin/bash
set -e

# Database Backup Script
# Usage: ./backup-database.sh [environment]

ENVIRONMENT=${1:-production}
NAMESPACE="beeyield-${ENVIRONMENT}"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/beeyield-${ENVIRONMENT}-${TIMESTAMP}.sql"

echo "=================================="
echo "BeeYield Database Backup"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Namespace: $NAMESPACE"
echo "Backup file: $BACKUP_FILE"
echo "=================================="

# Create backup directory
mkdir -p $BACKUP_DIR

# Get PostgreSQL pod
POSTGRES_POD=$(kubectl get pod -l app=postgres -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POSTGRES_POD" ]; then
    echo "Error: PostgreSQL pod not found"
    exit 1
fi

echo "Creating backup from pod: $POSTGRES_POD"

# Create backup
kubectl exec -n $NAMESPACE $POSTGRES_POD -- \
    pg_dump -U postgres beeyield | gzip > "${BACKUP_FILE}.gz"

echo "✓ Backup created: ${BACKUP_FILE}.gz"

# Verify backup
if [ -f "${BACKUP_FILE}.gz" ]; then
    SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "✓ Backup size: $SIZE"
else
    echo "✗ Backup failed"
    exit 1
fi

# Optional: Upload to S3
if [ ! -z "$UPLOAD_TO_S3" ]; then
    echo "Uploading to S3..."
    aws s3 cp "${BACKUP_FILE}.gz" "s3://beeyield-backups/${ENVIRONMENT}/"
    echo "✓ Uploaded to S3"
fi

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "beeyield-${ENVIRONMENT}-*.sql.gz" -mtime +7 -delete
echo "✓ Old backups cleaned up"

echo "=================================="
echo "✓ Backup completed successfully!"
echo "=================================="
