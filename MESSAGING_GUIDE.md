# Messaging System Guide

## ✅ Yes, you can send messages to vendors, customers, and employees!

I've created a complete messaging system for your CRM. Here's how it works:

---

## 🎯 What's Included

### Backend Components:
1. **Message Model** - Stores messages between users
2. **Conversation Model** - Groups messages into conversations
3. **MessageService** - Business logic for sending/receiving messages
4. **API Endpoints** - REST API for messaging

### Features:
- ✅ Send messages between vendors, customers, and employees
- ✅ Organization-scoped messaging (multi-tenant)
- ✅ Read/unread status tracking
- ✅ Conversation threads
- ✅ Link messages to leads, deals, or customers
- ✅ File attachments support
- ✅ Unread message counts

---

## 📋 Setup Instructions

### 1. Run Database Migrations

```bash
cd shared-backend
python manage.py makemigrations
python manage.py migrate
```

This will create the `messages` and `conversations` tables.

### 2. API Endpoints are Already Registered

The endpoints are automatically available at:
- `/api/messages/` - Message management
- `/api/conversations/` - Conversation management

---

## 🚀 How to Use

### 1. Get Available Recipients

**GET** `/api/messages/recipients/`

Returns list of users you can message:
- **Vendors** can message: employees and customers in their organization
- **Employees** can message: vendors and customers in their organization  
- **Customers** can message: vendors and employees

**Response:**
```json
[
  {
    "id": 123,
    "email": "employee@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
]
```

### 2. Send a Message

**POST** `/api/messages/send/`

**Request Body:**
```json
{
  "recipient_id": 123,
  "content": "Hello! How are you?",
  "subject": "Optional subject",
  "related_lead_id": 456,        // Optional: link to a lead
  "related_deal_id": 789,        // Optional: link to a deal
  "related_customer_id": 101,    // Optional: link to a customer
  "attachments": []              // Optional: file attachments
}
```

**Response:**
```json
{
  "id": 1,
  "sender": {
    "id": 1,
    "email": "vendor@example.com"
  },
  "recipient": {
    "id": 123,
    "email": "employee@example.com"
  },
  "content": "Hello! How are you?",
  "subject": "Optional subject",
  "is_read": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 3. Get Your Messages

**GET** `/api/messages/`

Returns all messages you've sent or received.

**Query Parameters:**
- `?ordering=-created_at` - Sort by newest first (default)

### 4. Get Messages with a Specific User

**GET** `/api/messages/with_user/?user_id=123`

Returns conversation thread with a specific user.

### 5. Mark Message as Read

**POST** `/api/messages/{id}/mark_read/`

Marks a message as read and updates unread counts.

### 6. Get Unread Count

**GET** `/api/messages/unread_count/`

Returns total unread messages:
```json
{
  "unread_count": 5
}
```

### 7. Get All Conversations

**GET** `/api/conversations/`

Returns all your conversations with other users, sorted by most recent message.

**Response:**
```json
[
  {
    "id": 1,
    "participant1": {...},
    "participant2": {...},
    "other_participant": {
      "id": 123,
      "email": "employee@example.com"
    },
    "last_message": {
      "content": "Hello!",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "unread_count": 2,
    "last_message_at": "2024-01-15T10:30:00Z"
  }
]
```

---

## 💻 Frontend Integration Example

### React Hook for Messaging

```typescript
// src/hooks/useMessages.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';

export const useMessages = () => {
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
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useRecipients = () => {
  return useQuery({
    queryKey: ['message-recipients'],
    queryFn: () => api.get('/api/messages/recipients/'),
  });
};

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/api/conversations/'),
  });
};
```

### Send Message Component

```typescript
// src/components/messages/SendMessageDialog.tsx
import { useState } from 'react';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../ui/dialog';
import { Button, Input, Textarea, Select } from '@chakra-ui/react';
import { useSendMessage, useRecipients } from '@/hooks/useMessages';
import { toaster } from '../ui/toaster';

export const SendMessageDialog = ({ isOpen, onClose }) => {
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  
  const { data: recipients } = useRecipients();
  const sendMessage = useSendMessage();
  
  const handleSend = async () => {
    if (!recipientId || !content.trim()) {
      toaster.create({
        title: 'Error',
        description: 'Please select a recipient and enter a message',
        type: 'error',
      });
      return;
    }
    
    try {
      await sendMessage.mutateAsync({
        recipient_id: recipientId,
        content,
        subject: subject || undefined,
      });
      
      toaster.create({
        title: 'Success',
        description: 'Message sent successfully',
        type: 'success',
      });
      
      setContent('');
      setSubject('');
      onClose();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Failed to send message',
        type: 'error',
      });
    }
  };
  
  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Select
            placeholder="Select recipient"
            value={recipientId || ''}
            onChange={(e) => setRecipientId(Number(e.target.value))}
          >
            {recipients?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} ({user.first_name} {user.last_name})
              </option>
            ))}
          </Select>
          
          <Input
            placeholder="Subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            mt={4}
          />
          
          <Textarea
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            mt={4}
          />
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={sendMessage.isPending || !recipientId || !content.trim()}
            loading={sendMessage.isPending}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};
```

---

## 🔐 Permissions

The messaging system respects your existing RBAC:
- Users can only message people in their organization
- Vendors can message employees and customers
- Employees can message vendors and customers
- Customers can message vendors and employees

---

## 📊 Database Schema

### Messages Table
- `sender` - User who sent the message
- `recipient` - User who receives the message
- `content` - Message text
- `subject` - Optional subject
- `organization` - Organization context
- `is_read` - Read status
- `related_lead`, `related_deal`, `related_customer` - Optional links

### Conversations Table
- `participant1`, `participant2` - The two users in conversation
- `organization` - Organization context
- `last_message` - Most recent message
- `unread_count_participant1`, `unread_count_participant2` - Unread counts

---

## 🎨 Next Steps

1. **Run migrations** to create the tables
2. **Test the API** using Postman or your frontend
3. **Create frontend components** using the examples above
4. **Add real-time updates** using Django Channels (optional)
5. **Add file uploads** for attachments (optional)

---

## ❓ Common Questions

**Q: Can vendors message other vendors?**  
A: Currently, no. Vendors can only message employees and customers in their organization. This can be customized in `MessageService.get_available_recipients()`.

**Q: Can I send messages to users outside my organization?**  
A: No, messages are organization-scoped for security and data isolation.

**Q: How do I add file attachments?**  
A: The `attachments` field accepts a list of objects. You'll need to:
1. Upload files to your media storage
2. Pass file URLs/metadata in the `attachments` array

**Q: Can I add real-time messaging?**  
A: Yes! You can integrate Django Channels (see previous chat integration guide) to make messages appear instantly.

---

## 🚀 Quick Test

1. **Get recipients:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/messages/recipients/
```

2. **Send a message:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 123,
    "content": "Hello! This is a test message."
  }' \
  http://localhost:8000/api/messages/send/
```

3. **Get messages:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/messages/
```

---

That's it! You now have a complete messaging system. 🎉

