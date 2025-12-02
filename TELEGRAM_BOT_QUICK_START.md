# 🤖 Telegram Bot Quick Start Guide

## 📋 Prerequisites

1. ✅ Telegram bot created via [@BotFather](https://t.me/botfather)
2. ✅ Bot token stored in `.env` file
3. ✅ Backend server running

---

## 🚀 Quick Start (2 Methods)

### **Method 1: Webhook Mode** (Recommended for Production)

Use this when your backend is accessible from the internet (e.g., via ngrok, deployed server)

#### **Step 1: Start Backend**
```powershell
cd D:\LearnAppDev\too-good-crm\shared-backend
python manage.py runserver
```

#### **Step 2: Expose Backend to Internet** (if local)
```powershell
# In a new terminal
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

#### **Step 3: Set Webhook**
```powershell
# Replace YOUR_NGROK_URL with your actual URL
$token = "YOUR_BOT_TOKEN"
$webhookUrl = "YOUR_NGROK_URL/api/telegram/webhook/"

Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/setWebhook" `
  -Method POST `
  -Body (@{url=$webhookUrl} | ConvertTo-Json) `
  -ContentType "application/json"
```

**Or use the Python script:**
```powershell
cd D:\LearnAppDev\too-good-crm\shared-backend
python setup_telegram_webhook.py
```

#### **Step 4: Set Domain with BotFather** (For Login Widget)
1. Message [@BotFather](https://t.me/botfather)
2. Send: `/setdomain`
3. Select: `@LeadGrid_bot`
4. Enter your domain (e.g., `https://yourdomain.com` or `https://abc123.ngrok-free.app`)

#### **Step 5: Test Bot**
```
1. Open Telegram
2. Search for @LeadGrid_bot
3. Send: /start
4. Bot should respond immediately!
```

---

### **Method 2: Polling Mode** (For Local Development)

Use this when you don't have ngrok or when developing locally

#### **Step 1: Delete Webhook**
```powershell
$token = "YOUR_BOT_TOKEN"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/deleteWebhook" -Method POST
```

#### **Step 2: Start Backend**
```powershell
cd D:\LearnAppDev\too-good-crm\shared-backend
python manage.py runserver
```

#### **Step 3: Start Polling Script** (in a new terminal)
```powershell
cd D:\LearnAppDev\too-good-crm\shared-backend
python telegram_poller.py
```

This script will:
- Poll Telegram for updates every 2 seconds
- Forward messages to your local backend
- Show logs in the terminal

#### **Step 4: Test Bot**
```
1. Open Telegram
2. Search for @LeadGrid_bot
3. Send: /start
4. Bot should respond (may take 2-3 seconds)
```

---

## 🔍 Verify Setup

### **Check Webhook Status**
```powershell
$token = "YOUR_BOT_TOKEN"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getWebhookInfo"
```

**Expected Output (Webhook Mode):**
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

**Expected Output (Polling Mode):**
```json
{
  "ok": true,
  "result": {
    "url": "",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### **Check Bot Info**
```powershell
$token = "YOUR_BOT_TOKEN"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getMe"
```

**Expected Output:**
```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "LeadGrid Bot",
    "username": "LeadGrid_bot"
  }
}
```

---

## 🛠️ Environment Setup

### **Check `.env` File**
```env
# shared-backend/.env
TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TG_WEBHOOK_SECRET=your-secret-token-here
BACKEND_URL=https://yourdomain.com  # or ngrok URL

# For Gemini AI (optional)
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

### **Verify Backend Endpoints**
```powershell
# Test webhook endpoint
curl http://localhost:8000/api/telegram/webhook/info/

# Test bot info endpoint
curl http://localhost:8000/api/telegram/bot/info/
```

---

## 📝 Bot Commands

Once your bot is running, users can use these commands:

### **Authentication**
- `/start` - Start authentication (email + password)
- `/login` - Quick login with email
- `/logout` - Logout from bot
- `/me` - Show account info

### **Profile & Permissions**
- `/profiles` - List your profiles
- `/switch <id>` - Switch to another profile
- `/permissions` - Show your current permissions ⭐

### **Help & Features**
- `/help` - Show all commands
- `/features` - List available features
- `/actions` - Quick action shortcuts
- `/clear` - Clear conversation history

### **Natural Language**
You can also just chat naturally:
- "Show my deals"
- "Create a new customer"
- "What are my pending issues?"
- "Show this week's statistics"

---

## 🐛 Troubleshooting

### **Problem: Bot Not Responding**

**Solution 1: Check Backend**
```powershell
# Is the backend running?
curl http://localhost:8000/api/telegram/bot/info/
```

**Solution 2: Check Webhook**
```powershell
$token = "YOUR_BOT_TOKEN"
$info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getWebhookInfo"
$info.result
```

Look for:
- `pending_update_count`: Should be 0
- `last_error_message`: Should be empty
- `url`: Should match your backend URL

