# Jitsi Meet Integration Guide

## Overview

This CRM now supports **in-app video/audio calling** between users using **Jitsi Meet**. Unlike the previous Twilio integration (which called external phone numbers), this system enables direct browser-based calls between CRM users.

## Architecture

### Backend Components

1. **Models** (`crmApp/models/jitsi_call.py`):
   - `JitsiCallSession`: Tracks call sessions with room names, participants, status, and duration
   - `UserPresence`: Tracks user online status, availability, and current call state

2. **Service Layer** (`crmApp/services/jitsi_service.py`):
   - `JitsiService`: Singleton service handling call logic, room generation, and status management

3. **API Endpoints**:
   - **Call Management**:
     - `POST /api/jitsi-calls/initiate_call/` - Start a new call
     - `POST /api/jitsi-calls/{id}/update_status/` - Answer/reject/end call
     - `GET /api/jitsi-calls/active_calls/` - List active calls
     - `GET /api/jitsi-calls/my_active_call/` - Get user's current call
   
   - **Presence Management**:
     - `GET /api/user-presence/online_users/` - List available users
     - `POST /api/user-presence/update_my_status/` - Update status
     - `POST /api/user-presence/heartbeat/` - Keep-alive ping

### Database Schema

**jitsi_call_sessions**:
```sql
- id (PK)
- room_name (unique) - Jitsi room identifier
- session_id (UUID) - Unique session ID
- call_type (audio/video)
- status (pending/ringing/active/completed/missed/rejected/cancelled/failed)
- initiator (FK to User)
- recipient (FK to User)
- participants (JSON array)
- started_at, ended_at, duration_seconds
- organization (FK)
- created_at, updated_at
```

**user_presence**:
```sql
- id (PK)
- user (OneToOne FK)
- status (online/busy/away/offline)
- last_seen
- available_for_calls (boolean)
- current_call (FK to JitsiCallSession, nullable)
- status_message
- created_at, updated_at
```

## Test Users

Test users have been created for immediate testing:

### Available Users
| Username | Email | Password | Status |
|----------|-------|----------|--------|
| testuser4 | testuser4@example.com | testpass123 | Online |
| calluser4 | calluser4@example.com | testpass123 | Online |
| calluser8 | calluser8@example.com | testpass123 | Online |

**Organization**: Test Organization

All other test users (testuser3, testuser5, testuser6, calluser1-10) are also available with various statuses (busy, away, offline).

## API Usage Examples

### 1. Login
```bash
POST /api/login/
Content-Type: application/json

{
  "username": "testuser4",
  "password": "testpass123"
}

Response:
{
  "token": "abc123...",
  "user": {...}
}
```

### 2. Update Your Status to Online
```bash
POST /api/user-presence/update_my_status/
Authorization: Token abc123...
Content-Type: application/json

{
  "status": "online",
  "available_for_calls": true,
  "status_message": "Available"
}
```

### 3. Get Online Users
```bash
GET /api/user-presence/online_users/
Authorization: Token abc123...

Response:
[
  {
    "id": 1,
    "username": "calluser8",
    "email": "calluser8@example.com",
    "first_name": "Test",
    "last_name": "User 8",
    "status": "online",
    "is_available": true
  }
]
```

### 4. Initiate a Call
```bash
POST /api/jitsi-calls/initiate_call/
Authorization: Token abc123...
Content-Type: application/json

{
  "recipient_id": 2,
  "call_type": "video"
}

Response:
{
  "id": 1,
  "room_name": "crm-1234567890-abc123",
  "session_id": "uuid-here",
  "call_type": "video",
  "status": "ringing",
  "initiator": {...},
  "recipient": {...},
  "jitsi_url": "https://meet.jit.si/crm-1234567890-abc123",
  "started_at": "2024-01-15T10:30:00Z"
}
```

### 5. Answer a Call
```bash
POST /api/jitsi-calls/{call_id}/update_status/
Authorization: Token abc123...
Content-Type: application/json

{
  "action": "answer"
}

Response:
{
  "id": 1,
  "status": "active",
  "jitsi_url": "https://meet.jit.si/crm-1234567890-abc123",
  ...
}
```

