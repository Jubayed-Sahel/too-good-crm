"""
Vendor management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Vendor(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Vendor model for managing suppliers and service providers.
    """
    VENDOR_TYPE_CHOICES = [
        ('supplier', 'Supplier'),
        ('service_provider', 'Service Provider'),
        ('contractor', 'Contractor'),
        ('consultant', 'Consultant'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='vendors')
    
    # Basic information
    name = models.CharField(max_length=255)
    vendor_type = models.CharField(max_length=50, choices=VENDOR_TYPE_CHOICES, default='supplier')
    
    # Contact person
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    
    # Business details
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    
    # Financial
    payment_terms = models.CharField(max_length=100, null=True, blank=True)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'vendors'
        verbose_name = 'Vendor'
        verbose_name_plural = 'Vendors'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'vendor_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