**Solution 3: Delete and Reset Webhook**
```powershell
# Delete webhook
$token = "YOUR_BOT_TOKEN"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/deleteWebhook" -Method POST

# Wait 5 seconds
Start-Sleep -Seconds 5

# Set new webhook
$webhookUrl = "YOUR_BACKEND_URL/api/telegram/webhook/"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/setWebhook" `
  -Method POST `
  -Body (@{url=$webhookUrl} | ConvertTo-Json) `
  -ContentType "application/json"
```

### **Problem: 404 Error on Webhook**

**Check:**
1. Backend URL is correct
2. Backend is running
3. `/api/telegram/webhook/` endpoint exists

**Test:**
```powershell
curl http://localhost:8000/api/telegram/webhook/ -Method POST
# Should return: {"ok": true} or similar (not 404)
```

### **Problem: "Module not found" Error**

**Solution:**
```powershell
cd D:\LearnAppDev\too-good-crm\shared-backend
pip install -r requirements.txt
```

### **Problem: Telegram Login Widget Not Working**

**Check:**
1. Domain is set with BotFather (`/setdomain`)
2. Domain matches your frontend URL exactly
3. Bot username in `TelegramLoginButton.tsx` is correct (`LeadGrid_bot`)

**Set domain:**
```
1. Message @BotFather
2. Send: /setdomain
3. Select: @LeadGrid_bot
4. Enter: yourdomain.com (without https://)
```

---

## 🔄 Switching Between Modes

### **Switch from Polling to Webhook**
```powershell
# 1. Stop the polling script (Ctrl+C)

# 2. Set webhook
$token = "YOUR_BOT_TOKEN"
$webhookUrl = "YOUR_BACKEND_URL/api/telegram/webhook/"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/setWebhook" `
  -Method POST `
  -Body (@{url=$webhookUrl} | ConvertTo-Json) `
  -ContentType "application/json"

# 3. Verify
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getWebhookInfo"
```

### **Switch from Webhook to Polling**
```powershell
# 1. Delete webhook
$token = "YOUR_BOT_TOKEN"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/deleteWebhook" -Method POST

# 2. Start polling script
cd D:\LearnAppDev\too-good-crm\shared-backend
python telegram_poller.py
```

---

## 📊 Monitoring

### **View Backend Logs**
```powershell
# In the backend terminal, you'll see:
📱 Telegram Login Widget authentication attempt: 123456789
✅ Telegram user 123456789 authenticated as john@example.com
🔍 Loading pipelines...
✅ Vendor permissions loaded for john@example.com
```

### **View Polling Logs**
```powershell
# In the polling terminal, you'll see:
[2024-11-30 10:30:45] 🔄 Starting Telegram bot polling...
[2024-11-30 10:30:47] ✅ Update 123: Message from John Doe
[2024-11-30 10:30:47] 📤 Forwarded to backend: 200 OK
```

---

## 🎯 Production Deployment

### **Requirements:**
1. Backend deployed with HTTPS (e.g., Heroku, AWS, DigitalOcean)
2. Domain name (e.g., `https://api.leadgrid.com`)
3. SSL certificate (usually provided by hosting platform)

### **Setup:**
```bash
# 1. Deploy backend

# 2. Set webhook
curl -X POST "https://api.telegram.org/bot$TG_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.leadgrid.com/api/telegram/webhook/"}'

# 3. Set domain with BotFather
# Message @BotFather: /setdomain
# Enter: api.leadgrid.com (or your frontend domain)

# 4. Test
curl "https://api.telegram.org/bot$TG_BOT_TOKEN/getWebhookInfo"
```

---

## ✅ Success Checklist

- [ ] Backend is running
- [ ] Webhook is set (or polling script is running)
- [ ] Domain is set with BotFather
- [ ] Bot responds to `/start` command
- [ ] Telegram Login Widget shows on web frontend
- [ ] Clicking widget authenticates successfully
- [ ] Bot sends welcome message after web login
- [ ] `/permissions` command shows correct role

---

## 🚀 Next Steps

1. **Test Authentication Flow:**
   - Login via web with Telegram Login Widget
   - Check if bot sends welcome message
   - Verify permissions with `/permissions` command

2. **Test RBAC:**
   - Try different commands based on your role
   - Test profile switching with `/switch`
   - Verify permission checks work

3. **Test Natural Language:**
   - Ask bot questions in natural language
   - Test Gemini AI integration
   - Try creating/viewing resources

---

## 📞 Need Help?

1. Check backend logs for errors
2. Verify webhook status with `/getWebhookInfo`
3. Test bot token with `/getMe`
4. Check this documentation for troubleshooting

---

**Your bot username:** `@LeadGrid_bot`  
**Backend endpoint:** `http://localhost:8000/api/telegram/webhook/`  
**Documentation:** `TELEGRAM_AUTH_IMPLEMENTATION.md`

Happy bot-ing! 🤖✨
