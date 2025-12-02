# Phone Verification Workflow Example

## Complete User Journey: Linking Telegram Account via Phone Number

### Scenario
**Sarah** is a vendor user in the CRM who wants to link her Telegram account to receive notifications and manage tasks on the go.

---

## Step 1: User Initiates Phone Verification (CRM Web App)

**User Action:**
1. Sarah logs into the CRM web application
2. Navigates to the **Messages** page
3. Sees the "Connect to Telegram Bot" section
4. Clicks the **"Verify via Phone Number"** button

**What Happens:**
- A dialog opens asking for phone number
- User enters: `+1-555-123-4567`
- Clicks **"Send Code"**

**Backend Process:**
```
POST /api/telegram/send-verification-code/
Headers: Authorization: Bearer <token>
Body: {
  "phone_number": "+15551234567"
}

→ System validates phone number format
→ System normalizes to E.164: "+15551234567"
→ System generates 6-digit code: "847392"
→ System creates PhoneVerification record:
   - user: Sarah (User ID: 42)
   - phone_number: "+15551234567"
   - verification_code: "847392"
   - expires_at: 15 minutes from now
   - verification_attempts: 0
→ SMS Service sends SMS:
   "Your CRM verification code is: 847392
   
   Or click this link to verify: 
   http://localhost:5173/verify-telegram?code=847392&phone=+8801957028871
   
   This code expires in 15 minutes."
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to +15551234567",
  "phone_number": "+15551234567",
  "expires_in": 900,
  "verification_id": 123
}
```

**Frontend:**
- Dialog closes
- Toast notification: "Code Sent! Verification code sent to +15551234567"
- User sees: "Check Your Phone - A verification link has been sent..."

---

## Step 2: User Receives SMS

**What Sarah Sees on Her Phone:**
```
From: +1-555-TWILIO (or your Twilio number)
Message:
━━━━━━━━━━━━━━━━━━━━
Your CRM verification code is: 847392

Or click this link to verify: 
https://your-crm.com/verify-telegram?code=847392&phone=+15551234567

This code expires in 15 minutes.
━━━━━━━━━━━━━━━━━━━━
```

**Options:**
- Option A: Click the link (opens verification page)
- Option B: Note the code and manually navigate to Telegram bot

---

## Step 3A: User Clicks SMS Link (Recommended Flow)

**User Action:**
1. Sarah clicks the link in SMS
2. Link opens: `https://your-crm.com/verify-telegram?code=847392&phone=+15551234567`
3. Verification page loads

**What Happens:**
- Frontend extracts `code=847392` and `phone=+15551234567` from URL
- Pre-fills the verification form
- Detects Telegram context (if opened from Telegram)

**Frontend Process:**
```javascript
// VerifyTelegramPage.tsx
- Reads URL params: code="847392", phone="+15551234567"
- Auto-fills phone number and code fields
- Checks for Telegram WebApp context
- If in Telegram: extracts chat_id automatically
- If not: shows warning to open from Telegram
```

**Page Display:**
```
┌─────────────────────────────────────┐
│  📱 Verify Phone Number             │
│                                     │
│  Phone Number                       │
│  [+15551234567          ] (pre-filled)│
│                                     │
│  Verification Code                  │
│  [847392] (pre-filled, auto-focused)│
│                                     │
│  [  Verify & Link Account  ]        │
│                                     │
│  ⚠️ Make sure you're in Telegram    │
└─────────────────────────────────────┘
```

---

## Step 3B: User Opens Telegram Bot First (Alternative Flow)

**User Action:**
1. Sarah opens Telegram app
2. Searches for `@LeadGrid_bot`
3. Clicks **"Start"** button
4. Bot sends welcome message

**Telegram Bot Interaction:**
```
User: /start

Bot: 👋 Welcome to LeadGrid CRM Bot!

To link your account, please:
1. Go to your CRM Messages page
2. Click "Verify via Phone Number"
3. Enter your phone number
4. Enter the code from SMS

Or visit: https://your-crm.com/verify-telegram
```

**Then User:**
5. Manually navigates to verification page
6. Enters phone number and code manually

---

## Step 4: User Verifies Code

**User Action:**
1. Sarah is on the verification page
2. Phone number is pre-filled: `+15551234567`
3. Code is pre-filled: `847392`
4. Clicks **"Verify & Link Account"**

