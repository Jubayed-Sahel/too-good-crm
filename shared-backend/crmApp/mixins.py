"""
Mixins for DRF ViewSets
"""

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from crmApp.utils import build_search_query


class OrganizationFilterMixin:
    """
    Mixin to filter queryset by user's organizations
    """
    
    def get_queryset(self):
        """Filter by user's active organizations"""
        queryset = super().get_queryset()
        
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        
        # Get user's organizations
        user_orgs = user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        # Filter queryset by organization
        if hasattr(queryset.model, 'organization'):
            queryset = queryset.filter(organization_id__in=user_orgs)
        
        return queryset


class SearchFilterMixin:
    """
    Mixin to add search functionality
    """
    search_fields = []
    
    def filter_queryset(self, queryset):
        """Add search filtering"""
        queryset = super().filter_queryset(queryset)
        
        search_term = self.request.query_params.get('search')
        if search_term and self.search_fields:
            search_query = build_search_query(search_term, self.search_fields)
            queryset = queryset.filter(search_query)
        
        return queryset


class BulkActionMixin:
    """
    Mixin to add bulk actions
    """
    
    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Bulk delete items"""
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response(
                {'error': 'No IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        count = queryset.count()
        queryset.delete()
        
        return Response({
            'message': f'{count} items deleted successfully',
            'count': count
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update items"""
        ids = request.data.get('ids', [])
        update_data = request.data.get('data', {})
        
        if not ids or not update_data:
            return Response(
                {'error': 'IDs and data are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(id__in=ids)
        count = queryset.update(**update_data)
        
        return Response({
            'message': f'{count} items updated successfully',
            'count': count
        })


class ExportMixin:
    """
    Mixin to add export functionality
    """
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export data as CSV"""
        import csv
        from django.http import HttpResponse
        
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{self.basename}_export.csv"'
        
        # Get model fields
        model = queryset.model
        fields = [f.name for f in model._meta.fields if f.name not in ['password']]
        
        writer = csv.writer(response)
        writer.writerow(fields)
        
        for obj in queryset:
            writer.writerow([getattr(obj, field, '') for field in fields])
        
        return response


class AuditLogMixin:
    """
    Mixin to add audit logging
    """
    
    def perform_create(self, serializer):
        """Log create action"""
        instance = serializer.save()
        self.log_action('create', instance)
        return instance
    
    def perform_update(self, serializer):
        """Log update action"""
        instance = serializer.save()
        self.log_action('update', instance)
        return instance
    
    def perform_destroy(self, instance):
        """Log delete action"""
        self.log_action('delete', instance)
        instance.delete()
    
    def log_action(self, action, instance):
        """
        Log action to audit trail
        Override this method to implement custom logging
        """
        pass


class SoftDeleteMixin:
    """
    Mixin to add soft delete functionality
    """
    
    def perform_destroy(self, instance):
        """Soft delete instead of hard delete"""
        if hasattr(instance, 'is_deleted'):
            instance.is_deleted = True
            instance.save()
        elif hasattr(instance, 'status'):
            instance.status = 'inactive'
            instance.save()
        else:
            # Fall back to hard delete
            instance.delete()
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore soft-deleted item"""
        instance = self.get_object()
        
        if hasattr(instance, 'is_deleted'):
            instance.is_deleted = False
            instance.save()
        elif hasattr(instance, 'status'):
            instance.status = 'active'
            instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
