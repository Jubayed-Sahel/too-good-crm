"""
Message ViewSet
API endpoints for messaging functionality
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db import models
from crmApp.models import Message, Conversation
from crmApp.serializers.message import (
    MessageSerializer,
    MessageCreateSerializer,
    ConversationSerializer
)
from crmApp.services.message_service import MessageService
from crmApp.viewsets.mixins.permission_mixins import PermissionCheckMixin
from crmApp.viewsets.mixins.organization_mixins import OrganizationFilterMixin

User = get_user_model()


class MessageViewSet(PermissionCheckMixin, OrganizationFilterMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing messages
    
    Permissions:
    - Users can send messages to vendors, customers, and employees in their organization
    - Users can view their own sent and received messages
    """
    
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get messages for current user"""
        user = self.request.user
        organization = getattr(self.request.user, 'current_organization', None)
        
        # Fallback to getting organization from active profile
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(user)
        
        queryset = Message.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        )
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def send(self, request):
        """
        Send a message to another user
        Only vendors can initiate new conversations.
        Employees and customers can only reply to existing conversations.
        
        POST /api/messages/send/
        {
            "recipient_id": 123,
            "content": "Hello!",
            "subject": "Optional subject",
            "related_lead_id": 456,  // optional
            "related_deal_id": 789,  // optional
            "related_customer_id": 101,  // optional
            "attachments": []  // optional
        }
        """
        serializer = MessageCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            recipient = User.objects.get(id=serializer.validated_data['recipient_id'])
            organization = getattr(request.user, 'current_organization', None)
            
            # Fallback to getting organization from active profile
            if not organization:
                from crmApp.utils.profile_context import get_active_profile_organization
                organization = get_active_profile_organization(request.user)
            
            # Check if user is vendor - only vendors can initiate messages
            from crmApp.models import UserProfile
            sender_profile = UserProfile.objects.filter(
                user=request.user,
                organization=organization,
                status='active'
            ).first()
            
            if not sender_profile:
                return Response(
                    {'error': 'No active profile found for this organization'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if this is a new conversation (no existing messages)
            existing_messages = Message.objects.filter(
                models.Q(sender=request.user, recipient=recipient) |
                models.Q(sender=recipient, recipient=request.user),
                organization=organization
            ).exists()
            
            # If it's a new conversation, check permissions:
            # - Vendors can initiate with anyone
            # - Employees can only initiate with their vendor
            # - Customers cannot initiate
            if not existing_messages:
                if sender_profile.profile_type == 'customer':
                    return Response(
                        {'error': 'Customers can only reply to existing conversations. Only vendors and employees can initiate new conversations.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                elif sender_profile.profile_type == 'employee':
                    # Employees can only initiate with their vendor
                    recipient_profile = UserProfile.objects.filter(
                        user=recipient,
                        organization=organization,
                        status='active'
                    ).first()
                    
                    if not recipient_profile or recipient_profile.profile_type != 'vendor':
                        return Response(
                            {'error': 'Employees can only initiate conversations with their vendor.'},
                            status=status.HTTP_403_FORBIDDEN
                        )
                # Vendors can initiate with anyone (no check needed)
            
            # Get related objects if provided
            related_lead = None
            related_deal = None
            related_customer = None
            
            if serializer.validated_data.get('related_lead_id'):
                from crmApp.models import Lead
                related_lead = Lead.objects.get(id=serializer.validated_data['related_lead_id'])
            
            if serializer.validated_data.get('related_deal_id'):
                from crmApp.models import Deal
                related_deal = Deal.objects.get(id=serializer.validated_data['related_deal_id'])
            
            if serializer.validated_data.get('related_customer_id'):
                from crmApp.models import Customer
                related_customer = Customer.objects.get(id=serializer.validated_data['related_customer_id'])
            
            # Send message using service
            message = MessageService.send_message(
                sender=request.user,
                recipient=recipient,
                content=serializer.validated_data['content'],
                subject=serializer.validated_data.get('subject'),
                organization=organization,
                related_lead=related_lead,
                related_deal=related_deal,
                related_customer=related_customer,
                attachments=serializer.validated_data.get('attachments', [])
            )
            
            # Send real-time notification via Pusher
            try:
                from crmApp.services.pusher_service import pusher_service
                pusher_service.send_message(message, request.user, recipient)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to send Pusher notification: {e}")
            
            return Response(
                MessageSerializer(message, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        
        except User.DoesNotExist:
            return Response(
                {'error': 'Recipient not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        
        if message.recipient != request.user:
            return Response(
                {'error': 'You can only mark your own received messages as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        MessageService.mark_as_read(message, request.user)
        
        return Response(
            MessageSerializer(message, context={'request': request}).data
        )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread message count for current user"""
        organization = getattr(request.user, 'current_organization', None)
        
        # Fallback to getting organization from active profile
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(request.user)
        
        count = MessageService.get_unread_count(request.user, organization)
        
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def recipients(self, request):
        """
        Get list of users that current user can message
        
        GET /api/messages/recipients/
        """
        organization = getattr(request.user, 'current_organization', None)
        
        # Fallback to getting organization from active profile
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(request.user)
        
        recipients = MessageService.get_available_recipients(request.user, organization)
        
        from crmApp.serializers.auth import UserSerializer
        return Response(
            UserSerializer(recipients, many=True, context={'request': request}).data
        )
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """
        Get messages with a specific user
        
        GET /api/messages/with_user/?user_id=123
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            other_user = User.objects.get(id=user_id)
            organization = getattr(request.user, 'current_organization', None)
            
            # Fallback to getting organization from active profile
            if not organization:
                from crmApp.utils.profile_context import get_active_profile_organization
                organization = get_active_profile_organization(request.user)
            
            messages = MessageService.get_messages(
                request.user,
                other_user,
                organization,
                limit=100
            )
            
            # Mark messages as read
            for message in messages:
                if message.recipient == request.user and not message.is_read:
                    MessageService.mark_as_read(message, request.user)
            
            return Response(
                MessageSerializer(messages, many=True, context={'request': request}).data
            )
        
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ConversationViewSet(PermissionCheckMixin, OrganizationFilterMixin, viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for managing conversations
    
    Users can view their conversations with other users
    """
    
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get conversations for current user"""
        user = self.request.user
        organization = getattr(self.request.user, 'current_organization', None)
        
        # Fallback to getting organization from active profile
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(user)
        
        queryset = Conversation.objects.filter(
            models.Q(participant1=user) | models.Q(participant2=user)
        )
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        return queryset.order_by('-last_message_at')

