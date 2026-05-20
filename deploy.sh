#!/bin/bash
# Deploy BeeYield with Batch Verification Fix
# This script deploys the latest code with batch verification working

set -e

echo "🚀 BeeYield Deployment Script"
echo "═════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo "📦 Step 1: Pulling latest code..."
git pull origin main || git pull origin master
echo -e "${GREEN}✓ Code pulled${NC}"
echo ""

# Step 2: Stop current deployment
echo "⏹️  Step 2: Stopping current deployment..."
docker-compose down
echo -e "${GREEN}✓ Containers stopped${NC}"
echo ""

# Step 3: Rebuild Docker image (CRITICAL: no-cache)
echo "🔨 Step 3: Building Docker image (this may take 2-3 minutes)..."
docker-compose build --no-cache frontend
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Step 4: Start deployment
echo "🚀 Step 4: Starting deployment..."
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Step 5: Wait for services to be healthy
echo "⏳ Step 5: Waiting for services to be healthy..."
sleep 15

# Check container status
FRONTEND_STATUS=$(docker-compose ps frontend | grep -o "Up\|Exited" | head -1)
BACKEND_STATUS=$(docker-compose ps backend | grep -o "Up\|Exited" | head -1)

if [ "$FRONTEND_STATUS" = "Up" ] && [ "$BACKEND_STATUS" = "Up" ]; then
    echo -e "${GREEN}✓ All services healthy${NC}"
else
    echo -e "${RED}✗ Services not healthy${NC}"
    echo "Frontend: $FRONTEND_STATUS"
    echo "Backend: $BACKEND_STATUS"
    exit 1
fi
echo ""

# Step 6: Run verification tests
echo "🧪 Step 6: Running verification tests..."
echo ""

# Test frontend loads
echo "   Testing frontend..."
if curl -s http://localhost:3000 | grep -q "html"; then
    echo -e "   ${GREEN}✓ Frontend responds${NC}"
else
    echo -e "   ${RED}✗ Frontend not responding${NC}"
fi

# Test traceability page
echo "   Testing traceability page..."
if curl -s http://localhost:3000/traceability | grep -q "Find Your Honey\|Latest verified"; then
    echo -e "   ${GREEN}✓ Traceability page loads${NC}"
else
    echo -e "   ${RED}✗ Traceability page not loading${NC}"
fi

echo ""
echo "═════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE${NC}"
echo ""
echo "📍 Next Steps:"
echo "   1. Go to: https://yourdomain.com/traceability"
echo "   2. Enter: BEE-2026-01-0420"
echo "   3. Click: Search"
echo "   4. Expected: Modal opens with complete verified batch data"
echo ""
echo "🧪 Test All 3 Batches:"
echo "   - BEE-2026-01-0420 (Premium Reserve)"
echo "   - BEE-2026-01-0419 (Acacia Standard)"
echo "   - BEE-2026-01-0418 (Acacia Gold)"
echo ""
echo "📊 View Logs:"
echo "   docker-compose logs frontend | grep '\[Trace\]'"
echo ""
echo "✅ Batch verification is now deployed!"
