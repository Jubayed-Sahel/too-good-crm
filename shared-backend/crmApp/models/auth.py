"""
Authentication and user management models.
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from .base import TimestampedModel


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, username, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('Email is required')
        if not username:
            raise ValueError('Username is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimestampedModel):
    """
    Custom user model with email-based authentication.
    Supports multi-tenancy through UserProfile (vendor, employee, customer).
    """
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    profile_image = models.CharField(max_length=255, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    
    # Security fields
    failed_login_attempts = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    must_change_password = models.BooleanField(default=False)
    
    # Two-factor authentication
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=255, null=True, blank=True)
    
    # Current organization context for multi-tenancy
    current_organization = models.ForeignKey(
        'Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_users',
        help_text='Currently active organization for this user'
    )
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Return the user's full name if available."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def get_profiles(self, organization_id=None):
        """Get all user profiles, optionally filtered by organization."""
        profiles = self.user_profiles.all()
        if organization_id:
            profiles = profiles.filter(organization_id=organization_id)
        return profiles
    
    def has_profile_type(self, profile_type, organization_id=None):
        """Check if user has a specific profile type."""
        query = {'profile_type': profile_type, 'status': 'active'}
        if organization_id:
            query['organization_id'] = organization_id
        return self.user_profiles.filter(**query).exists()
    
    def is_vendor(self, organization_id=None):
        """Check if user has vendor profile."""
        return self.has_profile_type('vendor', organization_id)
    
    def is_employee(self, organization_id=None):
        """Check if user has employee profile."""
        return self.has_profile_type('employee', organization_id)
    
    def is_customer(self, organization_id=None):
        """Check if user has customer profile."""
        return self.has_profile_type('customer', organization_id)


class RefreshToken(TimestampedModel):
    """JWT refresh token storage and management."""
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='refresh_tokens')
    token = models.CharField(max_length=500, unique=True)
    expires_at = models.DateTimeField()
    is_revoked = models.BooleanField(default=False)
    revoked_at = models.DateTimeField(null=True, blank=True)
    device_info = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.CharField(max_length=45, null=True, blank=True)
    
    class Meta:
        db_table = 'refresh_tokens'
        verbose_name = 'Refresh Token'
        verbose_name_plural = 'Refresh Tokens'
        indexes = [
            models.Index(fields=['user', 'expires_at']),
            models.Index(fields=['token']),
        ]
    
    def __str__(self):
        return f"Token for {self.user.email}"


class PasswordResetToken(TimestampedModel):
    """Password reset token management."""
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'Password Reset Token'
        verbose_name_plural = 'Password Reset Tokens'
        indexes = [
            models.Index(fields=['token', 'expires_at']),
        ]
    
    def __str__(self):
        return f"Reset token for {self.user.email}"


class EmailVerificationToken(TimestampedModel):
    """Email verification token management."""
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='email_verification_tokens')
    token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'email_verification_tokens'
        verbose_name = 'Email Verification Token'
        verbose_name_plural = 'Email Verification Tokens'
        indexes = [
            models.Index(fields=['token', 'expires_at']),
        ]
    
    def __str__(self):
        return f"Verification token for {self.user.email}"


class UserProfile(TimestampedModel):
    """
    User Profile model for multi-tenancy.
    Links a user to an organization with a specific profile type (vendor, employee, customer).
    
    Constraints:
    - A user can have ONLY ONE vendor profile (owns one organization)
    - A user can have ONLY ONE employee profile (works in one organization)
    - A user can have ONLY ONE customer profile (can be standalone)
    - Each profile type is unique per user (enforced by unique constraint on user + profile_type)
    """
    PROFILE_TYPE_CHOICES = [
        ('vendor', 'Vendor'),
        ('employee', 'Employee'),
        ('customer', 'Customer'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
    ]
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_profiles')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='user_profiles', null=True, blank=True)
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPE_CHOICES)
    is_primary = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    activated_at = models.DateTimeField(null=True, blank=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        # Enforce ONE profile of each type per user
        unique_together = [('user', 'profile_type')]
        indexes = [
            models.Index(fields=['user', 'organization']),
            models.Index(fields=['profile_type', 'status']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(profile_type='customer') | models.Q(organization__isnull=False),
                name='customer_profile_no_org_required'
            )
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(profile_type='customer') | models.Q(organization__isnull=False),
                name='customer_profile_no_org_required'
            )
        ]
    
    def __str__(self):
        org_name = self.organization.name if self.organization else 'No Organization'
        return f"{self.user.email} - {self.get_profile_type_display()} @ {org_name}"
    
    def clean(self):
        """Validate profile constraints."""
        from django.core.exceptions import ValidationError
        
        # Vendor and employee profiles must have organization
        if self.profile_type in ['vendor', 'employee'] and not self.organization:
            raise ValidationError(f"{self.get_profile_type_display()} profile must have an organization.")
        
        # Check if user already has this profile type
        existing = UserProfile.objects.filter(
            user=self.user,
            profile_type=self.profile_type
        ).exclude(pk=self.pk)
        
        if existing.exists():
            raise ValidationError(f"User already has a {self.get_profile_type_display()} profile.")
        
        super().clean()
    
    def activate(self):
        """Activate the user profile."""
        from django.utils import timezone
        self.status = 'active'
        self.activated_at = timezone.now()
        self.deactivated_at = None
        self.save(update_fields=['status', 'activated_at', 'deactivated_at'])
    
    def deactivate(self):
        """Deactivate the user profile."""
        from django.utils import timezone
        self.status = 'inactive'
        self.deactivated_at = timezone.now()
        self.save(update_fields=['status', 'deactivated_at'])
    
    def suspend(self):
        """Suspend the user profile."""
        self.status = 'suspended'
        self.save(update_fields=['status'])
