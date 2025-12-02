"""
ViewSet for Audit Logs (Activity Feed)
"""
import logging
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from crmApp.models import AuditLog
from crmApp.serializers.audit_log import AuditLogSerializer, AuditLogListSerializer
from crmApp.viewsets.mixins import OrganizationFilterMixin, QueryFilterMixin

logger = logging.getLogger(__name__)


class AuditLogViewSet(
    viewsets.ReadOnlyModelViewSet,
    OrganizationFilterMixin,
    QueryFilterMixin,
):
    """
    ViewSet for viewing audit logs (activity feed).
    Read-only - audit logs cannot be created/updated/deleted via API.
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return AuditLogListSerializer
        return AuditLogSerializer
    
    def get_queryset(self):
        """
        Filter audit logs by user's accessible organizations.
        """
        queryset = AuditLog.objects.all()
        
        # Apply organization filtering
        queryset = self.filter_by_organization(queryset, self.request)
        
        # Filter by action type
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by resource type
        resource_type = self.request.query_params.get('resource_type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by user profile type
        profile_type = self.request.query_params.get('profile_type')
        if profile_type:
            queryset = queryset.filter(user_profile_type=profile_type)
        
        # Filter by related entities
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(related_customer_id=customer_id)
        
        lead_id = self.request.query_params.get('lead_id')
        if lead_id:
            queryset = queryset.filter(related_lead_id=lead_id)
        
        deal_id = self.request.query_params.get('deal_id')
        if deal_id:
            queryset = queryset.filter(related_deal_id=deal_id)
        
        # Search by description
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(description__icontains=search) |
                Q(resource_name__icontains=search) |
                Q(user_email__icontains=search)
            )
        
        # Date range filtering
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.select_related(
            'organization', 'user', 'related_customer', 'related_lead', 'related_deal'
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get audit log statistics for the current organization.
        """
        queryset = self.get_queryset()
        
        # Count by action type
        action_counts = {}
        for action, label in AuditLog.ACTION_CHOICES:
            count = queryset.filter(action=action).count()
            if count > 0:
                action_counts[action] = {
                    'label': label,
                    'count': count
                }
        
        # Count by resource type
        resource_counts = {}
        for resource, label in AuditLog.RESOURCE_TYPE_CHOICES:
            count = queryset.filter(resource_type=resource).count()
            if count > 0:
                resource_counts[resource] = {
                    'label': label,
                    'count': count
                }
        
        # Count by user profile type
        profile_type_counts = {
            'vendor': queryset.filter(user_profile_type='vendor').count(),
            'employee': queryset.filter(user_profile_type='employee').count(),
            'customer': queryset.filter(user_profile_type='customer').count(),
        }
        
        # Recent activity count (last 24 hours)
        from django.utils import timezone
        from datetime import timedelta
        last_24h = timezone.now() - timedelta(hours=24)
        recent_count = queryset.filter(created_at__gte=last_24h).count()
        
        return Response({
            'total_logs': queryset.count(),
            'recent_activity_24h': recent_count,
            'by_action': action_counts,
            'by_resource': resource_counts,
            'by_profile_type': profile_type_counts,
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent audit logs (last 50).
        """
        queryset = self.get_queryset()[:50]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """
        Get audit logs grouped by date for timeline view.
        """
        queryset = self.get_queryset()[:100]  # Last 100 activities
        
        # Group by date
        timeline = {}
        for log in queryset:
            date_key = log.created_at.date().isoformat()
            if date_key not in timeline:
                timeline[date_key] = []
            timeline[date_key].append(AuditLogListSerializer(log).data)
        
        return Response(timeline)

