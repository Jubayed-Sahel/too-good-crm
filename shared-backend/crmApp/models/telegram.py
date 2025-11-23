"""
Telegram Bot Integration Models
Maps Telegram chat IDs to CRM users for authentication
"""
from django.db import models
from django.utils import timezone
from .base import TimestampedModel


class TelegramUser(TimestampedModel):
    """
    Maps Telegram chat_id to CRM User.
    Handles authentication flow for Telegram bot users.
    """
    # Telegram user information
    chat_id = models.BigIntegerField(unique=True, db_index=True)
    telegram_username = models.CharField(max_length=100, null=True, blank=True)
    telegram_first_name = models.CharField(max_length=100, null=True, blank=True)
    telegram_last_name = models.CharField(max_length=100, null=True, blank=True)
    
    # CRM user mapping
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='telegram_accounts',
        null=True,
        blank=True
    )
    
    # Profile selection (which organization/role context to use)
    selected_profile = models.ForeignKey(
        'UserProfile',
        on_delete=models.SET_NULL,
        related_name='telegram_users',
        null=True,
        blank=True,
        help_text='The active profile/organization context for this Telegram user'
    )
    
    # Authentication state
    is_authenticated = models.BooleanField(default=False)
    pending_email = models.EmailField(null=True, blank=True)  # During auth flow
    auth_code = models.CharField(max_length=10, null=True, blank=True)  # Temporary auth code
    auth_code_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Conversation state (for multi-step flows)
    conversation_state = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        choices=[
            ('waiting_for_email', 'Waiting for email'),
            ('waiting_for_password', 'Waiting for password'),
            ('authenticated', 'Authenticated'),
            ('none', 'None'),
        ],
        default='none'
    )
    
    # Conversation history for Gemini (stored as JSON)
    conversation_history = models.JSONField(default=list, blank=True)
    conversation_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Last activity
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_command_used = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        db_table = 'telegram_users'
        verbose_name = 'Telegram User'
        verbose_name_plural = 'Telegram Users'
        indexes = [
            models.Index(fields=['chat_id']),
            models.Index(fields=['user', 'is_authenticated']),
        ]
    
    def __str__(self):
        username = self.telegram_username or f"User {self.chat_id}"
        if self.user:
            return f"{username} → {self.user.email}"
        return f"{username} (not authenticated)"
    
    @property
    def full_name(self):
        """Get full name from Telegram profile."""
        if self.telegram_first_name and self.telegram_last_name:
            return f"{self.telegram_first_name} {self.telegram_last_name}"
        return self.telegram_first_name or self.telegram_username or str(self.chat_id)
    
    def update_last_activity(self):
        """Update last message timestamp."""
        self.last_message_at = timezone.now()
        self.save(update_fields=['last_message_at'])
    
    def clear_auth_state(self):
        """Clear authentication state."""
        self.pending_email = None
        self.auth_code = None
        self.auth_code_expires_at = None
        self.conversation_state = 'none'
        self.save(update_fields=[
            'pending_email', 'auth_code', 'auth_code_expires_at', 'conversation_state'
        ])
    
    def authenticate(self, user):
        """Mark user as authenticated and link to CRM user."""
        self.user = user
        self.is_authenticated = True
        self.conversation_state = 'authenticated'
        self.clear_auth_state()
        self.save(update_fields=[
            'user', 'is_authenticated', 'conversation_state',
            'pending_email', 'auth_code', 'auth_code_expires_at'
        ])
    
    def add_to_conversation_history(self, role, content):
        """Add message to conversation history for Gemini context."""
        if not self.conversation_history:
            self.conversation_history = []
        
        self.conversation_history.append({
            'role': role,  # 'user' or 'assistant'
            'content': content,
            'timestamp': timezone.now().isoformat()
        })
        
        # Keep only last 20 messages to avoid token limits
        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-20:]
        
        self.save(update_fields=['conversation_history'])
    
    def clear_conversation_history(self):
        """Clear conversation history."""
        self.conversation_history = []
        self.conversation_id = None
        self.save(update_fields=['conversation_history', 'conversation_id'])

