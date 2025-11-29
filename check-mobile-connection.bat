@echo off
REM Mobile App Connection Diagnostic Tool
REM Run this before testing mobile app login

echo.
echo ============================================
echo Mobile App Connection Diagnostic Tool
echo ============================================
echo.

REM Get current IP address
echo [1/6] Checking your PC's IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP: =!
    echo     Current IP: !IP!
)

REM Check if backend is running
echo.
echo [2/6] Checking if backend is running on port 8000...
powershell -Command "Test-NetConnection -ComputerName localhost -Port 8000 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded"

REM Check if backend is accessible from network
echo.
echo [3/6] Checking if backend is accessible from network (0.0.0.0:8000)...
powershell -Command "$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -eq 'Dhcp'} | Select-Object -First 1).IPAddress; Test-NetConnection -ComputerName $ip -Port 8000 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded"

REM Check firewall status
echo.
echo [4/6] Checking Windows Firewall status...
powershell -Command "Get-NetFirewallProfile | Where-Object {$_.Name -eq 'Private'} | Select-Object -ExpandProperty Enabled"

REM Test login endpoint
echo.
echo [5/6] Testing login endpoint...
powershell -Command "$body = @{username='admin'; password='admin123'} | ConvertTo-Json; try { $response = Invoke-RestMethod -Uri 'http://192.168.0.131:8000/api/auth/login/' -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 5; if ($response.token) { Write-Host '    ✅ Login successful - token received' -ForegroundColor Green } else { Write-Host '    ❌ Login failed - no token' -ForegroundColor Red } } catch { Write-Host '    ❌ Login endpoint not reachable' -ForegroundColor Red }"

REM Check gradle.properties
echo.
echo [6/6] Checking mobile app configuration...
findstr "BACKEND_URL" "%~dp0app-frontend\gradle.properties"

echo.
echo ============================================
echo Diagnostic Complete
echo ============================================
echo.
echo ACTION ITEMS:
echo 1. If IP mismatch: Update app-frontend/gradle.properties
echo 2. If backend not running: Start with "python manage.py runserver 0.0.0.0:8000"
echo 3. If firewall blocking: Allow Python through Windows Firewall
echo 4. Rebuild mobile app after any gradle.properties changes
echo.
pause
