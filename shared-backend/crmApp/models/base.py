"""
Base abstract models and mixins for the CRM application.
"""
from django.db import models


class TimestampedModel(models.Model):
    """
    Abstract base class that provides created_at and updated_at timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class CodeMixin(models.Model):
    """
    Abstract mixin for models that need unique codes per organization.
    """
    code = models.CharField(max_length=50, null=True, blank=True)
    
    class Meta:
        abstract = True


class AddressMixin(models.Model):
    """
    Abstract mixin for models that need address fields.
    """
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        abstract = True
    
    @property
    def zip_code(self):
        """Alias for postal_code for frontend compatibility"""
        return self.postal_code
    
    @zip_code.setter  
    def zip_code(self, value):
        """Setter for zip_code alias"""
        self.postal_code = value


class ContactInfoMixin(models.Model):
    """
    Abstract mixin for models that need contact information.
    """
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    mobile = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        abstract = True


class StatusMixin(models.Model):
    """
    Abstract mixin for models with active/inactive status.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    class Meta:
        abstract = True
