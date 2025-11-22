# 8x8 Video Integration Setup Guide

## Overview
Your Too Good CRM has been prepared for 8x8 Video (Jitsi Enterprise) integration with proper JWT authentication. This guide explains how to complete the setup.

## What Has Been Done

### Backend Changes ✅
1. **Removed** old Jitsi Meet (meet.jit.si) implementation
2. **Created** new JWT-based 8x8 Video service with RS256 signing
3. **Updated** settings to support 8x8 credentials
4. **Modified** serializers to return JWT tokens with video URLs

### Frontend Changes ✅
1. **Removed** all old Jitsi components, types, and services
2. **Commented out** call button handlers (ready for new implementation)
3. **Cleaned up** imports and references

## Required: Add Your 8x8 Credentials

### Step 1: Get Your Credentials from 8x8 Dashboard

You need three pieces of information from your 8x8 account:

1. **App ID** - Your 8x8 application identifier
2. **API Key (Private Key)** - The RSA private key for JWT signing
3. **Key ID (KID)** - Optional key identifier

### Step 2: Add to .env File

Create or update `shared-backend/.env`:

```bash
# 8x8 Video Configuration
JITSI_8X8_APP_ID=your_app_id_here
JITSI_8X8_API_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
(your full RSA private key)
...
-----END PRIVATE KEY-----
JITSI_8X8_KID=your_key_id_here
JITSI_SERVER=8x8.vc
```

**Important Notes:**
- The API Key should be your **full RSA private key** (including BEGIN/END markers)
- Use multi-line format in .env or escape newlines
- The KID is optional but recommended

### Step 3: Alternative - Direct Settings Configuration

If you prefer, you can add directly to `settings.py` (NOT recommended for production):

```python
JITSI_8X8_APP_ID = 'your_app_id'
JITSI_8X8_API_KEY = '''-----BEGIN PRIVATE KEY-----
Your private key here
-----END PRIVATE KEY-----'''
JITSI_8X8_KID = 'your_key_id'
```

## How JWT Authentication Works

### JWT Token Generation
The backend now generates JWT tokens for each call using your private key:

```python
payload = {
    "iss": "your_app_id",          # Issuer
    "sub": "8x8.vc",                # Subject (8x8 domain)
    "aud": "your_app_id",          # Audience
    "exp": now + 3600,              # Expires in 1 hour
    "room": "crm-20251122-abc123",  # Room name
    "context": {
        "user": {
            "id": "8",
            "name": "Jennifer Thompson",
            "email": "jennifer.thompson8@example.com",
            "moderator": "true"
        }
    }
}
```

### API Response Format
When you initiate a call, you'll now receive:

```json
{
  "call_session": {
    "id": 1,
    "room_name": "crm-20251122-abc123",
    "status": "pending",
    "jitsi_url": {
      "video_url": "https://8x8.vc/your_app_id/crm-20251122-abc123",
      "jwt_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "room_name": "crm-20251122-abc123",
      "app_id": "your_app_id",
      "server_domain": "8x8.vc"
    }
  }
}
```

## Next Steps: Frontend Implementation

### Option 1: 8x8 Video SDK (Recommended)

Install the 8x8 Jitsi Meet SDK:

```bash
cd web-frontend
npm install @jitsi/react-sdk
```

Create a new component:

```typescript
// src/components/video/VideoCall.tsx
import { JitsiMeeting } from '@jitsi/react-sdk';

interface VideoCallProps {
  videoUrl: string;
  jwtToken: string;
  roomName: string;
  userName: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  videoUrl,
  jwtToken,
  roomName,
  userName
}) => {
  return (
    <JitsiMeeting
      domain="8x8.vc"
      roomName={`${appId}/${roomName}`}
      jwt={jwtToken}
      configOverwrite={{
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
      }}
      interfaceConfigOverwrite={{
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'hangup',
          'chat', 'settings'
        ],
      }}
      userInfo={{
        displayName: userName
      }}
      onReadyToClose={() => {
        // Handle call end
      }}
      getIFrameRef={(iframeRef) => {
        iframeRef.style.height = '100%';
      }}
    />
  );
};
```

### Option 2: IFrame Embedding (Alternative)

For simpler implementation, use iframe with JWT:

```typescript
const joinCall = async (callId: number) => {
  const response = await api.get(`/api/jitsi-calls/${callId}/`);
  const { video_url, jwt_token } = response.data.jitsi_url;
  
  // Open in new window or embed
  const callWindow = window.open(
    `${video_url}?jwt=${jwt_token}`,
    'video-call',
    'width=1200,height=800'
  );
};
```

## Testing the Implementation

### 1. Start Backend
```bash
cd shared-backend
python manage.py runserver
```

### 2. Test JWT Generation

```bash
curl -X POST http://localhost:8000/api/jitsi-calls/initiate_call/ \
  -H "Authorization: Token your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id": 15, "call_type": "video"}'
```

You should see a response with `jwt_token` in the `jitsi_url` object.

### 3. Verify JWT Token

Go to https://jwt.io/ and paste your JWT token to verify it's properly signed.

## Troubleshooting

### "8x8 credentials not configured" Error
- Make sure `.env` file exists in `shared-backend/`
- Verify `JITSI_8X8_APP_ID` and `JITSI_8X8_API_KEY` are set
- Restart Django server after adding credentials

### JWT Signing Errors
- Verify your private key format (should include BEGIN/END markers)
- Check that you're using the **API Key** (private key), not the public key
- Ensure no extra spaces or line breaks in the key

### "Invalid JWT" Error from 8x8
- Verify your App ID matches the one in 8x8 dashboard
- Check that your private key corresponds to the public key uploaded to 8x8
- Ensure the JWT hasn't expired (default 1 hour)

## Security Best Practices

1. **Never commit** `.env` file to git
2. **Use environment variables** in production
3. **Rotate keys** periodically
4. **Set appropriate JWT expiration** (default 1 hour is good)
5. **Validate users** before generating JWT tokens

## Support Resources

- **8x8 Video Documentation**: https://docs.8x8.com/8x8WebHelp/video/
- **Jitsi JWT Authentication**: https://jitsi.github.io/handbook/docs/devops-guide/secure-domain
- **PyJWT Library**: https://pyjwt.readthedocs.io/

## Summary

✅ Backend is JWT-ready
✅ API endpoints return JWT tokens
✅ Old Jitsi code removed
🔲 Add your 8x8 credentials to .env
🔲 Implement frontend video component
🔲 Test end-to-end calling

**Need Help?** Share your App ID (it's not sensitive) and let me know if you encounter any issues!
