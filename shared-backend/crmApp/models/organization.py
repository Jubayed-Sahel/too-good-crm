"""
Organization and multi-tenancy models.
"""
from django.db import models
from django.utils.text import slugify
from .base import TimestampedModel, AddressMixin


class Organization(TimestampedModel, AddressMixin):
    """
    Multi-tenant organization model.
    Each organization has its own isolated data.
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    
    # Settings stored as JSON
    settings = models.JSONField(default=dict, blank=True)
    
    # Subscription and billing
    subscription_plan = models.CharField(max_length=50, default='free')
    subscription_status = models.CharField(max_length=50, default='active')
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'organizations'
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from name if not provided"""
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            
            # Ensure unique slug
            while Organization.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            self.slug = slug
        
        super().save(*args, **kwargs)


class UserOrganization(TimestampedModel):
    """
    Junction table linking users to organizations with roles and permissions.
    Supports multi-tenancy where users can belong to multiple organizations.
    """
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_organizations')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='user_organizations')
    
    # Status
    is_active = models.BooleanField(default=True)
    is_owner = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Invitation tracking
    invited_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_invitations')
    invitation_accepted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_organizations'
        verbose_name = 'User Organization'
        verbose_name_plural = 'User Organizations'
        unique_together = [('user', 'organization')]
        indexes = [
            models.Index(fields=['user', 'organization']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.organization.name}"
