# Telegram Authentication & RBAC Implementation

## 📋 Overview

This document describes the complete Telegram authentication system for LeadGrid CRM, including:
- **Telegram Login Widget** for web frontend authentication
- **RBAC (Role-Based Access Control)** synced between web, app, and Telegram bot
- **Permission-aware** bot interactions

---

## 🎯 Features

### 1. **Telegram Login Widget** (Web Frontend)
- ✅ One-click authentication via Telegram
- ✅ Secure data verification using HMAC-SHA256
- ✅ Links Telegram account to CRM user
- ✅ Syncs roles and permissions automatically

### 2. **RBAC Integration**
- ✅ Permissions synced across web, Android app, and Telegram bot
- ✅ Role-based access: **Vendor**, **Employee**, **Customer**
- ✅ Organization context awareness
- ✅ Dynamic permission checking

### 3. **Telegram Bot Commands**
- `/start` - Authenticate via email/password
- `/login` - Quick login with email
- `/logout` - Logout from bot
- `/me` - Show account info
- `/profiles` - List available profiles
- `/switch` - Switch between profiles
- `/permissions` - Show current permissions ⭐ **NEW**
- `/help` - Show all commands

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User Login Flow                        │
└─────────────────────────────────────────────────────────────┘

Web Frontend                Backend                  Telegram Bot
     │                          │                          │
     │  1. Click Telegram       │                          │
     │     Login Button         │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │  2. Telegram Widget      │                          │
     │     Opens & Authenticates│                          │
     ├─────────────────────────►│  3. Verify HMAC Hash    │
     │                          │     & Check User Link    │
     │                          ├─────────────────────────►│
     │                          │  4. Send Welcome Message │
     │                          │◄─────────────────────────┤
     │  5. Return JWT Token     │                          │
     │     + User Data          │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  6. Permissions Synced   │                          │
     │     Across All Platforms │                          │
     └──────────────────────────┴──────────────────────────┘
```

---

## 📁 File Structure

### Backend Files

```
shared-backend/
├── crmApp/
│   ├── viewsets/
│   │   ├── telegram_auth.py        ⭐ NEW - Login Widget auth endpoints
│   │   ├── telegram_commands.py    ⭐ NEW - RBAC-aware commands
│   │   └── telegram.py             ✏️  UPDATED - Added RBAC integration
│   ├── services/
│   │   ├── telegram_rbac_service.py ⭐ NEW - RBAC logic for bot
│   │   ├── telegram_auth_service.py
│   │   └── telegram_service.py
│   ├── models/
│   │   └── telegram.py             (TelegramUser model)
│   └── urls.py                     ✏️  UPDATED - Added new endpoints
```

### Frontend Files

```
web-frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── TelegramLoginButton.tsx  ⭐ NEW - Login widget component
│   │       ├── LoginForm.tsx            ✏️  UPDATED - Integrated widget
│   │       └── index.ts                 ✏️  UPDATED - Export widget
```

---

## 🔧 Setup Instructions

### 1. **Configure Telegram Bot**

#### A. Set Domain with BotFather

1. Open Telegram and message [@BotFather](https://t.me/botfather)
2. Send `/setdomain`
3. Select your bot: `@LeadGrid_bot`
4. Enter your domain: `https://yourdomain.com`

#### B. Update Environment Variables

```env
# Backend: shared-backend/.env
TG_BOT_TOKEN=your_bot_token_here
TG_WEBHOOK_SECRET=your_webhook_secret_here
BACKEND_URL=https://yourdomain.com
```

```env
# Frontend: web-frontend/.env
VITE_API_BASE_URL=https://yourdomain.com
```

### 2. **Run Database Migrations**

```bash
cd shared-backend
python manage.py makemigrations
python manage.py migrate
```

### 3. **Start Backend Server**

```bash
cd shared-backend
python manage.py runserver
```

### 4. **Start Frontend Dev Server**

