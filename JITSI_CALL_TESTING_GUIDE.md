# Jitsi Call Testing Guide

## Demo Users Created

Two demo users have been created for testing Jitsi video/audio calls:

### 1. Vendor User (Service Provider)
- **Username:** `vendor_demo`
- **Password:** `demo123`
- **Email:** vendor@democompany.com
- **Name:** John Vendor
- **Organization:** Demo Vendor Company
- **Profile Type:** Employee (Vendor)

### 2. Client User (Customer)
- **Username:** `client_demo`
- **Password:** `demo123`
- **Email:** client@democlient.com
- **Name:** Sarah Client
- **Organization:** Demo Vendor Company (as customer)
- **Profile Type:** Customer

## Testing Instructions

### Step 1: Start the Backend Server
```bash
cd shared-backend
python manage.py runserver
```

### Step 2: Start the Frontend Server
```bash
cd web-frontend
npm run dev
```

### Step 3: Open Two Browser Windows

1. **Browser 1 (Vendor):**
   - Navigate to: `http://localhost:5173` (or your frontend URL)
   - Login with:
     - Username: `vendor_demo`
     - Password: `demo123`

2. **Browser 2 (Client):**
   - Open an incognito/private window or different browser
   - Navigate to: `http://localhost:5173`
   - Login with:
     - Username: `client_demo`
     - Password: `demo123`

### Step 4: Initiate a Call

The `client_demo` user is already created as a **customer** in the vendor's organization, so:

1. **Login as `vendor_demo`**
2. **Navigate to Customers page** - You should see "Sarah Client" in your customer list
3. **Find the call button** next to Sarah Client
4. **Click the call/video button** to initiate a call
5. You should see:
   - **📞 Call Initiated** toast on the vendor's screen
   - **📞 Incoming Call** toast/notification on the client's screen (if client_demo is logged in)

Alternatively, the client can also initiate a call to the vendor if there's a user list or contact feature.

### Step 5: Answer the Call

On the recipient's screen:
1. Click the **Answer** button in the incoming call notification
2. Both users will see:
   - **✅ Call Active** toast
   - A new browser window/tab opening with Jitsi Meet
3. Both users can now see and hear each other

### Step 6: End the Call

Either user can:
1. Click the **End Call** button in the active call indicator
2. Or close the Jitsi Meet window
3. Both users will see a **Call Ended** toast

## Toast Notifications

The system shows toast notifications for the following events:

### 1. Call Initiated
- **Title:** 📞 Call Initiated
- **Description:** "Calling [recipient name]..."
- **Type:** Success (green)
- **Duration:** 5 seconds
- **Shown to:** Caller

### 2. Incoming Call
- **Title:** 📞 Incoming Call
- **Description:** "[caller name] is calling you"
- **Type:** Info (blue)
- **Duration:** 30 seconds (stays until answered/rejected)
- **Shown to:** Recipient
- **Actions:** Answer button available

### 3. Call Active
- **Title:** ✅ Call Active
- **Description:** "You are now in a call with [other user]"
- **Type:** Success (green)
- **Duration:** 5 seconds
- **Shown to:** Both users when call connects

### 4. Call Ended
- **Title:** Call Ended
- **Description:** "The call has been ended"
- **Type:** Info (blue)
- **Duration:** 3 seconds
- **Shown to:** Both users when call ends

## Features Implemented

### Backend (Django)
- ✅ JitsiCallSession model (tracks all calls)
- ✅ UserPresence model (online status)
- ✅ JitsiService (business logic)
- ✅ REST API endpoints:
  - `/api/jitsi-calls/initiate_call/` - Start a call
  - `/api/jitsi-calls/{id}/update_status/` - Answer/reject/end call
  - `/api/jitsi-calls/active_calls/` - List active calls
  - `/api/jitsi-calls/my_active_call/` - Get current user's call
  - `/api/user-presence/online_users/` - List online users
  - `/api/user-presence/update_my_status/` - Update presence
  - `/api/user-presence/heartbeat/` - Keep-alive

### Frontend (React + TypeScript)
- ✅ Jitsi Service (`jitsi.service.ts`)
- ✅ JitsiCallManager Component with:
  - Incoming call popup with Answer/Decline buttons
  - Active call indicator with End button
  - Toast notifications for all call events
  - Automatic online status management
  - Heartbeat to keep presence alive
  - Poll for incoming calls every 3 seconds

### Call Flow
1. **Initiation:**
   - User A clicks call button for User B
   - System creates call session with status "pending"
   - Jitsi room is created
   - User A sees "Call Initiated" toast
   - Jitsi window opens for User A

