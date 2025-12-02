"""
Phone Verification Model
Stores verification codes for phone number-based authentication
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random
import string
from .base import TimestampedModel


class PhoneVerification(TimestampedModel):
    """
    Phone verification code for Telegram bot authentication.
    Links a phone number to a CRM user account.
    """
    # User who requested verification
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='phone_verifications'
    )
    
    # Phone number to verify (E.164 format: +1234567890)
    phone_number = models.CharField(max_length=20, db_index=True)
    
    # 6-digit verification code
    verification_code = models.CharField(max_length=6)
    
    # Telegram chat ID (if available from Telegram user)
    telegram_chat_id = models.BigIntegerField(null=True, blank=True, db_index=True)
    
    # Verification status
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    
    # Code expiration (15 minutes)
    expires_at = models.DateTimeField()
    
    # Link to Telegram user after verification
    telegram_user = models.ForeignKey(
        'TelegramUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='phone_verifications'
    )
    
    # Attempts tracking
    verification_attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    
    class Meta:
        db_table = 'phone_verifications'
        verbose_name = 'Phone Verification'
        verbose_name_plural = 'Phone Verifications'
        indexes = [
            models.Index(fields=['phone_number', 'verification_code']),
            models.Index(fields=['telegram_chat_id', 'is_verified']),
            models.Index(fields=['user', 'is_verified']),
            models.Index(fields=['expires_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Verification for {self.phone_number} - {self.user.email}"
    
    @classmethod
    def generate_code(cls) -> str:
        """Generate a random 6-digit verification code."""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    @classmethod
    def create_verification(cls, user, phone_number, telegram_chat_id=None):
        """
        Create a new phone verification record.
        
        Args:
            user: CRM user
            phone_number: Phone number in E.164 format
            telegram_chat_id: Optional Telegram chat ID
            
        Returns:
            PhoneVerification instance
        """
        # Invalidate any existing unverified codes for this user/phone
        cls.objects.filter(
            user=user,
            phone_number=phone_number,
            is_verified=False,
            expires_at__gt=timezone.now()
        ).update(is_verified=True)  # Mark as used/expired
        
        # Generate new code
        code = cls.generate_code()
        expires_at = timezone.now() + timedelta(minutes=15)
        
        return cls.objects.create(
            user=user,
            phone_number=phone_number,
            verification_code=code,
            telegram_chat_id=telegram_chat_id,
            expires_at=expires_at
        )
    
    def verify(self, code: str) -> tuple[bool, str]:
        """
        Verify the code.
        
        Args:
            code: Verification code to check
            
        Returns:
            (success: bool, message: str)
        """
        # Check if already verified
        if self.is_verified:
            return False, "This verification code has already been used."
        
        # Check if expired
        if timezone.now() > self.expires_at:
            return False, "Verification code has expired. Please request a new one."
        
        # Check attempts
        if self.verification_attempts >= self.max_attempts:
            return False, "Maximum verification attempts exceeded. Please request a new code."
        
        # Increment attempts
        self.verification_attempts += 1
        self.save(update_fields=['verification_attempts'])
        
        # Verify code
        if code != self.verification_code:
            remaining = self.max_attempts - self.verification_attempts
            if remaining > 0:
                return False, f"Invalid code. {remaining} attempt(s) remaining."
            else:
                return False, "Invalid code. Maximum attempts exceeded. Please request a new code."
        
        # Success - mark as verified
        self.is_verified = True
        self.verified_at = timezone.now()
        self.save(update_fields=['is_verified', 'verified_at'])
        
        return True, "Verification successful!"
    
    @property
    def is_expired(self) -> bool:
        """Check if verification code is expired."""
        return timezone.now() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if verification code is still valid."""
        return not self.is_verified and not self.is_expired and self.verification_attempts < self.max_attempts

