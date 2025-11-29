Write-Host "`n=== Mobile App Authentication Test ===" -ForegroundColor Cyan

# 1. Check IP
Write-Host "`n[1/5] Checking Current IP Address..." -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -eq 'Dhcp'} | Select-Object -First 1).IPAddress
if ($ip) {
    Write-Host "    ✅ Current IP: $ip" -ForegroundColor Green
} else {
    $ip = "192.168.0.131"
    Write-Host "    ⚠️  Using fallback IP: $ip" -ForegroundColor Yellow
}

# 2. Check gradle.properties
Write-Host "`n[2/5] Checking Mobile App Configuration..." -ForegroundColor Yellow
$configFile = "app-frontend\gradle.properties"
if (Test-Path $configFile) {
    $config = Get-Content $configFile | Select-String "BACKEND_URL"
    Write-Host "    $config"
    if ($config -match $ip) {
        Write-Host "    ✅ IP matches" -ForegroundColor Green
    } else {
        Write-Host "    ❌ IP mismatch - needs update" -ForegroundColor Red
    }
} else {
    Write-Host "    ❌ gradle.properties not found" -ForegroundColor Red
}

# 3. Check backend
Write-Host "`n[3/5] Checking Backend Status..." -ForegroundColor Yellow
$backend = Get-Job | Where-Object { $_.Name -eq "Backend" }
if ($backend -and $backend.State -eq "Running") {
    Write-Host "    ✅ Backend running (Job ID: $($backend.Id))" -ForegroundColor Green
    
    # Check if listening on 0.0.0.0
    $output = Receive-Job -Id $backend.Id -Keep 2>$null | Out-String
    if ($output -match "0\.0\.0\.0:8000") {
        Write-Host "    ✅ Listening on all interfaces (0.0.0.0:8000)" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  May only be listening on localhost" -ForegroundColor Yellow
    }
} else {
    Write-Host "    ❌ Backend not running" -ForegroundColor Red
    Write-Host "    Start with: python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
}

# 4. Test network connectivity
Write-Host "`n[4/5] Testing Network Connectivity..." -ForegroundColor Yellow
$test = Test-NetConnection -ComputerName $ip -Port 8000 -WarningAction SilentlyContinue -InformationLevel Quiet
if ($test) {
    Write-Host "    ✅ Backend accessible from network" -ForegroundColor Green
} else {
    Write-Host "    ❌ Backend not accessible on network" -ForegroundColor Red
    Write-Host "    Check: Firewall, backend binding, network connection" -ForegroundColor Gray
}

# 5. Test login endpoint
Write-Host "`n[5/5] Testing Login Endpoint..." -ForegroundColor Yellow
try {
    $body = @{username="admin"; password="admin123"} | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "http://${ip}:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    
    if ($response.token) {
        Write-Host "    ✅ Login successful - token field present" -ForegroundColor Green
        Write-Host "    Token: $($response.token.Substring(0,20))..." -ForegroundColor Gray
        Write-Host "    User: $($response.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "    ❌ Login response missing 'token' field" -ForegroundColor Red
    }
    
    if ($response.access) {
        Write-Host "    ✅ JWT access token present" -ForegroundColor Green
    }
} catch {
    Write-Host "    ❌ Login endpoint failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n" -NoNewline
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""

# Overall status
$allGood = $backend -and $test -and ($config -match $ip)
if ($allGood) {
    Write-Host "✅ All checks passed!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Build → Clean Project" -ForegroundColor White
    Write-Host "3. Build → Rebuild Project" -ForegroundColor White
    Write-Host "4. Run → Run 'app'" -ForegroundColor White
    Write-Host "5. Test login with: admin / admin123`n" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected - review output above" -ForegroundColor Yellow
    Write-Host "`nCommon Fixes:" -ForegroundColor Yellow
    Write-Host "• Backend not running: python manage.py runserver 0.0.0.0:8000" -ForegroundColor White
    Write-Host "• IP mismatch: Update app-frontend/gradle.properties" -ForegroundColor White
    Write-Host "• Network issue: Check firewall and WiFi connection`n" -ForegroundColor White
}
