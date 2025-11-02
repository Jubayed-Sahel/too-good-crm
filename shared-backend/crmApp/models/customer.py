"""
Customer management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Customer(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Customer model for managing clients and accounts.
    Supports both individual and business customers.
    """
    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('business', 'Business'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='customers')
    
    # Basic information
    name = models.CharField(max_length=255)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES, default='individual')
    
    # Business details (for business customers)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    
    # Contact person (for business customers)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='customers')
    
    # Financial
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    payment_terms = models.CharField(max_length=100, null=True, blank=True)
    
    # Metadata
    source = models.CharField(max_length=100, null=True, blank=True)  # How they found us
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    # Conversion tracking
    converted_from_lead = models.ForeignKey('Lead', on_delete=models.SET_NULL, null=True, blank=True, related_name='converted_customers')
    converted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'customers'
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'customer_type']),
            models.Index(fields=['assigned_to']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
