$files = Get-ChildItem -Recurse -Include *.tsx,*.ts -Path "src\components\beeyield", "src\pages"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Track if changes were made
    $original = $content

    # Colors
    $content = $content -replace "bg-\[#0A0A0A\]", "bg-gray-50"
    $content = $content -replace "bg-\[#0D0D0D\]", "bg-white"
    $content = $content -replace "bg-\[#111111\]", "bg-white"
    $content = $content -replace "bg-\[#1A1A1A\]", "bg-gray-50"
    
    # White background replacements
    $content = $content -replace "bg-black/95", "bg-white/95"
    $content = $content -replace "bg-black/90", "bg-white/90"
    $content = $content -replace "bg-black/80", "bg-white/80"
    $content = $content -replace "bg-black/60", "bg-white/80"
    $content = $content -replace "bg-black/40", "bg-gray-100"
    $content = $content -replace "bg-black/20", "bg-gray-100"
    $content = $content -replace "bg-black/10", "bg-gray-50"
    $content = $content -replace "bg-black/5", "bg-gray-50"
    $content = $content -replace "bg-black/\[0.02\]", "bg-gray-50"
    $content = $content -replace "bg-black/\[0.03\]", "bg-gray-50"
    $content = $content -replace "bg-white/\[0.03\]", "bg-white"
    $content = $content -replace "bg-white/\[0.04\]", "bg-gray-50"
    $content = $content -replace "bg-white/\[0.06\]", "bg-gray-100"
    
    # Specific color tokens that were dark
    $content = $content -replace "border-white/10", "border-gray-200"
    $content = $content -replace "border-white/20", "border-gray-300"
    $content = $content -replace "border-white/\[0.08\]", "border-gray-200"
    $content = $content -replace "border-white/\[0.06\]", "border-gray-200"
    $content = $content -replace "border-white/\[0.04\]", "border-gray-100"
    
    # Text colors
    $content = $content -replace "text-white/15", "text-gray-300"
    $content = $content -replace "text-white/20", "text-gray-400"
    $content = $content -replace "text-white/30", "text-gray-500"
    $content = $content -replace "text-white/40", "text-gray-600"
    $content = $content -replace "text-white/50", "text-gray-600"
    $content = $content -replace "text-white/70", "text-gray-700"
    $content = $content -replace "text-white/80", "text-gray-800"
    $content = $content -replace "text-white/90", "text-gray-900"
    
    # This might accidentally replace explicit text-white on primary badges/buttons.
    # To mitigate, let's target exact classes that were used heavily in the dashboard.
    $content = $content -replace "text-white(?!\/|\]|Space)", "text-gray-900"
    
    # Fix the ones that need to stay white (if inside an orange button or primary gradient)
    # E.g. bg-[#FF6B00] text-gray-900 -> bg-[#FF6B00] text-white
    $content = $content -replace "(bg-\[#FF6B00\][^>]*?)text-gray-900", "`$1text-white"
    $content = $content -replace "(bg-honey[^>]*?)text-gray-900", "`$1text-white"
    $content = $content -replace "(bg-emerald-[0-9]{3}[^>]*?)text-gray-900", "`$1text-white"

    if ($original -cne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated UI on: $($file.Name)"
    }
}
Write-Host "Done!"
