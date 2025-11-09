"""
Jitsi call session model for tracking in-app video/audio calls between users
"""
from django.db import models
from .base import TimestampedModel
import uuid


class JitsiCallSession(TimestampedModel):
    """
    Tracks Jitsi video/audio call sessions between CRM users.
    Supports 1-on-1 and group calls.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),           # Call initiated, waiting for recipient
        ('ringing', 'Ringing'),           # Recipient notified
        ('active', 'Active'),             # Call in progress
        ('completed', 'Completed'),       # Call ended normally
        ('missed', 'Missed'),             # Recipient didn't answer
        ('rejected', 'Rejected'),         # Recipient declined
        ('cancelled', 'Cancelled'),       # Initiator cancelled before answer
        ('failed', 'Failed'),             # Technical failure
    ]
    
    CALL_TYPE_CHOICES = [
        ('audio', 'Audio Only'),
        ('video', 'Video Call'),
    ]
    
    # Unique identifiers
    room_name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Unique Jitsi room name"
    )
    session_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True
    )
    
    # Call details
    call_type = models.CharField(
        max_length=10,
        choices=CALL_TYPE_CHOICES,
        default='video'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Participants
    initiator = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='initiated_calls',
        help_text="User who started the call"
    )
    
    # For 1-on-1 calls
    recipient = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='received_calls',
        help_text="Primary recipient (for 1-on-1 calls)"
    )
    
    # For group calls - store user IDs as JSON array
    participants = models.JSONField(
        default=list,
        blank=True,
        help_text="List of user IDs participating in the call"
    )
    
    # Timing
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the call actually started (first person joined)"
    )
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the call ended"
    )
    duration_seconds = models.IntegerField(
        null=True,
        blank=True,
        help_text="Total call duration in seconds"
    )
    
    # Organization context
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='jitsi_calls',
        help_text="Organization this call belongs to"
    )
    
    # Additional metadata
    recording_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        help_text="URL to call recording if enabled"
    )
    notes = models.TextField(
        blank=True,
        help_text="Notes about the call"
    )
    
    # Jitsi configuration used
    jitsi_server = models.CharField(
        max_length=255,
        default='meet.jit.si',
        help_text="Jitsi server used for this call"
    )
    
    class Meta:
        db_table = 'jitsi_call_sessions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['initiator', 'created_at']),
            models.Index(fields=['room_name']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        if self.recipient:
            return f"Call: {self.initiator} → {self.recipient} ({self.status})"
        return f"Group Call: {self.room_name} ({self.status})"
    
    @property
    def duration_formatted(self):
        """Return duration in MM:SS format"""
        if not self.duration_seconds:
            return "00:00"
        minutes = self.duration_seconds // 60
        seconds = self.duration_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"
    
    @property
    def is_active(self):
        """Check if call is currently active"""
        return self.status == 'active'
    
    @property
    def participant_count(self):
        """Get number of participants"""
        return len(self.participants) if self.participants else 0


class UserPresence(TimestampedModel):
    """
    Tracks user online status and availability for calls.
    Updated via heartbeat/websocket pings.
    """
    
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('busy', 'Busy'),
        ('away', 'Away'),
        ('offline', 'Offline'),
    ]
    
    user = models.OneToOneField(
        'User',
        on_delete=models.CASCADE,
        related_name='presence',
        primary_key=True
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='offline'
    )
    
    last_seen = models.DateTimeField(
        auto_now=True,
        help_text="Last activity timestamp"
    )
    
    # Call availability
    available_for_calls = models.BooleanField(
        default=True,
        help_text="Whether user accepts incoming calls"
    )
    
    # Current call info
    current_call = models.ForeignKey(
        'JitsiCallSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='active_users',
        help_text="Current active call session"
    )
    
    # Custom status message
    status_message = models.CharField(
        max_length=100,
        blank=True,
        help_text="Custom status message (e.g., 'In a meeting')"
    )
    
    class Meta:
        db_table = 'user_presence'
    
    def __str__(self):
        return f"{self.user.username} - {self.status}"
    
    @property
    def is_online(self):
        """Check if user is currently online"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Consider online if seen in last 5 minutes
        if self.status == 'offline':
            return False
        
        threshold = timezone.now() - timedelta(minutes=5)
        return self.last_seen >= threshold
    
    @property
    def is_available(self):
        """Check if user is available for calls"""
        return self.is_online and self.available_for_calls and self.status not in ['busy']
