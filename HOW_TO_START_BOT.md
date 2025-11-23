# 🤖 How to Start Telegram Bot

## Quick Start (Every Time)

Open PowerShell in the backend directory and run these 2 commands:

```powershell
cd C:\Users\User\Desktop\p\too-good-crm\shared-backend

# Start Backend Server
Start-Job -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python manage.py runserver --noreload
} | Out-Null

# Start Telegram Poller
Start-Job -Name "TelegramPoller" -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python telegram_poller_enhanced.py
} | Out-Null

# Wait and check status
Start-Sleep 5
Write-Host "`n✅ Telegram Bot Started!`n" -ForegroundColor Green
Get-Job | Format-Table Id, State, Name
```

## Or Use the Startup Script

I'll create a simple script you can just double-click:

**File: `start_telegram_bot.ps1`**

```powershell
Write-Host "Starting Telegram Bot..." -ForegroundColor Cyan

# Navigate to backend directory
Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend

# Start Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Job -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python manage.py runserver --noreload
} | Out-Null

Start-Sleep 3

# Start Telegram Poller
Write-Host "Starting Telegram Poller..." -ForegroundColor Yellow
Start-Job -Name "TelegramPoller" -ScriptBlock { 
    Set-Location C:\Users\User\Desktop\p\too-good-crm\shared-backend
    .\venv\Scripts\Activate.ps1
    python telegram_poller_enhanced.py
} | Out-Null

Start-Sleep 3

# Show status
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TELEGRAM BOT STARTED!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Get-Job | Format-Table Id, State, Name -AutoSize

Write-Host "`n✅ Bot is ready at @LeadGrid_bot" -ForegroundColor Cyan
Write-Host "`nTo stop: Get-Job | Stop-Job; Get-Job | Remove-Job`n"

# Keep window open
Read-Host "Press Enter to close"
```

## To Stop the Bot

```powershell
Get-Job | Stop-Job
Get-Job | Remove-Job
```

## Check Bot Status Anytime

```powershell
Get-Job | Format-Table Id, State, Name
```

## View Live Logs

```powershell
# View backend logs
Receive-Job -Id 1 -Keep | Select-Object -Last 20

# View poller logs
Receive-Job -Name "TelegramPoller" -Keep | Select-Object -Last 20
```

## Summary

**Every time you want to use the bot:**
1. Open PowerShell
2. Run the startup script OR the 2 Start-Job commands
3. Wait 5 seconds
4. Bot is ready!

**That's it!** The bot will keep running until you close PowerShell or stop the jobs.