2. **Ringing:**
   - User B's app polls and detects incoming call
   - User B sees incoming call notification popup
   - User B can answer or decline

3. **Active:**
   - User B clicks Answer
   - Call status changes to "active"
   - Jitsi window opens for User B
   - Both users see "Call Active" toast
   - Both users connected in same Jitsi room

4. **Ended:**
   - Either user clicks End Call
   - Call status changes to "completed"
   - Duration is calculated and saved
   - Both users see "Call Ended" toast
   - Jitsi windows can be closed

## Integration into Your App

### Add JitsiCallManager to Your Layout

```tsx
import { JitsiCallManager } from '@/components/jitsi/JitsiCallManager';
import { useAuthStore } from '@/store/authStore'; // Or your auth context

function AppLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      {/* Your app layout */}
      
      {/* Add Jitsi Call Manager */}
      {user && <JitsiCallManager userId={user.id} />}
    </div>
  );
}
```

### Add Call Button to User List

```tsx
import { initiateCall } from '@/components/jitsi/JitsiCallManager';

function UserListItem({ user }) {
  const handleCallUser = async () => {
    try {
      await initiateCall(user.id, user.full_name, 'video');
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  };

  return (
    <div>
      <span>{user.full_name}</span>
      <button onClick={handleCallUser}>
        📹 Call
      </button>
    </div>
  );
}
```

## API Configuration

The Jitsi endpoints are already configured in `web-frontend/src/config/api.config.ts`:

```typescript
JITSI: {
  BASE: '',
  CALLS: '/jitsi-calls/',
  CALL_DETAIL: (id) => `/jitsi-calls/${id}/`,
  INITIATE_CALL: '/jitsi-calls/initiate_call/',
  UPDATE_CALL_STATUS: (id) => `/jitsi-calls/${id}/update_status/`,
  ACTIVE_CALLS: '/jitsi-calls/active_calls/',
  MY_ACTIVE_CALL: '/jitsi-calls/my_active_call/',
  USER_PRESENCE: '/user-presence/',
  ONLINE_USERS: '/user-presence/online_users/',
  UPDATE_MY_STATUS: '/user-presence/update_my_status/',
  HEARTBEAT: '/user-presence/heartbeat/',
}
```

## Troubleshooting

### No Incoming Call Notification?
- Check that the recipient is logged in
- Check browser console for errors
- Verify polling is working (check Network tab for `/my_active_call/` requests)
- Ensure both users are in the same organization or have access to each other

### Jitsi Window Not Opening?
- Check for popup blockers
- Verify the `jitsi_url` in the API response
- Try manually opening the URL from the console

### Call Status Not Updating?
- Check that the backend server is running
- Verify API endpoints are accessible
- Check Django server logs for errors

## Next Steps

1. **Add to Navigation:**
   - Add "Calls" menu item
   - Create a dedicated Calls page showing call history

2. **Enhanced UI:**
   - Add online status indicators to user lists
   - Show "busy" status when user is in a call
   - Add audio-only call option

3. **Real-time Updates:**
   - Implement WebSocket with Django Channels
   - Replace polling with WebSocket events
   - Instant call notifications

4. **Call History:**
   - Create page to view past calls
   - Show duration, participants, timestamp
   - Add call notes feature

5. **Production:**
   - Set up self-hosted Jitsi server
   - Add JWT authentication for Jitsi rooms
   - Configure STUN/TURN servers for better connectivity

## Test Scenarios

### Scenario 1: Basic Call
1. Vendor initiates call to Client
2. Client answers
3. Both connect to Jitsi
4. Client ends call
5. ✅ Expected: All toasts shown, call tracked in database

### Scenario 2: Rejected Call
1. Client initiates call to Vendor
2. Vendor declines
3. ✅ Expected: Call status = "rejected", no Jitsi window opens

### Scenario 3: Missed Call
1. Vendor initiates call to Client
2. Client doesn't answer for 30 seconds
3. Vendor ends call
4. ✅ Expected: Call status = "cancelled"

### Scenario 4: Both Users Call Each Other
1. Vendor initiates call to Client
2. Before Client answers, Client also tries to call Vendor
3. ✅ Expected: One call succeeds, other shows error (user already in call)

## Support

If you encounter any issues:
1. Check browser console for JavaScript errors
2. Check Django server logs
3. Verify both frontend and backend are running
4. Ensure demo users are created (`python manage.py create_call_demo_users`)
5. Test API endpoints directly using the test script:
   ```bash
   cd shared-backend
   python test_jitsi_api.py
   ```

Happy Testing! 🎉
