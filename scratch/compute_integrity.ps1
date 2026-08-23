$url = "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
$tmpFile = Join-Path $PSScriptRoot "xlsx-0.20.3.tgz"

Invoke-WebRequest -Uri $url -OutFile $tmpFile
$hash = Get-FileHash -Path $tmpFile -Algorithm SHA512
$hexStr = $hash.Hash
$bytes = New-Object byte[] 64
for ($i = 0; $i -lt 64; $i++) {
    $bytes[$i] = [Convert]::ToByte($hexStr.Substring($i * 2, 2), 16)
}
$b64 = [Convert]::ToBase64String($bytes)
Write-Output "sha512-$b64"
Remove-Item $tmpFile -Force
