"""
Issue management models for tracking vendor and order issues.
"""
from django.db import models, IntegrityError
from .base import TimestampedModel, CodeMixin


class Issue(TimestampedModel, CodeMixin):
    """
    Issue model for tracking problems with vendors, orders, and services.
    Allows organization to log and manage issues throughout their lifecycle.
    """
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    CATEGORY_CHOICES = [
        ('general', 'General Issue'),
        ('delivery', 'Delivery Delay'),
        ('quality', 'Quality Issue'),
        ('billing', 'Billing Problem'),
        ('communication', 'Communication Issue'),
        ('technical', 'Technical Problem'),
        ('other', 'Other'),
    ]
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='issues'
    )
    
    # Basic information
    issue_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Relationships
    vendor = models.ForeignKey(
        'Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    order = models.ForeignKey(
        'Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )
    
    # Classification
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='general'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_issues'
    )
    
    # Client-raised issues
    raised_by_customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='raised_issues',
        help_text='Customer who raised this issue (for client-raised issues)'
    )
    is_client_issue = models.BooleanField(
        default=False,
        help_text='True if this issue was raised by a client/customer'
    )
    
    # Resolution tracking
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_issues'
    )
    resolution_notes = models.TextField(null=True, blank=True)
    
    # Linear Integration
    linear_issue_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text='Linear issue ID for synced issues'
    )
    linear_issue_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        help_text='Linear issue URL'
    )
    linear_team_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text='Linear team ID'
    )
    synced_to_linear = models.BooleanField(
        default=False,
        help_text='Whether this issue has been synced to Linear'
    )
    last_synced_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Last time this issue was synced with Linear'
    )
    
    class Meta:
        db_table = 'issues'
        verbose_name = 'Issue'
        verbose_name_plural = 'Issues'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'priority']),
            models.Index(fields=['organization', 'category']),
            models.Index(fields=['vendor']),
            models.Index(fields=['order']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['issue_number']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.issue_number}: {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate issue number if not provided."""
        if not self.issue_number:
            # Generate issue number: ISS-YYYY-NNNN
            from django.utils import timezone
            from django.db import IntegrityError
            from django.db import transaction
            
            year = timezone.now().year
            
            # Simple approach: query for last issue and increment
            # Don't use select_for_update to avoid transaction conflicts
            try:
                last_issue = Issue.objects.filter(
                    organization=self.organization,
                    issue_number__startswith=f'ISS-{year}'
                ).order_by('-issue_number').first()
                
                if last_issue:
                    try:
                        last_num = int(last_issue.issue_number.split('-')[-1])
                        new_num = last_num + 1
                    except (ValueError, IndexError):
                        new_num = 1
                else:
                    new_num = 1
                
                # Generate issue number
                self.issue_number = f'ISS-{year}-{new_num:04d}'
                
            except Exception:
                # If query fails, use timestamp as fallback
                import time
                timestamp = int(time.time() * 1000) % 10000
                self.issue_number = f'ISS-{year}-{timestamp:04d}'
        
        # Save the issue
        try:
            super().save(*args, **kwargs)
        except IntegrityError as e:
            # If unique constraint fails, add timestamp to make it unique
            if 'issue_number' in str(e) and not self.issue_number.endswith(str(int(__import__('time').time() * 1000) % 10000)):
                import time
                timestamp = int(time.time() * 1000) % 10000
                base_number = self.issue_number.rsplit('-', 1)[0] if '-' in self.issue_number else f'ISS-{year}'
                self.issue_number = f'{base_number}-{timestamp:04d}'
                super().save(*args, **kwargs)
            else:
                raise
