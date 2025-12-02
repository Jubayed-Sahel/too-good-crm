# 🔗 Telegram Bot Auto-Link Setup

## Overview

Users can now generate a secure deep link from the CRM chat interface that:
1. **Opens Telegram bot** automatically
2. **Auto-authenticates** with their CRM account
3. **Syncs permissions** based on their current profile (vendor/employee/customer)
4. **Expires after 5 minutes** for security

---

## 🎯 How It Works

### User Flow:

```
1. User opens CRM Messages page (chat with AI Assistant)
   ↓
2. Clicks "Generate Telegram Link" button
   ↓
3. CRM generates a secure deep link with their profile info
   ↓
4. User clicks "Open in Telegram"
   ↓
5. Telegram app opens @LeadGrid_bot
   ↓
6. Bot automatically authenticates user with correct role
   ↓
7. User can use bot with their CRM permissions!
```

---

## 🏗️ Architecture

### Backend Components:

1. **`telegram_link_generator.py`**
   - Generates secure deep links with HMAC-SHA256 tokens
   - Links expire after 5 minutes
   - Format: `https://t.me/LeadGrid_bot?start=auth_USER_PROFILE_TIME_TOKEN`

2. **Telegram Bot Handler** (Updated `/start` command)
   - Detects deep link payload
   - Verifies token authenticity
   - Auto-authenticates user
   - Syncs profile and permissions

3. **API Endpoint:**
   ```
   GET /api/telegram/generate-link/
   ```

### Frontend Component:

1. **`TelegramLinkButton.tsx`**
   - Displays in AI Assistant chat window
   - Generates link on-demand
   - Shows profile info and expiration time
   - One-click "Open in Telegram" button

---

## 🔐 Security Features

### 1. **HMAC-SHA256 Token**
```python
token = hmac.new(
    bot_token.encode(),
    f"{user_id}:{profile_id}:{timestamp}".encode(),
    hashlib.sha256
).hexdigest()
```

### 2. **Time-based Expiration**
- Links valid for **5 minutes** only
- Prevents replay attacks
- Shows countdown timer in UI

### 3. **Profile-specific**
- Each link tied to specific user + profile
- Can't be reused for different accounts
- Permissions synced from active profile

---

## 📋 Setup Instructions

### 1. Backend Already Configured ✅

The following files are already in place:
- `shared-backend/crmApp/viewsets/telegram_link_generator.py`
- `shared-backend/crmApp/viewsets/telegram.py` (updated)
- `shared-backend/crmApp/urls.py` (endpoint added)

### 2. Frontend Already Configured ✅

The following files are already in place:
- `web-frontend/src/components/messages/TelegramLinkButton.tsx`
- `web-frontend/src/pages/MessagesPage.tsx` (integrated)

### 3. Environment Variables

Add to `shared-backend/.env`:
```env
TG_BOT_USERNAME=LeadGrid_bot  # Your bot username
```

---

## 🧪 Testing

### Test the Complete Flow:

1. **Start Backend:**
   ```powershell
   cd D:\LearnAppDev\too-good-crm\shared-backend
   python manage.py runserver
   ```

2. **Start Bot (Polling Mode):**
   ```powershell
   cd D:\LearnAppDev\too-good-crm\shared-backend
   python telegram_poller.py
   ```

3. **Open Web Frontend:**
   ```
   http://localhost:5173/messages
   ```

4. **Click on "AI Assistant" in the conversations list**

5. **You'll see the Telegram Link button at the top:**
   - Click "Generate Telegram Link"
   - Shows your profile info
   - Click "Open in Telegram"

6. **Telegram opens automatically:**
   - Bot sends welcome message
   - Shows your role and permissions
   - Ready to use!

7. **Verify Permissions:**
   - In Telegram, send: `/permissions`
   - Should show your exact CRM role and permissions

---

## 📊 Deep Link Format

### Structure:
```
https://t.me/LeadGrid_bot?start=auth_USER_PROFILE_TIME_TOKEN
```

### Example:
```
https://t.me/LeadGrid_bot?start=auth_1_5_1701360000_abc123def456...
```

### Parts:
- `auth` - Indicates auto-auth flow
- `1` - User ID
- `5` - Profile ID
- `1701360000` - Unix timestamp
- `abc123...` - HMAC-SHA256 token