**Backend Process:**
```
POST /api/telegram/verify-phone-code/
Body: {
  "phone_number": "+15551234567",
  "verification_code": "847392",
  "telegram_chat_id": 987654321  // From Telegram WebApp
}

→ System finds PhoneVerification record:
   WHERE phone_number = "+15551234567"
     AND verification_code = "847392"
     AND is_verified = False
     AND expires_at > now()
→ Verifies code (increments attempts)
→ Checks expiration (15 min window)
→ Checks attempts (max 5)

If valid:
  → Creates/updates TelegramUser:
     - chat_id: 987654321
     - user: Sarah (User ID: 42)
     - is_authenticated: True
  → Links PhoneVerification to TelegramUser
  → Sets default profile for TelegramUser
  → Marks PhoneVerification as verified
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verified and Telegram account linked successfully",
  "user": {
    "id": 42,
    "email": "sarah@example.com",
    "full_name": "Sarah Johnson"
  },
  "telegram_user": {
    "chat_id": 987654321,
    "username": "sarah_tg",
    "full_name": "Sarah J",
    "is_authenticated": true
  }
}
```

**Frontend:**
- Shows success message: ✅ "Verified Successfully!"
- Displays: "Your Telegram account has been linked to your CRM profile"
- Auto-redirects to Telegram bot after 3 seconds

---

## Step 5: User Can Now Use Telegram Bot

**User Action:**
- Sarah is redirected to Telegram
- Bot sends confirmation message

**Telegram Bot:**
```
Bot: ✅ Account Linked Successfully!

Welcome, Sarah Johnson!

Your Telegram account is now connected to:
- Organization: Acme Corp
- Profile: Vendor
- Role: Owner

Type /help to see available commands.

Available features:
• View customers (/customers)
• View deals (/deals)
• View activities (/activities)
• Get notifications about CRM updates
```

**Sarah can now:**
- Receive CRM notifications in Telegram
- Query customer data via bot
- View deals and activities
- Manage tasks on the go

---

## Error Scenarios

### Scenario A: Expired Code
```
User tries to verify after 16 minutes

Backend Response:
{
  "error": "Invalid or expired verification code"
}

Frontend: Shows error toast
```

### Scenario B: Wrong Code
```
User enters: "847391" (wrong code)

Backend Process:
- Finds PhoneVerification record
- Increments attempts: 0 → 1
- Verifies code: FAIL
- Returns: "Invalid code. 4 attempt(s) remaining."

User can try again (up to 5 attempts total)
```

### Scenario C: Too Many Attempts
```
User fails 5 times

Backend Response:
{
  "error": "Maximum verification attempts exceeded. Please request a new code."
}

User must request a new code
```

### Scenario D: Twilio Not Configured (Development)
```
User requests code

Backend Process:
- SMS Service detects Twilio not configured
- Logs to console: "Would send SMS to +15551234567: Code is 847392"
- Still returns success to user (for development)

In production: Configure Twilio for real SMS
```

---

## Database State After Successful Verification

**phone_verifications table:**
```sql
id: 123
user_id: 42 (Sarah)
phone_number: "+15551234567"
verification_code: "847392"
telegram_chat_id: 987654321
is_verified: True
verified_at: 2025-01-02 14:35:22
expires_at: 2025-01-02 14:50:00
verification_attempts: 1
telegram_user_id: 456
created_at: 2025-01-02 14:35:07
updated_at: 2025-01-02 14:35:22
```

**telegram_users table:**
```sql
id: 456
chat_id: 987654321
telegram_username: "sarah_tg"
telegram_first_name: "Sarah"
telegram_last_name: "J"
user_id: 42 (Sarah)
selected_profile_id: 12 (Vendor profile)
is_authenticated: True
conversation_state: "authenticated"
created_at: 2025-01-02 14:35:22
updated_at: 2025-01-02 14:35:22
```

---

## Security Features

✅ **15-minute expiration** - Codes expire after 15 minutes
✅ **5 attempt limit** - Prevents brute force attacks
✅ **One-time use** - Codes marked as verified after successful use
✅ **User-specific** - Codes tied to specific CRM user account
✅ **Phone normalization** - Validates and normalizes phone numbers
✅ **HMAC tokens** - Secure token generation (for link-based auth)
✅ **Rate limiting** - Can be added to prevent spam

---

## Testing Without Twilio

If Twilio is not configured, the system still works:

1. User requests code → Code is generated
2. Check backend logs to see the code:
   ```
   [SMS] Would send to +15551234567: Your CRM verification code is: 847392...
   ```
3. Use that code in verification page
4. System works normally (just no real SMS sent)

Perfect for development and testing!

---

## Summary

**Total Steps:**
1. ✅ User clicks "Verify via Phone Number"
2. ✅ Enters phone number → Receives SMS with code
3. ✅ Clicks SMS link → Opens verification page
4. ✅ Enters code → Account linked
5. ✅ Can use Telegram bot

**Time:** ~2-3 minutes total
**Security:** High (time-limited, attempt-limited codes)
**User Experience:** Simple 3-click process

