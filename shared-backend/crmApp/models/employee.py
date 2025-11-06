"""
Employee management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin


class Employee(TimestampedModel, CodeMixin, ContactInfoMixin, AddressMixin, StatusMixin):
    """
    Employee model for managing organization staff.
    Supports hierarchical structure with manager relationships.
    Linked to User through UserProfile for multi-tenancy.
    """
    EMPLOYMENT_TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on-leave', 'On Leave'),
        ('terminated', 'Terminated'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='employees')
    user = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_profiles')
    user_profile = models.ForeignKey('UserProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='employee_records')
    
    # Personal information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    profile_image = models.CharField(max_length=255, null=True, blank=True)
    
    # Employment details
    job_title = models.CharField(max_length=100, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, default='full-time')
    hire_date = models.DateField(null=True, blank=True)
    termination_date = models.DateField(null=True, blank=True)
    emergency_contact = models.CharField(max_length=255, null=True, blank=True)
    
    # Hierarchy
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='direct_reports')
    role = models.ForeignKey('Role', on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    
    # Compensation
    salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    class Meta:
        db_table = 'employees'
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        unique_together = [
            ('organization', 'code'),
            ('organization', 'user'),
        ]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'department']),
            models.Index(fields=['user', 'organization']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.organization.name})"
    
    @property
    def full_name(self):
        """Return the employee's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """Override save to create user profile if user is linked."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create or get user profile for employee
        if is_new and self.user and not self.user_profile:
            from .auth import UserProfile
            user_profile, created = UserProfile.objects.get_or_create(
                user=self.user,
                organization=self.organization,
                profile_type='employee',
                defaults={'status': 'active'}
            )
            self.user_profile = user_profile
            super().save(update_fields=['user_profile'])