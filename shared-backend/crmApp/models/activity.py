"""
Activity tracking models for customer interactions and communications.
"""
from django.db import models
from .base import TimestampedModel


class Activity(TimestampedModel):
    """
    Activity model for tracking customer interactions, communications, and tasks.
    Supports multiple activity types: calls, emails, telegram messages, meetings, notes, tasks.
    """
    
    ACTIVITY_TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
        ('task', 'Task'),
    ]
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='activities'
    )
    
    # Basic information
    activity_type = models.CharField(
        max_length=20,
        choices=ACTIVITY_TYPE_CHOICES
    )
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    # Relationships (can be related to customer, lead, deal, etc.)
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    lead = models.ForeignKey(
        'Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    deal = models.ForeignKey(
        'Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities'
    )
    
    # Generic name field for quick reference
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    
    # Activity-specific fields
    # For calls
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    call_duration = models.IntegerField(null=True, blank=True, help_text="Duration in seconds")
    call_recording_url = models.URLField(max_length=500, null=True, blank=True)
    
    # For emails
    email_subject = models.CharField(max_length=255, null=True, blank=True)
    email_body = models.TextField(null=True, blank=True)
    email_to = models.CharField(max_length=255, null=True, blank=True)
    email_from = models.CharField(max_length=255, null=True, blank=True)
    email_attachments = models.JSONField(default=list, blank=True)
    
    # For telegram
    telegram_username = models.CharField(max_length=100, null=True, blank=True)
    telegram_message = models.TextField(null=True, blank=True)
    telegram_chat_id = models.CharField(max_length=100, null=True, blank=True)
    
    # For meetings
    meeting_location = models.CharField(max_length=255, null=True, blank=True)
    meeting_url = models.URLField(max_length=500, null=True, blank=True)
    attendees = models.JSONField(default=list, blank=True)
    
    # For video calls (Jitsi/8x8)
    video_call_room = models.CharField(max_length=255, null=True, blank=True, help_text="Video call room name")
    video_call_url = models.URLField(max_length=500, null=True, blank=True, help_text="Full video call URL")
    
    # For tasks
    task_priority = models.CharField(max_length=10, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], null=True, blank=True)
    task_due_date = models.DateField(null=True, blank=True)
    
    # For notes
    is_pinned = models.BooleanField(default=False)
    
    # General
    duration_minutes = models.IntegerField(null=True, blank=True, help_text="Activity duration in minutes")
    
    # Status and timeline
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='scheduled'
    )
    scheduled_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_activities'
    )
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_activities'
    )
    
    # Additional metadata
    tags = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    
    class Meta:
        db_table = 'activities'
        verbose_name = 'Activity'
        verbose_name_plural = 'Activities'
        indexes = [
            models.Index(fields=['organization', 'activity_type']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['customer']),
            models.Index(fields=['lead']),
            models.Index(fields=['deal']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['scheduled_at']),
            models.Index(fields=['completed_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_activity_type_display()}: {self.title}"
    
    def save(self, *args, **kwargs):
        """Auto-set completed_at when status changes to completed."""
        if self.status == 'completed' and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        
        # Sync customer_name from related customer/lead if not provided
        if not self.customer_name:
            if self.customer:
                self.customer_name = self.customer.name
            elif self.lead:
                self.customer_name = self.lead.name
        
        super().save(*args, **kwargs)
