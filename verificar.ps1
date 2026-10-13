# Aplica la limpieza, compila y corre la prueba end-to-end del backend. Sin pasos manuales.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$port = 3199

# El proxy viejo (datos mock) ya no se usa: las rutas ahora usan src/server
Remove-Item 'src\app\api\proxyHelper.ts' -Force -ErrorAction SilentlyContinue

npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm install falló' }

$env:WC_UPSTREAM = 'off'
npm run build
if ($LASTEXITCODE -ne 0) { throw 'build falló' }

$server = Start-Process -FilePath 'npx.cmd' -ArgumentList 'next','start','-p',"$port" -PassThru -WindowStyle Hidden
try {
  $ready = $false
  for ($i = 0; $i -lt 40 -and -not $ready; $i++) {
    Start-Sleep -Milliseconds 500
    try { Invoke-RestMethod "http://localhost:$port/api/admin/config" | Out-Null; $ready = $true } catch {}
  }
  if (-not $ready) { throw 'el servidor no arrancó' }
  node scripts/e2e.mjs "http://localhost:$port"
  if ($LASTEXITCODE -ne 0) { throw 'la prueba e2e falló' }
  Write-Host 'BACKEND OK' -ForegroundColor Green
}
finally {
  taskkill /PID $server.Id /T /F | Out-Null
}
