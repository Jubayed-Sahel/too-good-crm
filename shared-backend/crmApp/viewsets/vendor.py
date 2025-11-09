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
    
    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        """Get all issues related to this vendor"""
        vendor = self.get_object()
        from crmApp.models import Issue
        from crmApp.serializers import IssueListSerializer
        
        issues = Issue.objects.filter(vendor=vendor).select_related(
            'organization', 'vendor', 'order', 'assigned_to', 'resolved_by'
        ).order_by('-created_at')
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            issues = issues.filter(status=status_filter)
        
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            issues = issues.filter(priority=priority_filter)
        
        # Paginate
        page = self.paginate_queryset(issues)
        if page is not None:
            serializer = IssueListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = IssueListSerializer(issues, many=True)
        return Response(serializer.data)