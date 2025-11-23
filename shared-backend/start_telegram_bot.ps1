# Telegram Bot Startup Script
# Double-click this file or run: .\start_telegram_bot.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  STARTING TELEGRAM BOT" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend

# Check if jobs are already running
$existingJobs = Get-Job -ErrorAction SilentlyContinue
if ($existingJobs) {
    Write-Host "⚠️  Cleaning up old jobs..." -ForegroundColor Yellow
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
}

# Start Backend Server
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python manage.py runserver --noreload
}

Start-Sleep 5

# Verify backend started
try {
    $test = Invoke-WebRequest -Uri "http://localhost:8000/api/telegram/webhook/" `
                              -Method POST -Body '{}' -ContentType "application/json" `
                              -TimeoutSec 5 -ErrorAction Stop
    Write-Host "      ✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "      ❌ Backend failed to start!" -ForegroundColor Red
    Write-Host "      Check logs: Receive-Job -Id $($backendJob.Id)" -ForegroundColor Yellow
    exit
}

# Start Telegram Poller
Write-Host "[2/2] Starting Telegram Poller..." -ForegroundColor Yellow
$pollerJob = Start-Job -Name "TelegramPoller" -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python telegram_poller_enhanced.py
}

Start-Sleep 3

Write-Host "      ✅ Poller is running!" -ForegroundColor Green

# Show status
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ TELEGRAM BOT IS READY!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Running Jobs:" -ForegroundColor Cyan
Get-Job | Format-Table Id, State, Name -AutoSize

Write-Host "`n📱 Your bot is ready: @LeadGrid_bot" -ForegroundColor Cyan
Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "  - View backend logs:  Receive-Job -Id $($backendJob.Id) -Keep"
Write-Host "  - View poller logs:   Receive-Job -Name TelegramPoller -Keep"
Write-Host "  - Stop bot:           Get-Job | Stop-Job; Get-Job | Remove-Job"
Write-Host "  - Check status:       Get-Job`n"

# Keep window open
Read-Host "Press Enter to close (bot will keep running in background)"