### 6. End a Call
```bash
POST /api/jitsi-calls/{call_id}/update_status/
Authorization: Token abc123...
Content-Type: application/json

{
  "action": "end"
}

Response:
{
  "id": 1,
  "status": "completed",
  "duration_formatted": "05:32",
  "duration_seconds": 332,
  ...
}
```

### 7. Heartbeat (Keep-Alive)
```bash
POST /api/user-presence/heartbeat/
Authorization: Token abc123...

Response:
{
  "status": "online",
  "last_seen": "2024-01-15T10:35:00Z",
  "is_online": true
}
```

## Call Flow

### Initiating User (Caller)
1. Login and get auth token
2. Update status to "online" and `available_for_calls: true`
3. Get list of online users
4. Call `POST /api/jitsi-calls/initiate_call/` with `recipient_id`
5. Receive `jitsi_url` in response
6. Open Jitsi URL in iframe or new window
7. Call status is automatically set to "active" when answered

### Receiving User (Callee)
1. Login and be online/available
2. Receive notification of incoming call (via polling or WebSocket)
3. Call `POST /api/jitsi-calls/{id}/update_status/` with `action: "answer"`
4. Receive `jitsi_url` in response
5. Open Jitsi URL to join the call
6. Or call with `action: "reject"` to decline

### Ending Call
Either user calls:
```bash
POST /api/jitsi-calls/{id}/update_status/
{"action": "end"}
```

## Frontend Integration (TODO)

### React Component Example
```typescript
// JitsiMeetComponent.tsx
import React, { useEffect, useRef } from 'react';

interface JitsiMeetProps {
  roomName: string;
  userName: string;
  onCallEnd?: () => void;
}

export const JitsiMeetComponent: React.FC<JitsiMeetProps> = ({
  roomName,
  userName,
  onCallEnd
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const jitsiUrl = `https://meet.jit.si/${roomName}#userInfo.displayName="${encodeURIComponent(userName)}"`;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        ref={iframeRef}
        src={jitsiUrl}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};
```

### Service Layer Example
```typescript
// services/jitsi.service.ts
import axios from 'axios';

const API_BASE = '/api';

