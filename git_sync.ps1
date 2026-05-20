# PowerShell Git Sync Script
Write-Host "Adding all modified files to Git..." -ForegroundColor Cyan
git add -A

Write-Host "Committing changes..." -ForegroundColor Cyan
git commit -m "chore: add explicit supabase anon and service role keys to backend env"

Write-Host "Pushing changes to GitHub..." -ForegroundColor Cyan
git push

Write-Host "Git synchronization complete!" -ForegroundColor Green
