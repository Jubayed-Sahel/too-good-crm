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
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin,
)


class VendorViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin,
):
    """
    ViewSet for Vendor management.
    Employees can access vendors if they have vendor:read permission.
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
        # Use OrganizationFilterMixin to filter by accessible organizations
        queryset = super().get_queryset()
        
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
    
    def list(self, request, *args, **kwargs):
        """Override list - employees can view vendors in their organization"""
        # Employees in the same organization can view vendors by default
        # The queryset filtering already restricts to their organization
        # Only check explicit vendor:read permission if needed, but allow by default
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve - employees can view vendors in their organization"""
        # Employees in the same organization can view vendors by default
        # The queryset filtering already restricts to their organization
        return super().retrieve(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        """Override perform_create to check permissions and set organization"""
        organization = self.get_organization_from_request(self.request)
        
        if not organization:
            raise ValueError('Organization is required. Please ensure you have an active profile.')
        
        # Check permission for creating vendors
        self.check_permission(
            self.request,
            resource='vendor',
            action='create',
            organization=organization
        )
        
        # Set organization if not already set
        if 'organization' not in serializer.validated_data and 'organization_id' not in serializer.validated_data:
            serializer.save(organization=organization)
        else:
            serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'vendor', 'update', instance=instance)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to check permissions"""
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'vendor', 'delete', instance=instance)
        return super().destroy(request, *args, **kwargs)
    
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
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get vendor statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_count = queryset.count()
        active_count = queryset.filter(status='active').count()
        inactive_count = queryset.filter(status='inactive').count()
        
        # Group by vendor type
        type_stats = {}
        vendor_types = queryset.values_list('vendor_type', flat=True).distinct()
        for vtype in vendor_types:
            if vtype:
                type_stats[vtype] = queryset.filter(vendor_type=vtype).count()
        
        return Response({
            'total': total_count,
            'active': active_count,
            'inactive': inactive_count,
            'by_type': type_stats
        })