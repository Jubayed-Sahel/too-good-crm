"""
Issue related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone

from crmApp.models import Issue, Employee
from crmApp.serializers import (
    IssueSerializer,
    IssueListSerializer,
    IssueCreateSerializer,
    IssueUpdateSerializer
)
from crmApp.services import IssueLinearService, RBACService
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin,
    LinearSyncMixin,
    QueryFilterMixin,
)
import logging

logger = logging.getLogger(__name__)


class IssueViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin,
    LinearSyncMixin,
    QueryFilterMixin,
):
    """ViewSet for Issue model"""
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'order', 'priority', 'category', 'status', 'assigned_to']
    search_fields = ['issue_number', 'title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.linear_service = IssueLinearService()
    
    def get_queryset(self):
        """Filter issues based on user type and organization"""
        user = self.request.user
        
        # Check if user has any profiles
        if not hasattr(user, 'profiles') or not user.profiles.exists():
            return Issue.objects.none()
        
        # Get active profile
        from crmApp.models import UserProfile
        active_profile = user.profiles.filter(is_active=True).first()
        
        if not active_profile:
            return Issue.objects.none()
        
        queryset = Issue.objects.select_related(
            'vendor', 'order', 'assigned_to', 'created_by', 'resolved_by',
            'raised_by_customer', 'organization'
        )
        
        # Client/Customer: Can only see issues they raised
        if active_profile.profile_type == 'customer':
            from crmApp.models import Customer
            try:
                customer = Customer.objects.get(user=user, organization=active_profile.organization)
                return queryset.filter(raised_by_customer=customer)
            except Customer.DoesNotExist:
                return Issue.objects.none()
        
        # Vendor: Can see issues related to their vendor record
        elif active_profile.profile_type == 'vendor':
            from crmApp.models import Vendor
            try:
                vendor = Vendor.objects.get(user=user, organization=active_profile.organization)
                return queryset.filter(
                    organization=active_profile.organization
                ).filter(vendor=vendor)
            except Vendor.DoesNotExist:
                return Issue.objects.none()
        
        # Employee: Can see all issues for their organization
        elif active_profile.profile_type == 'employee':
            if hasattr(user, 'current_organization') and user.current_organization:
                return queryset.filter(organization=user.current_organization)
            if active_profile.organization:
                return queryset.filter(organization=active_profile.organization)
            return Issue.objects.none()
        
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
    
    def perform_create(self, serializer):
        """Override perform_create to set organization and check permissions"""
        organization = self.get_organization_from_request(self.request)
        
        if not organization:
            raise ValueError('Organization is required. Please ensure you have an active profile.')
        
        # Customers can create issues (raise them), but employees/vendors need permission
        active_profile = getattr(self.request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            # Customers can create issues without permission check
            serializer.save(organization_id=organization.id)
        else:
            # Employees/vendors need issue:create permission
            self.check_permission(
                self.request,
                resource='issue',
                action='create',
                organization=organization
            )
            serializer.save(organization_id=organization.id)
    
    def update(self, request, *args, **kwargs):
        """Override update to sync status changes to Linear and check permissions"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        # Check permission for updating issues
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            self.check_customer_permission(request, instance, action='update')
        else:
            self.check_permission(request, 'issue', 'update', instance=instance)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh instance to get updated data
        instance.refresh_from_db()
        
        # Sync status change to Linear
        linear_updated = self.linear_service.sync_issue_status_to_linear(instance, old_status)
        
        response_serializer = self.get_serializer(instance)
        response_data = response_serializer.data
        
        if linear_updated[0]:
            response_data['linear_synced'] = True
        
        return Response(response_data)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        
        # Check permission for deleting issues
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            self.check_customer_permission(request, instance, action='delete')
        else:
            self.check_permission(request, 'issue', 'delete', instance=instance)
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark issue as resolved and sync to Linear if synced - requires issue:update permission"""
        try:
            issue = self.get_object()
            
            # Check permission
            self.check_permission(request, 'issue', 'update', instance=issue)
            
            # Check if already resolved
            if issue.status == 'resolved':
                return Response(
                    {'error': 'Bad Request', 'details': 'Issue is already resolved'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            old_status = issue.status
            issue.status = 'resolved'
            issue.resolved_at = timezone.now()
            
            # Try to find employee associated with this user
            try:
                employee = Employee.objects.get(user=request.user, organization=issue.organization)
                issue.resolved_by = employee
            except Employee.DoesNotExist:
                issue.resolved_by = None
            
            # Add resolution notes if provided
            resolution_notes = request.data.get('resolution_notes')
            if resolution_notes:
                if issue.resolution_notes:
                    issue.resolution_notes += f"\n\n{resolution_notes}"
                else:
                    issue.resolution_notes = resolution_notes
            
            issue.save()
            
            # Auto-sync to Linear if already synced
            update_description = issue.description
            if resolution_notes:
                update_description = f"{update_description}\n\n--- Resolution Notes ---\n{resolution_notes}"
            
            linear_updated = self.linear_service.sync_issue_status_to_linear(
                issue, old_status, description=update_description
            )
            
            serializer = self.get_serializer(issue)
            response_data = {
                'message': 'Issue resolved successfully',
                'issue': serializer.data,
                'previous_status': old_status
            }
            
            if linear_updated[0]:
                response_data['linear_synced'] = True
                response_data['message'] += ' and synced to Linear'
            
            return Response(response_data, status=status.HTTP_200_OK)
            
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
        """Reopen a resolved issue and sync to Linear if synced - requires issue:update permission"""
        try:
            issue = self.get_object()
            
            # Check permission
            self.check_permission(request, 'issue', 'update', instance=issue)
            
            old_status = issue.status
            issue.status = 'open'
            issue.resolved_at = None
            issue.resolved_by = None
            issue.save()
            
            # Sync to Linear if synced
            linear_updated = self.linear_service.sync_issue_status_to_linear(issue, old_status)
            
            serializer = self.get_serializer(issue)
            response_data = {
                'message': 'Issue reopened successfully',
                'issue': serializer.data,
                'previous_status': old_status
            }
            
            if linear_updated[0]:
                response_data['linear_synced'] = True
            
            return Response(response_data, status=status.HTTP_200_OK)
            
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
                'by_source': {
                    'client_raised': queryset.filter(is_client_issue=True).count(),
                    'internal': queryset.filter(is_client_issue=False).count(),
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
        """Sync issue to Linear - requires issue:update permission"""
        try:
            issue = self.get_object()
            
            # Check permission
            self.check_permission(request, 'issue', 'update', instance=issue)
            
            # Get team_id
            organization = issue.organization or self.get_organization_from_request(request)
            team_id = self.linear_service.get_team_id(request, organization, issue)
            
            if not team_id:
                return Response(
                    {'error': 'Bad Request', 'details': 'team_id is required. Either provide it in the request or configure it for your organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Sync issue
            success, linear_data, error = self.linear_service.sync_issue_to_linear(issue, team_id, update_existing=True)
            
            if not success:
                return Response(
                    {'error': 'Internal Server Error', 'details': error},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
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
        """Sync issue from Linear (pull latest changes) - requires issue:update permission"""
        try:
            issue = self.get_object()
            
            # Check permission
            self.check_permission(request, 'issue', 'update', instance=issue)
            
            # Sync from Linear
            success, error = self.linear_service.sync_issue_from_linear(issue)
            
            if not success:
                return Response(
                    {'error': 'Bad Request', 'details': error},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
        """Bulk sync multiple issues to Linear - requires issue:update permission"""
        try:
            # Get organization and check permission
            organization = self.get_organization_from_request(request)
            
            if not organization:
                return Response(
                    {'error': 'Bad Request', 'details': 'Organization is required. Please ensure you have an active profile.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check permission
            self.check_permission(request, 'issue', 'update', organization=organization)
            
            # Get parameters
            issue_ids = request.data.get('issue_ids', [])
            team_id = request.data.get('team_id') or self.linear_service.get_team_id(request, organization)
            
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
            
            # Get issues
            issues = self.get_queryset().filter(id__in=issue_ids)
            
            # Bulk sync
            result = self.linear_service.bulk_sync_issues_to_linear(issues, team_id)
            
            return Response(
                {
                    'message': f'Bulk sync completed: {result["synced_count"]} succeeded, {result["failed_count"]} failed',
                    'synced_count': result['synced_count'],
                    'failed_count': result['failed_count'],
                    'results': result['results']
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error in bulk sync: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
