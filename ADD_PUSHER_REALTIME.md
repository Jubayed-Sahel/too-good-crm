# Adding Pusher for Real-Time Messaging

## Current Status

**The messaging system I created does NOT use Pusher yet.** 

It's currently a **REST API-based system** where:
- Messages are stored in the database
- You need to poll/refresh to see new messages
- Not real-time (messages don't appear instantly)

## Adding Pusher for Real-Time Updates

Here's how to integrate Pusher to make messages appear instantly:

---

## 🚀 Step 1: Install Pusher

### Backend (Django)

```bash
cd shared-backend
pip install pusher
```

### Frontend (React)

```bash
cd web-frontend
npm install pusher-js
```

---

## 🔧 Step 2: Backend Setup

### 1. Get Pusher Credentials

1. Sign up at [pusher.com](https://pusher.com) (free tier available)
2. Create a new app
3. Get your credentials:
   - `app_id`
   - `key`
   - `secret`
   - `cluster` (e.g., "us2")

### 2. Add to Settings

Add to `shared-backend/crmAdmin/settings.py`:

```python
# Pusher Configuration
PUSHER_APP_ID = os.getenv('PUSHER_APP_ID', '')
PUSHER_KEY = os.getenv('PUSHER_KEY', '')
PUSHER_SECRET = os.getenv('PUSHER_SECRET', '')
PUSHER_CLUSTER = os.getenv('PUSHER_CLUSTER', 'us2')
```

Add to your `.env` file:
```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=us2
```

### 3. Create Pusher Service

Create `shared-backend/crmApp/services/pusher_service.py`:

```python
"""
Pusher Service for Real-Time Messaging
"""
import pusher
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class PusherService:
    """Service for sending real-time updates via Pusher"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._pusher = None
        return cls._instance
    
    @property
    def pusher(self):
        """Get or create Pusher client"""
        if self._pusher is None:
            try:
                self._pusher = pusher.Pusher(
                    app_id=settings.PUSHER_APP_ID,
                    key=settings.PUSHER_KEY,
                    secret=settings.PUSHER_SECRET,
                    cluster=settings.PUSHER_CLUSTER,
                    ssl=True
                )
            except Exception as e:
                logger.error(f"Failed to initialize Pusher: {e}")
                self._pusher = None
        return self._pusher
    
    def send_message(self, message, sender, recipient):
        """
        Send real-time message notification
        
        Args:
            message: Message object
            sender: User who sent the message
            recipient: User who receives the message
        """
        if not self.pusher:
            return
        
        try:
            # Send to recipient's private channel
            channel_name = f'private-user-{recipient.id}'
            
            self.pusher.trigger(channel_name, 'new-message', {
                'id': message.id,
                'sender': {
                    'id': sender.id,
                    'email': sender.email,
                    'first_name': sender.first_name,
                    'last_name': sender.last_name,
                },
                'content': message.content,
                'subject': message.subject,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read,
            })
            
            # Also update conversation list
            self.pusher.trigger(channel_name, 'conversation-updated', {
                'conversation_id': message.organization.id if message.organization else None,
                'last_message': {
                    'content': message.content,
                    'created_at': message.created_at.isoformat(),
                }
            })
            
        except Exception as e:
            logger.error(f"Failed to send Pusher message: {e}")
    
    def mark_message_read(self, message, user):
        """Notify when message is marked as read"""
        if not self.pusher:
            return
        
        try:
            channel_name = f'private-user-{message.sender.id}'
            self.pusher.trigger(channel_name, 'message-read', {
                'message_id': message.id,
                'read_by': user.id,
            })
        except Exception as e:
            logger.error(f"Failed to send read notification: {e}")


# Singleton instance
pusher_service = PusherService()
```

### 4. Update Message Service

Update `shared-backend/crmApp/services/message_service.py`:

```python
# At the top, add:
from crmApp.services.pusher_service import pusher_service

# In the send_message method, after creating the message:
def send_message(...):
    # ... existing code to create message ...
    
    # Send real-time notification via Pusher
    pusher_service.send_message(message, sender, recipient)
    
    return message
```

### 5. Update Message ViewSet

Update `shared-backend/crmApp/viewsets/message.py`:

```python
# In mark_read action, after marking as read:
@action(detail=True, methods=['post'])
def mark_read(self, request, pk=None):
    message = self.get_object()
    MessageService.mark_as_read(message, request.user)
    
    # Send real-time notification
    from crmApp.services.pusher_service import pusher_service
    pusher_service.mark_message_read(message, request.user)
    
    return Response(MessageSerializer(message, context={'request': request}).data)
```

---

## 🎨 Step 3: Frontend Setup

### 1. Create Pusher Hook

Create `web-frontend/src/hooks/usePusher.ts`:

```typescript
import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'us2';

let pusherInstance: Pusher | null = null;

export const getPusherInstance = () => {
  if (!pusherInstance && PUSHER_KEY) {
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth/', // We'll create this endpoint
    });
  }
  return pusherInstance;
};

export const usePusherChannel = (
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) => {
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const pusher = getPusherInstance();
    if (!pusher) return;

    pusherRef.current = pusher;

    // Subscribe to private channel
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Bind to event
    channel.bind(eventName, callback);

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind(eventName, callback);
        pusher.unsubscribe(channelName);
      }
    };
  }, [channelName, eventName]);

  return { pusher: pusherRef.current, channel: channelRef.current };
};
```

### 2. Create Pusher Auth Endpoint

Create `shared-backend/crmApp/views/pusher_auth.py`:

```python
"""
Pusher Authentication Endpoint
Required for private channels
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import pusher
from django.conf import settings
import hashlib
import hmac

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pusher_auth(request):
    """
    Authenticate Pusher private channel subscription
    
    POST /api/pusher/auth/
    {
        "socket_id": "123.456",
        "channel_name": "private-user-123"
    }
    """
    socket_id = request.data.get('socket_id')
    channel_name = request.data.get('channel_name')
    
    if not socket_id or not channel_name:
        return Response(
            {'error': 'socket_id and channel_name are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify user can access this channel
    if channel_name.startswith('private-user-'):
        user_id = int(channel_name.split('-')[-1])
        if user_id != request.user.id:
            return Response(
                {'error': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    # Generate auth signature
    pusher_client = pusher.Pusher(
        app_id=settings.PUSHER_APP_ID,
        key=settings.PUSHER_KEY,
        secret=settings.PUSHER_SECRET,
        cluster=settings.PUSHER_CLUSTER,
        ssl=True
    )
    
    auth = pusher_client.authenticate(
        channel=channel_name,
        socket_id=socket_id
    )
    
    return Response(auth)
```

Add to `shared-backend/crmApp/urls.py`:

```python
from crmApp.views.pusher_auth import pusher_auth

urlpatterns = [
    # ... existing patterns ...
    path('api/pusher/auth/', pusher_auth, name='pusher-auth'),
    # ... rest of patterns ...
]
```

### 3. Update Messages Hook

Update `web-frontend/src/hooks/useMessages.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import api from '@/lib/apiClient';
import { usePusherChannel } from './usePusher';
import { useAuth } from './useAuth';

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Subscribe to real-time updates
  const channelName = user ? `private-user-${user.id}` : null;
  
  usePusherChannel(
    channelName || '',
    'new-message',
    (data: any) => {
      // Invalidate queries to refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Optional: Show notification
      console.log('New message received:', data);
    }
  );
  
  return useQuery({
    queryKey: ['messages'],
    queryFn: () => api.get('/api/messages/'),
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      recipient_id: number;
      content: string;
      subject?: string;
    }) => api.post('/api/messages/send/', data),
    onSuccess: () => {
      // Pusher will handle real-time updates, but we can still invalidate
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
```

### 4. Add Environment Variables

Add to `web-frontend/.env`:

```env
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=us2
```

---

## ✅ How It Works

### Flow:

1. **User sends message** → Backend saves to database
2. **Backend sends Pusher event** → Pusher broadcasts to recipient
3. **Frontend receives event** → Updates UI instantly
4. **No polling needed** → Messages appear in real-time

### Channels:

- `private-user-{user_id}` - Private channel for each user
- Events:
  - `new-message` - When a new message arrives
  - `message-read` - When a message is read
  - `conversation-updated` - When conversation list updates

---

## 🎯 Benefits

✅ **Real-time** - Messages appear instantly  
✅ **No polling** - Saves bandwidth and server resources  
✅ **Scalable** - Pusher handles the infrastructure  
✅ **Easy to use** - Simple API integration  

---

## 💰 Cost

**Pusher Free Tier:**
- 200,000 messages/day
- 100 concurrent connections
- 100 channels

**For most CRMs, this is enough!**

---

## 🔄 Alternative: Without Pusher

If you don't want to use Pusher, you can:

1. **Poll for new messages** (simpler, but less efficient):
```typescript
// Poll every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

2. **Use Django Channels** (more complex, but free):
   - See the Django Channels guide we discussed earlier
   - Requires Redis setup
   - More control, but more setup

---

## 📝 Summary

**Current System:** REST API (not real-time)  
**With Pusher:** Real-time messaging (messages appear instantly)  
**Cost:** Free tier available (200k messages/day)  
**Setup Time:** ~30 minutes  

The messaging system works without Pusher, but adding Pusher makes it real-time! 🚀

