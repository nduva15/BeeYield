$files = Get-ChildItem -Recurse -Include *.tsx,*.ts -Path "src"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'dark:') {
        # Remove dark: utility classes (e.g. dark:bg-black, dark:text-white, dark:border-[#1e1e1e], dark:prose-invert)
        $newContent = [regex]::Replace($content, '\s+dark:[a-zA-Z0-9_\-\[\]\/\.#%\(\),]+', '')
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Cleaned: $($file.Name)"
    }
}
Write-Host "Done! All dark: classes removed."
