"""
Mixin for customer-related actions (notes, activities).
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from crmApp.models import Activity
from crmApp.services import RBACService
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