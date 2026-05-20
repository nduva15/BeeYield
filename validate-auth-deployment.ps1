# Auth Deployment Validation Script (Windows PowerShell)

$ErrorActionPreference = "Continue"

Write-Host "🔍 BeeYield Authentication Deployment Validator" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Colors helper
function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Test 1: Check .env file exists
Write-Host "📋 Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Success ".env file exists"
} else {
    Write-Error-Custom ".env file NOT found - copy .env.production.example to .env"
}

# Test 2: Check VITE vars are set
Write-Host "`n🔐 Checking VITE Environment Variables..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    
    $supabaseUrl = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_URL=" } | ForEach-Object { $_ -replace "VITE_SUPABASE_URL=", "" }
    if ($supabaseUrl -and $supabaseUrl -ne "https://your-project-ref.supabase.co") {
        Write-Success "VITE_SUPABASE_URL configured"
    } else {
        Write-Error-Custom "VITE_SUPABASE_URL not configured"
    }
    
    $supabaseKey = $envContent | Where-Object { $_ -match "^VITE_SUPABASE_ANON_KEY=" } | ForEach-Object { $_ -replace "VITE_SUPABASE_ANON_KEY=", "" }
    if ($supabaseKey -and $supabaseKey -ne "your-anon-key-here") {
        Write-Success "VITE_SUPABASE_ANON_KEY configured"
    } else {
        Write-Error-Custom "VITE_SUPABASE_ANON_KEY not configured"
    }
}

# Test 3: Check Docker is running
Write-Host "`n🐳 Checking Docker Setup..." -ForegroundColor Yellow
try {
    $dockerVersion = docker version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker is running"
    } else {
        Write-Error-Custom "Docker daemon not responding"
    }
} catch {
    Write-Error-Custom "Docker not installed or not in PATH"
}

# Test 4: Check containers are running
Write-Host "`n📦 Checking Container Status..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>/dev/null

if ($containers -match "beeyield-frontend") {
    Write-Success "Frontend container is running"
} else {
    Write-Error-Custom "Frontend container is NOT running"
    Write-Host "   Run: docker-compose up -d" -ForegroundColor Yellow
}

if ($containers -match "beeyield-backend") {
    Write-Success "Backend container is running"
} else {
    Write-Error-Custom "Backend container is NOT running"
}

if ($containers -match "beeyield-postgres") {
    Write-Success "Database container is running"
} else {
    Write-Error-Custom "Database container is NOT running"
}

# Test 5: Check Frontend is accessible
Write-Host "`n🌐 Checking Frontend Accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -ErrorAction SilentlyContinue -TimeoutSec 5
    if ($response.Content -match "html") {
        Write-Success "Frontend is accessible at http://localhost:3000"
    } else {
        Write-Error-Custom "Frontend not responding correctly"
    }
} catch {
    Write-Warning-Custom "Could not reach frontend (may still be starting): $_"
}

# Test 6: Check Backend is accessible
Write-Host "`n🔌 Checking Backend Connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -ErrorAction SilentlyContinue -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend health check passed"
    } else {
        Write-Error-Custom "Backend health check failed (HTTP $($response.StatusCode))"
        Write-Warning-Custom "Ensure backend has /health endpoint"
    }
} catch {
    Write-Error-Custom "Backend health check failed"
    Write-Warning-Custom "Ensure backend has /health endpoint or update healthcheck in docker-compose.yml"
}

# Test 7: Check Dockerfile has args
Write-Host "`n🔨 Checking Build Configuration..." -ForegroundColor Yellow
$dockerfileContent = Get-Content "Dockerfile" -Raw

if ($dockerfileContent -match "ARG VITE_SUPABASE_URL") {
    Write-Success "Dockerfile has VITE_SUPABASE_URL build arg"
} else {
    Write-Error-Custom "Dockerfile missing VITE_SUPABASE_URL build arg"
}

if ($dockerfileContent -match "ARG VITE_SUPABASE_ANON_KEY") {
    Write-Success "Dockerfile has VITE_SUPABASE_ANON_KEY build arg"
} else {
    Write-Error-Custom "Dockerfile missing VITE_SUPABASE_ANON_KEY build arg"
}

# Test 8: Check docker-compose passes args
Write-Host "`n⚙️  Checking Docker Compose Configuration..." -ForegroundColor Yellow
$composeContent = Get-Content "docker-compose.yml" -Raw

if ($composeContent -match "VITE_SUPABASE_URL:") {
    Write-Success "docker-compose passes VITE_SUPABASE_URL to build"
} else {
    Write-Error-Custom "docker-compose NOT passing VITE_SUPABASE_URL"
}

if ($composeContent -match "VITE_SUPABASE_ANON_KEY:") {
    Write-Success "docker-compose passes VITE_SUPABASE_ANON_KEY to build"
} else {
    Write-Error-Custom "docker-compose NOT passing VITE_SUPABASE_ANON_KEY"
}

# Test 9: Check nginx config
Write-Host "`n⚡ Checking Nginx Configuration..." -ForegroundColor Yellow
try {
    $nginxTest = docker exec beeyield-frontend nginx -t 2>&1
    if ($nginxTest -match "successful") {
        Write-Success "Nginx configuration is valid"
    } else {
        Write-Error-Custom "Nginx configuration has errors"
    }
} catch {
    Write-Warning-Custom "Frontend container not running, skipping nginx check"
}

# Summary
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "✅ Validation Complete" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed instructions, see: AUTH_DEPLOYMENT_FIX.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env with your Supabase credentials"
Write-Host "  2. Run: docker-compose down && docker-compose build --no-cache && docker-compose up -d"
Write-Host "  3. Test signup at: http://localhost:3000/shop/auth"
Write-Host "  4. Check browser console for VITE_SUPABASE_URL value"
Write-Host ""
