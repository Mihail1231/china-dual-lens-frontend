$port = 8080
$root = $PSScriptRoot
$difyUrl = "https://api.dify.ai/v1/workflows/run"
$difyApiKey = $env:DIFY_API_KEY

# Load from .env.local if present
$envFile = Join-Path $root ".env.local"
if ((-not $difyApiKey) -and (Test-Path $envFile)) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match "^DIFY_API_KEY=(.+)$") {
      $difyApiKey = $Matches[1].Trim()
    }
  }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "China Dual-Lens server running at http://localhost:$port/"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".png"  = "image/png"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $request = $context.Request
  $response = $context.Response

  $response.Headers.Add("Access-Control-Allow-Origin", "*")
  $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if ($request.HttpMethod -eq "OPTIONS") {
    $response.StatusCode = 204
    $response.Close()
    continue
  }

  $relPath = $request.Url.LocalPath.TrimStart('/')

  # Local Serverless Proxy Route: POST /api/route
  if ($relPath -eq "api/route" -and $request.HttpMethod -eq "POST") {
    try {
      $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
      $bodyText = $reader.ReadToEnd()
      $reader.Close()

      $headers = @{
        "Authorization" = "Bearer $difyApiKey"
        "Content-Type"  = "application/json"
      }

      $difyResp = Invoke-WebRequest -Uri $difyUrl -Method POST -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($bodyText)) -TimeoutSec 180 -UseBasicParsing
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($difyResp.Content)
      $response.StatusCode = [int]$difyResp.StatusCode
      $response.ContentType = "application/json; charset=utf-8"
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      $errJson = '{"error":"Local proxy error: ' + ($_.Exception.Message -replace '"', '\"') + '"}'
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($errJson)
      $response.StatusCode = 502
      $response.ContentType = "application/json; charset=utf-8"
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $response.Close()
    continue
  }

  if ([string]::IsNullOrEmpty($relPath)) {
    $relPath = "index.html"
  }

  $filePath = Join-Path $root $relPath
  if (Test-Path $filePath -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
    $response.ContentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } else {
    $response.StatusCode = 404
  }
  $response.Close()
}