---

## 🎨 UI Features

### Button States:

#### **Initial State:**
```
┌─────────────────────────────────────┐
│ 📱 Connect to Telegram Bot          │
│ Get instant CRM notifications...    │
│                                     │
│ [Generate Telegram Link]           │
└─────────────────────────────────────┘
```

#### **Link Generated:**
```
┌─────────────────────────────────────┐
│ ✅ Link Ready! @LeadGrid_bot        │
│ Expires in 300s                     │
│                                     │
│ Profile: vendor | Acme Corp         │
│                                     │
│ [Open in Telegram] [📋]            │
│                                     │
│ Click to authenticate with vendor   │
└─────────────────────────────────────┘
```

---

## 🔄 Permission Sync

When user clicks the link:

1. **Telegram bot receives `/start auth_...` command**
2. **Bot verifies token**
3. **Bot links Telegram account to CRM user**
4. **Bot sets active profile** (vendor/employee/customer)
5. **Bot loads permissions** from `TelegramRBACService`
6. **Bot sends confirmation** with permission summary

### Example Bot Message:
```
✅ Authenticated successfully!

Welcome, John Doe!

Profile: Vendor
Organization: Acme Corp

🔐 Your Permissions

Permissions:
• Customer: create, delete, update, view
• Deal: create, delete, update, view
• Lead: create, delete, update, view
• Employee: create, delete, update, view
...

Permissions are synced with your web/app profile.
Use /switch to change profiles.

You can now use all CRM features via Telegram!

Try asking:
• "Show my deals"
• "List my customers"
• "Create a new lead"
• "Show statistics"

Type /help to see all available commands.
```

---

## 🐛 Troubleshooting

### Issue: "Invalid or expired link"

**Cause:** Link expired (> 5 minutes)

**Solution:** Generate a new link from the CRM

### Issue: "Authentication failed"

**Cause:** Bot token mismatch or profile not found

**Solution:**
1. Check `TG_BOT_TOKEN` in `.env`
2. Ensure profile is active
3. Check backend logs

### Issue: Button not showing

**Cause:** Not in AI Assistant chat

**Solution:** Click on "AI Assistant" in the conversations list (left sidebar)

---

## 📝 API Documentation

### Generate Link Endpoint

**Endpoint:** `GET /api/telegram/generate-link/`

**Headers:**
```
Authorization: Token YOUR_AUTH_TOKEN
```

**Query Parameters (Optional):**
```
?profile_id=5  # Specific profile ID, otherwise uses first active
```

**Response:**
```json
{
  "telegram_link": "https://t.me/LeadGrid_bot?start=auth_1_5_1701360000_abc123...",
  "bot_username": "LeadGrid_bot",
  "expires_in": 300,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "profile": {
    "id": 5,
    "profile_type": "vendor",
    "organization": {
      "id": 13,
      "name": "Acme Corp"
    }
  }
}
```

---

## 🚀 Production Deployment

### Requirements:
1. Backend accessible from internet (for Telegram webhook)
2. Bot configured in webhook mode
3. Domain set with BotFather

### Setup:
```bash
# 1. Set webhook
curl -X POST "https://api.telegram.org/bot$TG_BOT_TOKEN/setWebhook" \
  -d "url=https://yourdomain.com/api/telegram/webhook/"

# 2. Set domain (for Login Widget, optional)
# Message @BotFather: /setdomain
# Enter: yourdomain.com
```

---

## ✅ Features Checklist

- [x] Secure deep link generation
- [x] HMAC-SHA256 token verification
- [x] Time-based expiration (5 minutes)
- [x] Profile-specific authentication
- [x] Permission sync from CRM
- [x] UI component in chat interface
- [x] One-click "Open in Telegram"
- [x] Copy link to clipboard
- [x] Countdown timer
- [x] Bot auto-authentication handler
- [x] Welcome message with permissions

---

## 🎉 Benefits

1. **No manual authentication** - One-click setup
2. **Secure** - HMAC tokens, time-limited
3. **Profile-aware** - Correct permissions automatically
4. **User-friendly** - Simple button in chat
5. **Fast** - Generates in < 1 second
6. **Flexible** - Works with any profile type

---

**Created:** Sunday, November 30, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use

