# Twilio VOIP - Quick Setup

## ⚡ Quick Start (5 Minutes)

### 1. Get Twilio Credentials
- Go to: https://console.twilio.com
- Copy your **Account SID** (starts with AC)
- Copy your **Auth Token** (click to reveal)
- Copy your **Phone Number** (format: +1234567890)

### 2. Update .env File
Open `shared-backend/.env` and add:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+11234567890
```

### 3. Restart Server
```bash
# Press Ctrl+C to stop Django
cd shared-backend
python manage.py runserver
```

### 4. Test It!
1. Go to Customers page
2. Find a customer with a phone number
3. Click the green phone icon 📞
4. Your call will be initiated!

---

## ✅ What's Working Now

- ✅ Call button in customer list (green phone icon)
- ✅ Click to call any customer with a phone number
- ✅ Toast notifications for success/error
- ✅ Call history saved in database
- ✅ Activity records created for each call
- ✅ Real-time status tracking

---

## 🎯 Files Modified

**Backend:**
- `shared-backend/.env` - Configuration ⚙️
- `shared-backend/crmAdmin/settings.py` - Settings
- `shared-backend/crmApp/services/twilio_service.py` - Service layer ⭐
- `shared-backend/crmApp/models/call.py` - Call model 📊
- `shared-backend/crmApp/serializers/call.py` - API serializers
- `shared-backend/crmApp/viewsets/customer.py` - API endpoints 🔌
- `shared-backend/crmApp/migrations/0003_call.py` - Database migration

**Frontend:**
- `web-frontend/src/services/twilio.service.ts` - Twilio API client ⭐
- `web-frontend/src/pages/CustomersPage.tsx` - Call handler
- `web-frontend/src/features/customers/pages/CustomersPage.tsx` - Call handler

---

## 🧪 Quick Test

1. **Test Your Setup:**
   - Click call button on any customer
   - If you see "Twilio is not configured" → Check your .env file
   - If you see "Call initiated" → It's working! ✅

2. **Call Your Own Phone:**
   - Create a test customer with YOUR phone number
   - Click the call button
   - Your phone should ring

---

## 📞 API Endpoints

```
POST /api/customers/{id}/initiate_call/
GET  /api/customers/{id}/call_history/
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Twilio is not configured" | Add credentials to .env and restart server |
| No call button | Customer needs a phone number |
| Call fails | Check phone format: +1234567890 |
| Button doesn't work | Hard refresh: Ctrl+Shift+R |

---

## 🎊 That's It!

You now have a fully functional VOIP calling system integrated into your CRM!

For detailed documentation, see: **TWILIO_INTEGRATION_COMPLETE.md**
