"""
8x8 Video Integration Service (Jitsi Enterprise)
Handles JWT token generation, call session management, and user presence for 8x8 Video
"""
import uuid
import hashlib
import jwt
import time
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from crmApp.models import JitsiCallSession, UserPresence, User
import logging

logger = logging.getLogger(__name__)


class JitsiService:
    """
    Service for managing 8x8 Video calls between CRM users.
    Generates JWT tokens for secure authentication with 8x8's Jitsi platform.
    """
    
    def __init__(self):
        # 8x8 Configuration
        self.app_id = getattr(settings, 'JITSI_8X8_APP_ID', '')
        self.api_key = getattr(settings, 'JITSI_8X8_API_KEY', '')
        self.kid = getattr(settings, 'JITSI_8X8_KID', '')
        self.server_domain = getattr(settings, 'JITSI_SERVER', '8x8.vc')
        self.algorithm = getattr(settings, 'JITSI_JWT_ALGORITHM', 'RS256')
        self.jwt_expires_in = getattr(settings, 'JITSI_JWT_EXPIRES_IN', 3600)
        
        if not self.app_id or not self.api_key:
            logger.warning("8x8 Video credentials not configured. Set JITSI_8X8_APP_ID and JITSI_8X8_API_KEY in settings.")
    
    def generate_room_name(self, initiator_id, recipient_id=None):
        """
        Generate a unique room name for a call session.
        Format: crm-{timestamp}-{hash}
        """
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        unique_string = f"{initiator_id}-{recipient_id or 'group'}-{uuid.uuid4().hex[:8]}"
        hash_part = hashlib.md5(unique_string.encode()).hexdigest()[:8]
        return f"crm-{timestamp}-{hash_part}"
    
    def generate_jwt_token(self, room_name, user, moderator=True):
        """
        Generate JWT token for 8x8 Video authentication.
        
        Args:
            room_name (str): The room identifier
            user (User): Django user object
            moderator (bool): Whether user has moderator privileges
            
        Returns:
            str: JWT token for authentication
        """
        if not self.app_id or not self.api_key:
            raise ValueError("8x8 credentials not configured")
        
        # Current time and expiration
        now = int(time.time())
        exp = now + self.jwt_expires_in
        
        # User display name
        display_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # JWT Payload for 8x8 Video
        payload = {
            # Standard JWT claims
            "iss": self.app_id,  # Issuer (your 8x8 App ID)
            "sub": self.server_domain,  # Subject (8x8 domain)
            "aud": self.app_id,  # Audience (your 8x8 App ID)
            "iat": now,  # Issued at
            "nbf": now,  # Not before
            "exp": exp,  # Expiration time
            
            # 8x8 Video specific claims
            "room": room_name,  # Room name
            "context": {
                "user": {
                    "id": str(user.id),
                    "name": display_name,
                    "email": user.email,
                    "moderator": str(moderator).lower(),  # String boolean
                },
                "features": {
                    "livestreaming": False,
                    "recording": False,
                    "transcription": False,
                }
            }
        }
        
        # Generate JWT token
        # For 8x8, API Key is the private key for RS256 signing
        token = jwt.encode(
            payload,
            self.api_key,
            algorithm=self.algorithm,
            headers={'kid': self.kid} if self.kid else None
        )
        
        return token
    
    def initiate_call(self, initiator, recipient=None, call_type='video', organization=None):
        """
        Initiate a new call session.
        
        Args:
            initiator (User): User initiating the call
            recipient (User, optional): Recipient for 1-on-1 call
            call_type (str): 'audio' or 'video'
            organization (Organization): Organization context
            
        Returns:
            JitsiCallSession: Created call session with JWT token
            
        Raises:
            ValueError: If recipient is not available or inputs are invalid
        """
        # Validate recipient availability
        if recipient:
            if recipient == initiator:
                raise ValueError("Cannot call yourself")
            
            try:
                presence = UserPresence.objects.get(user=recipient)
                recipient_name = f"{recipient.first_name} {recipient.last_name}".strip() or recipient.username
                if not presence.is_available:
                    raise ValueError(f"{recipient_name} is not available for calls")
            except UserPresence.DoesNotExist:
                recipient_name = f"{recipient.first_name} {recipient.last_name}".strip() or recipient.username
                UserPresence.objects.create(user=recipient, status='offline')
                raise ValueError(f"{recipient_name} is offline")
        
        # Get organization from user profile if not provided
        if not organization:
            from crmApp.models import UserProfile
            initiator_profile = UserProfile.objects.filter(
                user=initiator,
                status='active',
                is_primary=True
            ).first() or UserProfile.objects.filter(
                user=initiator,
                status='active'
            ).first()
            
            if initiator_profile and initiator_profile.organization:
                organization = initiator_profile.organization
            else:
                raise ValueError("Organization is required for call sessions. User must have an active profile with an organization.")
        
        # Generate unique room name
        room_name = self.generate_room_name(
            initiator.id,
            recipient.id if recipient else None
        )
        
        # Create call session
        call_session = JitsiCallSession.objects.create(
            room_name=room_name,
            call_type=call_type,
            status='pending',
            initiator=initiator,
            recipient=recipient,
            participants=[initiator.id] + ([recipient.id] if recipient else []),
            organization=organization,
            jitsi_server=self.server_domain
        )
        
        logger.info(f"Call initiated: {initiator.username} → {recipient.username if recipient else 'group'} (Room: {room_name})")
        
        # Update initiator presence
        try:
            initiator_presence = UserPresence.objects.get(user=initiator)
            initiator_presence.current_call = call_session
            initiator_presence.status = 'busy'
            initiator_presence.save()
        except UserPresence.DoesNotExist:
            UserPresence.objects.create(
                user=initiator,
                current_call=call_session,
                status='busy'
            )
        
        # Update recipient presence with current_call so they can see the incoming call
        if recipient:
            try:
                recipient_presence = UserPresence.objects.get(user=recipient)
                recipient_presence.current_call = call_session
                recipient_presence.save()
            except UserPresence.DoesNotExist:
                UserPresence.objects.create(
                    user=recipient,
                    current_call=call_session,
                    status='online'
                )
        
        return call_session
    
    def answer_call(self, call_session, user):
        """
        User answers an incoming call.
        
        Args:
            call_session (JitsiCallSession): The call session
            user (User): User answering the call
        """
        if call_session.status != 'pending' and call_session.status != 'ringing':
            raise ValueError("Call is not in answerable state")
        
        call_session.status = 'active'
        if not call_session.started_at:
            call_session.started_at = timezone.now()
        call_session.save()
        
        # Update user presence
        try:
            presence = UserPresence.objects.get(user=user)
            presence.current_call = call_session
            presence.status = 'busy'
            presence.save()
        except UserPresence.DoesNotExist:
            UserPresence.objects.create(
                user=user,
                current_call=call_session,
                status='busy'
            )
        
        logger.info(f"Call answered: {user.username} joined room {call_session.room_name}")
        return call_session
    
    def reject_call(self, call_session, user):
        """
        User rejects an incoming call.
        """
        if call_session.recipient != user:
            raise ValueError("Only the recipient can reject this call")
        
        call_session.status = 'rejected'
        call_session.ended_at = timezone.now()
        call_session.save()
        
        # Clear initiator's current call
        try:
            initiator_presence = UserPresence.objects.get(user=call_session.initiator)
            initiator_presence.current_call = None
            initiator_presence.status = 'online'
            initiator_presence.save()
        except UserPresence.DoesNotExist:
            pass
        
        logger.info(f"Call rejected: {user.username} rejected call from {call_session.initiator.username}")
        return call_session
    
    def end_call(self, call_session, user):
        """
        End an active call.
        
        Args:
            call_session (JitsiCallSession): The call session to end
            user (User): User ending the call
        """
        if call_session.status in ['completed', 'rejected', 'cancelled', 'failed']:
            logger.warning(f"Attempting to end already ended call: {call_session.id}")
            return
        
        call_session.status = 'completed'
        call_session.ended_at = timezone.now()
        
        # Calculate duration if call was active
        if call_session.started_at:
            duration = (call_session.ended_at - call_session.started_at).total_seconds()
            call_session.duration_seconds = int(duration)
        
        call_session.save()
        
        # Clear current call from all participants
        for participant_id in call_session.participants:
            try:
                participant = User.objects.get(id=participant_id)
                presence = UserPresence.objects.get(user=participant)
                if presence.current_call == call_session:
                    presence.current_call = None
                    presence.status = 'online'
                    presence.save()
            except (User.DoesNotExist, UserPresence.DoesNotExist):
                pass
        
        logger.info(f"Call ended: Room {call_session.room_name}, Duration: {call_session.duration_formatted}")
        return call_session
    
    def get_video_url(self, call_session, user):
        """
        Generate 8x8 Video URL with JWT token for joining a call.
        
        Args:
            call_session (JitsiCallSession): The call session
            user (User): User joining the call
            
        Returns:
            dict: URL and JWT token for joining
        """
        # Generate JWT token for this user
        is_moderator = (call_session.initiator == user)
        jwt_token = self.generate_jwt_token(
            call_session.room_name,
            user,
            moderator=is_moderator
        )
        
        # 8x8 Video URL format
        video_url = f"https://{self.server_domain}/{self.app_id}/{call_session.room_name}"
        
        return {
            'video_url': video_url,
            'jwt_token': jwt_token,
            'room_name': call_session.room_name,
            'app_id': self.app_id,
            'server_domain': self.server_domain,
        }
    
    def get_active_calls(self, organization=None, user=None):
        """
        Get all active calls, optionally filtered by organization or user.
        """
        from django.db.models import Q
        
        queryset = JitsiCallSession.objects.filter(status='active')
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        if user:
            queryset = queryset.filter(
                Q(initiator=user) |
                Q(recipient=user) |
                Q(participants__contains=[user.id])
            )
        
        return queryset.select_related('initiator', 'recipient', 'organization').order_by('-started_at')
    
    def update_user_presence(self, user, status='online', status_message='', available_for_calls=True):
        """
        Update user's presence status.
        """
        presence, created = UserPresence.objects.get_or_create(user=user)
        presence.status = status
        presence.status_message = status_message
        presence.available_for_calls = available_for_calls
        presence.last_seen = timezone.now()
        presence.save()
        
        return presence
    
    def get_online_users(self, organization=None):
        """
        Get list of users currently online and available for calls.
        """
        # Users online in the last 5 minutes
        recent_time = timezone.now() - timezone.timedelta(minutes=5)
        
        queryset = UserPresence.objects.filter(
            last_seen__gte=recent_time,
            available_for_calls=True
        ).select_related('user')
        
        if organization:
            # Filter by organization membership
            from crmApp.models import UserProfile
            org_user_ids = UserProfile.objects.filter(
                organization=organization,
                status='active'
            ).values_list('user_id', flat=True)
            
            queryset = queryset.filter(user_id__in=org_user_ids)
        
        return queryset


# Singleton instance
jitsi_service = JitsiService()
