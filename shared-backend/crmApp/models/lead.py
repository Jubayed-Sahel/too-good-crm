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
    
    # Pipeline stage (for sales pipeline visualization)
    stage = models.ForeignKey('PipelineStage', on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    
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
            models.Index(fields=['organization', 'stage']),  # Added for better stage filtering
            models.Index(fields=['assigned_to']),
            models.Index(fields=['is_converted']),
            models.Index(fields=['stage', 'organization']),  # Added for stage-based queries
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class LeadStageHistory(TimestampedModel):
    """
    Tracks the history of lead stage changes.
    Records which vendor/organization the lead belongs to and stage transitions.
    """
    lead = models.ForeignKey('Lead', on_delete=models.CASCADE, related_name='stage_history')
    organization = models.ForeignKey('crmApp.Organization', on_delete=models.CASCADE, related_name='lead_stage_history')
    stage = models.ForeignKey('PipelineStage', on_delete=models.SET_NULL, null=True, blank=True, related_name='lead_history')
    previous_stage = models.ForeignKey('PipelineStage', on_delete=models.SET_NULL, null=True, blank=True, related_name='previous_lead_history')
    changed_by = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='lead_stage_changes')
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'lead_stage_history'
        verbose_name = 'Lead Stage History'
        verbose_name_plural = 'Lead Stage Histories'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['lead', '-created_at']),
            models.Index(fields=['organization', 'stage']),
            models.Index(fields=['organization', '-created_at']),
        ]
    
    def __str__(self):
        stage_name = self.stage.name if self.stage else 'None'
        prev_stage_name = self.previous_stage.name if self.previous_stage else 'None'
        return f"{self.lead.name}: {prev_stage_name} → {stage_name}"