```bash
cd web-frontend
npm run dev
```

---

## 🔐 API Endpoints

### 1. **Telegram Login Widget Auth**

**Endpoint:** `POST /api/telegram/auth/`

**Request Body:**
```json
{
  "id": 123456789,
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "abc123..."
}
```

**Response (Already Linked):**
```json
{
  "success": true,
  "token": "your_jwt_token",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "profiles": [...]
  },
  "telegram_linked": true,
  "message": "Successfully authenticated with Telegram"
}
```

**Response (Not Linked):**
```json
{
  "success": false,
  "telegram_linked": false,
  "telegram_user": {
    "telegram_id": 123456789,
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe"
  },
  "action_required": "link_account",
  "message": "Telegram account not linked. Please log in or register."
}
```

### 2. **Link Telegram Account**

**Endpoint:** `POST /api/telegram/link/`

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "email": "john@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "your_jwt_token",
  "user": {...},
  "message": "Account linked successfully"
}
```

---

## 🛡️ RBAC (Role-Based Access Control)

### Permission Model

```python
# Vendor Permissions (All permissions in their organization)
{
  'customer': ['view', 'create', 'update', 'delete'],
  'deal': ['view', 'create', 'update', 'delete'],
  'lead': ['view', 'create', 'update', 'delete'],
  'employee': ['view', 'create', 'update', 'delete'],
  'issue': ['view', 'create', 'update', 'delete'],
  'order': ['view', 'create', 'update', 'delete'],
  'payment': ['view', 'create', 'update', 'delete'],
  'activity': ['view', 'create', 'update', 'delete'],
  'message': ['view', 'create', 'update', 'delete'],
  'pipeline': ['view', 'create', 'update', 'delete'],
  'analytics': ['view'],
}

# Employee Permissions (Based on assigned role)
# Fetched from UserRole → Role → Permission models

# Customer Permissions (Limited access)
{
  'issue': ['view', 'create'],
  'order': ['view'],
  'payment': ['view'],
  'message': ['view', 'create'],
}
```

### Usage in Telegram Bot

```python
from crmApp.services.telegram_rbac_service import TelegramRBACService

# Check permission
has_permission = TelegramRBACService.check_permission(
    telegram_user,
    resource='customer',
    action='create'
)

if not has_permission:
    telegram_service.send_message(
        chat_id,
        "❌ You don't have permission to create customers."
    )
    return

# Get all permissions
permissions = TelegramRBACService.get_user_permissions(telegram_user)

# Get organization context
org_id = TelegramRBACService.get_organization_context(telegram_user)
```

---

## 🧪 Testing

### 1. **Test Telegram Login Widget**

1. Open web frontend: `http://localhost:5173/login`
2. Click the **Telegram Login** button
3. Authorize in Telegram
4. Check if:
   - ✅ JWT token is stored
   - ✅ User data is loaded
   - ✅ Redirected to dashboard
   - ✅ Telegram bot sends welcome message

### 2. **Test Bot Permissions**

1. Send `/start` to `@LeadGrid_bot`
2. Authenticate with email/password
3. Send `/permissions` to view your permissions
4. Try different commands based on your role:
   - **Vendor:** All commands should work
   - **Employee:** Commands based on assigned role
   - **Customer:** Limited commands (issues, orders)

### 3. **Test Profile Switching**

1. Send `/profiles` to list available profiles
2. Send `/switch 2` to switch to profile ID 2
3. Send `/permissions` to see updated permissions
4. Permissions should reflect the new profile's role

---

## 🚀 User Flow Examples

### Example 1: New User (Not Linked)

```
User: *Clicks Telegram Login button on web*
Bot: 👋 Welcome to LeadGrid CRM!
     To complete your authentication, please:
     1. Enter your CRM email and password on the web page
     2. Or create a new account if you don't have one

User: *Enters email/password on web*
Bot: 🎉 Account linked successfully!
     Your Telegram account is now connected to:
     Email: john@example.com
     Name: John Doe

     You can now use the bot to manage your CRM!
     Type /help to see available commands.
```

