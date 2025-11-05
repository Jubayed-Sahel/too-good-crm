"""
Customer ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Customer
from crmApp.serializers import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerListSerializer,
)


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Customer management.
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        elif self.action == 'create':
            return CustomerCreateSerializer
        return CustomerSerializer
    
    def get_queryset(self):
        """Filter customers by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by customer type
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        
        # Filter by assigned employee
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                company_name__icontains=search
            )
        
        return queryset.select_related('organization', 'assigned_to')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get customer statistics"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Customer.objects.filter(organization_id__in=user_orgs)
        
        stats = {
            'total': queryset.count(),
            'active': queryset.filter(status='active').count(),
            'inactive': queryset.filter(status='inactive').count(),
            'by_type': {
                'individual': queryset.filter(customer_type='individual').count(),
                'business': queryset.filter(customer_type='business').count(),
            }
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a customer"""
        customer = self.get_object()
        customer.status = 'inactive'
        customer.save()
        
        return Response({
            'message': 'Customer deactivated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a customer"""
        customer = self.get_object()
        customer.status = 'active'
        customer.save()
        
        return Response({
            'message': 'Customer activated successfully.',
            'customer': CustomerSerializer(customer).data
        })
    
    @action(detail=True, methods=['get'])
    def notes(self, request, pk=None):
        """Get customer notes"""
        from crmApp.models import Activity
        customer = self.get_object()
        
        # Get all note-type activities for this customer
        notes = Activity.objects.filter(
            customer=customer,
            activity_type='note'
        ).select_related('created_by').order_by('-created_at')
        
        notes_data = [{
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id if note.created_by else None,
            'user_name': note.created_by.full_name if note.created_by else 'Unknown',
            'note': note.description,
            'created_at': note.created_at
        } for note in notes]
        
        return Response(notes_data)
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to customer"""
        from crmApp.models import Activity
        customer = self.get_object()
        note_text = request.data.get('note')
        
        if not note_text:
            return Response(
                {'error': 'Note text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        note = Activity.objects.create(
            customer=customer,
            activity_type='note',
            subject=f'Note for {customer.name}',
            description=note_text,
            created_by=request.user,
            is_completed=True
        )
        
        return Response({
            'id': note.id,
            'customer': note.customer_id,
            'user': note.created_by_id,
            'user_name': note.created_by.full_name,
            'note': note.description,
            'created_at': note.created_at
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get customer activities"""
        from crmApp.models import Activity
        customer = self.get_object()
        
        activities = Activity.objects.filter(
            customer=customer
        ).select_related('created_by').order_by('-created_at')[:50]
        
        activities_data = [{
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
        
        return Response(activities_data)
