"""
Lead management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Lead(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Lead model for managing potential customers.
    Tracks lead qualification and conversion to customers.
    """
    LEAD_SOURCE_CHOICES = [
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('social_media', 'Social Media'),
        ('email_campaign', 'Email Campaign'),
        ('cold_call', 'Cold Call'),
        ('event', 'Event'),
        ('partner', 'Partner'),
        ('other', 'Other'),
    ]
    
    QUALIFICATION_STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('unqualified', 'Unqualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    
    organization = models.ForeignKey('crmApp.Organization', on_delete=models.CASCADE, related_name='leads')
    
    # Basic information
    name = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255, null=True, blank=True)
    job_title = models.CharField(max_length=100, null=True, blank=True)
    
    # Lead details
    source = models.CharField(max_length=50, choices=LEAD_SOURCE_CHOICES, default='website')
    qualification_status = models.CharField(max_length=20, choices=QUALIFICATION_STATUS_CHOICES, default='new')
    
    # Assignment
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    
    # Scoring and qualification
    lead_score = models.IntegerField(default=0)
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Conversion tracking
    is_converted = models.BooleanField(default=False)
    converted_at = models.DateTimeField(null=True, blank=True)
    converted_by = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_leads')
    
    # Additional info
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    # Marketing
    campaign = models.CharField(max_length=255, null=True, blank=True)
    referrer = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'leads'
        verbose_name = 'Lead'
        verbose_name_plural = 'Leads'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'qualification_status']),
            models.Index(fields=['organization', 'source']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['is_converted']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
