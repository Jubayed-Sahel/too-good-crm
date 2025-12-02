"""
Telegram Bot Deep Link Generator
Generates secure deep links for Telegram bot authorization from CRM
"""
import hashlib
import hmac
import json
import logging
import secrets
import string
import time
from typing import Dict, Optional
from django.utils import timezone
from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from crmApp.models import User, UserProfile

logger = logging.getLogger(__name__)

# Cache key prefix for auth codes
AUTH_CODE_CACHE_PREFIX = "tg_auth_code_"
AUTH_CODE_EXPIRY = 300  # 5 minutes


def generate_auth_token(user_id: int, profile_id: int, timestamp: int) -> str:
    """
    Generate a secure token for Telegram bot authorization.
    
    Args:
        user_id: CRM user ID
        profile_id: Active profile ID
        timestamp: Unix timestamp
        
    Returns:
        HMAC-SHA256 token
    """
    bot_token = settings.TG_BOT_TOKEN
    
    # Create data string
    data = f"{user_id}:{profile_id}:{timestamp}"
    
    # Generate HMAC
    token = hmac.new(
        bot_token.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return token


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def generate_telegram_link(request):
    """
    Generate a deep link to open Telegram bot with auto-authorization.
    
    GET /api/telegram/generate-link/
    
    Response:
    {
        "telegram_link": "https://t.me/LeadGrid_bot?start=auth_USER123_PROFILE456_TOKEN",
        "bot_username": "LeadGrid_bot",
        "expires_in": 300
    }
    """
    try:
        user = request.user
        
        # Get active profile
        profile_id = request.data.get('profile_id') or request.GET.get('profile_id')
        
        if profile_id:
            try:
                profile = UserProfile.objects.get(
                    id=profile_id,
                    user=user,
                    status='active'
                )
            except UserProfile.DoesNotExist:
                return Response(
                    {'error': 'Profile not found or not active'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Get first active profile
            profile = UserProfile.objects.filter(
                user=user,
                status='active'
            ).first()
            
            if not profile:
                return Response(
                    {'error': 'No active profile found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Generate timestamp
        timestamp = int(time.time())
        
        # Generate secure token
        token = generate_auth_token(user.id, profile.id, timestamp)
        
        # Create deep link payload
        # Format: auth_USERID_PROFILEID_TIMESTAMP_TOKEN
        payload = f"auth_{user.id}_{profile.id}_{timestamp}_{token}"
        
        # Bot username (from settings or default)
        bot_username = getattr(settings, 'TG_BOT_USERNAME', 'LeadGrid_bot')
        
        # Generate Telegram deep link
        telegram_link = f"https://t.me/{bot_username}?start={payload}"
        
        logger.info(
            f"Generated Telegram link for user {user.email} "
            f"(profile: {profile.profile_type})"
        )
        
        # Generate a short 6-character code for manual entry
        # Format: 3 letters + 3 digits (e.g., "ABC123")
        auth_code = ''.join(secrets.choice(string.ascii_uppercase) for _ in range(3))
        auth_code += ''.join(secrets.choice(string.digits) for _ in range(3))
        
        # Store code in cache with user/profile info (expires in 5 minutes)
        code_data = {
            'user_id': user.id,
            'profile_id': profile.id,
            'timestamp': timestamp,
            'token': token  # Store full token for verification
        }
        cache.set(f"{AUTH_CODE_CACHE_PREFIX}{auth_code}", code_data, AUTH_CODE_EXPIRY)
        
        logger.info(f"Generated auth code {auth_code} for user {user.email}")
        
        return Response({
            'telegram_link': telegram_link,
            'auth_code': auth_code,  # Short code for manual entry
            'bot_username': bot_username,
            'expires_in': AUTH_CODE_EXPIRY,  # 5 minutes
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
            },
            'profile': {
                'id': profile.id,
                'profile_type': profile.profile_type,
                'organization': {
                    'id': profile.organization.id,
                    'name': profile.organization.name,
                } if profile.organization else None,
            }
        })
    
    except Exception as e:
        logger.error(f"Error generating Telegram link: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to generate link', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def verify_auth_token(user_id: int, profile_id: int, timestamp: int, token: str) -> bool:
    """
    Verify the auth token from deep link.
    
    Args:
        user_id: User ID from payload
        profile_id: Profile ID from payload
        timestamp: Timestamp from payload
        token: Token to verify
        
    Returns:
        True if valid, False otherwise
    """
    # Check if token is expired (5 minutes)
    current_time = int(time.time())
    if current_time - timestamp > 300:
        logger.warning(f"Expired auth token for user {user_id}")
        return False
    
    # Generate expected token
    expected_token = generate_auth_token(user_id, profile_id, timestamp)
    
    # Compare tokens
    if token != expected_token:
        logger.warning(f"Invalid auth token for user {user_id}")
        return False
    
    return True


def verify_auth_code(code: str) -> Optional[Dict]:
    """
    Verify a short auth code and return user/profile data.
    
    Args:
        code: 6-character auth code (e.g., "ABC123")
        
    Returns:
        Dict with user_id, profile_id, timestamp, token if valid, None otherwise
    """
    if not code or len(code) != 6:
        return None
    
    # Normalize code to uppercase
    code = code.upper()
    
    # Get from cache
    code_data = cache.get(f"{AUTH_CODE_CACHE_PREFIX}{code}")
    
    if not code_data:
        logger.warning(f"Auth code not found or expired: {code}")
        return None
    
    # Verify the stored token is still valid
    user_id = code_data['user_id']
    profile_id = code_data['profile_id']
    timestamp = code_data['timestamp']
    token = code_data['token']
    
    # Verify token
    if not verify_auth_token(user_id, profile_id, timestamp, token):
        logger.warning(f"Invalid token for auth code: {code}")
        cache.delete(f"{AUTH_CODE_CACHE_PREFIX}{code}")  # Delete invalid code
        return None
    
    # Delete code after use (one-time use)
    cache.delete(f"{AUTH_CODE_CACHE_PREFIX}{code}")
    
    logger.info(f"Auth code verified: {code} for user {user_id}")
    return code_data

