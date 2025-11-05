"""
Vendor management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Vendor(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Vendor model for managing suppliers and service providers.
    Linked to User through UserProfile for multi-tenancy.
    """
    VENDOR_TYPE_CHOICES = [
        ('supplier', 'Supplier'),
        ('service_provider', 'Service Provider'),
        ('contractor', 'Contractor'),
        ('consultant', 'Consultant'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
        ('blacklisted', 'Blacklisted'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='vendors')
    user = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_profiles')
    user_profile = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='vendor_records')
    
    # Basic information
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    vendor_type = models.CharField(max_length=50, choices=VENDOR_TYPE_CHOICES, default='supplier')
    
    # Contact person
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    
    # Business details
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Assignment
    assigned_employee = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_vendors')
    
    # Financial
    payment_terms = models.CharField(max_length=100, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'vendors'
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
        unique_together = [
            ('organization', 'code'),
            ('organization', 'user'),
        ]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'vendor_type']),
            models.Index(fields=['user', 'organization']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
    
    def save(self, *args, **kwargs):
        """Override save to sync company_name and create user profile."""
        # Sync company_name with name if not provided
        if not self.company_name and self.name:
            self.company_name = self.name
        elif not self.name and self.company_name:
            self.name = self.company_name
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create or get user profile for vendor
        if is_new and self.user and not self.user_profile:
            from .auth import UserProfile
            user_profile, created = UserProfile.objects.get_or_create(
                user=self.user,
                organization=self.organization,
                profile_type='vendor',
                defaults={'status': 'active'}
            )
            self.user_profile = user_profile
            super().save(update_fields=['user_profile'])