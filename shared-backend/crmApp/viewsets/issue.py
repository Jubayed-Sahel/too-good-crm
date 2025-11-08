"""
Issue related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
# from django_filters.rest_framework import DjangoFilterBackend  # Not installed
from django.db import transaction
from django.utils import timezone
from crmApp.models import Issue
from crmApp.serializers import (
    IssueSerializer,
    IssueListSerializer,
    IssueCreateSerializer,
    IssueUpdateSerializer
)
from crmApp.services.linear_service import LinearService
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
                },
                'linear_sync': {
                    'synced': queryset.filter(synced_to_linear=True).count(),
                    'not_synced': queryset.filter(synced_to_linear=False).count(),
                }
            }
            
            return Response(stats, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error getting issue stats: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def sync_to_linear(self, request, pk=None):
        """Sync issue to Linear"""
        try:
            issue = self.get_object()
            linear_service = LinearService()
            
            # Get team_id from request or settings
            team_id = request.data.get('team_id') or getattr(request.user.current_organization, 'linear_team_id', None)
            
            if not team_id:
                return Response(
                    {'error': 'Bad Request', 'details': 'team_id is required. Either provide it in the request or configure it for your organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            with transaction.atomic():
                if issue.synced_to_linear and issue.linear_issue_id:
                    # Update existing Linear issue
                    linear_data = linear_service.update_issue(
                        issue_id=issue.linear_issue_id,
                        title=issue.title,
                        description=issue.description,
                        priority=linear_service.map_priority_to_linear(issue.priority)
                    )
                else:
                    # Create new Linear issue
                    linear_data = linear_service.create_issue(
                        team_id=team_id,
                        title=issue.title,
                        description=issue.description or '',
                        priority=linear_service.map_priority_to_linear(issue.priority)
                    )
                    
                    issue.linear_issue_id = linear_data['id']
                    issue.linear_issue_url = linear_data['url']
                    issue.linear_team_id = team_id
                
                issue.synced_to_linear = True
                issue.last_synced_at = timezone.now()
                issue.save()
            
            serializer = self.get_serializer(issue)
            return Response(
                {
                    'message': 'Issue synced to Linear successfully',
                    'issue': serializer.data,
                    'linear_data': linear_data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error syncing issue {pk} to Linear: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def sync_from_linear(self, request, pk=None):
        """Sync issue from Linear (pull latest changes)"""
        try:
            issue = self.get_object()
            
            if not issue.synced_to_linear or not issue.linear_issue_id:
                return Response(
                    {'error': 'Bad Request', 'details': 'Issue is not synced to Linear'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            linear_service = LinearService()
            linear_issue = linear_service.get_issue(issue.linear_issue_id)
            
            with transaction.atomic():
                # Update local issue with Linear data
                issue.title = linear_issue.get('title', issue.title)
                issue.description = linear_issue.get('description', issue.description)
                
                # Map Linear priority to CRM priority
                linear_priority = linear_issue.get('priority', 3)
                issue.priority = linear_service.map_linear_priority_to_crm(linear_priority)
                
                issue.last_synced_at = timezone.now()
                issue.save()
            
            serializer = self.get_serializer(issue)
            return Response(
                {
                    'message': 'Issue synced from Linear successfully',
                    'issue': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error syncing issue {pk} from Linear: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def bulk_sync_to_linear(self, request):
        """Bulk sync multiple issues to Linear"""
        try:
            issue_ids = request.data.get('issue_ids', [])
            team_id = request.data.get('team_id')
            
            if not issue_ids:
                return Response(
                    {'error': 'Bad Request', 'details': 'issue_ids is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not team_id:
                return Response(
                    {'error': 'Bad Request', 'details': 'team_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            issues = self.get_queryset().filter(id__in=issue_ids)
            linear_service = LinearService()
            
            synced_count = 0
            failed_count = 0
            results = []
            
            for issue in issues:
                try:
                    with transaction.atomic():
                        if issue.synced_to_linear and issue.linear_issue_id:
                            linear_data = linear_service.update_issue(
                                issue_id=issue.linear_issue_id,
                                title=issue.title,
                                description=issue.description,
                                priority=linear_service.map_priority_to_linear(issue.priority)
                            )
                        else:
                            linear_data = linear_service.create_issue(
                                team_id=team_id,
                                title=issue.title,
                                description=issue.description or '',
                                priority=linear_service.map_priority_to_linear(issue.priority)
                            )
                            issue.linear_issue_id = linear_data['id']
                            issue.linear_issue_url = linear_data['url']
                            issue.linear_team_id = team_id
                        
                        issue.synced_to_linear = True
                        issue.last_synced_at = timezone.now()
                        issue.save()
                        
                        synced_count += 1
                        results.append({
                            'issue_id': issue.id,
                            'issue_number': issue.issue_number,
                            'status': 'success',
                            'linear_url': issue.linear_issue_url
                        })
                        
                except Exception as e:
                    failed_count += 1
                    results.append({
                        'issue_id': issue.id,
                        'issue_number': issue.issue_number,
                        'status': 'failed',
                        'error': str(e)
                    })
                    logger.error(f"Failed to sync issue {issue.id}: {str(e)}")
            
            return Response(
                {
                    'message': f'Bulk sync completed: {synced_count} succeeded, {failed_count} failed',
                    'synced_count': synced_count,
                    'failed_count': failed_count,
                    'results': results
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error in bulk sync: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
