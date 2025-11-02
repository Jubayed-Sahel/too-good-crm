"""
Lead ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from crmApp.models import Lead
from crmApp.serializers import (
    LeadSerializer,
    LeadCreateSerializer,
    LeadUpdateSerializer,
    LeadListSerializer,
    ConvertLeadSerializer,
)


class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lead management.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        elif self.action == 'create':
            return LeadCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeadUpdateSerializer
        elif self.action == 'convert':
            return ConvertLeadSerializer
        return LeadSerializer
    
    def get_queryset(self):
        """Filter leads by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Lead.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by qualification status
        qualification = self.request.query_params.get('qualification_status')
        if qualification:
            queryset = queryset.filter(qualification_status=qualification)
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Filter by assigned employee
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter converted/unconverted
        is_converted = self.request.query_params.get('is_converted')
        if is_converted is not None:
            queryset = queryset.filter(is_converted=is_converted.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                company__icontains=search
            )
        
        return queryset.select_related('organization', 'assigned_to', 'converted_by')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get lead statistics"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Lead.objects.filter(organization_id__in=user_orgs)
        
        stats = {
            'total': queryset.count(),
            'active': queryset.filter(status='active').count(),
            'converted': queryset.filter(is_converted=True).count(),
            'unconverted': queryset.filter(is_converted=False).count(),
            'by_qualification': {
                'new': queryset.filter(qualification_status='new').count(),
                'contacted': queryset.filter(qualification_status='contacted').count(),
                'qualified': queryset.filter(qualification_status='qualified').count(),
                'unqualified': queryset.filter(qualification_status='unqualified').count(),
            },
            'by_source': {}
        }
        
        # Group by source
        sources = queryset.values_list('source', flat=True).distinct()
        for source in sources:
            stats['by_source'][source] = queryset.filter(source=source).count()
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert lead to customer"""
        lead = self.get_object()
        
        serializer = ConvertLeadSerializer(
            data=request.data,
            context={'lead': lead, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        
        return Response({
            'message': 'Lead converted successfully.',
            'customer_id': customer.id,
            'lead': LeadSerializer(lead).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def qualify(self, request, pk=None):
        """Mark lead as qualified"""
        lead = self.get_object()
        lead.qualification_status = 'qualified'
        lead.save()
        
        return Response({
            'message': 'Lead qualified successfully.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['post'])
    def disqualify(self, request, pk=None):
        """Mark lead as unqualified"""
        lead = self.get_object()
        lead.qualification_status = 'unqualified'
        lead.save()
        
        return Response({
            'message': 'Lead disqualified.',
            'lead': LeadSerializer(lead).data
        })
