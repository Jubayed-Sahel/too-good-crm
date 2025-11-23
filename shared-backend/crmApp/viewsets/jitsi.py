"""
ViewSet for Jitsi call management
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from crmApp.models import JitsiCallSession, UserPresence, User
from crmApp.serializers import (
    JitsiCallSessionSerializer,
    UserPresenceSerializer,
    OnlineUserSerializer,
    JitsiInitiateCallSerializer,
    UpdateCallStatusSerializer,
    UpdatePresenceSerializer,
)
from crmApp.services.jitsi_service import jitsi_service
import logging

logger = logging.getLogger(__name__)


class JitsiCallViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Jitsi call sessions.
    """
    queryset = JitsiCallSession.objects.all()
    serializer_class = JitsiCallSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter calls by user's organizations or user involvement"""
        from django.db.models import Q
        
        # Get user's organizations
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        # Allow access to calls in user's orgs OR where user is involved
        # Note: participants__contains requires PostgreSQL JSONField support
        # For SQLite compatibility, we rely on initiator/recipient checks
        queryset = JitsiCallSession.objects.filter(
            Q(organization_id__in=user_orgs) |
            Q(initiator=self.request.user) |
            Q(recipient=self.request.user)
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by user involvement only
        user_filter = self.request.query_params.get('my_calls')
        if user_filter:
            queryset = queryset.filter(
                Q(initiator=self.request.user) |
                Q(recipient=self.request.user)
            )
        
        return queryset.select_related('initiator', 'recipient', 'organization').order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def initiate_call_by_email(self, request):
        """
        Initiate a new call by looking up user by email.
        
        Request body:
        {
            "recipient_email": "user@example.com",
            "call_type": "video"  // "video" or "audio"
        }
        """
        recipient_email = request.data.get('recipient_email')
        call_type = request.data.get('call_type', 'video')
        
        if not recipient_email:
            return Response(
                {'error': 'recipient_email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Look up user by email
            recipient = User.objects.get(email=recipient_email)
            
            # Get organization from user's primary profile
            user_profile = request.user.user_profiles.filter(is_primary=True).first()
            if not user_profile:
                return Response(
                    {'error': 'User must have an active profile'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initiate call using service
            call_session = jitsi_service.initiate_call(
                initiator=request.user,
                recipient=recipient,
                call_type=call_type,
                organization=user_profile.organization
            )
            
            # Return call details
            return Response({
                'message': 'Call initiated successfully',
                'call_session': JitsiCallSessionSerializer(call_session, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {'error': f'No user found with email: {recipient_email}'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error initiating call by email: {str(e)}")
            return Response(
                {'error': f'Failed to initiate call: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def initiate_call(self, request):
        """
        Initiate a new call to another user.
        
        Request body:
        {
            "recipient_id": 123,  // optional, for 1-on-1 call
            "call_type": "video"  // "video" or "audio"
        }
        """
        serializer = JitsiInitiateCallSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        recipient_id = serializer.validated_data.get('recipient_id')
        call_type = serializer.validated_data.get('call_type', 'video')
        
        try:
            # Get recipient user if specified
            recipient = None
            if recipient_id:
                recipient = User.objects.get(id=recipient_id)
            
            # Get organization from user's primary profile
            user_profile = request.user.user_profiles.filter(is_primary=True).first()
            if not user_profile:
                return Response(
                    {'error': 'User must have an active profile'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Initiate call using service
            call_session = jitsi_service.initiate_call(
                initiator=request.user,
                recipient=recipient,
                call_type=call_type,
                organization=user_profile.organization
            )
            
            # Return call details
            return Response({
                'message': 'Call initiated successfully',
                'call_session': JitsiCallSessionSerializer(call_session, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except User.DoesNotExist:
            return Response(
                {'error': 'Recipient user not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error initiating call: {str(e)}")
            return Response(
                {'error': f'Failed to initiate call: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update call status (answer, reject, end).
        
        Request body:
        {
            "action": "answer|reject|end"
        }
        """
        call_session = self.get_object()
        serializer = UpdateCallStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action_type = serializer.validated_data['action']
        
        try:
            if action_type == 'answer':
                jitsi_service.answer_call(call_session, request.user)
                message = 'Call answered'
            elif action_type == 'reject':
                jitsi_service.reject_call(call_session, request.user)
                message = 'Call rejected'
            elif action_type == 'end':
                jitsi_service.end_call(call_session, request.user)
                message = 'Call ended'
            
            call_session.refresh_from_db()
            
            return Response({
                'message': message,
                'call_session': JitsiCallSessionSerializer(call_session, context={'request': request}).data
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error updating call status: {str(e)}")
            return Response(
                {'error': f'Failed to update call: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def active_calls(self, request):
        """Get all currently active calls"""
        organization = request.user.current_organization
        active_calls = jitsi_service.get_active_calls(organization=organization)
        
        serializer = JitsiCallSessionSerializer(
            active_calls,
            many=True,
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_active_call(self, request):
        """Get user's current active call if any (including pending/ringing)"""
        logger.info(f"[my_active_call] Checking for user: {request.user.username} (ID: {request.user.id})")
        try:
            presence = UserPresence.objects.get(user=request.user)
            logger.info(f"[my_active_call] Found presence - current_call: {presence.current_call}, status: {presence.status}")
            # Check if current_call is still valid
            if presence.current_call:
                logger.info(f"[my_active_call] Call status: {presence.current_call.status}")
                if presence.current_call.status in ['pending', 'ringing', 'active']:
                    serializer = JitsiCallSessionSerializer(
                        presence.current_call,
                        context={'request': request}
                    )
                    logger.info(f"[my_active_call] Returning active call: {presence.current_call.id}")
                    return Response(serializer.data)
                else:
                    # Call is no longer active - clear it
                    logger.info(f"[my_active_call] Call no longer active, clearing")
                    presence.current_call = None
                    presence.status = 'online'
                    presence.save()
        except UserPresence.DoesNotExist:
            # User has no presence record - no active call
            logger.info(f"[my_active_call] No presence record found")
            pass
        except Exception as e:
            # Handle any other database errors gracefully
            logger.error(f"Error getting active call: {str(e)}", exc_info=True)
            pass
        
        # Return 204 No Content when no active call (more semantically correct)
        logger.info(f"[my_active_call] No active call found, returning 204")
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def heartbeat(self, request):
        """Update user's last seen timestamp (called periodically from frontend)"""
        try:
            presence, created = UserPresence.objects.get_or_create(
                user=request.user,
                defaults={'status': 'online', 'available_for_calls': True}
            )
            
            # Update status to online if not already
            if presence.status != 'online':
                presence.status = 'online'
            
            # Heartbeat automatically updates last_seen due to auto_now
            presence.save()
            
            return Response({'status': 'ok'})
        except Exception as e:
            # Log but don't fail - heartbeat failures shouldn't break the app
            logger.error(f"Error in heartbeat: {str(e)}", exc_info=True)
            # Return success anyway to avoid breaking frontend polling
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)


class UserPresenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user presence/status.
    """
    queryset = UserPresence.objects.all()
    serializer_class = UserPresenceSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch']  # Allow POST for custom actions
    
    def get_queryset(self):
        """Get presence for users in same organization"""
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        # Get users in same organizations
        queryset = UserPresence.objects.filter(
            user__user_profiles__organization_id__in=user_orgs,
            user__user_profiles__status='active'
        ).distinct().select_related('user', 'current_call')
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def online_users(self, request):
        """Get all currently online users"""
        # Get organization from user's primary profile
        user_profile = request.user.user_profiles.filter(is_primary=True).first()
        if not user_profile or not user_profile.organization:
            return Response([], status=status.HTTP_200_OK)
        
        online_users = jitsi_service.get_online_users(organization=user_profile.organization)
        
        # Format response
        users_data = []
        for presence in online_users:
            users_data.append({
                'id': presence.user.id,
                'username': presence.user.username,
                'full_name': f"{presence.user.first_name} {presence.user.last_name}".strip() or presence.user.username,
                'status': presence.status,
                'available_for_calls': presence.available_for_calls,
                'status_message': presence.status_message,
                'current_call_id': presence.current_call_id
            })
        
        serializer = OnlineUserSerializer(users_data, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post', 'put', 'patch'])
    def update_my_status(self, request):
        """Update current user's presence status"""
        try:
            serializer = UpdatePresenceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            presence = jitsi_service.update_user_status(
                user=request.user,
                status=serializer.validated_data['status'],
                available_for_calls=serializer.validated_data.get('available_for_calls'),
                status_message=serializer.validated_data.get('status_message')
            )
            
            return Response({
                'message': 'Status updated successfully',
                'presence': UserPresenceSerializer(presence).data
            })
            
        except Exception as e:
            logger.error(f"Error updating presence: {str(e)}", exc_info=True)
            # Return a more user-friendly error message
            error_message = str(e)
            if 'no such table' in error_message.lower():
                error_message = 'Presence service is not available. Please contact support.'
            return Response(
                {'error': f'Failed to update status: {error_message}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def heartbeat(self, request):
        """Update user's last seen timestamp (called periodically from frontend)"""
        try:
            presence, created = UserPresence.objects.get_or_create(
                user=request.user,
                defaults={'status': 'online', 'available_for_calls': True}
            )
            
            # Update status to online if not already
            if presence.status != 'online':
                presence.status = 'online'
            
            # Heartbeat automatically updates last_seen due to auto_now
            presence.save()
            
            return Response({'status': 'ok'})
        except Exception as e:
            # Log but don't fail - heartbeat failures shouldn't break the app
            logger.error(f"Error in heartbeat: {str(e)}", exc_info=True)
            # Return success anyway to avoid breaking frontend polling
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
