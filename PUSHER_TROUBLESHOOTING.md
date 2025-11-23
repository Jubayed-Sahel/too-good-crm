# Debugging: Still Need to Refresh Pages?

## Quick Fix Checklist

### ✅ Step 1: Restart Frontend Dev Server
The `.env` file was just updated. Vite only loads environment variables on startup.

**Terminal 1 (Frontend):**
```powershell
cd web-frontend
# Press Ctrl+C to stop the current server
npm run dev
```

**Terminal 2 (Backend):**
```powershell
cd shared-backend
python manage.py runserver
```

### ✅ Step 2: Hard Refresh Browser
After restarting servers, do a hard refresh in your browser:
- **Chrome/Edge**: `Ctrl + Shift + R`
- **Firefox**: `Ctrl + F5`

Or open an **Incognito/Private window** to ensure no cached JavaScript.

### ✅ Step 3: Check Browser Console
Open browser DevTools (F12) and check the Console tab. You should see:

**Expected Logs (successful connection):**
```
[VideoCallManager] Render - isAuthenticated: true user: 123 hasToken: true
[Pusher] Starting subscription setup for user: 123
[Pusher] Initialized with user: 123 authEndpoint: http://localhost:8000/api/pusher/auth/
[Pusher] Subscribing to channel: private-user-123
[Pusher] ✅ Connected to Pusher
[Pusher] ✅ Successfully subscribed to: private-user-123
```

### ❌ Common Issues

#### Issue 1: No Pusher logs at all
**Problem:** Frontend not loading the component or hook
**Solution:**
```powershell
cd web-frontend
npm run dev  # Make sure server is running
```

#### Issue 2: "No userId or authToken"
**Problem:** User not logged in or token not in localStorage
**Console shows:**
```
[Pusher] No userId or authToken, skipping subscription. userId: undefined hasToken: false
```
**Solution:**
1. Logout and login again
2. Check localStorage in DevTools:
   - Go to Application tab → Local Storage
   - Look for `auth_tokens` key
   - Should have `access` and `refresh` tokens

#### Issue 3: "Subscription error" or "Connection error"
**Problem:** Pusher auth endpoint failing
**Console shows:**
```
[Pusher] ❌ Subscription error: {...}
[Pusher] ❌ Connection error: {...}
```
**Solution:**
1. Check backend is running: `http://localhost:8000`
2. Test auth endpoint manually:
   ```powershell
   # Get your token from localStorage first
   curl -X POST http://localhost:8000/api/pusher/auth/ `
     -H "Authorization: Bearer YOUR_TOKEN_HERE" `
     -H "Content-Type: application/json" `
     -d '{"socket_id":"123.456","channel_name":"private-user-123"}'
   ```
   Should return: `{"auth":"..."}`

#### Issue 4: Connected but no events received
**Problem:** Backend not sending Pusher events
**Console shows:**
```
[Pusher] ✅ Connected to Pusher
[Pusher] ✅ Successfully subscribed to: private-user-123
# But nothing happens when you initiate a call
```
**Solution:**
Check backend console when making a call. Should see:
```
INFO - Sent Pusher notification: call-initiated for call 1 to user 2
INFO - Call initiated: user1 → user2 (Room: crm-20251123-abc)
```

If you DON'T see these logs, Pusher might not be installed:
```powershell
cd shared-backend
pip install pusher
```

---

## Testing Step-by-Step

### Test 1: Verify Pusher is Connected

1. **Login to your CRM**
2. **Open Browser Console** (F12)
3. **Look for Pusher logs:**
   - `[Pusher] ✅ Connected to Pusher`
   - `[Pusher] ✅ Successfully subscribed to: private-user-{your-id}`

### Test 2: Initiate a Call

1. **User A**: Navigate to Customers page
2. **User A**: Click phone icon
3. **Check Console**:
   ```
   [VideoCall] Initiating audio call to user 123
   [VideoCall] Call initiated successfully: {...}
   [Pusher] Call initiated: <call data>
   ```
4. **✅ SUCCESS**: Calling UI appears WITHOUT refreshing

### Test 3: Receive a Call (Different Browser)

1. **User B**: Stay on Dashboard (any page)
2. **User A**: Click call button
3. **User B Console**:
   ```
   [Pusher] Call initiated: {...}
   [VideoCallManager] Call initiated via Pusher: {...}
   ```
4. **User B UI**: Incoming call notification appears
5. **✅ SUCCESS**: No refresh needed!

### Test 4: Answer Call

1. **User B**: Click "Answer"
2. **Both Consoles**:
   ```
   [Pusher] Call answered: {...}
   [VideoCallManager] Call answered via Pusher: {...}
   ```
3. **Both UIs**: Active call interface appears
4. **✅ SUCCESS**: No refresh needed!

### Test 5: End Call

1. **Either User**: Click "End Call"
2. **Both Consoles**:
   ```
   [Pusher] Call ended: {...}
   [VideoCallManager] Call ended via Pusher: {...}
   ```
3. **Both UIs**: Call interface disappears
4. **✅ SUCCESS**: No refresh needed!

---

## Still Not Working?

### Debug Mode: Enable Verbose Logging

**Edit `web-frontend/src/hooks/usePusherVideoCall.ts`:**

Add this at the top of the file:
```typescript
// Enable Pusher debug logging
Pusher.logToConsole = true;
```

This will show ALL Pusher internal logs.

### Network Tab Check

1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `ws-ap2.pusher.com`
4. Should show "101 Switching Protocols"

### Manual Test: Trigger Event from Backend

**Python console:**
```python
python manage.py shell

from django.conf import settings
import pusher

pusher_client = pusher.Pusher(
    app_id=settings.PUSHER_APP_ID,
    key=settings.PUSHER_KEY,
    secret=settings.PUSHER_SECRET,
    cluster=settings.PUSHER_CLUSTER,
    ssl=True
)

# Replace 123 with your user ID
pusher_client.trigger('private-user-123', 'test-event', {'message': 'Hello!'})
```

You should see this in browser console:
```
test-event {message: 'Hello!'}
```

---

## Environment Variables Reference

### Backend `.env` (shared-backend/.env)
```env
PUSHER_APP_ID=2079466
PUSHER_KEY=5ea9fef4e6e142b94ac4
PUSHER_SECRET=4e0299e5aa14e5a4cf75
PUSHER_CLUSTER=ap2
```

### Frontend `.env` (web-frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_PUSHER_KEY=5ea9fef4e6e142b94ac4
VITE_PUSHER_CLUSTER=ap2
```

**⚠️ IMPORTANT:** After changing `.env` files, you MUST restart the dev servers!

---

## Contact for Help

If still not working after all these steps, share:
1. Browser console output (full log)
2. Backend console output when making a call
3. Network tab screenshot showing WebSocket connections
4. Output of: `npm list pusher-js` (frontend)
5. Output of: `pip list | grep pusher` (backend)
