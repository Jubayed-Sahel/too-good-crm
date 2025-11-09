"""
Jitsi Meet Integration Service
Handles creation of call sessions, room management, and user presence
"""
import uuid
import hashlib
from django.utils import timezone
from django.conf import settings
from crmApp.models import JitsiCallSession, UserPresence, User
import logging

logger = logging.getLogger(__name__)


class JitsiService:
    """
    Service for managing Jitsi Meet video/audio calls between users.
    Handles room creation, call session management, and user presence.
    """
    
    def __init__(self):
        # Use custom Jitsi server or default to meet.jit.si
        self.jitsi_server = getattr(settings, 'JITSI_SERVER', 'meet.jit.si')
        self.jitsi_domain = getattr(settings, 'JITSI_DOMAIN', 'meet.jit.si')
    
    def generate_room_name(self, initiator_id, recipient_id=None):
        """
        Generate a unique room name for a call session.
        Format: crm-{timestamp}-{hash}
        """
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
        unique_string = f"{initiator_id}-{recipient_id or 'group'}-{uuid.uuid4().hex[:8]}"
        hash_part = hashlib.md5(unique_string.encode()).hexdigest()[:8]
        return f"crm-{timestamp}-{hash_part}"
    
    def initiate_call(self, initiator, recipient=None, call_type='video', organization=None):
        """
        Initiate a new call session.
        
        Args:
            initiator (User): User initiating the call
            recipient (User, optional): Recipient for 1-on-1 call
            call_type (str): 'audio' or 'video'
            organization (Organization): Organization context
            
        Returns:
            JitsiCallSession: Created call session
            
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
                # Create presence record if it doesn't exist
                recipient_name = f"{recipient.first_name} {recipient.last_name}".strip() or recipient.username
                UserPresence.objects.create(user=recipient, status='offline')
                raise ValueError(f"{recipient_name} is offline")
        
        # Get organization from user profile if not provided
        if not organization:
            # Try to get organization from initiator's active profile
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
            jitsi_server=self.jitsi_server
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
    
    def get_jitsi_url(self, call_session, user_name=None):
        """
        Generate Jitsi Meet URL for joining a call.
        
        Args:
            call_session (JitsiCallSession): The call session
            user_name (str, optional): Display name for the user
            
        Returns:
            str: Full Jitsi Meet URL
        """
        base_url = f"https://{self.jitsi_server}/{call_session.room_name}"
        
        # Add user display name as URL parameter
        if user_name:
            base_url += f"#userInfo.displayName=\"{user_name}\""
        
        return base_url
    
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
        
        return queryset.select_related('initiator', 'recipient', 'organization')
    
    def get_online_users(self, organization=None):
        """
        Get all online users, optionally filtered by organization.
        """
        from django.db.models import Q
        from crmApp.models import UserProfile
        
        queryset = UserPresence.objects.filter(
            Q(status='online') | Q(status='away')
        ).select_related('user')
        
        if organization:
            # Filter by organization membership through UserProfile
            queryset = queryset.filter(
                user__user_profiles__organization=organization,
                user__user_profiles__status='active'
            ).distinct()
        
        # Only return users who are truly online (active in last 5 minutes)
        return [p for p in queryset if p.is_online]
    
    def update_user_status(self, user, status, available_for_calls=None, status_message=None):
        """
        Update user's online status and availability.
        
        Args:
            user (User): The user
            status (str): 'online', 'busy', 'away', or 'offline'
            available_for_calls (bool, optional): Whether to accept calls
            status_message (str, optional): Custom status message
        """
        presence, created = UserPresence.objects.get_or_create(user=user)
        presence.status = status
        
        if available_for_calls is not None:
            presence.available_for_calls = available_for_calls
        
        if status_message is not None:
            presence.status_message = status_message
        
        presence.save()
        
        logger.info(f"User status updated: {user.username} → {status}")
        
        return presence


# Singleton instance
jitsi_service = JitsiService()
