"""
Customer management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class CustomerOrganization(TimestampedModel):
    """
    Junction table linking customers to multiple vendor organizations.
    Allows one customer to work with multiple vendors.
    Each vendor can maintain their own relationship data with the customer.
    """
    RELATIONSHIP_STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('prospect', 'Prospect'),
    ]
    
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='customer_organizations')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='organization_customers')
    
    # Vendor-specific relationship metadata
    relationship_status = models.CharField(
        max_length=20,
        choices=RELATIONSHIP_STATUS_CHOICES,
        default='active',
        help_text='Status of this customer-vendor relationship'
    )
    assigned_employee = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_customer_orgs',
        help_text='Employee assigned to manage this customer for this vendor'
    )
    vendor_notes = models.TextField(
        null=True,
        blank=True,
        help_text='Vendor-specific notes about this customer'
    )
    vendor_customer_code = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text='Customer code/ID used by this specific vendor'
    )
    
    # Vendor-specific financial terms
    credit_limit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Credit limit for this customer with this vendor'
    )
    payment_terms = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text='Payment terms for this customer with this vendor'
    )
    
    # Relationship tracking
    relationship_started = models.DateTimeField(auto_now_add=True)
    last_interaction = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'customer_organizations'
        verbose_name = 'Customer-Organization Relationship'
        verbose_name_plural = 'Customer-Organization Relationships'
        unique_together = [('customer', 'organization')]
        indexes = [
            models.Index(fields=['customer', 'organization']),
            models.Index(fields=['organization', 'relationship_status']),
            models.Index(fields=['assigned_employee']),
        ]
        ordering = ['-relationship_started']
    
    def __str__(self):
        return f"{self.customer.name} - {self.organization.name}"


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
    
    # Primary organization (backward compatibility - first vendor the customer signed up with)
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='primary_customers',
        null=True,
        blank=True,
        help_text='Primary/original vendor organization'
    )
    
    # Many-to-many relationship with organizations through CustomerOrganization
    organizations = models.ManyToManyField(
        'Organization',
        through='CustomerOrganization',
        related_name='shared_customers',
        help_text='All vendor organizations this customer works with'
    )
    
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
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'customer_type']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['user', 'organization']),
            models.Index(fields=['email']),
            models.Index(fields=['name']),
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
        
        # Link to existing user profile or create one if it doesn't exist
        # Note: UserProfile has unique constraint on (user, profile_type), not (user, organization, profile_type)
        # So a user can only have ONE customer profile, but can be a customer of multiple organizations
        if is_new and self.user and not self.user_profile:
            from .auth import UserProfile
            # First, try to get existing customer profile for this user (regardless of organization)
            user_profile = UserProfile.objects.filter(
                user=self.user,
                profile_type='customer'
            ).first()
            
            if not user_profile:
                # No customer profile exists - create one for this organization
                user_profile = UserProfile.objects.create(
                    user=self.user,
                    organization=self.organization,
                    profile_type='customer',
                    status='active'
                )
            else:
                # Customer profile exists - update organization if needed
                # Note: A customer profile can be associated with one primary organization
                # but the customer can still do business with multiple organizations
                if user_profile.organization != self.organization:
                    # Update organization if it's different (customer doing business with new org)
                    user_profile.organization = self.organization
                    user_profile.save(update_fields=['organization'])
            
            # Link customer record to user profile
            self.user_profile = user_profile
            super().save(update_fields=['user_profile'])