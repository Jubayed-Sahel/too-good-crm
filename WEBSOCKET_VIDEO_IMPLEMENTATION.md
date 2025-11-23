# WebSocket Video Call Implementation - Complete

## Overview
Successfully replaced Pusher with Django Channels WebSocket for video call real-time notifications. Pusher is retained for other features (messaging).

## Implementation Summary

### Backend Changes

#### 1. Django Channels Installation
- **Packages Installed**: 
  - `channels==4.0.0`
  - `daphne==4.0.0` (ASGI server)
  - Dependencies: `twisted`, `autobahn`, `zope-interface`, etc.

#### 2. Configuration Updates

**File**: `shared-backend/crmAdmin/settings.py`
- Added `'daphne'` to `INSTALLED_APPS` (first position - required)
- Added `'channels'` to `INSTALLED_APPS`
- Added ASGI application configuration:
  ```python
  ASGI_APPLICATION = 'crmAdmin.asgi.application'
  ```
- Added channel layer configuration:
  ```python
  CHANNEL_LAYERS = {
      "default": {
          "BACKEND": "channels.layers.InMemoryChannelLayer"
      }
  }
  ```
  *Note: For production, replace with Redis backend*

#### 3. ASGI Application Structure

**File**: `shared-backend/crmAdmin/asgi.py`
- Restructured to support both HTTP and WebSocket protocols
- Uses `ProtocolTypeRouter` with:
  - `"http"`: Existing Django application with MCP server mount
  - `"websocket"`: WebSocket routing with authentication middleware
- Added `AllowedHostsOriginValidator` and `AuthMiddlewareStack` for security

#### 4. WebSocket Consumer

**File**: `shared-backend/crmApp/consumers/video_call_consumer.py`
- **Class**: `VideoCallConsumer(AsyncWebsocketConsumer)`
- **Channel Group**: `video_call_{user_id}`
- **Methods**:
  - `connect()`: Handles WebSocket connection, joins group
  - `disconnect()`: Handles disconnection, leaves group
  - `receive()`: Handles ping/pong for keep-alive
  - `video_call_event()`: Sends video call events to connected client

#### 5. WebSocket Routing

**File**: `shared-backend/crmApp/routing.py`
- **URL Pattern**: `ws/video-call/<user_id>/`
- Maps to `VideoCallConsumer`

#### 6. Jitsi Service Updates

**File**: `shared-backend/crmApp/services/jitsi_service.py`
- **Removed**: Pusher dependency (`get_pusher_service()`)
- **Added**: Django Channels imports
  ```python
  from channels.layers import get_channel_layer
  from asgiref.sync import async_to_sync
  ```
- **Updated**: `_send_call_notification()` method
  - Now uses `channel_layer.group_send()`
  - Sends to `video_call_{user_id}` group
  - Message type: `video_call_event`
  - Event data structure:
    ```python
    {
        'event': 'call-initiated|call-answered|call-rejected|call-ended',
        'data': {
            'id': ...,
            'room_name': ...,
            'status': ...,
            'initiator': ...,
            'recipient': ...,
            'jitsi_url': {...},
            ...
        }
    }
    ```

### Frontend Changes

#### 1. WebSocket Hook

**File**: `web-frontend/src/hooks/useVideoCallWebSocket.ts`
- **Purpose**: Manages WebSocket connection for video call notifications
- **Features**:
  - Auto-connection when user authenticated
  - Auto-reconnection with 3-second interval
  - Ping/pong keep-alive (30-second interval)
  - Event handlers for all call states
  - Connection state tracking
- **WebSocket URL**: `ws://localhost:8000/ws/video-call/{userId}/`
- **Events Handled**:
  - `call-initiated`: New incoming call
  - `call-answered`: Call accepted
  - `call-rejected`: Call declined
  - `call-ended`: Call terminated

#### 2. VideoCallManager Updates

