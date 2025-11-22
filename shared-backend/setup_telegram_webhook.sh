#!/bin/bash
# Telegram Webhook Setup Script for Linux/Mac
# This script sets up the Telegram webhook for the CRM bot

echo "============================================================"
echo "Telegram Bot Webhook Setup"
echo "============================================================"
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Run the Python setup script
python setup_telegram_webhook.py

