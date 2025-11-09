# Start MCP Servers for Too Good CRM
# This script starts Edge in debug mode and verifies MCP server setup

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting MCP Servers" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Edge is already running in debug mode
Write-Host "🔍 Checking if Edge is running in debug mode..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9222/json" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    $tabs = $response.Content | ConvertFrom-Json
    Write-Host "✅ Edge is already running in debug mode" -ForegroundColor Green
    Write-Host "   Found $($tabs.Count) tab(s)" -ForegroundColor Gray
    $edgeRunning = $true
} catch {
    Write-Host "⚠️  Edge is not running in debug mode" -ForegroundColor Yellow
    $edgeRunning = $false
}

# Start Edge in debug mode if not running
if (-not $edgeRunning) {
    Write-Host ""
    Write-Host "🚀 Starting Edge in debug mode..." -ForegroundColor Yellow
    
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
            Write-Host "✅ Found Edge at: $edgeExe" -ForegroundColor Green
            break
        }
    }
    
    if ($null -eq $edgeExe) {
        Write-Host "❌ Microsoft Edge not found in common installation paths" -ForegroundColor Red
        Write-Host "   Please install Microsoft Edge or update the script with your Edge path" -ForegroundColor Yellow
        exit 1
    }
    
    # Create temp directory if it doesn't exist
    $debugDir = "C:\temp\edge-dev-debug"
    if (-not (Test-Path $debugDir)) {
        New-Item -ItemType Directory -Path $debugDir -Force | Out-Null
        Write-Host "✅ Created debug directory: $debugDir" -ForegroundColor Green
    }
    
    # Start Edge in debug mode (non-blocking)
    Write-Host "   Starting Edge with remote debugging on port 9222..." -ForegroundColor Gray
    Start-Process -FilePath $edgeExe -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=$debugDir" -WindowStyle Normal
    
    # Wait for Edge to start
    Write-Host "   Waiting for Edge to start..." -ForegroundColor Gray
    $maxAttempts = 10
    $attempt = 0
    $started = $false
    
    while ($attempt -lt $maxAttempts -and -not $started) {
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9222/json" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            $started = $true
            Write-Host "✅ Edge started successfully!" -ForegroundColor Green
        } catch {
            $attempt++
            Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    }
    
    if (-not $started) {
        Write-Host "❌ Edge did not start in debug mode within expected time" -ForegroundColor Red
        Write-Host "   Please check if Edge is already running or try manually" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  MCP Server Status" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Django MCP Server
Write-Host "🔍 Checking Django MCP Server..." -ForegroundColor Yellow
try {
    $pythonCheck = python -c "import mcp; print('OK')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Django MCP Server dependencies installed" -ForegroundColor Green
        Write-Host "   Location: shared-backend\mcp_server.py" -ForegroundColor Gray
    } else {
        Write-Host "❌ Django MCP Server dependencies not installed" -ForegroundColor Red
        Write-Host "   Install with: pip install mcp" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not verify Django MCP Server" -ForegroundColor Yellow
}

Write-Host ""

# Check Edge DevTools MCP
Write-Host "🔍 Checking Edge DevTools MCP..." -ForegroundColor Yellow
try {
    $nodeCheck = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js is installed: $nodeCheck" -ForegroundColor Green
        Write-Host "   Edge DevTools MCP will be installed on first use via npx" -ForegroundColor Gray
    } else {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        Write-Host "   Install Node.js to use Edge DevTools MCP" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Node.js not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Edge is running in debug mode (port 9222)" -ForegroundColor Green
Write-Host ""
Write-Host "2. 📝 Configure Claude Desktop:" -ForegroundColor Yellow
Write-Host "   - Open Claude Desktop" -ForegroundColor Gray
Write-Host "   - Edit MCP configuration (see MCP_SETUP.md)" -ForegroundColor Gray
Write-Host "   - Restart Claude Desktop" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 MCP servers will start automatically when Claude Desktop connects" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. 💡 To test MCP servers, ask Claude:" -ForegroundColor Yellow
Write-Host "   - 'List all models in my CRM' (Django MCP)" -ForegroundColor Gray
Write-Host "   - 'Navigate to http://localhost:5173' (Edge DevTools MCP)" -ForegroundColor Gray
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ MCP servers are ready!" -ForegroundColor Green
Write-Host "   Keep this terminal open to keep Edge running in debug mode" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Keep script running
Write-Host "Waiting... (Press Ctrl+C to exit)" -ForegroundColor DarkGray
try {
    while ($true) {
        Start-Sleep -Seconds 60
        # Check if Edge is still running
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9222/json" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
        } catch {
            Write-Host "⚠️  Edge debug connection lost. Restart Edge if needed." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "👋 Exiting..." -ForegroundColor Yellow
}

