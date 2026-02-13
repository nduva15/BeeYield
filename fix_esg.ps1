$file = 'c:\Users\aggym\Downloads\Honey\src\pages\ESG.tsx'
$lines = [System.IO.File]::ReadAllLines($file)
$newLines = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($i -ne 285) {  # 0-indexed, so line 286 is index 285
        [void]$newLines.Add($lines[$i])
    }
}
[System.IO.File]::WriteAllLines($file, $newLines.ToArray())
