$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "VITE_SUPABASE_URL=(.*)") { $global:url = $matches[1].Trim() }
        if ($_ -match "SUPABASE_SERVICE_ROLE_KEY=(.*)") { $global:key = $matches[1].Trim() }
    }
}

if (-not $global:url -or -not $global:key) {
    Write-Host "Missing URL or KEY"
    exit
}

$headers = @{
    "apikey"        = $global:key
    "Authorization" = "Bearer $global:key"
}

$tables = @("honey_batches", "products", "newsletter_subscribers", "contact_submissions", "profiles")

foreach ($t in $tables) {
    try {
        $uri = "$($global:url)/rest/v1/$t?select=*"
        $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
        
        $count = 0
        if ($response -is [Array]) { $count = $response.Length }
        elseif ($response -is [PSCustomObject]) { $count = 1 }
        
        Write-Host "Table '$t': $count rows"
        
    }
    catch {
        Write-Host "Table '$t': ERROR $($_.Exception.Message)"
    }
}
