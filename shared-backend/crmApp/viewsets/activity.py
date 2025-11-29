"""
Activity related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend  # Not installed
from django.utils import timezone
from crmApp.models import Activity
from crmApp.serializers import (
    ActivitySerializer,
    ActivityListSerializer,
    ActivityCreateSerializer,
    ActivityUpdateSerializer
)
import logging

logger = logging.getLogger(__name__)


class ActivityViewSet(viewsets.ModelViewSet):
    """ViewSet for Activity model"""
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['customer', 'lead', 'deal', 'activity_type', 'status', 'assigned_to']
    search_fields = ['title', 'description', 'customer_name']
    ordering_fields = ['created_at', 'updated_at', 'scheduled_at', 'completed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter activities by user's organizations"""
        user = self.request.user
        
        # Get active profile
        active_profile = getattr(user, 'active_profile', None)
        
        # Fallback to user_organizations for backward compatibility
        if active_profile and active_profile.organization:
            logger.debug(f"[ActivityViewSet] Filtering by organization: {active_profile.organization.id}")
            return Activity.objects.filter(
                organization_id=active_profile.organization.id
            ).select_related('customer', 'lead', 'deal', 'assigned_to', 'created_by')
        else:
            # Fallback to old method
            user_orgs = user.user_organizations.filter(
                is_active=True
            ).values_list('organization_id', flat=True)
            
            logger.debug(f"[ActivityViewSet] Filtering by user organizations: {list(user_orgs)}")
            return Activity.objects.filter(
                organization_id__in=user_orgs
            ).select_related('customer', 'lead', 'deal', 'assigned_to', 'created_by')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return ActivityListSerializer
        elif self.action == 'create':
            return ActivityCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ActivityUpdateSerializer
        return ActivitySerializer
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark activity as completed"""
        try:
            activity = self.get_object()
            activity.status = 'completed'
            activity.save()  # This will auto-set completed_at
            serializer = self.get_serializer(activity)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Activity.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Activity not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error completing activity {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an activity"""
        try:
            activity = self.get_object()
            activity.status = 'cancelled'
            activity.save()
            serializer = self.get_serializer(activity)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Activity.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Activity not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error cancelling activity {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get activity statistics"""
        try:
            queryset = self.get_queryset()
            
            stats = {
                'total': queryset.count(),
                'by_status': {
                    'scheduled': queryset.filter(status='scheduled').count(),
                    'in_progress': queryset.filter(status='in_progress').count(),
                    'completed': queryset.filter(status='completed').count(),
                    'cancelled': queryset.filter(status='cancelled').count(),
                },
                'by_type': {
                    'call': queryset.filter(activity_type='call').count(),
                    'email': queryset.filter(activity_type='email').count(),
                    'telegram': queryset.filter(activity_type='telegram').count(),
                    'meeting': queryset.filter(activity_type='meeting').count(),
                    'note': queryset.filter(activity_type='note').count(),
                    'task': queryset.filter(activity_type='task').count(),
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting activity stats: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming scheduled activities"""
        try:
            queryset = self.get_queryset().filter(
                status='scheduled',
                scheduled_at__gte=timezone.now()
            ).order_by('scheduled_at')[:10]
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting upcoming activities: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue activities"""
        try:
            queryset = self.get_queryset().filter(
                status='scheduled',
                scheduled_at__lt=timezone.now()
            ).order_by('scheduled_at')
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting overdue activities: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