export class JitsiService {
  async getOnlineUsers(token: string) {
    const response = await axios.get(`${API_BASE}/user-presence/online_users/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  }

  async initiateCall(recipientId: number, callType: 'audio' | 'video', token: string) {
    const response = await axios.post(
      `${API_BASE}/jitsi-calls/initiate_call/`,
      { recipient_id: recipientId, call_type: callType },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  }

  async answerCall(callId: number, token: string) {
    const response = await axios.post(
      `${API_BASE}/jitsi-calls/${callId}/update_status/`,
      { action: 'answer' },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  }

  async endCall(callId: number, token: string) {
    const response = await axios.post(
      `${API_BASE}/jitsi-calls/${callId}/update_status/`,
      { action: 'end' },
      { headers: { Authorization: `Token ${token}` } }
    );
    return response.data;
  }

  async sendHeartbeat(token: string) {
    await axios.post(
      `${API_BASE}/user-presence/heartbeat/`,
      {},
      { headers: { Authorization: `Token ${token}` } }
    );
  }
}

export const jitsiService = new JitsiService();
```

## User Presence System

The system tracks user presence with a 5-minute timeout:
- User is considered **online** if `last_seen` is within 5 minutes
- User is **available for calls** if:
  - Status is "online"
  - `available_for_calls` is true
  - Not currently in another call

Frontend should send heartbeat every 60 seconds to maintain online status:
```typescript
setInterval(() => {
  jitsiService.sendHeartbeat(userToken);
}, 60000); // Every 60 seconds
```

## Configuration

### Jitsi Server
Default: `https://meet.jit.si` (public server)

To use a custom Jitsi server, update `JitsiService.get_jitsi_url()`:
```python
# In jitsi_service.py
JITSI_SERVER = getattr(settings, 'JITSI_SERVER', 'https://meet.jit.si')
```

### Security Considerations

1. **Public Server**: The default `meet.jit.si` is public. Anyone with the room name can join.
2. **Room Names**: Generated with timestamp + random hash for uniqueness
3. **Organization Scoping**: All calls are scoped to organizations
4. **Future Enhancement**: Add JWT authentication for private Jitsi servers

### Self-Hosted Jitsi (Optional)

For production, consider:
1. Set up your own Jitsi server
2. Enable JWT authentication
3. Configure in Django settings:
```python
# settings.py
JITSI_SERVER = 'https://meet.yourcompany.com'
JITSI_APP_ID = 'your-app-id'
JITSI_APP_SECRET = 'your-secret'
```

## Management Commands

### Create Test Users
```bash
python manage.py create_test_users --count=5
python manage.py create_test_users --count=10 --prefix=demo
python manage.py create_test_users --organization="My Company"
```

## Testing Workflow

1. **Start Django server**:
```bash
cd shared-backend
python manage.py runserver
```

2. **Login as User 1** (testuser4):
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser4","password":"testpass123"}'
```

3. **Login as User 2** (calluser8) in another browser/session

4. **User 1 initiates call to User 2**:
```bash
curl -X POST http://localhost:8000/api/jitsi-calls/initiate_call/ \
  -H "Authorization: Token <user1-token>" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":<user2-id>,"call_type":"video"}'
```

5. **User 2 answers the call**:
```bash
curl -X POST http://localhost:8000/api/jitsi-calls/<call-id>/update_status/ \
  -H "Authorization: Token <user2-token>" \
  -H "Content-Type: application/json" \
  -d '{"action":"answer"}'
```

6. **Both users open the returned `jitsi_url` in their browsers**

7. **Either user ends the call**:
```bash
curl -X POST http://localhost:8000/api/jitsi-calls/<call-id>/update_status/ \
  -H "Authorization: Token <user-token>" \
  -H "Content-Type: application/json" \
  -d '{"action":"end"}'
```

## Next Steps

### Frontend Development (Required)
- [ ] Create `JitsiMeetComponent.tsx` with iframe integration
- [ ] Create `OnlineUsersPage.tsx` showing available users
- [ ] Add call buttons to user list
- [ ] Implement incoming call notifications/modal
- [ ] Add heartbeat mechanism (60-second interval)
- [ ] Handle call state management in Redux/Context

### Real-Time Notifications (Recommended)
- [ ] Set up Django Channels for WebSocket support
- [ ] Push incoming call events to recipient
- [ ] Push call status updates (answered, ended, missed)
- [ ] Push presence updates (user went online/offline)

### UI/UX Enhancements
- [ ] Ringtone for incoming calls
- [ ] Call duration timer
- [ ] Screen sharing controls
- [ ] Call history/logs page
- [ ] User avatars and status indicators

### Production Readiness
- [ ] Set up self-hosted Jitsi server
- [ ] Enable JWT authentication
- [ ] Add call recording (if needed)
- [ ] Add call quality monitoring
- [ ] Rate limiting on call endpoints
- [ ] Pagination for online users list

## Troubleshooting

### User not showing as online
- Check if heartbeat is being sent regularly
- Verify `last_seen` timestamp (must be < 5 minutes old)
- Check `available_for_calls` is true

### Call initiation fails
- Verify recipient is online and available
- Check both users are in the same organization
- Ensure recipient is not in another active call

### Jitsi iframe not loading
- Check browser console for CORS errors
- Verify Jitsi server is accessible
- Ensure iframe `allow` attributes include camera/microphone

### Call doesn't end properly
- Check both users call the `end` action
- Verify call status updates to "completed"
- Check `duration_seconds` is calculated

## API Reference

See full API documentation in:
- [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)

## Migration from Twilio

The previous Twilio integration has been replaced with Jitsi:
- **Old**: Called external phone numbers via Twilio VOIP
- **New**: In-app browser calls between CRM users via Jitsi Meet
- **Old Model**: `Call` model (still exists for backwards compatibility)
- **New Model**: `JitsiCallSession` (separate model for Jitsi)

Old Twilio endpoints still exist at `/api/calls/` but are deprecated.

---

**Status**: ✅ Backend Complete | ⏳ Frontend Pending | 🧪 Ready for Testing
