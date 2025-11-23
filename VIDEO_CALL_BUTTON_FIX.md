# Video Call Button Fix - Implementation Complete

## Issue Fixed
**Problem:** Clicking the phone/call button prompted "select an app" dialog instead of initiating video call

**Root Cause:** Phone buttons were using `<a href="tel:...">` links which trigger the system's phone protocol handler, asking which app should handle phone calls.

## Solution Implemented

### 1. Replaced `tel:` Links with Video Call Handlers
**Files Modified:**
- `web-frontend/src/components/customers/CustomerTable.tsx`
- `web-frontend/src/features/customers/CustomerTable.tsx`

**Changes:**
- Removed `as="a"` and `href="tel:..."` attributes
- Added `onClick={() => onCall(customer)}` handlers
- Updated tooltips from "Call {phone}" to "Video call {name}"
- Updated aria-labels for accessibility

### 2. Enhanced Error Handling in Video UI
**Files Modified:**
- `web-frontend/src/components/video/VideoCallWindow.tsx`
- `web-frontend/src/types/video.types.ts`

**Changes:**
- Added graceful handling for JWT generation errors
- Display user-friendly error message when video service is misconfigured
- Made `VideoUrlData` fields optional to support error responses
- Shows active call state even when video streaming is unavailable

## How It Works Now

### Before (Broken):
```tsx
<Button
  as="a"
  href={`tel:${customer.phone}`}
  // This triggers OS phone handler
>
  <FiPhone /> Call
</Button>
```

### After (Fixed):
```tsx
<Button
  onClick={() => onCall(customer)}
  // This triggers video call flow
  title="Video call Customer Name"
>
  <FiPhone /> Call
</Button>
```

## Call Flow

1. **User clicks phone icon**
   - `onClick` handler triggers
   - Calls `handleCall(customer)` from `CustomersPage.tsx`
   
2. **Validation**
   - Checks if customer has `user_id`
   - Shows error if customer is not a registered user
   
3. **Call Initiation**
   - Calls `initiateAudioCall(customer.user_id)`
   - API POST to `/api/jitsi-calls/initiate_call/`
   - Backend creates call session with status='pending'
   
4. **Automatic Detection**
   - `VideoCallManager` polls every 5 seconds
   - Detects new call in database
   - Shows `VideoCallWindow` component
   
5. **UI Display**
   - If JWT error: Shows error message with explanation
   - If JWT valid: Loads JitsiMeeting component for actual video
   - User can answer/reject/end call regardless of JWT status

## Testing

### Test Case 1: Click Call Button on Customer with User Account
**Expected:** 
- ✅ No "select an app" dialog
- ✅ Toast notification: "Call Initiated"
- ✅ `VideoCallWindow` appears after ~5 seconds (polling interval)
- ✅ Shows incoming call UI for recipient

### Test Case 2: Click Call Button on Customer without User Account
**Expected:**
- ✅ No "select an app" dialog
- ✅ Error toast: "Cannot Call - {name} is not a registered user"
- ❌ No call initiated

### Test Case 3: Active Call with JWT Error
**Expected:**
- ✅ Call window appears
- ✅ Shows error message: "Video interface unavailable"
- ✅ Can still end the call
- ✅ Call tracking works (status, duration)

## Known Limitations

### JWT Token Error
- Video streaming requires valid RSA private key in `JITSI_8X8_API_KEY`
- Current error: "Could not parse the provided public key"
- Call management still works (initiate, answer, end, tracking)
- Video interface unavailable until proper RSA key is configured

### Resolution
Add proper RSA private key to `.env`:
```env
JITSI_8X8_API_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"
```

## Files Changed Summary

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `web-frontend/src/components/customers/CustomerTable.tsx` | Modified | ~20 |
| `web-frontend/src/features/customers/components/CustomerTable.tsx` | Modified | ~20 |
| `web-frontend/src/components/video/VideoCallWindow.tsx` | Enhanced | ~30 |
| `web-frontend/src/types/video.types.ts` | Updated | ~5 |

## Verification Checklist

- [x] Phone button no longer triggers "select an app" dialog
- [x] Video call initiation works via API
- [x] Error handling for non-user customers
- [x] JWT error displays user-friendly message
- [x] Call window appears automatically
- [x] Answer/Reject/End buttons functional
- [x] Call status tracking works
- [x] TypeScript types updated correctly

## Status: ✅ COMPLETE

The call button now properly initiates video calls through the backend API instead of triggering system phone handlers. Users will see the video call window automatically after initiating a call (with proper error messages if video streaming is misconfigured).
