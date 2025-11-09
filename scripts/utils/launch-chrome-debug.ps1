# Launch Google Chrome in debug mode for MCP
Write-Host "Starting Google Chrome in debug mode..." -ForegroundColor Green
Write-Host "Port: 9223" -ForegroundColor Cyan
Write-Host "User Data Dir: C:\temp\chrome-dev-debug" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now use Chrome DevTools MCP in Claude Desktop" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Try multiple common Chrome installation paths
$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$chromeExe = $null
foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromeExe = $path
        Write-Host "Found Chrome at: $chromeExe" -ForegroundColor Green
        break
    }
}

if ($null -eq $chromeExe) {
    Write-Host "Error: Google Chrome not found in common installation paths" -ForegroundColor Red
    Write-Host "Please update the script with your Chrome installation path" -ForegroundColor Yellow
    exit 1
}

& $chromeExe --remote-debugging-port=9223 --user-data-dir="C:\temp\chrome-dev-debug"

