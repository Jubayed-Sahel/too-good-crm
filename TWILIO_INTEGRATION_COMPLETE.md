# Twilio VOIP Integration - Complete Setup Guide

## 🎉 Integration Complete!

The Twilio VOIP integration has been successfully implemented in your CRM system. This guide will walk you through the final configuration steps and show you how to use the new calling feature.

---

## 📋 What Was Implemented

### Backend Components

1. **Twilio Service** (`shared-backend/crmApp/services/twilio_service.py`)
   - Singleton service for all Twilio operations
   - Methods: `initiate_call()`, `get_call_status()`, `hangup_call()`, `is_configured()`
   - Comprehensive error handling and logging

2. **Call Model** (`shared-backend/crmApp/models/call.py`)
   - Tracks all VOIP calls in the database
   - Fields: call_sid, from/to numbers, status, duration, recording_url, etc.
   - Relationships: organization, customer, initiated_by
   - Database migration: `0003_call.py` (✅ Applied)

3. **Call Serializer** (`shared-backend/crmApp/serializers/call.py`)
   - `CallSerializer`: Full call data serialization
   - `InitiateCallSerializer`: Validates call initiation requests

4. **API Endpoints** (`shared-backend/crmApp/viewsets/customer.py`)
   - `POST /api/customers/{id}/initiate_call/` - Initiate a call
   - `GET /api/customers/{id}/call_history/` - Get call history
   - Creates Activity records for each call
   - Returns detailed call information

### Frontend Components

1. **Twilio Service** (`web-frontend/src/services/twilio.service.ts`)
   - TypeScript service for calling backend API
   - Methods: `initiateCall()`, `getCallHistory()`, `getCallStatus()`
   - Proper error handling and type definitions

2. **Call Button UI** (Already implemented)
   - Located in CustomerTable components
   - Green phone icon for customers with phone numbers
   - Mobile and desktop responsive

3. **Integration** (Both page versions updated)
   - `pages/CustomersPage.tsx`
   - `features/customers/pages/CustomersPage.tsx`
   - Real API calls instead of alert
   - Toast notifications for success/error
   - Auto-refresh after call

---

## 🔧 Configuration Steps

### Step 1: Get Twilio Credentials

