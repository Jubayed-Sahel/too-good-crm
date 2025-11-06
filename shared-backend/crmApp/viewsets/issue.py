"""
Issue related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend  # Not installed
from django.db import transaction
from crmApp.models import Issue
from crmApp.serializers import (
    IssueSerializer,
    IssueListSerializer,
    IssueCreateSerializer,
    IssueUpdateSerializer
)
import logging

logger = logging.getLogger(__name__)


class IssueViewSet(viewsets.ModelViewSet):
    """ViewSet for Issue model"""
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'order', 'priority', 'category', 'status', 'assigned_to']
    search_fields = ['issue_number', 'title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter issues by organization"""
        if hasattr(self.request.user, 'current_organization'):
            return Issue.objects.filter(
                organization=self.request.user.current_organization
            ).select_related('vendor', 'order', 'assigned_to', 'created_by', 'resolved_by')
        return Issue.objects.none()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return IssueListSerializer
        elif self.action == 'create':
            return IssueCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return IssueUpdateSerializer
        return IssueSerializer
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark issue as resolved"""
        try:
            issue = self.get_object()
            issue.status = 'resolved'
            issue.resolved_by = request.user
            issue.save()
            serializer = self.get_serializer(issue)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error resolving issue {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a resolved issue"""
        try:
            issue = self.get_object()
            issue.status = 'open'
            issue.resolved_by = None
            issue.save()
            serializer = self.get_serializer(issue)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error reopening issue {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get issue statistics"""
        try:
            queryset = self.get_queryset()
            
            stats = {
                'total': queryset.count(),
                'by_status': {
                    'open': queryset.filter(status='open').count(),
                    'in_progress': queryset.filter(status='in_progress').count(),
                    'resolved': queryset.filter(status='resolved').count(),
                    'closed': queryset.filter(status='closed').count(),
                },
                'by_priority': {
                    'low': queryset.filter(priority='low').count(),
                    'medium': queryset.filter(priority='medium').count(),
                    'high': queryset.filter(priority='high').count(),
                    'critical': queryset.filter(priority='critical').count(),
                },
                'by_category': {
                    'quality': queryset.filter(category='quality').count(),
                    'delivery': queryset.filter(category='delivery').count(),
                    'payment': queryset.filter(category='payment').count(),
                    'communication': queryset.filter(category='communication').count(),
                    'other': queryset.filter(category='other').count(),
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting issue stats: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
