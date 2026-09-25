[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ClientId,

    [Parameter(Mandatory = $false)]
    [string]$ClientSecret,

    [string]$ProjectRef = "ezfccfypwmuvbpujkqrg"
)

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "  BeeYield — Supabase Google OAuth Provider Configuration" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "Project Reference : $ProjectRef"
Write-Host "Authorized Callback: https://$ProjectRef.supabase.co/auth/v1/callback" -ForegroundColor Cyan
Write-Host ""

# 1. Retrieve stored Supabase token
$code = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public class CredManager {
    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredReadW", CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredFree")]
    public static extern void CredFree(IntPtr credential);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string Read(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] bytes = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, bytes, 0, cred.CredentialBlobSize);
            CredFree(credPtr);
            return Encoding.UTF8.GetString(bytes);
        }
        return null;
    }
}
'@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$token = [CredManager]::Read("Supabase CLI:supabase")
if (-not $token) {
    Write-Error "Could not find Supabase CLI authentication token. Please run 'supabase login' first."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Get current status
try {
    $current = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" -Headers $headers -Method Get
    Write-Host "Current Status:"
    Write-Host "  - EXTERNAL_GOOGLE_ENABLED   : $($current.EXTERNAL_GOOGLE_ENABLED)"
    Write-Host "  - EXTERNAL_GOOGLE_CLIENT_ID : $($current.EXTERNAL_GOOGLE_CLIENT_ID)"
    Write-Host ""
} catch {
    Write-Error "Failed to fetch current auth config: $_"
    exit 1
}

if (-not $ClientId) {
    $ClientId = Read-Host "Enter your Google OAuth Client ID (e.g. 123456-abc.apps.googleusercontent.com)"
}
if (-not $ClientSecret) {
    $ClientSecret = Read-Host "Enter your Google OAuth Client Secret (e.g. GOCSPX-...)"
}

if (-not $ClientId.Trim() -or -not $ClientSecret.Trim()) {
    Write-Warning "Client ID or Secret was not provided. Exiting without updating."
    exit 0
}

# 3. Patch Supabase Management API
$body = @{
    EXTERNAL_GOOGLE_ENABLED = $true
    EXTERNAL_GOOGLE_CLIENT_ID = $ClientId.Trim()
    EXTERNAL_GOOGLE_SECRET = $ClientSecret.Trim()
    EXTERNAL_GOOGLE_SKIP_NONCE_CHECK = $false
} | ConvertTo-Json

try {
    Write-Host "Sending update to Supabase Management API..." -ForegroundColor Cyan
    $res = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ProjectRef/config/auth" -Headers $headers -Method Patch -Body $body
    Write-Host "✓ Supabase Auth Configuration Updated Successfully!" -ForegroundColor Green
    Write-Host "  - EXTERNAL_GOOGLE_ENABLED   : $($res.EXTERNAL_GOOGLE_ENABLED)"
    Write-Host "  - EXTERNAL_GOOGLE_CLIENT_ID : $($res.EXTERNAL_GOOGLE_CLIENT_ID)"
} catch {
    Write-Error "Failed to update Supabase auth configuration: $_"
    exit 1
}

# 4. Verify public endpoint
try {
    $keys = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ProjectRef/api-keys" -Headers $headers -Method Get
    $anonKey = ($keys | Where-Object { $_.name -eq "anon" }).api_key
    if ($anonKey) {
        $settings = Invoke-RestMethod -Uri "https://$ProjectRef.supabase.co/auth/v1/settings" -Headers @{ "apikey" = $anonKey } -Method Get
        Write-Host "Verification: Google provider is active on GoTrue settings: $($settings.external.google)" -ForegroundColor Green
    }
} catch {
    Write-Host "Verification ping skipped: $_"
}

Write-Host ""
Write-Host "Google OAuth is now fully configured on your Supabase project ($ProjectRef)!" -ForegroundColor Green
