"""
Audit Log Model for tracking all organizational actions
"""
from django.db import models
from .base import TimestampedModel


class AuditLog(TimestampedModel):
    """
    Comprehensive audit logging for all organizational actions.
    Tracks who did what, when, and what changed.
    """
    
    ACTION_CHOICES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('view', 'Viewed'),
        ('export', 'Exported'),
        ('import', 'Imported'),
        ('login', 'Logged In'),
        ('logout', 'Logged Out'),
        ('moved', 'Moved'),
        ('converted', 'Converted'),
        ('assigned', 'Assigned'),
        ('status_change', 'Status Changed'),
        ('permission_change', 'Permission Changed'),
    ]
    
    RESOURCE_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('lead', 'Lead'),
        ('deal', 'Deal'),
        ('employee', 'Employee'),
        ('issue', 'Issue'),
        ('order', 'Order'),
        ('payment', 'Payment'),
        ('activity', 'Activity'),
        ('pipeline', 'Pipeline'),
        ('pipeline_stage', 'Pipeline Stage'),
        ('organization', 'Organization'),
        ('user', 'User'),
        ('role', 'Role'),
        ('permission', 'Permission'),
    ]
    
    # Organization context
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='audit_logs',
        help_text='Organization this action belongs to'
    )
    
    # Who performed the action
    user = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs_created',
        help_text='User who performed the action'
    )
    user_email = models.EmailField(
        help_text='Email of user (cached for historical reference)'
    )
    user_profile_type = models.CharField(
        max_length=20,
        help_text='Profile type: vendor, employee, customer'
    )
    
    # What action was performed
    action = models.CharField(
        max_length=50,
        choices=ACTION_CHOICES,
        db_index=True,
        help_text='Type of action performed'
    )
    resource_type = models.CharField(
        max_length=50,
        choices=RESOURCE_TYPE_CHOICES,
        db_index=True,
        help_text='Type of resource affected'
    )
    resource_id = models.IntegerField(
        null=True,
        blank=True,
        db_index=True,
        help_text='ID of the affected resource'
    )
    resource_name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text='Name/title of the affected resource (for quick reference)'
    )
    
    # Description of the action
    description = models.TextField(
        help_text='Human-readable description of the action'
    )
    
    # Detailed change information
    changes = models.JSONField(
        default=dict,
        blank=True,
        help_text='Detailed changes: {"field": {"old": value, "new": value}}'
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text='IP address of the request'
    )
    user_agent = models.TextField(
        null=True,
        blank=True,
        help_text='User agent string'
    )
    request_path = models.CharField(
        max_length=500,
        null=True,
        blank=True,
        help_text='API endpoint path'
    )
    request_method = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        help_text='HTTP method (GET, POST, PUT, DELETE, etc.)'
    )
    
    # Related resources (for linking activities to customers, leads, deals)
    related_customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    related_lead = models.ForeignKey(
        'Lead',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    related_deal = models.ForeignKey(
        'Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'
        indexes = [
            models.Index(fields=['organization', '-created_at']),
            models.Index(fields=['organization', 'resource_type', '-created_at']),
            models.Index(fields=['organization', 'action', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['resource_type', 'resource_id']),
            models.Index(fields=['related_customer']),
            models.Index(fields=['related_lead']),
            models.Index(fields=['related_deal']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user_email} {self.get_action_display()} {self.resource_type} #{self.resource_id}"
    
    @classmethod
    def log_action(cls, **kwargs):
        """
        Convenience method to create audit log entries.
        
        Usage:
            AuditLog.log_action(
                organization=org,
                user=request.user,
                action='create',
                resource_type='customer',
                resource_id=customer.id,
                resource_name=customer.name,
                description=f'Created new customer: {customer.name}',
                changes={'name': {'new': 'John Doe'}},
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT'),
                request_path=request.path,
                request_method=request.method
            )
        """
        # Extract user information
        user = kwargs.get('user')
        if user:
            kwargs['user_email'] = kwargs.get('user_email', user.email)
            
            # Get active profile type
            if not kwargs.get('user_profile_type'):
                active_profile = getattr(user, 'active_profile', None)
                if active_profile:
                    kwargs['user_profile_type'] = active_profile.profile_type
                else:
                    # Fallback: check all profiles
                    from crmApp.models import UserProfile
                    profile = UserProfile.objects.filter(
                        user=user,
                        status='active'
                    ).first()
                    kwargs['user_profile_type'] = profile.profile_type if profile else 'unknown'
        
        return cls.objects.create(**kwargs)

