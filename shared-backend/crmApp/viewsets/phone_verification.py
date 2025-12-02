"""
Phone Verification API Endpoints
Handles phone number-based authentication for Telegram bot linking
"""
import logging
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.conf import settings

from crmApp.models import PhoneVerification, TelegramUser, User
from crmApp.services.sms_service import SMSService

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_verification_code(request):
    """
    Send verification code to phone number.
    
    POST /api/telegram/send-verification-code/
    
    Body:
    {
        "phone_number": "+1234567890",
        "telegram_chat_id": 123456789  # Optional, if linking existing Telegram account
    }
    
    Returns:
    {
        "success": true,
        "message": "Verification code sent to +1234567890",
        "expires_in": 900  # seconds
    }
    """
    try:
        user = request.user
        phone_number = request.data.get('phone_number')
        telegram_chat_id = request.data.get('telegram_chat_id')
        
        if not phone_number:
            return Response(
                {'error': 'Phone number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and normalize phone number
        sms_service = SMSService()
        is_valid, error_msg = sms_service.validate_phone_number(phone_number)
        
        if not is_valid:
            return Response(
                {'error': error_msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        normalized_phone = sms_service.normalize_phone_number(phone_number)
        
        # Create verification code
        verification = PhoneVerification.create_verification(
            user=user,
            phone_number=normalized_phone,
            telegram_chat_id=telegram_chat_id
        )
        
        # Generate verification URL
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{base_url}/verify-telegram?code={verification.verification_code}&phone={normalized_phone}"
        
        # Send SMS
        success, error_msg = sms_service.send_verification_code(
            phone_number=normalized_phone,
            code=verification.verification_code,
            verification_url=verification_url
        )
        
        if not success:
            logger.error(f"Failed to send SMS to {normalized_phone}: {error_msg}")
            # Still return success to user (code is created), but log the error
            # In production, you might want to return an error if SMS fails
        
        logger.info(f"Verification code sent to {normalized_phone} for user {user.email}")
        
        expires_in = int((verification.expires_at - timezone.now()).total_seconds())
        
        return Response({
            'success': True,
            'message': f"Verification code sent to {normalized_phone}",
            'phone_number': normalized_phone,
            'expires_in': expires_in,
            'verification_id': verification.id,
            'verification_code': verification.verification_code,  # Include code for frontend display
            'verification_url': verification_url,  # Include URL for frontend
        })
        
    except Exception as e:
        logger.error(f"Error sending verification code: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to send verification code', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow any user to verify with code
def verify_phone_code(request):
    """
    Verify phone code and link Telegram account.
    
    POST /api/telegram/verify-phone-code/
    
    Body:
    {
        "phone_number": "+1234567890",
        "verification_code": "123456",
        "telegram_chat_id": 123456789  # Required for linking
    }
    
    Returns:
    {
        "success": true,
        "message": "Phone verified and Telegram account linked",
        "user": {...},
        "telegram_user": {...}
    }
    """
    try:
        phone_number = request.data.get('phone_number')
        verification_code = request.data.get('verification_code')
        telegram_chat_id = request.data.get('telegram_chat_id')
        
        if not all([phone_number, verification_code]):
            return Response(
                {'error': 'Phone number and verification code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not telegram_chat_id:
            return Response(
                {'error': 'Telegram chat ID is required for linking'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Normalize phone number
        sms_service = SMSService()
        normalized_phone = sms_service.normalize_phone_number(phone_number)
        
        # Find verification record
        verification = PhoneVerification.objects.filter(
            phone_number=normalized_phone,
            verification_code=verification_code,
            is_verified=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        
        if not verification:
            return Response(
                {'error': 'Invalid or expired verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify code
        success, message = verification.verify(verification_code)
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create TelegramUser
        telegram_user, created = TelegramUser.objects.get_or_create(
            chat_id=telegram_chat_id,
            defaults={
                'telegram_username': None,
                'telegram_first_name': None,
                'telegram_last_name': None,
            }
        )
        
        # Link to CRM user
        telegram_user.authenticate(verification.user)
        verification.telegram_user = telegram_user
        verification.save(update_fields=['telegram_user'])
        
        # Set default profile if available
        from crmApp.models import UserProfile
        profiles = UserProfile.objects.filter(user=verification.user, status='active')
        if profiles.exists() and not telegram_user.selected_profile:
            telegram_user.selected_profile = profiles.first()
            telegram_user.save(update_fields=['selected_profile'])
        
        logger.info(
            f"Phone {normalized_phone} verified and linked to Telegram chat {telegram_chat_id} "
            f"for user {verification.user.email}"
        )
        
        # Prepare response
        user_data = {
            'id': verification.user.id,
            'email': verification.user.email,
            'full_name': verification.user.full_name,
        }
        
        telegram_user_data = {
            'chat_id': telegram_user.chat_id,
            'username': telegram_user.telegram_username,
            'full_name': telegram_user.full_name,
            'is_authenticated': telegram_user.is_authenticated,
        }
        
        return Response({
            'success': True,
            'message': 'Phone verified and Telegram account linked successfully',
            'user': user_data,
            'telegram_user': telegram_user_data,
        })
        
    except Exception as e:
        logger.error(f"Error verifying phone code: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to verify code', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def check_verification_code(request):
    """
    Check if verification code is valid (without verifying).
    Used by frontend to pre-validate code format.
    
    GET /api/telegram/check-verification-code/?phone=+1234567890&code=123456
    
    Returns:
    {
        "exists": true,
        "is_expired": false,
        "remaining_attempts": 4
    }
    """
    try:
        phone_number = request.GET.get('phone')
        code = request.GET.get('code')
        
        if not phone_number or not code:
            return Response(
                {'error': 'Phone number and code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sms_service = SMSService()
        normalized_phone = sms_service.normalize_phone_number(phone_number)
        
        verification = PhoneVerification.objects.filter(
            phone_number=normalized_phone,
            verification_code=code,
            is_verified=False
        ).order_by('-created_at').first()
        
        if not verification:
            return Response({
                'exists': False,
                'is_expired': True,
                'remaining_attempts': 0
            })
        
        return Response({
            'exists': True,
            'is_expired': verification.is_expired,
            'remaining_attempts': verification.max_attempts - verification.verification_attempts,
            'expires_at': verification.expires_at.isoformat() if verification.expires_at else None,
        })
        
    except Exception as e:
        logger.error(f"Error checking verification code: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to check code', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

