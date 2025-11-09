"""
Vendor ViewSet
"""

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Vendor
from crmApp.serializers import (
    VendorSerializer,
    VendorCreateSerializer,
    VendorListSerializer,
)


class VendorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Vendor management.
    """
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VendorListSerializer
        elif self.action == 'create':
            return VendorCreateSerializer
        return VendorSerializer
    
    def get_queryset(self):
        """Filter vendors by user's organizations through user_profiles"""
        user_orgs = self.request.user.user_profiles.filter(
            status='active'
        ).values_list('organization_id', flat=True)
        
        queryset = Vendor.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by vendor type
        vendor_type = self.request.query_params.get('vendor_type')
        if vendor_type:
            queryset = queryset.filter(vendor_type=vendor_type)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                contact_person__icontains=search
            )
        
        return queryset.select_related('organization')
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get list of vendor types"""
        types = Vendor.objects.values_list('vendor_type', flat=True).distinct()
        return Response(list(types))