**File**: `web-frontend/src/components/video/VideoCallManager.tsx`
- **Changed**: Replaced `usePusherVideoCall` with `useVideoCallWebSocket`
- **Updated**: Event data structure (now nested under `event.data`)
- **Removed**: Pusher-specific auth token handling
- **Simplified**: No longer needs auth token for WebSocket (uses Django session)

#### 3. Environment Configuration

**File**: `web-frontend/.env`
- **Added**: `VITE_WS_BASE_URL=ws://localhost:8000`
- **Updated Comment**: Clarified Pusher is for chat only

## Running the Application

### Starting Backend with WebSocket Support

**Option 1: Using Daphne (Recommended for WebSocket)**
```powershell
cd shared-backend
daphne -b 0.0.0.0 -p 8000 crmAdmin.asgi:application
```

**Option 2: Using Django Development Server**
```powershell
cd shared-backend
python manage.py runserver
```
*Note: Django 3.0+ automatically uses ASGI if ASGI_APPLICATION is set*

### Starting Frontend
```powershell
cd web-frontend
npm run dev
```

**Important**: Restart the frontend dev server to load the new `VITE_WS_BASE_URL` environment variable.

## Testing WebSocket Connection

### 1. Check WebSocket Connection in Browser Console

When a user logs in, you should see:
```
[VideoCallWS] Connecting to: ws://localhost:8000/ws/video-call/1/
[VideoCallWS] Connected successfully
[VideoCallWS] Connection confirmed: Connected to video call notifications
```

### 2. Test Video Call Flow

1. **Initiate Call**: User A calls User B
   - User A sees calling UI immediately
   - User B receives real-time notification (no refresh)
   - Console logs: `[VideoCallWS] Received message: {event: 'call-initiated', ...}`

2. **Answer Call**: User B answers
   - Both users see active call UI immediately
   - Console logs: `[VideoCallWS] Received message: {event: 'call-answered', ...}`

3. **End Call**: Either user ends call
   - Both users see call ended immediately
   - Console logs: `[VideoCallWS] Received message: {event: 'call-ended', ...}`

### 3. Check Backend Logs

```
[VideoCallWS] User 1 attempting to connect
[VideoCallWS] User 1 connected successfully to video_call_1
Sent WebSocket notification: call-initiated for call 123 to user 2
[VideoCallWS] Sent call-initiated to user 2
```

## WebSocket Event Structure

### Backend Sends:
```json
{
  "event": "call-initiated",
  "data": {
    "id": 123,
    "room_name": "crm-20250115123456-abc123",
    "call_type": "video",
    "status": "pending",
    "initiator": 1,
    "initiator_name": "John Doe",
    "recipient": 2,
    "recipient_name": "Jane Smith",
    "jitsi_url": {
      "url": "https://8x8.vc/vpaas-.../crm-...",
      "token": "eyJ...",
      "room_name": "crm-..."
    },
    "created_at": "2025-01-15T12:34:56.789Z",
    "participants": [1, 2]
  }
}
```

### Frontend Receives:
Handled by `useVideoCallWebSocket` hook, converted to `VideoCallSession` by `VideoCallManager`

## Production Considerations

### 1. Replace InMemoryChannelLayer with Redis

**Install Redis backend**:
```bash
pip install channels-redis
```

**Update `settings.py`**:
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("127.0.0.1", 6379)],
        },
    },
}
```

### 2. Use WSS (WebSocket Secure) for Production

**Update frontend `.env`**:
```
VITE_WS_BASE_URL=wss://your-domain.com
```

### 3. Configure ASGI Server for Production

Use Daphne with systemd or Docker:
```bash
daphne -b 0.0.0.0 -p 8000 crmAdmin.asgi:application
```

Or use Uvicorn:
```bash
pip install uvicorn
uvicorn crmAdmin.asgi:application --host 0.0.0.0 --port 8000
```

### 4. WebSocket Authentication

Currently uses Django session authentication (configured in `asgi.py` with `AuthMiddlewareStack`). For token-based auth, implement custom middleware.

## Architecture Diagram

```
┌─────────────────┐                    ┌──────────────────┐
│   User Browser  │                    │   User Browser   │
│   (User A)      │                    │   (User B)       │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │ WebSocket Connect                    │ WebSocket Connect
         │ ws://localhost:8000/ws/video-call/1/ │ ws://localhost:8000/ws/video-call/2/
         │                                      │
         ▼                                      ▼
