#!/bin/bash
# Auth Deployment Validation Script

set -e

echo "🔍 BeeYield Authentication Deployment Validator"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Test 1: Check .env file exists
echo "📋 Checking Environment Configuration..."
if [ -f .env ]; then
    test_result 0 ".env file exists"
else
    test_result 1 ".env file NOT found - copy .env.production.example to .env"
fi

# Test 2: Check VITE vars are set
echo ""
echo "🔐 Checking VITE Environment Variables..."
if grep -q "VITE_SUPABASE_URL=" .env; then
    URL=$(grep "VITE_SUPABASE_URL=" .env | cut -d'=' -f2 | head -1)
    if [ -z "$URL" ] || [ "$URL" == "https://your-project-ref.supabase.co" ]; then
        test_result 1 "VITE_SUPABASE_URL not configured"
    else
        test_result 0 "VITE_SUPABASE_URL configured"
    fi
else
    test_result 1 "VITE_SUPABASE_URL not found in .env"
fi

if grep -q "VITE_SUPABASE_ANON_KEY=" .env; then
    KEY=$(grep "VITE_SUPABASE_ANON_KEY=" .env | cut -d'=' -f2 | head -1)
    if [ -z "$KEY" ] || [ "$KEY" == "your-anon-key-here" ]; then
        test_result 1 "VITE_SUPABASE_ANON_KEY not configured"
    else
        test_result 0 "VITE_SUPABASE_ANON_KEY configured"
    fi
else
    test_result 1 "VITE_SUPABASE_ANON_KEY not found in .env"
fi

# Test 3: Check Docker is running
echo ""
echo "🐳 Checking Docker Setup..."
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        test_result 0 "Docker is running"
    else
        test_result 1 "Docker daemon not responding"
    fi
else
    test_result 1 "Docker not installed"
fi

# Test 4: Check containers are running
echo ""
echo "📦 Checking Container Status..."
if docker ps | grep -q beeyield-frontend; then
    test_result 0 "Frontend container is running"
else
    test_result 1 "Frontend container is NOT running"
    echo -e "${YELLOW}Run: docker-compose up -d${NC}"
fi

if docker ps | grep -q beeyield-backend; then
    test_result 0 "Backend container is running"
else
    test_result 1 "Backend container is NOT running"
fi

if docker ps | grep -q beeyield-postgres; then
    test_result 0 "Database container is running"
else
    test_result 1 "Database container is NOT running"
fi

# Test 5: Check Frontend is accessible
echo ""
echo "🌐 Checking Frontend Accessibility..."
if command -v curl &> /dev/null; then
    if curl -s http://localhost:3000 | grep -q "html"; then
        test_result 0 "Frontend is accessible at http://localhost:3000"
    else
        test_result 1 "Frontend not responding correctly"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not available, skipping accessibility check"
fi

# Test 6: Check Backend is accessible
echo ""
echo "🔌 Checking Backend Connectivity..."
if command -v curl &> /dev/null; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        test_result 0 "Backend health check passed"
    else
        test_result 1 "Backend health check failed (HTTP $STATUS)"
        echo -e "${YELLOW}   Ensure backend has /health endpoint${NC}"
    fi
else
    echo -e "${YELLOW}⚠${NC} curl not available, skipping backend check"
fi

# Test 7: Check Dockerfile has args
echo ""
echo "🔨 Checking Build Configuration..."
if grep -q "ARG VITE_SUPABASE_URL" Dockerfile; then
    test_result 0 "Dockerfile has VITE_SUPABASE_URL build arg"
else
    test_result 1 "Dockerfile missing VITE_SUPABASE_URL build arg"
fi

if grep -q "ARG VITE_SUPABASE_ANON_KEY" Dockerfile; then
    test_result 0 "Dockerfile has VITE_SUPABASE_ANON_KEY build arg"
else
    test_result 1 "Dockerfile missing VITE_SUPABASE_ANON_KEY build arg"
fi

# Test 8: Check docker-compose passes args
echo ""
echo "⚙️ Checking Docker Compose Configuration..."
if grep -q "VITE_SUPABASE_URL:" docker-compose.yml; then
    test_result 0 "docker-compose passes VITE_SUPABASE_URL to build"
else
    test_result 1 "docker-compose NOT passing VITE_SUPABASE_URL"
fi

if grep -q "VITE_SUPABASE_ANON_KEY:" docker-compose.yml; then
    test_result 0 "docker-compose passes VITE_SUPABASE_ANON_KEY to build"
else
    test_result 1 "docker-compose NOT passing VITE_SUPABASE_ANON_KEY"
fi

# Test 9: Check nginx config
echo ""
echo "⚡ Checking Nginx Configuration..."
if docker ps | grep -q beeyield-frontend; then
    if docker exec beeyield-frontend nginx -t 2>&1 | grep -q "successful"; then
        test_result 0 "Nginx configuration is valid"
    else
        test_result 1 "Nginx configuration has errors"
    fi
else
    echo -e "${YELLOW}⚠${NC} Frontend container not running, skipping nginx check"
fi

# Summary
echo ""
echo "=================================================="
echo "✅ Validation Complete"
echo ""
echo "📚 For detailed instructions, see: AUTH_DEPLOYMENT_FIX.md"
echo ""
echo "🚀 Next Steps:"
echo "  1. Update .env with your Supabase credentials"
echo "  2. Run: docker-compose down && docker-compose build --no-cache && docker-compose up -d"
echo "  3. Test signup at: http://localhost:3000/shop/auth"
echo "  4. Check browser console for VITE_SUPABASE_URL value"
echo ""
