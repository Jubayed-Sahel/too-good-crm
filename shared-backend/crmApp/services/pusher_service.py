"""
Pusher Service for Real-Time Messaging
"""
from django.conf import settings
from django.db import models
import logging

logger = logging.getLogger(__name__)

# Try to import pusher, but handle gracefully if not installed
try:
    import pusher
    PUSHER_AVAILABLE = True
except ImportError:
    PUSHER_AVAILABLE = False
    pusher = None
    logger.warning("Pusher package not installed. Real-time messaging will be disabled.")

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
        if not PUSHER_AVAILABLE:
            return None
            
        if self._pusher is None:
            try:
                app_id = getattr(settings, 'PUSHER_APP_ID', None)
                key = getattr(settings, 'PUSHER_KEY', None)
                secret = getattr(settings, 'PUSHER_SECRET', None)
                cluster = getattr(settings, 'PUSHER_CLUSTER', 'ap2')
                
                if not all([app_id, key, secret]):
                    logger.warning("Pusher credentials not configured. Real-time messaging will be disabled.")
                    return None
                
                self._pusher = pusher.Pusher(
                    app_id=app_id,
                    key=key,
                    secret=secret,
                    cluster=cluster,
                    ssl=True
                )
                logger.info("Pusher client initialized successfully")
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
            logger.debug("Pusher not available, skipping real-time notification")
            return
        
        try:
            # Send to recipient's private channel
            channel_name = f'private-user-{recipient.id}'
            
            message_data = {
                'message': {
                    'id': message.id,
                    'sender_id': sender.id,
                    'recipient_id': recipient.id,
                    'content': message.content,
                    'subject': message.subject,
                    'created_at': message.created_at.isoformat() if message.created_at else None,
                    'is_read': message.is_read,
                    'organization_id': message.organization.id if message.organization else None,
                },
                'sender': {
                    'id': sender.id,
                    'email': sender.email,
                    'first_name': getattr(sender, 'first_name', ''),
                    'last_name': getattr(sender, 'last_name', ''),
                },
            }
            
            # Send to recipient
            self.pusher.trigger(channel_name, 'new-message', message_data)
            logger.info(f"Sent Pusher notification for message {message.id} to user {recipient.id}")
            
            # Also send to sender so they see their message immediately
            sender_channel = f'private-user-{sender.id}'
            self.pusher.trigger(sender_channel, 'new-message', message_data)
            logger.info(f"Sent Pusher notification for message {message.id} to sender {sender.id}")
            
            # Also update conversation list for recipient
            # Get conversation ID from the conversation that contains this message
            conversation_id = None
            try:
                from crmApp.models import Conversation
                conversation = Conversation.objects.filter(
                    models.Q(participant1=sender, participant2=recipient) |
                    models.Q(participant1=recipient, participant2=sender),
                    organization=message.organization
                ).first()
                if conversation:
                    conversation_id = conversation.id
            except Exception:
                pass
            
            self.pusher.trigger(channel_name, 'conversation-updated', {
                'conversation_id': conversation_id,
                'last_message': {
                    'content': message.content,
                    'created_at': message.created_at.isoformat() if message.created_at else None,
                },
                'sender_id': sender.id,
                'message': {
                    'sender_id': sender.id,
                    'recipient_id': recipient.id,
                },
            })
            
        except Exception as e:
            logger.error(f"Failed to send Pusher message: {e}", exc_info=True)
    
    def mark_message_read(self, message, user):
        """Notify when message is marked as read"""
        if not self.pusher:
            return
        
        try:
            # Notify the sender that their message was read
            channel_name = f'private-user-{message.sender.id}'
            self.pusher.trigger(channel_name, 'message-read', {
                'message_id': message.id,
                'read_by': user.id,
                'read_at': message.read_at.isoformat() if message.read_at else None,
            })
            logger.info(f"Sent read notification for message {message.id}")
        except Exception as e:
            logger.error(f"Failed to send read notification: {e}", exc_info=True)
    
    def send_unread_count_update(self, user, unread_count):
        """Send unread message count update"""
        if not self.pusher:
            return
        
        try:
            channel_name = f'private-user-{user.id}'
            self.pusher.trigger(channel_name, 'unread-count-updated', {
                'unread_count': unread_count,
            })
        except Exception as e:
            logger.error(f"Failed to send unread count update: {e}", exc_info=True)


# Singleton instance
pusher_service = PusherService()

