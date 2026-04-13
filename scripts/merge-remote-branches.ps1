# Merge all remote origin/* branches into main and push
# Usage: Run from repository root in PowerShell: ./scripts/merge-remote-branches.ps1

function Abort-WithMessage($msg) {
    Write-Host "ERROR: $msg" -ForegroundColor Red
    exit 1
}

# Ensure inside a git repo
if (-not (Test-Path .git)) {
    Abort-WithMessage "This script must be run from the repository root (where .git lives)."
}

# Ensure working tree is clean (uncommitted changes)
$status = git status --porcelain
if ($status.Trim().Length -ne 0) {
    Write-Host "Working tree not clean. The following changes exist:" -ForegroundColor Yellow
    Write-Host $status
    Abort-WithMessage "Stash or commit your changes before running this script."
}

# Get remote branches (exclude HEAD and main)
$remoteRefs = git for-each-ref --format='%(refname:short)' refs/remotes/origin | ForEach-Object { $_ -replace '^origin/','' }
$branches = $remoteRefs | Where-Object { $_ -and $_ -ne 'HEAD' -and $_ -ne 'main' }
Write-Host "Remote branches to attempt (count: $($branches.Count)):`n" -ForegroundColor Cyan
$branches | ForEach-Object { Write-Host "- $_" }

# Checkout main and update
Write-Host "`nChecking out main and updating from origin/main..." -ForegroundColor Cyan
$rc = git checkout main
if ($LASTEXITCODE -ne 0) { Abort-WithMessage "Failed to checkout main." }
$rc = git pull --ff-only origin main
if ($LASTEXITCODE -ne 0) { Abort-WithMessage "Failed to fast-forward pull origin/main. Resolve upstream issues first." }

$merged = @()
$failed = @()

foreach ($b in $branches) {
    Write-Host "`n--- Merging origin/$b ---" -ForegroundColor Gray
    git merge --no-ff --no-edit "origin/$b"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Merged $b" -ForegroundColor Green
        $merged += $b
    } else {
        Write-Host "Merge failed for $b -- aborting merge and recording failure" -ForegroundColor Yellow
        git merge --abort 2>$null
        $failed += $b
    }
}

if ($merged.Count -gt 0) {
    Write-Host "`nPushing main to origin..." -ForegroundColor Cyan
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Abort-WithMessage "Push failed. Fix push issues (permissions, protected branch) and retry." 
    }
} else {
    Write-Host "\nNo branches were merged." -ForegroundColor Yellow
}

Write-Host "`nSUMMARY" -ForegroundColor Cyan
Write-Host "Merged: $($merged -join ', ')" -ForegroundColor Green
Write-Host "Failed: $($failed -join ', ')" -ForegroundColor Yellow

if ($failed.Count -gt 0) { 
    Write-Host "`nSome branches failed to merge due to conflicts. Resolve manually or rerun after fixes." -ForegroundColor Yellow
    exit 2
}

Write-Host "\nAll done." -ForegroundColor Green
exit 0
