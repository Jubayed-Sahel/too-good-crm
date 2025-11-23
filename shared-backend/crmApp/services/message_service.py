"""
Message Service
Handles business logic for sending messages between users
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from crmApp.models import Message, Conversation, Organization
from typing import Optional, List, Dict

User = get_user_model()


class MessageService:
    """Service for handling messages"""
    
    @staticmethod
    def send_message(
        sender: User,
        recipient: User,
        content: str,
        subject: Optional[str] = None,
        organization: Optional[Organization] = None,
        related_lead=None,
        related_deal=None,
        related_customer=None,
        attachments: Optional[List[Dict]] = None
    ) -> Message:
        """
        Send a message from one user to another
        
        Args:
            sender: User sending the message
            recipient: User receiving the message
            content: Message content
            subject: Optional subject
            organization: Organization context
            related_lead: Related lead (optional)
            related_deal: Related deal (optional)
            related_customer: Related customer (optional)
            attachments: List of attachment dicts
        
        Returns:
            Created Message object
        """
        # Get organization from sender's active profile if not provided
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(sender)
        
        # Create message
        message = Message.objects.create(
            sender=sender,
            recipient=recipient,
            content=content,
            subject=subject,
            organization=organization,
            related_lead=related_lead,
            related_deal=related_deal,
            related_customer=related_customer,
            attachments=attachments or []
        )
        
        # Get or create conversation
        conversation = MessageService.get_or_create_conversation(
            sender, recipient, organization
        )
        
        # Update conversation
        conversation.last_message = message
        conversation.last_message_at = timezone.now()
        
        # Update unread count for recipient
        if recipient == conversation.participant1:
            conversation.unread_count_participant1 += 1
        else:
            conversation.unread_count_participant2 += 1
        
        conversation.save()
        
        # Send real-time notification via Pusher
        try:
            from crmApp.services.pusher_service import pusher_service
            pusher_service.send_message(message, sender, recipient)
        except Exception as e:
            # Log error but don't fail message creation
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Failed to send Pusher notification: {e}")
        
        return message
    
    @staticmethod
    def get_or_create_conversation(
        user1: User,
        user2: User,
        organization: Optional[Organization] = None
    ) -> Conversation:
        """
        Get or create a conversation between two users
        
        Args:
            user1: First user
            user2: Second user
            organization: Organization context
        
        Returns:
            Conversation object
        """
        # Ensure consistent ordering (smaller ID first)
        if user1.id > user2.id:
            user1, user2 = user2, user1
        
        conversation, created = Conversation.objects.get_or_create(
            participant1=user1,
            participant2=user2,
            organization=organization,
            defaults={
                'last_message_at': timezone.now()
            }
        )
        
        return conversation
    
    @staticmethod
    def get_conversations(user: User, organization: Optional[Organization] = None):
        """
        Get all conversations for a user
        
        Args:
            user: User to get conversations for
            organization: Optional organization filter
        
        Returns:
            QuerySet of Conversation objects
        """
        from django.db import models
        queryset = Conversation.objects.filter(
            models.Q(participant1=user) | models.Q(participant2=user)
        )
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        return queryset.order_by('-last_message_at')
    
    @staticmethod
    def get_messages(
        user1: User,
        user2: User,
        organization: Optional[Organization] = None,
        limit: int = 50
    ):
        """
        Get messages between two users
        
        Args:
            user1: First user
            user2: Second user
            organization: Optional organization filter
            limit: Maximum number of messages to return
        
        Returns:
            QuerySet of Message objects
        """
        from django.db import models
        import logging
        logger = logging.getLogger(__name__)
        
        queryset = Message.objects.filter(
            models.Q(sender=user1, recipient=user2) |
            models.Q(sender=user2, recipient=user1)
        )
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        # Return messages ordered by created_at (oldest first) for proper chat display
        # Frontend reverses this to show newest at bottom
        messages = list(queryset.order_by('created_at')[:limit])
        logger.info(f"get_messages: Found {len(messages)} messages between user {user1.id} and {user2.id} (org: {organization.id if organization else None}, limit: {limit})")
        return messages
    
    @staticmethod
    def mark_as_read(message: Message, user: User):
        """
        Mark a message as read
        
        Args:
            message: Message to mark as read
            user: User marking the message as read
        """
        if message.recipient == user and not message.is_read:
            message.mark_as_read()
            
            # Update conversation unread count
            conversation = Conversation.objects.filter(
                models.Q(participant1=user, participant2=message.sender) |
                models.Q(participant1=message.sender, participant2=user),
                organization=message.organization
            ).first()
            
            if conversation:
                if user == conversation.participant1:
                    conversation.unread_count_participant1 = max(0, conversation.unread_count_participant1 - 1)
                else:
                    conversation.unread_count_participant2 = max(0, conversation.unread_count_participant2 - 1)
                conversation.save()
            
            # Send real-time notification via Pusher
            try:
                from crmApp.services.pusher_service import pusher_service
                pusher_service.mark_message_read(message, user)
                
                # Update unread count for user
                unread_count = MessageService.get_unread_count(user, message.organization)
                pusher_service.send_unread_count_update(user, unread_count)
            except Exception as e:
                # Log error but don't fail
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to send Pusher read notification: {e}")
    
    @staticmethod
    def get_unread_count(user: User, organization: Optional[Organization] = None) -> int:
        """
        Get total unread message count for a user
        
        Args:
            user: User to get count for
            organization: Optional organization filter
        
        Returns:
            Total unread message count
        """
        queryset = Message.objects.filter(
            recipient=user,
            is_read=False
        )
        
        if organization:
            queryset = queryset.filter(organization=organization)
        
        return queryset.count()
    
    @staticmethod
    def get_available_recipients(sender: User, organization: Optional[Organization] = None) -> List[User]:
        """
        Get list of users that the sender can message
        
        For vendors: can message employees and customers in their organization
        For employees: can message vendors and customers in their organization
        For customers: can message vendors and employees
        
        Args:
            sender: User sending the message
            organization: Organization context
        
        Returns:
            List of User objects
        """
        from crmApp.models import UserProfile, Employee, Customer
        
        if not organization:
            from crmApp.utils.profile_context import get_active_profile_organization
            organization = get_active_profile_organization(sender)
        
        if not organization:
            return []
        
        # Get sender's profile type
        sender_profile = UserProfile.objects.filter(
            user=sender,
            organization=organization,
            status='active'
        ).first()
        
        if not sender_profile:
            return []
        
        recipients = []
        
        if sender_profile.profile_type == 'vendor':
            # Vendors can ONLY message employees (not customers)
            # Get employees in the organization
            employees = Employee.objects.filter(
                organization=organization,
                status='active'
            ).select_related('user')
            recipients.extend([emp.user for emp in employees if emp.user != sender])
        
        elif sender_profile.profile_type == 'employee':
            # Employees can ONLY message their vendor (not customers)
            # Get vendor (owner) of the organization
            vendor_profiles = UserProfile.objects.filter(
                organization=organization,
                profile_type='vendor',
                status='active'
            ).select_related('user')
            recipients.extend([prof.user for prof in vendor_profiles if prof.user != sender])
        
        elif sender_profile.profile_type == 'customer':
            # Customers can message vendors and employees
            # Get vendor
            vendor_profiles = UserProfile.objects.filter(
                organization=organization,
                profile_type='vendor',
                status='active'
            ).select_related('user')
            recipients.extend([prof.user for prof in vendor_profiles])
            
            # Get employees
            employees = Employee.objects.filter(
                organization=organization,
                status='active'
            ).select_related('user')
            recipients.extend([emp.user for emp in employees])
        
        # Remove duplicates and return
        return list(set(recipients))

