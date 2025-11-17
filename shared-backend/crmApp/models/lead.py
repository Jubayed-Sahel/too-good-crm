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
    
    # Follow-up and reminders
    follow_up_date = models.DateTimeField(null=True, blank=True, help_text="Scheduled follow-up date/time")
    follow_up_notes = models.TextField(null=True, blank=True, help_text="Notes for follow-up")
    last_contacted_at = models.DateTimeField(null=True, blank=True, help_text="Last time this lead was contacted")
    next_follow_up_reminder = models.DateTimeField(null=True, blank=True, help_text="Next reminder for follow-up")
    
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
    
    def save(self, *args, **kwargs):
        """Override save to generate code if not provided"""
        from django.utils import timezone
        from django.db import IntegrityError
        
        # Generate code if not provided and organization is set
        if not self.code and self.organization_id:
            year = timezone.now().year
            try:
                # Try to get the last lead code for this organization
                last_lead = Lead.objects.filter(
                    organization_id=self.organization_id,
                    code__startswith=f'LEAD-{year}'
                ).exclude(code__isnull=True).exclude(code='').order_by('-code').first()
                
                if last_lead and last_lead.code:
                    try:
                        last_num = int(last_lead.code.split('-')[-1])
                        new_num = last_num + 1
                    except (ValueError, IndexError):
                        new_num = 1
                else:
                    new_num = 1
                
                self.code = f'LEAD-{year}-{new_num:04d}'
            except Exception:
                # If query fails, use timestamp-based code
                import time
                timestamp = int(time.time() * 1000) % 10000
                self.code = f'LEAD-{year}-{timestamp:04d}'
        
        # Try to save, retry with different code if unique constraint fails
        max_retries = 3
        retry_count = 0
        while retry_count < max_retries:
            try:
                super().save(*args, **kwargs)
                break
            except IntegrityError as e:
                if ('code' in str(e) or 'unique' in str(e).lower()) and retry_count < max_retries - 1:
                    # Code collision, try with timestamp
                    import time
                    timestamp = int(time.time() * 1000) % 10000
                    year = timezone.now().year
                    self.code = f'LEAD-{year}-{timestamp:04d}'
                    retry_count += 1
                else:
                    raise
    
    def __str__(self):
        org_name = self.organization.name if hasattr(self, 'organization') and self.organization else f"Org-{self.organization_id}" if self.organization_id else "No Org"
        return f"{self.name} ({org_name})"
