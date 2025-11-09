# Launch Microsoft Edge in debug mode for MCP
Write-Host "Starting Microsoft Edge in debug mode..." -ForegroundColor Green
Write-Host "Port: 9222" -ForegroundColor Cyan
Write-Host "User Data Dir: C:\temp\edge-dev-debug" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now use Edge DevTools MCP in Claude Desktop" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Try multiple common Edge installation paths
$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$edgeExe = $null
foreach ($path in $edgePaths) {
    if (Test-Path $path) {
        $edgeExe = $path
        Write-Host "Found Edge at: $edgeExe" -ForegroundColor Green
        break
    }
}

if ($null -eq $edgeExe) {
    Write-Host "Error: Microsoft Edge not found in common installation paths" -ForegroundColor Red
    Write-Host "Please update the script with your Edge installation path" -ForegroundColor Yellow
    exit 1
}

& $edgeExe --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"