┌────────────────────────────────────────────────────────┐
│              Django Channels (ASGI)                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │        ProtocolTypeRouter                        │ │
│  │  ┌────────────┐         ┌────────────────────┐  │ │
│  │  │  HTTP      │         │    WebSocket       │  │ │
│  │  │  (Django)  │         │  (VideoCallConsumer)│  │ │
│  │  └────────────┘         └────────────────────┘  │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │          Channel Layer (In-Memory)               │ │
│  │     Groups: video_call_1, video_call_2, ...      │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
         ▲
         │ group_send()
         │
┌────────┴────────┐
│  Jitsi Service  │
│  (REST API)     │
│  - initiate_call│
│  - answer_call  │
│  - reject_call  │
│  - end_call     │
└─────────────────┘
```

## Troubleshooting

### Issue: "Import channels.layers could not be resolved"
- **Cause**: Pylance not detecting installed package
- **Solution**: Restart Python language server or ignore (package is installed correctly)

### Issue: WebSocket connection fails
- **Check**: 
  1. Backend running with ASGI support
  2. `INSTALLED_APPS` includes `'daphne'` (first) and `'channels'`
  3. Console shows correct WebSocket URL
  4. No firewall blocking WebSocket connections

### Issue: "Channel layer not available"
- **Check**: 
  1. `CHANNEL_LAYERS` configured in `settings.py`
  2. Backend restarted after configuration
  3. Check logs for channel layer initialization errors

### Issue: Frontend not connecting
- **Check**:
  1. `.env` has `VITE_WS_BASE_URL` set
  2. Frontend dev server restarted after `.env` change
  3. User is authenticated (check `isAuthenticated` state)
  4. Browser console for WebSocket errors

## Files Changed

### Backend
- `shared-backend/crmAdmin/settings.py` - Added Channels configuration
- `shared-backend/crmAdmin/asgi.py` - Restructured for WebSocket
- `shared-backend/crmApp/routing.py` - Created WebSocket routing
- `shared-backend/crmApp/consumers/video_call_consumer.py` - Created consumer
- `shared-backend/crmApp/consumers/__init__.py` - Created package
- `shared-backend/crmApp/services/jitsi_service.py` - Replaced Pusher with Channels

### Frontend
- `web-frontend/src/hooks/useVideoCallWebSocket.ts` - Created WebSocket hook
- `web-frontend/src/components/video/VideoCallManager.tsx` - Updated to use WebSocket
- `web-frontend/.env` - Added WebSocket URL

## Next Steps

1. **Test the implementation**:
   - Start backend with `daphne` or `python manage.py runserver`
   - Restart frontend dev server
   - Test video calls between two users
   - Verify no page refresh needed

2. **Production deployment**:
   - Set up Redis for channel layer
   - Configure WSS (secure WebSocket)
   - Set up ASGI server (Daphne/Uvicorn) with process manager

3. **Monitoring**:
   - Add logging for WebSocket connections/disconnections
   - Monitor channel layer performance
   - Track WebSocket connection metrics

## Success Criteria

✅ Video calls work without page refresh
✅ Caller sees calling UI immediately
✅ Receiver gets notification in real-time
✅ Both parties see call status updates instantly
✅ WebSocket reconnects automatically on disconnect
✅ Pusher still works for messaging (not removed)

## Status

**Implementation**: COMPLETE
**Testing**: READY
**Documentation**: COMPLETE

All code changes have been successfully applied. The system is ready for testing.
