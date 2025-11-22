# Telegram Bot - Quick Start Guide

Get your Telegram bot up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Create Bot (2 minutes)

1. Open Telegram, search for **@BotFather**
2. Send `/newbot`
3. Choose a name: `YourCRM Bot`
4. Choose a username: `yourcrm_bot`
5. **Copy the bot token** (long string like `1234567890:ABCdef...`)

### 2. Configure Backend (1 minute)

Add to `shared-backend/.env`:

```env
TG_BOT_TOKEN=your-bot-token-here
GEMINI_API_KEY=your-gemini-key-here
BACKEND_URL= http://localhost:8000 (Not sure)
```

### 3. Run Migration (30 seconds)

```bash
cd shared-backend
python manage.py migrate
```

### 4. Set Up Webhook (1 minute)

**For local development, use ngrok:**

```bash
# Terminal 1: Start ngrok
ngrok http 8000

# Terminal 2: Set webhook (replace URL with your ngrok URL)
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://abc123.ngrok-free.app/api/telegram/webhook/"
```

**Or use the setup script:**

```bash
cd shared-backend
python setup_telegram_webhook.py
```

### 5. Test It! (30 seconds)

1. Open Telegram
2. Search for your bot: `@yourcrm_bot`
3. Send `/start`
4. Enter your CRM email
5. Enter your password
6. Ask: "Show my deals"

## ✅ Done!

Your bot is now ready. Try these commands:

```
Show my deals
List all customers
Create a new lead named John from Facebook
Show statistics for this month
Create a support issue
```

## 📚 Full Documentation

See [TELEGRAM_BOT_SETUP.md](./TELEGRAM_BOT_SETUP.md) for complete documentation.

## 🐛 Troubleshooting

**Bot not responding?**
- Check webhook: `curl http://localhost:8000/api/telegram/webhook/info/`
- Check logs: `tail -f shared-backend/logs/django.log`
- Verify ngrok is running

**Authentication fails?**
- User must be registered in CRM first
- Check email and password spelling
- Verify user is active

**Need help?**
- Type `/help` in the bot
- Check the full setup guide
- Review backend logs

## 🔧 Quick Commands

```bash
# Check webhook status
curl http://localhost:8000/api/telegram/webhook/info/

# Get bot info
curl http://localhost:8000/api/telegram/bot/info/

# View logs
tail -f shared-backend/logs/django.log

# Restart backend
cd shared-backend
python manage.py runserver
```

## 📱 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Authenticate |
| `/help` | Show help |
| `/me` | View account |
| `/logout` | Logout |
| `/clear` | Clear history |

## 🎯 Example Queries

**View Data:**
- "Show my deals"
- "List all customers"
- "What are my open issues?"

**Create Records:**
- "Create a lead named Jane from LinkedIn"
- "Add a new customer"

**Update Records:**
- "Update deal 5 to negotiation"
- "Change lead status to qualified"

**Analytics:**
- "Show statistics"
- "Monthly revenue"

**Issues:**
- "Create a support ticket"
- "Report a bug"

---

**That's it!** Your Telegram bot is ready to use. 🎉

