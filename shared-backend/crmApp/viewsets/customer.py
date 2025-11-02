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
