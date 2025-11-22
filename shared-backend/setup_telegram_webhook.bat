@echo off
REM Telegram Webhook Setup Script for Windows
REM This script sets up the Telegram webhook for the CRM bot

echo ============================================================
echo Telegram Bot Webhook Setup
echo ============================================================
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run the Python setup script
python setup_telegram_webhook.py

pause

