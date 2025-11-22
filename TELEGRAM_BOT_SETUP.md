# Telegram Bot Integration - Complete Setup Guide

This guide will walk you through setting up the Telegram bot integration for your CRM system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Telegram Bot](#step-1-create-telegram-bot)
4. [Step 2: Configure Environment Variables](#step-2-configure-environment-variables)
5. [Step 3: Run Database Migration](#step-3-run-database-migration)
6. [Step 4: Set Up Webhook](#step-4-set-up-webhook)
7. [Step 5: Test the Bot](#step-5-test-the-bot)
8. [Features](#features)
9. [Authentication Flow](#authentication-flow)
10. [RBAC & Permissions](#rbac--permissions)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Telegram bot integration allows users to interact with the CRM via Telegram using natural language. It leverages the same Gemini AI agent that powers the web interface, providing:

- ✅ Natural language CRM queries
- ✅ Full RBAC enforcement (Vendor/Employee/Customer roles)
- ✅ Secure authentication flow
- ✅ Real-time responses
- ✅ Conversation history tracking

---

## Prerequisites

- Django backend running
- Gemini AI configured (`GEMINI_API_KEY` set)
- Public URL for webhook (use ngrok for development)
- Telegram account

---

## Step 1: Create Telegram Bot

### 1.1 Talk to BotFather

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the prompts:
   - **Bot name**: `YourCRM Bot` (display name)
   - **Bot username**: `yourcrm_bot` (must end with `_bot`)

### 1.2 Get Your Bot Token

BotFather will respond with a message like:

```
Done! Congratulations on your new bot. You will find it at t.me/yourcrm_bot.
You can now add a description...

Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890

For a description of the Bot API, see this page: https://core.telegram.org/bots/api
```

**Copy the token** (the long string after "Use this token to access the HTTP API:")

### 1.3 Configure Bot Settings (Optional)

Send these commands to BotFather to customize your bot:

```
/setdescription - Set bot description
/setabouttext - Set about text
/setuserpic - Set bot profile picture
/setcommands - Set command list
```

For `/setcommands`, use this:

```
start - Start authentication flow
help - Show help message
login - Login to CRM account
logout - Logout from bot
me - View account information
clear - Clear conversation history
```

---

## Step 2: Configure Environment Variables

### 2.1 Update `.env` File

Add the following to your `shared-backend/.env` file:

```env
# Telegram Bot Configuration
TG_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
TG_WEBHOOK_SECRET=your-random-secret-token-here
```

**Generate a secure webhook secret:**

```bash
# On Linux/Mac
openssl rand -hex 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2.2 Verify Other Required Variables

Ensure these are also set in your `.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
BACKEND_URL=http://localhost:8000  # Or your ngrok URL
```

---

## Step 3: Run Database Migration

Apply the database migration to create the `TelegramUser` model:

```bash
cd shared-backend
python manage.py migrate
```

You should see output like:

```
Running migrations:
  Applying crmApp.0015_alter_customer_organization_telegramuser... OK
```

---

## Step 4: Set Up Webhook

### 4.1 Expose Your Backend (Development)

If running locally, use **ngrok** to expose your backend:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 8000
```

You'll get a URL like: `https://abc123.ngrok-free.app`

### 4.2 Set the Webhook URL

**Option A: Using curl**

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-backend-url.com/api/telegram/webhook/",
    "secret_token": "your-webhook-secret"
  }'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `https://your-backend-url.com` with your ngrok URL or production URL
- `your-webhook-secret` with the value from your `.env`

**Option B: Using the Django API**

```bash
curl -X POST http://localhost:8000/api/telegram/webhook/set/ \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_url": "https://your-backend-url.com/api/telegram/webhook/"
  }'
```

### 4.3 Verify Webhook

Check if the webhook is set correctly:

```bash
# Option A: Direct Telegram API
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"

# Option B: Django API
curl http://localhost:8000/api/telegram/webhook/info/
```

You should see:

```json
{
  "ok": true,
  "webhook_info": {
    "url": "https://your-backend-url.com/api/telegram/webhook/",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

## Step 5: Test the Bot

### 5.1 Start a Conversation

1. Open Telegram
2. Search for your bot: `@yourcrm_bot`
3. Click **START** or send `/start`

### 5.2 Authenticate

The bot will ask for your email:

```
👋 Welcome to CRM Telegram Bot!

I'm your AI-powered CRM assistant. I can help you:
• View and manage deals
• Track customers and leads
• Create support issues
• View analytics and statistics
• And much more!

🔐 To get started, please authenticate:

Send me your CRM account email address.

Example: john@company.com
```

**Send your CRM email** (must be registered in the system)

The bot will then ask for your password:

```
✅ Account found!

Email: john@company.com
Name: John Doe

🔐 Please enter your password to complete authentication.

For security, please send your password in the next message.
```

**Send your password** (the bot will attempt to delete this message for security)

### 5.3 Start Using CRM Features

Once authenticated, try these queries:

```
Show my deals
List all customers
Create a new lead named Jane from LinkedIn
Update deal 5 to negotiation stage
Record a payment of 5000 for order #3
Show statistics for this month
Create a support issue about login problems
```

---

## Features

### Natural Language Processing

The bot uses Gemini AI to understand natural language queries. You can ask questions in plain English:

- **View Data**: "Show my deals", "List customers", "What are my open issues?"
- **Create Records**: "Create a lead named John from Facebook", "Add a new customer"
- **Update Records**: "Update deal 23 to closed-won", "Change lead status to qualified"
- **Analytics**: "Show statistics", "What's my conversion rate?", "Monthly revenue"
- **Issues**: "Create a support ticket", "Report a bug"

### Commands

| Command | Description |
|---------|-------------|
| `/start` | Start authentication flow |
| `/help` | Show help message with examples |
| `/login [email]` | Login with optional email |
| `/logout` | Logout from bot |
| `/me` | View account information |
| `/clear` | Clear conversation history |

### Message Formatting

The bot supports HTML formatting:
- **Bold**: `<b>text</b>`
- **Italic**: `<i>text</i>`
- **Code**: `<code>text</code>`
- **Links**: `<a href="url">text</a>`

---

## Authentication Flow

### Step-by-Step Process

1. **User sends `/start`**
   - Bot creates `TelegramUser` record
   - Sets state to `waiting_for_email`

2. **User sends email**
   - Bot validates email format
   - Searches for user in CRM database
   - If found, sets state to `waiting_for_password`

3. **User sends password**
   - Bot verifies password using Django auth
   - If correct, links `TelegramUser` to CRM `User`
   - Sets `is_authenticated = True`

4. **User can now use CRM features**
   - All messages forwarded to Gemini AI
   - Gemini uses MCP tools with user context
   - Responses sent back to Telegram

### Security Features

- ✅ Password messages deleted automatically (best effort)
- ✅ Auth codes expire after 10 minutes
- ✅ Max 3 failed login attempts
- ✅ Webhook secret token validation
- ✅ HTTPS required for webhooks

---

## RBAC & Permissions

The bot enforces the same permission system as the web interface:

### Vendor Role
- ✅ Full access to all CRM data
- ✅ Create, read, update, delete all records
- ✅ View all analytics
- ✅ Manage employees and customers

### Employee Role
- ✅ View all customers, leads, deals
- ✅ Update only assigned records
- ✅ Create new leads and deals
- ✅ View organization analytics
- ❌ Cannot delete records
- ❌ Cannot manage other employees

### Customer Role
- ✅ View own profile
- ✅ Submit support issues
- ✅ View own orders and payments
- ❌ Cannot access other customers' data
- ❌ Cannot view analytics
- ❌ Cannot create leads or deals

**Permissions are checked by Gemini AI** using the same MCP tools as the web interface.

---

## Troubleshooting

### Bot Not Responding

**Check webhook status:**

```bash
curl http://localhost:8000/api/telegram/webhook/info/
```

**Check Django logs:**

```bash
cd shared-backend
tail -f logs/django.log
```

**Common issues:**
- Webhook URL not set correctly
- Backend not accessible (ngrok tunnel closed)
- `TG_BOT_TOKEN` not configured

### Authentication Fails

**Error: "No account found with email"**
- User must be registered in CRM first
- Check email spelling
- Verify user is active (`is_active=True`)

**Error: "Incorrect password"**
- Check password spelling
- Max 3 attempts before reset

**Error: "Authentication session expired"**
- Auth codes expire after 10 minutes
- Send `/start` to restart

### Gemini Not Working

**Error: "Failed to connect to Gemini service"**
- Check `GEMINI_API_KEY` is set
- Verify Gemini API quota
- Check backend logs for errors

**Error: "Permission denied"**
- User role doesn't have access
- Check RBAC permissions
- Verify organization assignment

### Webhook Issues

**Error: "Webhook not set"**

```bash
# Reset webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-url.com/api/telegram/webhook/"
```

**Error: "Invalid webhook URL"**
- Must be HTTPS (not HTTP)
- Must be publicly accessible
- Must return 200 OK

---

## Production Deployment

### 1. Use HTTPS

Telegram requires HTTPS for webhooks. Use:
- Nginx with Let's Encrypt
- Cloudflare
- AWS ALB/ELB
- Heroku (automatic HTTPS)

### 2. Set Environment Variables

```bash
export TG_BOT_TOKEN="your-production-token"
export TG_WEBHOOK_SECRET="your-production-secret"
export BACKEND_URL="https://api.yourcrm.com"
```

### 3. Update Webhook

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://api.yourcrm.com/api/telegram/webhook/" \
  -d "secret_token=your-production-secret"
```

### 4. Monitor Logs

Set up log monitoring for:
- Authentication failures
- Gemini API errors
- Webhook delivery issues

### 5. Rate Limiting

Consider adding rate limiting to prevent abuse:

```python
# In settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
    }
}
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/telegram/webhook/` | POST | Receive Telegram updates |
| `/api/telegram/webhook/info/` | GET | Get webhook information |
| `/api/telegram/webhook/set/` | POST | Set webhook URL |
| `/api/telegram/bot/info/` | GET | Get bot information |

---

## Architecture

```
┌─────────────┐
│   Telegram  │
│    User     │
└──────┬──────┘
       │
       │ (HTTPS Webhook)
       ▼
┌─────────────────────────────────────────┐
│         Django Backend                  │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  telegram_webhook()               │ │
│  │  - Parse update                   │ │
│  │  - Get/create TelegramUser        │ │
│  │  - Route to handler               │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│  ┌───────────▼───────────────────────┐ │
│  │  Authentication Flow              │ │
│  │  - Email verification             │ │
│  │  - Password check                 │ │
│  │  - Link to CRM User               │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│  ┌───────────▼───────────────────────┐ │
│  │  Gemini AI Service                │ │
│  │  - Build user context             │ │
│  │  - Call Gemini with MCP tools     │ │
│  │  - Stream response                │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│  ┌───────────▼───────────────────────┐ │
│  │  MCP Tools (CRM Actions)          │ │
│  │  - Customer management            │ │
│  │  - Lead/Deal tracking             │ │
│  │  - Issue management               │ │
│  │  - Analytics                      │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│  ┌───────────▼───────────────────────┐ │
│  │  Telegram Service                 │ │
│  │  - Format response                │ │
│  │  - Send message                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Support

For issues or questions:
1. Check logs: `shared-backend/logs/django.log`
2. Review this documentation
3. Test webhook connectivity
4. Verify environment variables

---

## License

This integration is part of the Too Good CRM system.

