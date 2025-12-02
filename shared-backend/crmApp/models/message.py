"""
Message Model
Handles direct messaging between users (vendors, customers, employees)
Also handles Gemini AI conversation persistence
"""

from django.db import models
from django.contrib.auth import get_user_model
from .base import TimestampedModel

User = get_user_model()


class Message(TimestampedModel):
    """
    Direct message between users
    Supports messaging between vendors, customers, and employees
    """
    
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('system', 'System'),
        ('notification', 'Notification'),
    ]
    
    # Sender and recipient
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text="User who sent the message"
    )
    
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        help_text="User who receives the message"
    )
    
    # Message content
    message_type = models.CharField(
        max_length=20,
        choices=MESSAGE_TYPES,
        default='text',
        help_text="Type of message"
    )
    
    subject = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Optional message subject"
    )
    
    content = models.TextField(
        help_text="Message content"
    )
    
    # Organization context (for multi-tenant isolation)
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='messages',
        null=True,
        blank=True,
        help_text="Organization context for the message"
    )
    
    # Status tracking
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the message has been read"
    )
    
    read_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the message was read"
    )
    
    # Optional: Link to related entities
    related_lead = models.ForeignKey(
        'Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        help_text="Related lead (if message is about a lead)"
    )
    
    related_deal = models.ForeignKey(
        'Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        help_text="Related deal (if message is about a deal)"
    )
    
    related_customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='messages',
        help_text="Related customer (if message is about a customer)"
    )
    
    # Attachments (stored as JSON)
    attachments = models.JSONField(
        default=list,
        blank=True,
        help_text="List of file attachments"
    )
    
    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', 'recipient']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['organization']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.email} to {self.recipient.email}"
    
    def mark_as_read(self):
        """Mark message as read"""
        from django.utils import timezone
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=['is_read', 'read_at'])


class GeminiConversation(TimestampedModel):
    """
    Stores conversation history with Gemini AI assistant
    Persists chat messages for later retrieval
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='gemini_conversations',
        help_text="User who owns this conversation"
    )
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='gemini_conversations',
        null=True,
        blank=True,
        help_text="Organization context"
    )
    
    conversation_id = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique conversation identifier (UUID)"
    )
    
    title = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Conversation title (auto-generated from first message)"
    )
    
    messages = models.JSONField(
        default=list,
        help_text="Array of messages [{role, content, timestamp}]"
    )
    
    last_message_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of last message"
    )
    
    class Meta:
        db_table = 'gemini_conversations'
        verbose_name = 'Gemini Conversation'
        verbose_name_plural = 'Gemini Conversations'
        ordering = ['-last_message_at']
        indexes = [
            models.Index(fields=['user', 'organization']),
            models.Index(fields=['conversation_id']),
        ]
    
    def __str__(self):
        title = self.title or f"Conversation {self.conversation_id[:8]}"
        return f"{self.user.email} - {title}"
    
    def add_message(self, role: str, content: str):
        """Add a message to the conversation"""
        from django.utils import timezone
        
        if not self.messages:
            self.messages = []
        
        self.messages.append({
            'role': role,
            'content': content,
            'timestamp': timezone.now().isoformat()
        })
        
        # Auto-generate title from first user message
        if not self.title and role == 'user':
            # Take first 50 chars of first message as title
            self.title = content[:50] + ('...' if len(content) > 50 else '')
        
        self.save()


class Conversation(TimestampedModel):
    """
    Represents a conversation thread between two users
    Groups messages for easier management
    """
    
    participant1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant1'
    )
    
    participant2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='conversations_as_participant2'
    )
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True
    )
    
    last_message = models.ForeignKey(
        Message,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversation_last'
    )
    
    last_message_at = models.DateTimeField(
        null=True,
        blank=True
    )
    
    # Unread count for each participant
    unread_count_participant1 = models.IntegerField(default=0)
    unread_count_participant2 = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        unique_together = [['participant1', 'participant2', 'organization']]
        ordering = ['-last_message_at']
    
    def __str__(self):
        return f"Conversation: {self.participant1.email} <-> {self.participant2.email}"
    
    def get_other_participant(self, user):
        """Get the other participant in the conversation"""
        if user == self.participant1:
            return self.participant2
        return self.participant1
    
    def get_unread_count(self, user):
        """Get unread count for a specific user"""
        if user == self.participant1:
            return self.unread_count_participant1
        return self.unread_count_participant2
    
    def update_unread_count(self, user, count):
        """Update unread count for a user"""
        if user == self.participant1:
            self.unread_count_participant1 = count
        else:
            self.unread_count_participant2 = count
        self.save(update_fields=['unread_count_participant1', 'unread_count_participant2'])

