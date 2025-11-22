# Telegram Webhook - Quick Command Reference

Quick copy-paste commands for setting up and managing your Telegram webhook.

## 📋 Prerequisites

Replace these placeholders in the commands below:
- `<YOUR_BOT_TOKEN>` - Your bot token from BotFather
- `<YOUR_WEBHOOK_URL>` - Your backend URL (e.g., `https://abc123.ngrok-free.app`)
- `<YOUR_SECRET>` - Your webhook secret token from `.env`

---

## 🚀 Quick Setup Commands

### 1. Set Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "<YOUR_WEBHOOK_URL>/api/telegram/webhook/",
    "secret_token": "<YOUR_SECRET>"
  }'
```

**Example:**
```bash
curl -X POST "https://api.telegram.org/bot1234567890:ABCdefGHI/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok-free.app/api/telegram/webhook/",
    "secret_token": "my-secret-token-123"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

---

### 2. Get Webhook Info

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Example:**
```bash
curl "https://api.telegram.org/bot1234567890:ABCdefGHI/getWebhookInfo"
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://abc123.ngrok-free.app/api/telegram/webhook/",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

---

### 3. Delete Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

**Example:**
```bash
curl -X POST "https://api.telegram.org/bot1234567890:ABCdefGHI/deleteWebhook"
```

---

### 4. Get Bot Info

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe"
```

**Example:**
```bash
curl "https://api.telegram.org/bot1234567890:ABCdefGHI/getMe"
```

**Expected Response:**
```json
{
  "ok": true,
  "result": {
    "id": 1234567890,
    "is_bot": true,
    "first_name": "YourCRM Bot",
    "username": "yourcrm_bot",
    "can_join_groups": true,
    "can_read_all_group_messages": false,
    "supports_inline_queries": false
  }
}
```

---

## 🔧 Using Django API Endpoints

### 1. Set Webhook (via Django)

```bash
curl -X POST http://localhost:8000/api/telegram/webhook/set/ \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "<YOUR_WEBHOOK_URL>/api/telegram/webhook/"
  }'
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/telegram/webhook/set/ \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://abc123.ngrok-free.app/api/telegram/webhook/"
  }'
```

---

### 2. Get Webhook Info (via Django)

```bash
curl http://localhost:8000/api/telegram/webhook/info/
```

---

### 3. Get Bot Info (via Django)

```bash
curl http://localhost:8000/api/telegram/bot/info/
```

---

## 🌐 Development with ngrok

### Start ngrok
```bash
ngrok http 8000
```

**Output:**
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

### Set Webhook with ngrok URL
```bash
# Copy the ngrok URL (e.g., https://abc123.ngrok-free.app)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://abc123.ngrok-free.app/api/telegram/webhook/"
  }'
```

---

## 🐛 Troubleshooting Commands

### Check if webhook is receiving updates
```bash
# Get webhook info and check pending_update_count
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo" | grep pending_update_count
```

### Check last error
```bash
# Get webhook info and check last_error_message
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo" | grep last_error
```

### Test webhook endpoint directly
```bash
# Test if your webhook endpoint is accessible
curl -X POST <YOUR_WEBHOOK_URL>/api/telegram/webhook/ \
  -H "Content-Type: application/json" \
  -d '{"update_id": 1, "message": {"chat": {"id": 123}, "text": "test"}}'
```

### Check Django logs
```bash
# Watch Django logs in real-time
tail -f shared-backend/logs/django.log
```

### Check Gemini status
```bash
# Verify Gemini AI is working
curl http://localhost:8000/api/gemini/status/ \
  -H "Authorization: Token <YOUR_AUTH_TOKEN>"
```

---

## 📝 PowerShell (Windows)

If you're on Windows and using PowerShell, use these commands instead:

### Set Webhook
```powershell
$body = @{
    url = "<YOUR_WEBHOOK_URL>/api/telegram/webhook/"
    secret_token = "<YOUR_SECRET>"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Get Webhook Info
```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Delete Webhook
```powershell
Invoke-RestMethod -Uri "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook" `
  -Method Post
```

---

## 🔐 Generate Webhook Secret

### Linux/Mac
```bash
openssl rand -hex 32
```

### Windows (PowerShell)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Python
```python
import secrets
print(secrets.token_hex(32))
```

---

## 📦 Using the Setup Script

Instead of manual commands, use the automated setup script:

### Linux/Mac
```bash
cd shared-backend
chmod +x setup_telegram_webhook.sh
./setup_telegram_webhook.sh
```

### Windows
```cmd
cd shared-backend
setup_telegram_webhook.bat
```

### Python (cross-platform)
```bash
cd shared-backend
python setup_telegram_webhook.py
```

---

## ✅ Verification Checklist

After setting webhook, verify:

- [ ] Webhook URL is set: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`
- [ ] Backend is accessible: `curl <YOUR_WEBHOOK_URL>/api/telegram/webhook/info/`
- [ ] Bot responds in Telegram: Send `/start` to your bot
- [ ] Django logs show activity: `tail -f shared-backend/logs/django.log`
- [ ] Gemini is configured: Check `GEMINI_API_KEY` in `.env`

---

## 🚨 Common Errors

### Error: "Webhook can be set up only for https URLs"
**Solution:** Use ngrok or deploy to HTTPS server

### Error: "Bad Request: wrong URL host"
**Solution:** Check URL format, must be full URL with protocol

### Error: "Connection refused"
**Solution:** Ensure backend is running and accessible

### Error: "Unauthorized"
**Solution:** Check bot token is correct

---

## 📚 References

- Telegram Bot API: https://core.telegram.org/bots/api
- Webhook Guide: https://core.telegram.org/bots/webhooks
- ngrok: https://ngrok.com/

---

**Quick Start:** Just run `python setup_telegram_webhook.py` and follow the prompts! 🚀

