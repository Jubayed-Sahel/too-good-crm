"""
Telegram Bot Deep Link Generator
Generates secure deep links for Telegram bot authorization from CRM
"""
import hashlib
import hmac
import json
import logging
import time
from typing import Dict, Optional

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from crmApp.models import User, UserProfile

logger = logging.getLogger(__name__)


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
        
        return Response({
            'telegram_link': telegram_link,
            'bot_username': bot_username,
            'expires_in': 300,  # 5 minutes
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

