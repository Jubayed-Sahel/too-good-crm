"""
Call tracking model
"""
from django.db import models
from .base import TimestampedModel


class Call(TimestampedModel):
    """
    Model to track VOIP calls made through Twilio
    """
    DIRECTION_CHOICES = [
        ('outbound', 'Outbound'),
        ('inbound', 'Inbound'),
    ]
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('ringing', 'Ringing'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
        ('busy', 'Busy'),
        ('no-answer', 'No Answer'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
    ]
    
    # Reference
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='calls')
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='calls', null=True, blank=True)
    initiated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='twilio_calls_initiated')
    
    # Call details
    call_sid = models.CharField(max_length=100, unique=True, help_text='Twilio Call SID')
    from_number = models.CharField(max_length=20)
    to_number = models.CharField(max_length=20)
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES, default='outbound')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    
    # Timing
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True, help_text='Duration in seconds')
    
    # Additional info
    recording_url = models.URLField(max_length=500, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'calls'
        verbose_name = 'Call'
        verbose_name_plural = 'Calls'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', 'customer']),
            models.Index(fields=['call_sid']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Call to {self.to_number} - {self.status}"
    
    @property
    def duration_formatted(self):
        """Return duration in MM:SS format"""
        if self.duration:
            minutes = self.duration // 60
            seconds = self.duration % 60
            return f"{minutes:02d}:{seconds:02d}"
        return "00:00"
