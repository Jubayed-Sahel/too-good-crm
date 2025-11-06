"""
Issue management models for tracking vendor and order issues.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, StatusMixin


class Issue(TimestampedModel, CodeMixin, StatusMixin):
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
            year = timezone.now().year
            last_issue = Issue.objects.filter(
                organization=self.organization,
                issue_number__startswith=f'ISS-{year}'
            ).order_by('-issue_number').first()
            
            if last_issue:
                last_num = int(last_issue.issue_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.issue_number = f'ISS-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)
