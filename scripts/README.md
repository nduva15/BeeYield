# Deployment Scripts

This directory contains operational scripts for managing the BeeYield deployment.

## Scripts Overview

### setup-scripts.sh
Makes all scripts executable. Run this first:
```bash
./setup-scripts.sh
```

### setup-infrastructure.sh
Sets up the complete AWS infrastructure using Terraform:
```bash
./setup-infrastructure.sh production
```

### deploy.sh
Deploys the application to Kubernetes:
```bash
./deploy.sh production v1.2.3
./deploy.sh staging latest
```

### rollback.sh
Rolls back to a previous version:
```bash
./rollback.sh production v1.2.2
```

### backup-database.sh
Creates a database backup:
```bash
./backup-database.sh production
UPLOAD_TO_S3=true ./backup-database.sh production  # Upload to S3
```

### restore-database.sh
Restores database from backup:
```bash
./restore-database.sh production backups/beeyield-prod-20260209.sql.gz
```

### monitor.sh
Interactive monitoring tool:
```bash
./monitor.sh production
```

## Usage Examples

### Initial Setup

```bash
# 1. Make scripts executable
chmod +x setup-scripts.sh
./setup-scripts.sh

# 2. Setup infrastructure
./setup-infrastructure.sh production

# 3. Configure secrets (edit k8s/secrets.yaml)

# 4. Deploy application
./deploy.sh production latest
```

### Daily Operations

```bash
# Deploy new version
./deploy.sh production v1.3.0

# Monitor system
./monitor.sh production

# Backup database
./backup-database.sh production
```

### Emergency Operations

```bash
# Rollback to previous version
./rollback.sh production v1.2.9

# Restore database
./restore-database.sh production backup-file.sql.gz
```

## Environment Variables

Scripts support these environment variables:

- `SKIP_DB`: Skip database deployment
- `SKIP_MIGRATIONS`: Skip database migrations
- `UPLOAD_TO_S3`: Upload backup to S3

Example:
```bash
SKIP_MIGRATIONS=true ./deploy.sh production v1.2.3
```

## Prerequisites

- kubectl configured
- AWS CLI configured
- Helm 3 installed
- Terraform installed (for infrastructure setup)
- Appropriate Kubernetes cluster access