1. **Sign up for Twilio** (if you haven't already):
   - Go to https://www.twilio.com/try-twilio
   - Create a free account
   - Verify your email and phone number

2. **Get a Twilio Phone Number**:
   - Login to https://console.twilio.com
   - Go to Phone Numbers → Manage → Buy a number
   - Select a number with Voice capability
   - Purchase the number

3. **Get Your Credentials**:
   - Go to https://console.twilio.com
   - Find your **Account SID** (starts with `AC...`)
   - Find your **Auth Token** (click to reveal)
   - Copy your **Phone Number** (format: +1234567890)

### Step 2: Update Environment Variables

1. **Open the .env file**:
   ```
   shared-backend/.env
   ```

2. **Add your Twilio credentials**:
   ```env
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+11234567890
   ```

   **Important Notes**:
   - Account SID starts with "AC"
   - Phone number must be in E.164 format (+country code + number)
   - Keep these credentials SECRET (never commit to git)

3. **Verify .env is in .gitignore**:
   ```bash
   # Check if .env is ignored
   cat shared-backend/.gitignore | grep .env
   ```
   If not present, add `.env` to `.gitignore`

### Step 3: Restart Django Server

After updating the .env file, you MUST restart the Django server:

1. **Stop the current server**:
   - Press `Ctrl+C` in the terminal running Django

2. **Start it again**:
   ```bash
   cd shared-backend
   python manage.py runserver
   ```

3. **Verify Twilio is configured**:
   - Check the server logs for any Twilio-related errors
   - The service will log if credentials are missing

---

## 🚀 How to Use

### Making a Call

1. **Navigate to Customers Page**:
   - Go to the Customers section in your CRM

2. **Find a Customer with a Phone Number**:
   - Look for the green phone icon button
   - Only customers with phone numbers will have this button

3. **Click the Call Button**:
   - Click the phone icon
   - A toast notification will appear: "Call Initiated"
   - The call will begin ringing the customer's phone

4. **Call Status**:
   - Check the Activity feed to see call records
   - View call history in the customer detail view

### Call States

- **Queued**: Call is being set up
- **Ringing**: Customer's phone is ringing
- **In Progress**: Call is connected
- **Completed**: Call ended normally
- **No Answer**: Customer didn't answer
- **Busy**: Customer's line was busy
- **Failed**: Call failed (check error_message)
- **Canceled**: Call was canceled before connecting

---

## 📊 Database Schema

The `calls` table stores all call information:

```sql
CREATE TABLE calls (
    id INTEGER PRIMARY KEY,
    call_sid VARCHAR(100) UNIQUE,  -- Twilio identifier
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    direction VARCHAR(20),  -- 'outbound' or 'inbound'
    status VARCHAR(20),
    start_time DATETIME,
    end_time DATETIME,
    duration INTEGER,  -- in seconds
    duration_formatted VARCHAR(10),  -- "MM:SS" format
    recording_url VARCHAR(500),
    notes TEXT,
    error_message TEXT,
    organization_id INTEGER,
    customer_id INTEGER,
    initiated_by_id INTEGER,
    created_at DATETIME,
    updated_at DATETIME
);
```

**Indexes**:
- organization_id + customer_id (for fast lookups)
- call_sid (unique identifier)
- status (for filtering by status)
- created_at (for chronological ordering)

---

## 🔍 Testing

### Test Without Real Calls

During development, Twilio uses a demo TwiML URL that will answer but not actually call the number. This is great for testing!

### Test with Real Calls

1. **Call Your Own Phone**:
   - Create a test customer with your phone number
   - Click the call button
   - Your phone should ring

2. **Check Call Status**:
   ```bash
   # Django shell
   python manage.py shell
   
   >>> from crmApp.models import Call
   >>> Call.objects.all()
   >>> call = Call.objects.first()
   >>> print(f"Status: {call.status}, Duration: {call.duration_formatted}")
   ```

3. **View Call History**:
   - Open customer detail page
   - Check the Activity section for call records

### Test Error Handling

1. **Test without credentials**:
   - Remove TWILIO_ACCOUNT_SID from .env
   - Restart server
   - Try to make a call
   - Should see: "Twilio is not configured" error

2. **Test with invalid phone number**:
   - Create customer with invalid phone: "abc123"
   - Try to call
   - Should see Twilio validation error

---

## 📝 API Documentation

### Initiate Call

**Endpoint**: `POST /api/customers/{customer_id}/initiate_call/`

**Authentication**: Required (Token)

**Request**: No body required

**Response** (Success - 201):
```json
{
  "message": "Call initiated successfully",
  "call": {
    "id": 1,
    "call_sid": "CA1234567890abcdef1234567890abcdef",
    "from_number": "+11234567890",
    "to_number": "+19876543210",
    "direction": "outbound",
    "status": "queued",
    "start_time": null,
    "end_time": null,
    "duration": null,
    "duration_formatted": "00:00",
    "recording_url": null,
    "notes": "",
    "error_message": null,
    "organization": 1,
    "customer": 5,
    "customer_name": "John Doe",
    "initiated_by": 1,
    "initiated_by_name": "Admin User",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "twilio_response": {
    "call_sid": "CA1234567890abcdef1234567890abcdef",
    "status": "queued",
    "to": "+19876543210",
    "from": "+11234567890",
    "direction": "outbound-api",
    "date_created": "2024-01-15T10:30:00Z"
  }
}
```

**Response** (Error - 400):
```json
{
  "error": "Customer does not have a phone number"
}
```

**Response** (Error - 503):
```json
{
  "error": "Twilio is not configured. Please add your Twilio credentials to the .env file.",
  "details": "Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
}
```

### Get Call History

**Endpoint**: `GET /api/customers/{customer_id}/call_history/`

**Authentication**: Required (Token)

**Response** (200):
```json
[
  {
    "id": 1,
    "call_sid": "CA1234...",
    "from_number": "+11234567890",
    "to_number": "+19876543210",
    "status": "completed",
    "duration": 125,
    "duration_formatted": "02:05",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## 🎯 Features Implemented

✅ **Core Functionality**
- Initiate outbound calls to customers
- Track call status and duration
- Store call history in database
- Link calls to customers and organizations
- Create activity records for calls

✅ **UI Integration**
- Green call button for customers with phones
- Toast notifications (success/error)
- Loading states
- Error handling

✅ **Backend Infrastructure**
- Twilio service layer (singleton pattern)
- Call model with comprehensive schema
- RESTful API endpoints
- Proper authentication and permissions
- Activity logging

✅ **Data Integrity**
- Organization-scoped calls
- User tracking (who initiated the call)
- Call SID uniqueness
- Phone number validation

---

## 🔮 Future Enhancements

The foundation is now in place for:

1. **Incoming Calls**:
   - Webhook endpoint for Twilio callbacks
   - Update call status in real-time
   - Show incoming call notifications

2. **Call Recording**:
   - Enable recording in Twilio
   - Store recording URLs
   - Playback in UI

3. **Call Analytics**:
   - Call duration reports
   - Success rate tracking
   - Peak calling hours
   - Agent performance metrics

4. **Mobile App Integration**:
   - Same API endpoints work for mobile
   - Just need to update Kotlin code
   - Add call button to mobile customer list

5. **Advanced Features**:
   - Call queuing
   - Conference calls
   - Call transfers
   - Voicemail
   - Call transcription (Twilio Voice Intelligence)

---

## 🐛 Troubleshooting

### "Twilio is not configured" Error

**Cause**: Environment variables are not set or server wasn't restarted

**Solution**:
1. Check `.env` file has all three variables
2. Restart Django server: `Ctrl+C` then `python manage.py runserver`
3. Check logs for "Twilio credentials not configured" message

### Call Button Doesn't Appear

**Cause**: Customer has no phone number

**Solution**:
1. Edit the customer
2. Add a valid phone number (E.164 format: +1234567890)
3. Save and refresh

### "Call failed" Error

**Possible Causes**:
1. Invalid phone number format
2. Twilio account not verified (free trial restrictions)
3. Insufficient Twilio balance
4. Phone number not purchased/verified

**Solution**:
1. Check phone number format: must be E.164 (+country code + number)
2. For trial accounts, verify the destination number in Twilio console
3. Check Twilio account balance
4. Review error_message in Call record

### Toast Notifications Not Showing

**Cause**: Frontend needs hard refresh

**Solution**:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Check browser console for errors

---

## 📚 Additional Resources

- **Twilio Docs**: https://www.twilio.com/docs/voice
- **Twilio Console**: https://console.twilio.com
- **Twilio API Reference**: https://www.twilio.com/docs/voice/api
- **TwiML Reference**: https://www.twilio.com/docs/voice/twiml
- **Twilio Status**: https://status.twilio.com

---

## 🎉 You're All Set!

Your CRM now has a complete VOIP calling system integrated with Twilio. Once you add your credentials and restart the server, you'll be able to call customers directly from the CRM interface!

**Next Steps**:
1. Sign up for Twilio (if not done)
2. Get phone number and credentials
3. Update `.env` file
4. Restart Django server
5. Test by calling your own phone
6. Start calling customers! 📞

---

**Need Help?**
- Check the Django server logs for detailed error messages
- Review Twilio console for call logs and debugging info
- Check the Call model records in Django admin
- Review Activity records for call history

Happy Calling! 🎊
