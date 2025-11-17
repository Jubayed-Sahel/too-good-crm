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
        constraints = [
            # Prevent a user from being an active employee of multiple organizations
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(status='active'),
                name='unique_active_employee_per_user'
            ),
        ]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'department']),
            models.Index(fields=['user', 'organization']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.organization.name})"
    
    @property
    def full_name(self):
        """Return the employee's full name."""
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        """
        Override save to validate single active employee constraint.
        Note: UserProfile is NOT auto-created here. It should only be created
        when a vendor explicitly assigns an employee through the proper workflow.
        """
        # Validate that user is not already an active employee of another organization
        if self.user and self.status == 'active':
            existing_active = Employee.objects.filter(
                user=self.user,
                status='active'
            ).exclude(pk=self.pk if self.pk else None).first()
            
            if existing_active:
                raise ValueError(
                    f"User {self.user.email} is already an active employee of "
                    f"{existing_active.organization.name}. An employee cannot belong to "
                    "multiple organizations simultaneously."
                )
        
        super().save(*args, **kwargs)