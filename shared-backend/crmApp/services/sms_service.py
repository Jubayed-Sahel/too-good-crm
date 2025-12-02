"""
SMS Service
Handles sending SMS messages via Twilio or other providers
"""
import os
import logging
from typing import Optional
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


class SMSService:
    """
    Service for sending SMS messages.
    Supports Twilio and fallback methods.
    """
    
    def __init__(self):
        # Twilio credentials
        self.twilio_account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None) or os.getenv('TWILIO_ACCOUNT_SID')
        self.twilio_auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None) or os.getenv('TWILIO_AUTH_TOKEN')
        self.twilio_phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None) or os.getenv('TWILIO_PHONE_NUMBER')
        
        self.is_twilio_configured = bool(self.twilio_account_sid and self.twilio_auth_token and self.twilio_phone_number)
        
        if not self.is_twilio_configured:
            logger.warning(
                "Twilio credentials not configured. SMS sending will be logged only. "
                "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables."
            )
    
    def send_sms(self, to_phone: str, message: str) -> tuple[bool, Optional[str]]:
        """
        Send SMS message to phone number.
        
        Args:
            to_phone: Recipient phone number (E.164 format: +1234567890)
            message: Message content
            
        Returns:
            (success: bool, error_message: Optional[str])
        """
        if not self.is_twilio_configured:
            # Log-only mode for development/testing
            logger.info(f"[SMS] Would send to {to_phone}: {message}")
            logger.warning(
                "SMS not actually sent - Twilio not configured. "
                "In production, configure Twilio credentials to send real SMS."
            )
            return True, None
        
        try:
            from twilio.rest import Client
            
            client = Client(self.twilio_account_sid, self.twilio_auth_token)
            
            # Send SMS
            message_obj = client.messages.create(
                body=message,
                from_=self.twilio_phone_number,
                to=to_phone
            )
            
            logger.info(f"SMS sent successfully to {to_phone}. SID: {message_obj.sid}")
            return True, None
            
        except ImportError:
            logger.error("Twilio package not installed. Install with: pip install twilio")
            return False, "SMS service not available - Twilio package not installed"
            
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_phone}: {str(e)}", exc_info=True)
            return False, f"Failed to send SMS: {str(e)}"
    
    def send_verification_code(self, phone_number: str, code: str, verification_url: str) -> tuple[bool, Optional[str]]:
        """
        Send verification code SMS.
        
        Args:
            phone_number: Recipient phone number
            code: 6-digit verification code
            verification_url: URL to verify the code
            
        Returns:
            (success: bool, error_message: Optional[str])
        """
        message = (
            f"Your CRM verification code is: {code}\n\n"
            f"Or click this link to verify: {verification_url}\n\n"
            f"This code expires in 15 minutes."
        )
        
        return self.send_sms(phone_number, message)
    
    @staticmethod
    def normalize_phone_number(phone: str) -> str:
        """
        Normalize phone number to E.164 format.
        
        Args:
            phone: Phone number in any format
            
        Returns:
            Phone number in E.164 format (+1234567890)
        """
        # Remove all non-digit characters except +
        normalized = ''.join(c for c in phone if c.isdigit() or c == '+')
        
        # If doesn't start with +, assume it needs country code
        # You may want to add more sophisticated normalization
        if not normalized.startswith('+'):
            # Default to +1 (US/Canada) if no country code
            # In production, you might want to detect country code from user location
            normalized = '+1' + normalized
        
        return normalized
    
    @staticmethod
    def validate_phone_number(phone: str) -> tuple[bool, Optional[str]]:
        """
        Validate phone number format.
        
        Args:
            phone: Phone number to validate
            
        Returns:
            (is_valid: bool, error_message: Optional[str])
        """
        normalized = SMSService.normalize_phone_number(phone)
        
        # Basic validation: should start with + and have 10-15 digits
        if not normalized.startswith('+'):
            return False, "Phone number must include country code (e.g., +1 for US/Canada)"
        
        digits_only = normalized[1:]  # Remove +
        if not digits_only.isdigit():
            return False, "Phone number contains invalid characters"
        
        if len(digits_only) < 10 or len(digits_only) > 15:
            return False, "Phone number must be between 10 and 15 digits"
        
        return True, None

