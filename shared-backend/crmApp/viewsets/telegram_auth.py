"""
Telegram Login Widget Authentication
Handles web-based Telegram authentication using Telegram Login Widget
"""
import hashlib
import hmac
import logging
import time
from typing import Dict, Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from crmApp.models import TelegramUser, UserProfile
from crmApp.services.telegram_service import TelegramService

User = get_user_model()
logger = logging.getLogger(__name__)


def verify_telegram_authentication(auth_data: Dict) -> bool:
    """
    Verify that the authentication data received from Telegram is valid.
    
    Based on: https://core.telegram.org/widgets/login#checking-authorization
    
    Args:
        auth_data: Dictionary containing Telegram auth data
        
    Returns:
        True if data is valid, False otherwise
    """
    bot_token = settings.TG_BOT_TOKEN
    
    # Check if we have the required fields
    check_hash = auth_data.get('hash')
    if not check_hash:
        logger.error("No hash in Telegram auth data")
        return False
    
    # Create a copy without the hash
    auth_data_copy = {k: v for k, v in auth_data.items() if k != 'hash'}
    
    # Create data check string
    data_check_arr = [f"{k}={v}" for k, v in sorted(auth_data_copy.items())]
    data_check_string = '\n'.join(data_check_arr)
    
    # Create secret key from bot token
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    
    # Calculate hash
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Compare hashes
    if calculated_hash != check_hash:
        logger.error(f"Hash mismatch: expected {check_hash}, got {calculated_hash}")
        return False
    
    # Check auth_date is not too old (24 hours)
    auth_date = int(auth_data.get('auth_date', 0))
    current_time = int(time.time())
    
    if current_time - auth_date > 86400:  # 24 hours
        logger.error(f"Auth date too old: {current_time - auth_date} seconds")
        return False
    
    return True


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_login_widget_auth(request):
    """
    Handle authentication from Telegram Login Widget.
    
    Expected data from Telegram:
    - id: Telegram user ID (chat_id)
    - first_name: User's first name
    - last_name: User's last name (optional)
    - username: Telegram username (optional)
    - photo_url: User's photo (optional)
    - auth_date: Unix timestamp of authentication
    - hash: Verification hash
    
    Returns:
        - If user already linked: JWT token and user data
        - If user not linked: Temporary auth token to complete linking
    """
    try:
        auth_data = request.data
        logger.info(f"📱 Telegram Login Widget authentication attempt: {auth_data.get('id')}")
        
        # Verify Telegram authentication data
        if not verify_telegram_authentication(auth_data):
            return Response(
                {'error': 'Invalid Telegram authentication data'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract Telegram user info
        telegram_id = auth_data.get('id')
        first_name = auth_data.get('first_name', '')
        last_name = auth_data.get('last_name', '')
        username = auth_data.get('username')
        photo_url = auth_data.get('photo_url')
        
        # Get or create TelegramUser
        telegram_user, created = TelegramUser.objects.get_or_create(
            chat_id=telegram_id,
            defaults={
                'telegram_username': username,
                'telegram_first_name': first_name,
                'telegram_last_name': last_name,
            }
        )
        
        # Update user info if changed
        if not created:
            telegram_user.telegram_username = username
            telegram_user.telegram_first_name = first_name
            telegram_user.telegram_last_name = last_name
            telegram_user.save(update_fields=[
                'telegram_username',
                'telegram_first_name',
                'telegram_last_name'
            ])
        
        # Check if Telegram user is already linked to a CRM user
        if telegram_user.user and telegram_user.is_authenticated:
            user = telegram_user.user
            
            # Generate or get auth token
            token, _ = Token.objects.get_or_create(user=user)
            
            # Get user profiles with permissions
            profiles = UserProfile.objects.filter(
                user=user,
                status='active'
            ).select_related('organization')
            
            # Sync selected profile if not set
            if not telegram_user.selected_profile and profiles.exists():
                telegram_user.selected_profile = profiles.first()
                telegram_user.save(update_fields=['selected_profile'])
            
            # Prepare user data
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'profiles': [
                    {
                        'id': p.id,
                        'profile_type': p.profile_type,
                        'organization': {
                            'id': p.organization.id,
                            'name': p.organization.name,
                        } if p.organization else None,
                    }
                    for p in profiles
                ]
            }
            
            # Send welcome message via Telegram
            telegram_service = TelegramService()
            telegram_service.send_message(
                chat_id=telegram_id,
                text=(
                    f"✅ <b>Successfully authenticated via web!</b>\n\n"
                    f"Welcome back, {user.full_name}!\n\n"
                    f"Your web and Telegram accounts are now synced.\n"
                    f"You can use the bot to manage your CRM on the go."
                )
            )
            
            logger.info(f"✅ Telegram user {telegram_id} authenticated as {user.email}")
            
            return Response({
                'success': True,
                'token': token.key,
                'user': user_data,
                'telegram_linked': True,
                'message': 'Successfully authenticated with Telegram'
            })
        
        else:
            # User not linked - return temporary token to complete linking
            # Frontend should show a form to enter email/password or link to existing account
            
            logger.info(f"⚠️  Telegram user {telegram_id} not linked to any CRM account")
            
            # Send message to Telegram user
            telegram_service = TelegramService()
            telegram_service.send_message(
                chat_id=telegram_id,
                text=(
                    f"👋 <b>Welcome to LeadGrid CRM!</b>\n\n"
                    f"To complete your authentication, please:\n"
                    f"1. Enter your CRM email and password on the web page\n"
                    f"2. Or create a new account if you don't have one\n\n"
                    f"Once linked, you'll be able to use both web and Telegram seamlessly!"
                )
            )
            
            return Response({
                'success': False,
                'telegram_linked': False,
                'telegram_user': {
                    'telegram_id': telegram_id,
                    'first_name': first_name,
                    'last_name': last_name,
                    'username': username,
                    'photo_url': photo_url,
                },
                'message': 'Telegram account not linked. Please log in or register to link your account.',
                'action_required': 'link_account'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"❌ Telegram login widget error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Authentication failed', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_link_account(request):
    """
    Link a Telegram account to an existing CRM user account.
    
    Expected data:
    - telegram_id: Telegram user ID
    - email: CRM account email
    - password: CRM account password
    
    Returns:
        JWT token and user data
    """
    try:
        telegram_id = request.data.get('telegram_id')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([telegram_id, email, password]):
            return Response(
                {'error': 'Missing required fields: telegram_id, email, password'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"🔗 Linking Telegram account {telegram_id} to email {email}")
        
        # Find user by email
        try:
            user = User.objects.get(email__iexact=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Get or create TelegramUser
        try:
            telegram_user = TelegramUser.objects.get(chat_id=telegram_id)
        except TelegramUser.DoesNotExist:
            return Response(
                {'error': 'Telegram user not found. Please try logging in with Telegram again.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if this Telegram account is already linked to another user
        if telegram_user.user and telegram_user.user.id != user.id:
            return Response(
                {'error': 'This Telegram account is already linked to another user.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Link accounts
        telegram_user.authenticate(user)
        
        # Set default selected profile
        profiles = UserProfile.objects.filter(user=user, status='active')
        if profiles.exists() and not telegram_user.selected_profile:
            telegram_user.selected_profile = profiles.first()
            telegram_user.save(update_fields=['selected_profile'])
        
        # Generate auth token
        token, _ = Token.objects.get_or_create(user=user)
        
        # Prepare user data
        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'profiles': [
                {
                    'id': p.id,
                    'profile_type': p.profile_type,
                    'organization': {
                        'id': p.organization.id,
                        'name': p.organization.name,
                    } if p.organization else None,
                }
                for p in profiles
            ]
        }
        
        # Send confirmation message via Telegram
        telegram_service = TelegramService()
        telegram_service.send_message(
            chat_id=telegram_id,
            text=(
                f"🎉 <b>Account linked successfully!</b>\n\n"
                f"Your Telegram account is now connected to:\n"
                f"<b>Email:</b> {user.email}\n"
                f"<b>Name:</b> {user.full_name}\n\n"
                f"You can now use the bot to manage your CRM!\n"
                f"Type /help to see available commands."
            )
        )
        
        logger.info(f"✅ Successfully linked Telegram {telegram_id} to user {user.email}")
        
        return Response({
            'success': True,
            'token': token.key,
            'user': user_data,
            'message': 'Account linked successfully'
        })
    
    except Exception as e:
        logger.error(f"❌ Error linking Telegram account: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to link account', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

