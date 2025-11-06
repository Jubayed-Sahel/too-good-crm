"""
Customer management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Customer(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Customer model for managing clients and accounts.
    Supports both individual and business customers.
    Linked to User through UserProfile for multi-tenancy and customer portal access.
    """
    CUSTOMER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('business', 'Business'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('prospect', 'Prospect'),
        ('vip', 'VIP'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='customers')
    user = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_profiles')
    user_profile = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_records')
    
    # Basic information
    name = models.CharField(max_length=255)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES, default='individual')
    
    # Business details (for business customers)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    industry = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(max_length=255, null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    # Contact person (for business customers)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='customers')
    
    # Financial
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
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
        unique_together = [
            ('organization', 'code'),
            ('organization', 'user'),
        ]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'customer_type']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['user', 'organization']),
        ]
        ordering = ['-created_at']  # Default ordering to prevent pagination warnings
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"
    
    @property
    def full_name(self):
        """Return the customer's full name."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save to sync names and create user profile."""
        # Sync name fields for individuals
        if self.customer_type == 'individual':
            if self.first_name and self.last_name and not self.name:
                self.name = f"{self.first_name} {self.last_name}"
            elif self.name and not (self.first_name and self.last_name):
                name_parts = self.name.split(' ', 1)
                self.first_name = name_parts[0] if len(name_parts) > 0 else ''
                self.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        # Sync company name for businesses
        if self.customer_type == 'business':
            if self.company_name and not self.name:
                self.name = self.company_name
            elif self.name and not self.company_name:
                self.company_name = self.name
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create or get user profile for customer
        if is_new and self.user and not self.user_profile:
            from .auth import UserProfile
            user_profile, created = UserProfile.objects.get_or_create(
                user=self.user,
                organization=self.organization,
                profile_type='customer',
                defaults={'status': 'active'}
            )
            self.user_profile = user_profile
            super().save(update_fields=['user_profile'])