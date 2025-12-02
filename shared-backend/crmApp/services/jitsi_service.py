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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


class JitsiService:
    """
    Service for managing 8x8 Video calls between CRM users.
    Generates JWT tokens for secure authentication with 8x8's Jitsi platform.
    """
    
    def __init__(self, use_public_server=None):
        # 8x8 Configuration
        self.app_id = getattr(settings, 'JITSI_8X8_APP_ID', '')
        self.api_key = getattr(settings, 'JITSI_8X8_API_KEY', '')
        self.kid = getattr(settings, 'JITSI_8X8_KID', '')
        self.server_domain = getattr(settings, 'JITSI_SERVER', '8x8.vc')
        self.algorithm = getattr(settings, 'JITSI_JWT_ALGORITHM', 'RS256')
        self.jwt_expires_in = getattr(settings, 'JITSI_JWT_EXPIRES_IN', 3600)
        
        # Check for force public server environment variable
        force_public = getattr(settings, 'JITSI_USE_PUBLIC_SERVER', 'false').lower() == 'true'
        
        # If 8x8 credentials are not configured, force_public is True, or use_public_server is True,
        # fall back to public Jitsi server (meet.jit.si) which doesn't need JWT
        self.use_public_server = use_public_server if use_public_server is not None else (force_public or not self.app_id or not self.api_key)
        
        if self.use_public_server:
            self.server_domain = 'meet.jit.si'
            logger.info("🌐 Using public Jitsi server (meet.jit.si) - no authentication required")
        elif not self.app_id or not self.api_key:
            logger.warning("⚠️ 8x8 Video credentials not configured. Set JITSI_8X8_APP_ID and JITSI_8X8_API_KEY in settings.")
        else:
            logger.info(f"🔐 Using 8x8 Video server ({self.server_domain}) with JWT authentication")
    
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
        Returns None if using public Jitsi server (no auth needed).
        
        Args:
            room_name (str): The room identifier
            user (User): Django user object
            moderator (bool): Whether user has moderator privileges
            
        Returns:
            str or None: JWT token for authentication (None for public server)
        """
        # Public Jitsi server doesn't need JWT token
        if self.use_public_server:
            logger.info(f"Using public server - no JWT token needed for room {room_name}")
            return None
            
        if not self.app_id or not self.api_key:
            raise ValueError("8x8 credentials not configured")
        
        # Current time and expiration
        now = int(time.time())
        exp = now + self.jwt_expires_in
        
        # User display name
        display_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # JWT Payload for 8x8 Video (Jaas format)
        # NOTE: recording is explicitly enabled so that the in-call UI
        # and external API can start/stop recordings.
        payload = {
            # Standard JWT claims
            "iss": "chat",  # Issuer - must be "chat" for 8x8
            "sub": self.app_id,  # Subject (your 8x8 App ID)
            "aud": "jitsi",  # Audience - must be "jitsi"
            "iat": now,  # Issued at
            "nbf": now,  # Not before
            "exp": exp,  # Expiration time
            
            # 8x8 Video specific claims
            "room": "*",  # Allow access to any room (or specify room_name)
            "context": {
                "user": {
                    "id": str(user.id),
                    "name": display_name,
                    "email": user.email,
                    "avatar": "",
                    "moderator": str(moderator).lower(),  # String boolean
                },
                "features": {
                    "livestreaming": "false",
                    "recording": "true",  # Allow recording controls for this user
                    "transcription": "false",
                    "outbound-call": "false",
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
        
        logger.info(f"Generated JWT token for user {user.username} in room {room_name}")
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
            
            # Get or create presence record for recipient
            presence, created = UserPresence.objects.get_or_create(
                user=recipient,
                defaults={
                    'status': 'online',
                    'available_for_calls': True
                }
            )
            
            recipient_name = f"{recipient.first_name} {recipient.last_name}".strip() or recipient.username
            
            # Only check availability if user is explicitly marked as unavailable
            # Allow calls even if user is offline - they can answer when they come online
            if presence.status == 'busy' or (presence.status != 'offline' and not presence.available_for_calls):
                raise ValueError(f"{recipient_name} is not available for calls")
        
        # Get organization from user profile if not provided (optional)
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
            # Organization is optional - users can make calls without one
        
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
            organization=organization,  # Can be None
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
        
        # Send real-time Pusher notification to recipient
        if recipient:
            self._send_call_notification(call_session, 'call-initiated', recipient.id)
        
        # Also notify initiator that call was created
        self._send_call_notification(call_session, 'call-initiated', initiator.id)
        
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
        
        # Send real-time notification to both users
        self._send_call_notification(call_session, 'call-answered', call_session.initiator.id)
        self._send_call_notification(call_session, 'call-answered', call_session.recipient.id)
        
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
        
        # Send real-time notification to both users
        self._send_call_notification(call_session, 'call-rejected', call_session.initiator.id)
        self._send_call_notification(call_session, 'call-rejected', call_session.recipient.id)
        
        return call_session
    
    def end_call(self, call_session, user):
        """
        End an active call.
        
        Args:
            call_session (JitsiCallSession): The call session to end
            user (User): User ending the call
        """
        logger.info(f"[end_call] Starting - Call ID: {call_session.id}, User: {user.id}, Current status: {call_session.status}")
        
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
        logger.info(f"[end_call] Call {call_session.id} saved with status='completed'")
        
        # Clear current call from all participants
        for participant_id in call_session.participants:
            try:
                participant = User.objects.get(id=participant_id)
                presence = UserPresence.objects.get(user=participant)
                if presence.current_call == call_session:
                    presence.current_call = None
                    presence.status = 'online'
                    presence.save()
                    logger.info(f"[end_call] Cleared current_call for participant {participant_id}")
            except (User.DoesNotExist, UserPresence.DoesNotExist):
                logger.warning(f"[end_call] Could not find user or presence for participant {participant_id}")
                pass
        
        logger.info(f"Call ended: Room {call_session.room_name}, Duration: {call_session.duration_formatted}")
        
        # Log the call as an activity
        self._log_call_activity(call_session)
        
        # Send real-time notification to all participants
        for participant_id in call_session.participants:
            logger.info(f"[end_call] Sending call-ended notification to participant {participant_id}")
            self._send_call_notification(call_session, 'call-ended', participant_id)
        
        logger.info(f"[end_call] Completed for call {call_session.id}")
        return call_session
    
    def get_video_url(self, call_session, user):
        """
        Generate Jitsi Video URL with JWT token (if needed) for joining a call.
        
        Args:
            call_session (JitsiCallSession): The call session
            user (User): User joining the call
            
        Returns:
            dict: URL and JWT token for joining (token is None for public server)
        """
        # Generate JWT token for this user (None for public server)
        is_moderator = (call_session.initiator == user)
        jwt_token = self.generate_jwt_token(
            call_session.room_name,
            user,
            moderator=is_moderator
        )
        
        # Video URL format
        if self.use_public_server:
            # Public Jitsi server (meet.jit.si)
            video_url = f"https://{self.server_domain}/{call_session.room_name}"
            logger.info(f"Generated public Jitsi URL: {video_url}")
        else:
            # 8x8 Video URL format
            video_url = f"https://{self.server_domain}/{self.app_id}/{call_session.room_name}"
            logger.info(f"Generated 8x8 Video URL: {video_url}")
        
        return {
            'video_url': video_url,
            'jwt_token': jwt_token,  # None for public server
            'room_name': call_session.room_name,
            'app_id': self.app_id if not self.use_public_server else None,
            'server_domain': self.server_domain,
            'error': None
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
    
    def _log_call_activity(self, call_session):
        """
        Create an Activity record for a completed video call.
        
        Args:
            call_session: JitsiCallSession object
        """
        from crmApp.models import Activity
        
        try:
            # Only log completed calls with actual duration
            if call_session.status != 'completed' or not call_session.duration_seconds:
                return
            
            # Get initiator and recipient info
            initiator = call_session.initiator
            recipient = call_session.recipient
            
            if not initiator or not recipient:
                logger.debug(f"Skipping activity log for call {call_session.id}: Missing initiator or recipient")
                return
            
            # Format recipient info
            recipient_name = f"{recipient.first_name} {recipient.last_name}".strip() or recipient.username
            recipient_email = recipient.email
            
            # Create activity title and description
            call_type_label = "Video Call" if call_session.call_type == 'video' else "Audio Call"
            title = f"{call_type_label} with {recipient_name}"
            description = (
                f"{call_type_label} between {initiator.username} and {recipient_name} ({recipient_email})\n"
                f"Duration: {call_session.duration_formatted}\n"
                f"Room: {call_session.room_name}"
            )
            
            # Create the activity record
            video_url = f"https://{self.server_domain}/{self.app_id}/{call_session.room_name}"
            activity = Activity.objects.create(
                organization=call_session.organization,
                activity_type='call',
                title=title,
                description=description,
                customer_name=recipient_name,
                phone_number=recipient_email,  # Store email in phone_number field for reference
                call_duration=call_session.duration_seconds,
                duration_minutes=call_session.duration_seconds // 60,
                status='completed',
                scheduled_at=call_session.started_at,
                completed_at=call_session.ended_at,
                created_by=initiator,
                video_call_room=call_session.room_name,
                video_call_url=video_url,
            )
            
            logger.info(f"Created activity record {activity.id} for video call {call_session.id}")
        except Exception as e:
            logger.error(f"Failed to create activity for call {call_session.id}: {e}")
    
    def _send_call_notification(self, call_session, event_type, user_id):
        """
        Send real-time call notification via WebSocket (Django Channels)
        
        Args:
            call_session: JitsiCallSession object
            event_type: 'call-initiated', 'call-answered', 'call-rejected', 'call-ended'
            user_id: ID of the user to notify
        """
        try:
            channel_layer = get_channel_layer()
            if not channel_layer:
                logger.debug("Channel layer not available, skipping real-time video call notification")
                return
            
            # Get video URL data for the call
            user = User.objects.get(id=user_id)
            video_url_data = self.get_video_url(call_session, user)
            
            # Prepare call data
            call_data = {
                'event': event_type,
                'data': {
                    'id': call_session.id,
                    'room_name': call_session.room_name,
                    'call_type': call_session.call_type,
                    'status': call_session.status,
                    'initiator': call_session.initiator.id,
                    'initiator_name': f"{call_session.initiator.first_name} {call_session.initiator.last_name}".strip() or call_session.initiator.username,
                    'recipient': call_session.recipient.id if call_session.recipient else None,
                    'recipient_name': f"{call_session.recipient.first_name} {call_session.recipient.last_name}".strip() or call_session.recipient.username if call_session.recipient else None,
                    'jitsi_url': video_url_data,
                    'created_at': call_session.created_at.isoformat() if call_session.created_at else None,
                    'started_at': call_session.started_at.isoformat() if call_session.started_at else None,
                    'ended_at': call_session.ended_at.isoformat() if call_session.ended_at else None,
                    'duration_seconds': call_session.duration_seconds,
                    'participants': call_session.participants,
                }
            }
            
            # Send to user's WebSocket group
            group_name = f'video_call_{user_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'video_call_event',
                    'data': call_data
                }
            )
            
            logger.info(f"Sent WebSocket notification: {event_type} for call {call_session.id} to user {user_id}")
        except Exception as e:
            logger.error(f"Failed to send WebSocket video call notification: {e}")


# Singleton instance
jitsi_service = JitsiService()
