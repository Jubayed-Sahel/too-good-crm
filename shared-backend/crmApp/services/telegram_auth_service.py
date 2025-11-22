"""
Telegram Authentication Service
Handles authentication flow for Telegram bot users
"""
import logging
import secrets
from typing import Optional, Tuple, Dict
from django.utils import timezone
from django.contrib.auth import authenticate
from datetime import timedelta

from crmApp.models import User, TelegramUser

logger = logging.getLogger(__name__)


class TelegramAuthService:
    """
    Service for handling Telegram bot user authentication.
    Manages the authentication flow: email verification → password → link account.
    """
    
    AUTH_CODE_EXPIRY_MINUTES = 10
    AUTH_CODE_LENGTH = 6
    
    @staticmethod
    def get_or_create_telegram_user(
        chat_id: int,
        telegram_username: Optional[str] = None,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None
    ) -> TelegramUser:
        """
        Get or create TelegramUser record for a chat_id.
        
        Args:
            chat_id: Telegram chat ID
            telegram_username: Telegram username (optional)
            first_name: Telegram first name (optional)
            last_name: Telegram last name (optional)
            
        Returns:
            TelegramUser instance
        """
        telegram_user, created = TelegramUser.objects.get_or_create(
            chat_id=chat_id,
            defaults={
                'telegram_username': telegram_username,
                'telegram_first_name': first_name,
                'telegram_last_name': last_name,
            }
        )
        
        # Update user info if provided
        if not created:
            updated = False
            if telegram_username and telegram_user.telegram_username != telegram_username:
                telegram_user.telegram_username = telegram_username
                updated = True
            if first_name and telegram_user.telegram_first_name != first_name:
                telegram_user.telegram_first_name = first_name
                updated = True
            if last_name and telegram_user.telegram_last_name != last_name:
                telegram_user.telegram_last_name = last_name
                updated = True
            
            if updated:
                telegram_user.save(update_fields=[
                    'telegram_username', 'telegram_first_name', 'telegram_last_name'
                ])
        
        return telegram_user
    
    @staticmethod
    def find_user_by_email(email: str) -> Optional[User]:
        """
        Find CRM user by email.
        
        Args:
            email: User email
            
        Returns:
            User instance or None
        """
        try:
            return User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return None
    
    @staticmethod
    def generate_auth_code() -> str:
        """
        Generate a random authentication code.
        
        Returns:
            Random 6-digit code
        """
        return ''.join(secrets.choice('0123456789') for _ in range(TelegramAuthService.AUTH_CODE_LENGTH))
    
    @staticmethod
    def start_auth_flow(telegram_user: TelegramUser, email: str) -> Tuple[bool, str]:
        """
        Start authentication flow with email verification.
        
        Args:
            telegram_user: TelegramUser instance
            email: User email to verify
            
        Returns:
            Tuple of (success, message)
        """
        # Find user by email
        user = TelegramAuthService.find_user_by_email(email)
        
        if not user:
            return False, f"❌ No account found with email: {email}\n\nPlease check your email and try again, or register at the web portal first."
        
        # Generate auth code
        auth_code = TelegramAuthService.generate_auth_code()
        expires_at = timezone.now() + timedelta(minutes=TelegramAuthService.AUTH_CODE_EXPIRY_MINUTES)
        
        # Update telegram user
        telegram_user.pending_email = email
        telegram_user.auth_code = auth_code
        telegram_user.auth_code_expires_at = expires_at
        telegram_user.conversation_state = 'waiting_for_password'
        telegram_user.save(update_fields=[
            'pending_email', 'auth_code', 'auth_code_expires_at', 'conversation_state'
        ])
        
        # Send code via email (optional - could also send via Telegram)
        # For now, we'll return the code in the message (in production, send via email)
        message = (
            f"✅ Account found!\n\n"
            f"<b>Email:</b> {email}\n"
            f"<b>Name:</b> {user.full_name}\n\n"
            f"🔐 Please enter your password to complete authentication.\n\n"
            f"<i>For security, please send your password in the next message.</i>"
        )
        
        return True, message
    
    @staticmethod
    def verify_password(telegram_user: TelegramUser, password: str) -> Tuple[bool, str, Optional[User]]:
        """
        Verify password and complete authentication.
        
        Args:
            telegram_user: TelegramUser instance
            password: User password
            
        Returns:
            Tuple of (success, message, user)
        """
        if not telegram_user.pending_email:
            return False, "❌ No pending authentication found. Please start with /start", None
        
        if not telegram_user.auth_code:
            return False, "❌ Authentication session expired. Please start with /start", None
        
        # Check if auth code expired
        if telegram_user.auth_code_expires_at and telegram_user.auth_code_expires_at < timezone.now():
            telegram_user.clear_auth_state()
            return False, "❌ Authentication session expired. Please start with /start", None
        
        # Find user
        user = TelegramAuthService.find_user_by_email(telegram_user.pending_email)
        
        if not user:
            telegram_user.clear_auth_state()
            return False, "❌ Account not found. Please start with /start", None
        
        # Verify password
        if not user.check_password(password):
            # Note: failed_login_attempts tracking removed as field doesn't exist in model
            # For now, just return error without attempt tracking
            return False, "❌ Incorrect password. Please try again or type /start to restart.", None
        
        # Authenticate successfully
        telegram_user.authenticate(user)
        
        message = (
            f"✅ <b>Authentication successful!</b>\n\n"
            f"Welcome, {user.full_name}!\n\n"
            f"You can now use all CRM features via Telegram.\n\n"
            f"Try asking:\n"
            f"• \"Show my deals\"\n"
            f"• \"List my customers\"\n"
            f"• \"Create a new lead\"\n"
            f"• \"Show statistics\"\n\n"
            f"Type /help to see all available commands."
        )
        
        return True, message, user
    
    @staticmethod
    def logout(telegram_user: TelegramUser) -> str:
        """
        Logout user from Telegram bot.
        
        Args:
            telegram_user: TelegramUser instance
            
        Returns:
            Logout message
        """
        if telegram_user.is_authenticated:
            user_email = telegram_user.user.email if telegram_user.user else "Unknown"
            telegram_user.user = None
            telegram_user.is_authenticated = False
            telegram_user.conversation_state = 'none'
            telegram_user.clear_auth_state()
            telegram_user.clear_conversation_history()
            telegram_user.save(update_fields=[
                'user', 'is_authenticated', 'conversation_state',
                'pending_email', 'auth_code', 'auth_code_expires_at',
                'conversation_history', 'conversation_id'
            ])
            
            return f"✅ Logged out successfully.\n\nAccount: {user_email}\n\nType /start to authenticate again."
        else:
            return "ℹ️ You're not logged in.\n\nType /start to authenticate."
    
    @staticmethod
    def get_user_info(telegram_user: TelegramUser) -> str:
        """
        Get authenticated user information.
        
        Args:
            telegram_user: TelegramUser instance
            
        Returns:
            User info message
        """
        if not telegram_user.is_authenticated or not telegram_user.user:
            return "❌ You're not authenticated.\n\nType /start to authenticate."
        
        user = telegram_user.user
        message = (
            f"<b>Account Information</b>\n\n"
            f"<b>Email:</b> {user.email}\n"
            f"<b>Name:</b> {user.full_name}\n"
            f"<b>Username:</b> {user.username}\n"
        )
        
        # Get active profiles
        active_profiles = user.user_profiles.filter(status='active')
        if active_profiles.exists():
            message += f"\n<b>Profiles:</b>\n"
            for profile in active_profiles:
                org_name = profile.organization.name if profile.organization else "Standalone"
                message += f"• {profile.get_profile_type_display()} @ {org_name}\n"
        
        message += f"\n<b>Telegram:</b> @{telegram_user.telegram_username or 'N/A'}"
        
        return message