### Example 2: Existing User (Already Linked)

```
User: *Clicks Telegram Login button on web*
Bot: ✅ Successfully authenticated via web!
     Welcome back, John Doe!

     Your web and Telegram accounts are now synced.
     You can use the bot to manage your CRM on the go.

Web: *Redirects to dashboard*
```

### Example 3: Checking Permissions

```
User: /permissions
Bot: 🔐 Your Permissions

     Profile: Vendor
     Organization: Acme Corp

     Permissions:
     • Activity: create, delete, update, view
     • Analytics: view
     • Customer: create, delete, update, view
     • Deal: create, delete, update, view
     • Employee: create, delete, update, view
     • Issue: create, delete, update, view
     • Lead: create, delete, update, view
     • Message: create, delete, update, view
     • Order: create, delete, update, view
     • Payment: create, delete, update, view
     • Pipeline: create, delete, update, view

     Permissions are synced with your web/app profile.
     Use /switch to change profiles.
```

---

## 🔒 Security Features

### 1. **HMAC Verification**
- All Telegram Login Widget data is verified using HMAC-SHA256
- Bot token is used as the secret key
- Prevents data tampering

### 2. **Auth Date Validation**
- Authentication data expires after 24 hours
- Prevents replay attacks

### 3. **Organization Context**
- All operations are scoped to user's organization
- Prevents cross-organization data access

### 4. **Permission Checks**
- All bot commands check permissions before execution
- Unauthorized actions are blocked with clear error messages

---

## 📊 Database Schema

### TelegramUser Model

```python
class TelegramUser(models.Model):
    # Telegram info
    chat_id = BigIntegerField(unique=True)
    telegram_username = CharField(max_length=100)
    telegram_first_name = CharField(max_length=100)
    telegram_last_name = CharField(max_length=100)
    
    # CRM user mapping
    user = ForeignKey('User', on_delete=CASCADE)
    selected_profile = ForeignKey('UserProfile', on_delete=SET_NULL)
    
    # Auth state
    is_authenticated = BooleanField(default=False)
    pending_email = EmailField()
    auth_code = CharField(max_length=10)
    auth_code_expires_at = DateTimeField()
    conversation_state = CharField(max_length=50)
    
    # Conversation history (for Gemini AI)
    conversation_history = JSONField(default=list)
    conversation_id = CharField(max_length=100)
```

---

## 🐛 Troubleshooting

### Issue: Telegram Login Button Not Showing

**Solution:**
1. Check console for JavaScript errors
2. Verify bot username in `TelegramLoginButton.tsx`
3. Ensure domain is set with BotFather

### Issue: "Invalid Telegram authentication data"

**Solution:**
1. Verify `TG_BOT_TOKEN` in backend `.env`
2. Check if domain matches the one set with BotFather
3. Ensure auth_date is recent (< 24 hours)

### Issue: "Telegram account not linked"

**Solution:**
1. User needs to enter CRM credentials on web
2. Use `/login` command in bot to link manually
3. Check if email exists in database

### Issue: Permission Denied in Bot

**Solution:**
1. Check user's role: `/permissions`
2. Switch to correct profile: `/profiles` then `/switch <id>`
3. Verify role has required permissions in Django admin

---

## 📝 Next Steps

- [ ] Add multi-factor authentication (MFA)
- [ ] Implement Telegram payment integration
- [ ] Add rich media support (images, documents)
- [ ] Create inline keyboards for quick actions
- [ ] Add analytics dashboard in bot

---

## 📚 Resources

- [Telegram Login Widget Docs](https://core.telegram.org/widgets/login)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Chakra UI](https://chakra-ui.com/)

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review backend logs: `shared-backend/logs/`
3. Check Telegram bot logs in console
4. Open an issue on GitHub

---

**Created:** Sunday, November 30, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

