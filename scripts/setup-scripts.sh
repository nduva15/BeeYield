#!/bin/bash
set -e

# Make all scripts executable
echo "Setting execute permissions on deployment scripts..."

chmod +x deploy.sh
chmod +x rollback.sh
chmod +x backup-database.sh
chmod +x restore-database.sh
chmod +x setup-infrastructure.sh
chmod +x monitor.sh

echo "✓ All scripts are now executable"
echo ""
echo "Available scripts:"
echo "  ./deploy.sh [environment] [version]         - Deploy application"
echo "  ./rollback.sh [environment] [version]       - Rollback deployment"
echo "  ./backup-database.sh [environment]          - Backup database"
echo "  ./restore-database.sh [environment] [file]  - Restore database"
echo "  ./setup-infrastructure.sh [environment]     - Setup infrastructure"
echo "  ./monitor.sh [environment]                  - Monitor system"
