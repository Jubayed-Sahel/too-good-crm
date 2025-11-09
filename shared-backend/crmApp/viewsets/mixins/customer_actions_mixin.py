"""
Mixin for customer-related actions (notes, activities, calls).
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from crmApp.models import Activity, Call
from crmApp.services import RBACService
from crmApp.services.twilio_service import twilio_service
from crmApp.serializers import CallSerializer
import logging

logger = logging.getLogger(__name__)


class CustomerActionsMixin:
    """
    Mixin for customer action methods (notes, activities, calls).
    """
    
    def check_customer_action_permission(self, request, customer, action='update'):
        """
        Check permission for customer actions.
        
        Args:
            request: Request object
            customer: Customer instance
            action: Action being performed (default: 'update')
            
        Raises:
            PermissionDenied: If permission is not granted
        """
        organization = customer.organization
        has_permission = (
            RBACService.check_permission(request.user, organization, 'customer', action) or
            RBACService.check_permission(request.user, organization, 'activity', 'create')
        )
        
        if not has_permission:
            raise PermissionDenied(
                f'Permission denied. Required: customer:{action} or activity:create'
            )
    
    def get_customer_notes(self, customer):
        """
        Get all notes for a customer.
        
        Args:
            customer: Customer instance
            
        Returns:
            List of note data dictionaries
        """
        notes = Activity.objects.filter(
            customer=customer,
            activity_type='note'
        ).select_related('created_by').order_by('-created_at')
        
        return [{
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id if note.created_by else None,
            'user_name': note.created_by.full_name if note.created_by else 'Unknown',
            'note': note.description,
            'created_at': note.created_at
        } for note in notes]
    
    def add_customer_note(self, customer, note_text, user):
        """
        Add a note to a customer.
        
        Args:
            customer: Customer instance
            note_text: Note text content
            user: User creating the note
            
        Returns:
            Activity instance
        """
        note = Activity.objects.create(
            customer=customer,
            activity_type='note',
            subject=f'Note for {customer.name}',
            description=note_text,
            created_by=user,
            is_completed=True
        )
        return note
    
    def get_customer_activities(self, customer, limit=50):
        """
        Get activities for a customer.
        
        Args:
            customer: Customer instance
            limit: Maximum number of activities to return
            
        Returns:
            List of activity data dictionaries
        """
        activities = Activity.objects.filter(
            customer=customer
        ).select_related('created_by').order_by('-created_at')[:limit]
        
        return [{
            'id': activity.id,
            'customer': activity.customer_id,
            'deal': activity.deal_id if hasattr(activity, 'deal') else None,
            'activity_type': activity.activity_type,
            'subject': activity.subject,
            'description': activity.description,
            'scheduled_at': activity.scheduled_at,
            'completed_at': activity.completed_at,
            'is_completed': activity.is_completed,
            'created_by': {
                'id': activity.created_by.id,
                'name': activity.created_by.full_name
            } if activity.created_by else None,
            'created_at': activity.created_at,
            'updated_at': activity.updated_at
        } for activity in activities]
    
    def initiate_customer_call(self, customer, user):
        """
        Initiate a VOIP call to customer via Twilio.
        
        Args:
            customer: Customer instance
            user: User initiating the call
            
        Returns:
            Tuple of (success: bool, call: Call instance or None, error: dict or None)
        """
        # Validate customer has phone number
        if not customer.phone:
            return False, None, {
                'error': 'Customer does not have a phone number'
            }
        
        # Check if Twilio is configured
        if not twilio_service.is_configured():
            return False, None, {
                'error': 'Twilio is not configured. Please add your Twilio credentials to the .env file.',
                'details': 'Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER'
            }
        
        try:
            # Initiate the call via Twilio
            call_response = twilio_service.initiate_call(
                to_number=customer.phone,
                from_number=None  # Will use default from settings
            )
            
            logger.info(f"Call initiated: {call_response}")
            
            # Create call record in database
            call = Call.objects.create(
                call_sid=call_response['call_sid'],
                from_number=call_response['from'],
                to_number=call_response['to'],
                direction='outbound',
                status=call_response['status'],
                organization=customer.organization,
                customer=customer,
                initiated_by=user
            )
            
            # Create activity record for the call
            Activity.objects.create(
                organization=customer.organization,
                customer=customer,
                activity_type='call',
                title=f'Outbound call to {customer.name}',
                description=f'Initiated VOIP call to {customer.phone}',
                phone_number=customer.phone,
                created_by=user,
                status='completed',
                scheduled_at=call_response.get('date_created'),
                completed_at=call_response.get('date_created')
            )
            
            return True, call, None
            
        except ValueError as e:
            logger.error(f"Configuration error: {str(e)}")
            return False, None, {'error': str(e)}
        except Exception as e:
            from twilio.base.exceptions import TwilioRestException
            
            logger.error(f"Error initiating call: {str(e)}")
            
            # Handle Twilio-specific errors
            if isinstance(e, TwilioRestException):
                error_code = getattr(e, 'code', None)
                error_msg = str(e)
                
                # Error 21219: Unverified number (trial account)
                if error_code == 21219 or 'unverified' in error_msg.lower():
                    return False, None, {
                        'error': f'The number {customer.phone} needs to be verified in your Twilio account. Trial accounts can only call verified numbers. Verify at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
                        'twilio_error_code': error_code,
                        'action': 'verify_number'
                    }
                
                # Error 20003: Geographic permissions (international calling)
                if error_code == 20003 or 'not authorized to call' in error_msg.lower() or 'geo-permissions' in error_msg.lower():
                    return False, None, {
                        'error': f'Your Twilio account is not authorized to call {customer.phone}. You need to enable international calling permissions for this country. Enable at: https://console.twilio.com/us1/develop/voice/settings/geo-permissions',
                        'twilio_error_code': error_code,
                        'action': 'enable_geo_permissions'
                    }
                
                # Other Twilio errors
                return False, None, {
                    'error': f'Twilio error: {error_msg}',
                    'twilio_error_code': error_code
                }
            
            # Generic error
            return False, None, {'error': f'Failed to initiate call: {str(e)}'}

