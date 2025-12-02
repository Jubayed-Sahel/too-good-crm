"""
Issue related viewsets
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from crmApp.models import Issue, Employee, IssueComment
from crmApp.serializers import (
    IssueSerializer,
    IssueListSerializer,
    IssueCreateSerializer,
    IssueUpdateSerializer,
    IssueCommentSerializer,
    CreateIssueCommentSerializer
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vendor', 'order', 'priority', 'category', 'status', 'assigned_to', 'raised_by_customer']
    search_fields = ['issue_number', 'title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.linear_service = IssueLinearService()
    
    def get_queryset(self):
        """Filter issues based on user type and organization"""
        user = self.request.user
        
        # Get active profile from middleware (set by OrganizationContextMiddleware)
        active_profile = getattr(user, 'active_profile', None)
        
        # Fallback: Get primary profile or first active profile
        if not active_profile:
            from crmApp.models import UserProfile
            active_profile = user.user_profiles.filter(
                is_primary=True,
                status='active'
            ).first() or user.user_profiles.filter(status='active').first()
        
        if not active_profile:
            logger.warning(f"User {user.email} has no active profile, returning empty queryset")
            return Issue.objects.none()
        
        queryset = Issue.objects.select_related(
            'vendor', 'order', 'assigned_to', 'created_by', 'resolved_by',
            'raised_by_customer', 'organization'
        ).prefetch_related('raised_by_customer__user')
        
        # Client/Customer: Can only see issues they raised
        if active_profile.profile_type == 'customer':
            from crmApp.models import Customer
            try:
                # Customer can see issues they raised for any organization
                # Get all customer records for this user (they can be customer of multiple orgs)
                customers = Customer.objects.filter(user=user)
                if customers.exists():
                    # Get all issues raised by any of this user's customer records
                    customer_issues = queryset.filter(raised_by_customer__in=customers)
                    logger.debug(
                        f"Customer {user.email} queryset: {customer_issues.count()} issues "
                        f"(Customer records: {customers.count()})"
                    )
                    return customer_issues
                else:
                    logger.warning(f"Customer {user.email} has no customer records")
                    return Issue.objects.none()
            except Exception as e:
                logger.error(f"Error getting customer issues for {user.email}: {str(e)}", exc_info=True)
                return Issue.objects.none()
        
        # Vendor: Can see all issues in their organization
        # They can view and update issues raised by customers for their organization
        elif active_profile.profile_type == 'vendor':
            if active_profile.organization:
                organization = active_profile.organization
                # Show all issues for their organization (customer-raised and internal)
                vendor_issues = queryset.filter(organization=organization)
                logger.debug(
                    f"Vendor {user.email} queryset: {vendor_issues.count()} issues "
                    f"for organization {organization.name} (ID: {organization.id})"
                )
                return vendor_issues
            else:
                logger.warning(f"Vendor {user.email} has no organization assigned")
                return Issue.objects.none()
        
        # Employee: Can see all issues in their organization
        # They can view and update issues raised by customers for their organization
        elif active_profile.profile_type == 'employee':
            organization = active_profile.organization
            if organization:
                # Show all issues for their organization (customer-raised and internal)
                employee_issues = queryset.filter(organization=organization)
                logger.debug(
                    f"Employee {user.email} queryset: {employee_issues.count()} issues "
                    f"for organization {organization.name} (ID: {organization.id})"
                )
                return employee_issues
            else:
                logger.warning(f"Employee {user.email} has no organization assigned")
                return Issue.objects.none()
        
        logger.warning(f"User {user.email} has unknown profile type: {active_profile.profile_type}")
        return Issue.objects.none()
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to sync full issue data from Linear before returning issue"""
        instance = self.get_object()
        
        # Sync full issue data from Linear if issue is synced
        if instance.linear_issue_id:
            try:
                # Sync issue status and data from Linear
                sync_success, sync_message = self.linear_service.sync_issue_from_linear(instance)
                if sync_success:
                    logger.info(f"Synced issue data from Linear: {sync_message}")
                    # Reload instance to get updated data
                    instance.refresh_from_db()
                
                # Sync comments from Linear
                comment_success, count, error = self.linear_service.sync_comments_from_linear(instance)
                if comment_success and count > 0:
                    logger.info(f"Synced {count} new comments from Linear for issue {instance.issue_number}")
                elif not comment_success:
                    logger.warning(f"Failed to sync comments from Linear: {error}")
            except Exception as e:
                logger.error(f"Error syncing from Linear: {str(e)}", exc_info=True)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        """Override list to add debug logging"""
        # Debug filter parameters
        logger.debug(f"[IssueViewSet] Query params: {dict(request.query_params)}")
        
        queryset = self.filter_queryset(self.get_queryset())
        
        # Debug logging
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile:
            logger.debug(
                f"Issue list request from {request.user.email} "
                f"(Profile: {active_profile.profile_type}, "
                f"Organization: {active_profile.organization.name if active_profile.organization else 'None'}) - "
                f"Found {queryset.count()} issues"
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
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
        """Override perform_create to set organization, check permissions, and auto-sync to Linear"""
        organization = self.get_organization_from_request(self.request)
        
        if not organization:
            raise ValueError('Organization is required. Please ensure you have an active profile.')
        
        # Only customers can create issues (raise them)
        # Vendors and employees cannot raise issues - they can only view and update them
        active_profile = getattr(self.request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            # Customers can create issues without permission check
            # Set is_client_issue=True and get customer record
            from crmApp.models import Customer
            try:
                customer = Customer.objects.get(
                    user=self.request.user,
                    organization=organization
                )
                issue = serializer.save(
                    organization_id=organization.id,
                    is_client_issue=True,
                    raised_by_customer=customer
                )
            except Customer.DoesNotExist:
                # If customer record doesn't exist, still create issue but log warning
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Customer record not found for user {self.request.user.email}")
                issue = serializer.save(
                    organization_id=organization.id,
                    is_client_issue=True
                )
            
            # Auto-sync to Linear - always attempt sync
            # Try to get team_id from multiple sources
            linear_team_id = self.linear_service.get_team_id(self.request, organization, issue)
            
            if linear_team_id:
                try:
                    logger.info(
                        f"Attempting to auto-sync issue {issue.issue_number} to Linear "
                        f"(team_id: {linear_team_id}, status: {issue.status})"
                    )
                    
                    # Sync issue to Linear (will map status to state)
                    success, linear_data, error = self.linear_service.sync_issue_to_linear(
                        issue=issue,
                        team_id=linear_team_id,
                        update_existing=False
                    )
                    
                    if success and linear_data:
                        logger.info(
                            f"Issue {issue.issue_number} auto-synced to Linear: {linear_data.get('url', 'N/A')} "
                            f"(Linear State: {linear_data.get('state', 'N/A')})"
                        )
                    else:
                        logger.warning(
                            f"Linear sync failed for issue {issue.issue_number}: {error or 'Unknown error'}"
                        )
                    
                except Exception as e:
                    logger.error(
                        f"Failed to auto-sync issue {issue.issue_number} to Linear: {str(e)}",
                        exc_info=True
                    )
                    # Don't fail the request if Linear sync fails - issue is still created
            else:
                # Check if Linear API key is configured
                from django.conf import settings
                import os
                linear_api_key = getattr(settings, 'LINEAR_API_KEY', None) or os.getenv('LINEAR_API_KEY', '')
                
                if not linear_api_key:
                    logger.warning(
                        f"Linear API key not configured. Issue {issue.issue_number} will not be synced to Linear. "
                        f"Please set LINEAR_API_KEY in your .env file."
                    )
                else:
                    logger.warning(
                        f"Linear team ID not found for organization {organization.name} (ID: {organization.id}). "
                        f"Issue {issue.issue_number} will not be synced to Linear. "
                        f"Please configure linear_team_id for the organization or set LINEAR_TEAM_ID in settings."
                    )
        else:
            # Vendors and employees are NOT allowed to raise issues
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                'Only customers can raise issues. Vendors and employees can view and update existing issues.'
            )
    
    def update(self, request, *args, **kwargs):
        """Override update to sync status changes to Linear and check permissions"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        
        # Check permission for updating issues
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            # Customers can only update their own issues
            self.check_customer_permission(request, instance, action='update')
        elif active_profile and active_profile.profile_type in ['vendor', 'employee']:
            # Vendors and employees can update issues in their organization
            # No strict permission check needed - they have implicit permission for their org's issues
            if instance.organization != active_profile.organization:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('You can only update issues in your organization.')
        else:
            # Fallback to permission check for other profile types
            self.check_permission(request, 'issue', 'update', instance=instance)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh instance to get updated data
        instance.refresh_from_db()
        
        # Sync all changes to Linear
        linear_synced = False
        organization = instance.organization
        linear_team_id = organization.linear_team_id if organization else None
        
        # If issue is already synced, update it
        if instance.synced_to_linear and instance.linear_issue_id:
            try:
                # Use IssueLinearService to sync status changes
                success, error = self.linear_service.sync_issue_status_to_linear(
                    issue=instance,
                    old_status=old_status
                )
                if success:
                    linear_synced = True
                    logger.info(f"Issue {instance.issue_number} status change synced to Linear")
                elif error:
                    logger.warning(f"Linear status sync skipped: {error}")
                
                # Also sync other field changes (title, description, priority) if they changed
                linear_update_data = {}
                if 'title' in request.data:
                    linear_update_data['title'] = instance.title
                if 'description' in request.data:
                    linear_update_data['description'] = instance.description
                if 'priority' in request.data:
                    linear_update_data['priority'] = self.linear_service.linear_service.map_priority_to_linear(instance.priority)
                
                # Update Linear if there are field changes (other than status)
                if linear_update_data:
                    try:
                        self.linear_service.linear_service.update_issue(
                            issue_id=instance.linear_issue_id,
                            **linear_update_data
                        )
                        instance.last_synced_at = timezone.now()
                        instance.save(update_fields=['last_synced_at'])
                        logger.info(f"Issue {instance.issue_number} field changes synced to Linear")
                    except Exception as e:
                        logger.error(f"Failed to sync field changes to Linear: {str(e)}")
                        
            except Exception as e:
                logger.error(f"Failed to sync issue changes to Linear: {str(e)}", exc_info=True)
        
        # If issue is not synced, try to sync it now (always attempt auto-sync)
        if not instance.synced_to_linear:
            # Try to get team_id from multiple sources if not already found
            if not linear_team_id:
                linear_team_id = self.linear_service.get_team_id(request, organization, instance)
            
            if linear_team_id:
                try:
                    logger.info(
                        f"Attempting to auto-sync issue {instance.issue_number} to Linear "
                        f"(team_id: {linear_team_id}, status: {instance.status})"
                    )
                    
                    # Sync issue to Linear (will map status to state)
                    success, linear_data, error = self.linear_service.sync_issue_to_linear(
                        issue=instance,
                        team_id=linear_team_id,
                        update_existing=False
                    )
                    
                    if success and linear_data:
                        linear_synced = True
                        logger.info(
                            f"Issue {instance.issue_number} auto-synced to Linear: {linear_data.get('url', 'N/A')} "
                            f"(Linear State: {linear_data.get('state', 'N/A')})"
                        )
                    else:
                        logger.warning(
                            f"Linear sync failed for issue {instance.issue_number}: {error or 'Unknown error'}"
                        )
                        
                except Exception as e:
                    logger.error(
                        f"Failed to auto-sync issue {instance.issue_number} to Linear: {str(e)}",
                        exc_info=True
                    )
                    # Don't fail the request if Linear sync fails
        
        response_serializer = self.get_serializer(instance)
        response_data = response_serializer.data
        
        if linear_synced:
            response_data['linear_synced'] = True
        
        # Send real-time notification via Pusher
        try:
            from crmApp.services.pusher_service import pusher_service
            # Check if status changed
            status_changed = old_status != instance.status
            
            # Notify the user who made the update
            pusher_service.send_issue_updated(instance, request.user, old_status if status_changed else None)
            
            # If status changed, send status change event
            if status_changed:
                pusher_service.send_issue_status_changed(instance, old_status, request.user)
            
            # Notify issue creator (if different from updater)
            if instance.raised_by_customer and instance.raised_by_customer.user != request.user:
                pusher_service.send_issue_updated(instance, instance.raised_by_customer.user, old_status if status_changed else None)
                if status_changed:
                    pusher_service.send_issue_status_changed(instance, old_status, instance.raised_by_customer.user)
            
            # Notify organization members (vendors/employees)
            if organization:
                from crmApp.models import Employee
                employees = Employee.objects.filter(
                    organization=organization,
                    status='active'
                ).select_related('user')
                for employee in employees:
                    if employee.user and employee.user != request.user:
                        pusher_service.send_issue_updated(instance, employee.user, old_status if status_changed else None)
                        if status_changed:
                            pusher_service.send_issue_status_changed(instance, old_status, employee.user)
        except Exception as e:
            logger.warning(f"Failed to send Pusher notification for issue update: {e}")
        
        return Response(response_data)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        
        # Check permission for deleting issues
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile and active_profile.profile_type == 'customer':
            # Customers can only delete their own issues
            self.check_customer_permission(request, instance, action='delete')
        elif active_profile and active_profile.profile_type in ['vendor', 'employee']:
            # Vendors and employees can delete issues in their organization
            if instance.organization != active_profile.organization:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('You can only delete issues in your organization.')
        else:
            # Fallback to permission check for other profile types
            self.check_permission(request, 'issue', 'delete', instance=instance)
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark issue as resolved and sync to Linear if synced - vendors and employees can resolve issues in their org"""
        try:
            issue = self.get_object()
            
            # Check permission - vendors and employees can resolve issues in their organization
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile and active_profile.profile_type == 'customer':
                # Customers cannot resolve issues (only vendors/employees can)
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Only vendors and employees can resolve issues.')
            elif active_profile and active_profile.profile_type in ['vendor', 'employee']:
                # Vendors and employees can resolve issues in their organization
                if issue.organization != active_profile.organization:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('You can only resolve issues in your organization.')
            else:
                # Fallback to permission check for other profile types
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
            
            # Sync status change to Linear (auto-sync)
            linear_updated = self.linear_service.sync_issue_status_to_linear(
                issue, old_status, description=update_description
            )
            
            # Log Linear sync result
            if linear_updated[0]:
                logger.info(f"Issue {issue.issue_number} resolved and synced to Linear")
            else:
                logger.warning(f"Issue {issue.issue_number} resolved but Linear sync failed: {linear_updated[1]}")
            
            serializer = self.get_serializer(issue)
            response_data = {
                'message': 'Issue resolved successfully',
                'issue': serializer.data,
                'previous_status': old_status
            }
            
            if linear_updated[0]:
                response_data['linear_synced'] = True
                response_data['message'] += ' and synced to Linear'
            
            # Send real-time notification via Pusher
            try:
                from crmApp.services.pusher_service import pusher_service
                pusher_service.send_issue_status_changed(issue, old_status, request.user)
                pusher_service.send_issue_updated(issue, request.user, old_status)
                
                # Notify issue creator
                if issue.raised_by_customer and issue.raised_by_customer.user != request.user:
                    pusher_service.send_issue_status_changed(issue, old_status, issue.raised_by_customer.user)
                    pusher_service.send_issue_updated(issue, issue.raised_by_customer.user, old_status)
            except Exception as e:
                logger.warning(f"Failed to send Pusher notification for issue resolve: {e}")
            
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
        """Reopen a resolved issue and sync to Linear if synced - vendors and employees can reopen issues in their org"""
        try:
            issue = self.get_object()
            
            # Check permission - vendors and employees can reopen issues in their organization
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile and active_profile.profile_type == 'customer':
                # Customers cannot reopen issues (only vendors/employees can)
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied('Only vendors and employees can reopen issues.')
            elif active_profile and active_profile.profile_type in ['vendor', 'employee']:
                # Vendors and employees can reopen issues in their organization
                if issue.organization != active_profile.organization:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('You can only reopen issues in your organization.')
            else:
                # Fallback to permission check for other profile types
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
            
            # Send real-time notification via Pusher
            try:
                from crmApp.services.pusher_service import pusher_service
                pusher_service.send_issue_status_changed(issue, old_status, request.user)
                pusher_service.send_issue_updated(issue, request.user, old_status)
                
                # Notify issue creator
                if issue.raised_by_customer and issue.raised_by_customer.user != request.user:
                    pusher_service.send_issue_status_changed(issue, old_status, issue.raised_by_customer.user)
                    pusher_service.send_issue_updated(issue, issue.raised_by_customer.user, old_status)
            except Exception as e:
                logger.warning(f"Failed to send Pusher notification for issue reopen: {e}")
            
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
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to an issue and sync to Linear if synced"""
        try:
            issue = self.get_object()
            
            # Check permission - user must have access to this issue
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile:
                if active_profile.profile_type == 'customer':
                    # Customers can only comment on issues they created
                    if issue.customer and issue.customer.user != request.user:
                        raise PermissionDenied('You can only comment on your own issues.')
                elif active_profile.profile_type in ['vendor', 'employee']:
                    # Vendors and employees can comment on issues in their organization
                    if issue.organization != active_profile.organization:
                        raise PermissionDenied('You can only comment on issues in your organization.')
            
            # Create the comment
            serializer = CreateIssueCommentSerializer(data={'issue': issue.id, 'content': request.data.get('content')}, context={'request': request})
            
            if not serializer.is_valid():
                return Response(
                    {'error': 'Bad Request', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            comment = serializer.save()
            
            # Sync comment to Linear if issue is synced
            if issue.linear_issue_id:
                try:
                    success, error = self.linear_service.add_comment_to_linear(
                        issue,
                        comment.content,
                        comment.author_name
                    )
                    
                    if success:
                        comment.synced_to_linear = True
                        comment.save()
                        logger.info(f"Comment {comment.id} synced to Linear issue {issue.linear_issue_id}")
                    else:
                        logger.warning(f"Failed to sync comment to Linear: {error}")
                except Exception as e:
                    logger.error(f"Error syncing comment to Linear: {str(e)}")
            
            # Return the comment data
            response_serializer = IssueCommentSerializer(comment)
            return Response(
                {
                    'message': 'Comment added successfully',
                    'comment': response_serializer.data,
                    'synced_to_linear': comment.synced_to_linear
                },
                status=status.HTTP_201_CREATED
            )
            
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error adding comment to issue {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get all comments for an issue"""
        try:
            issue = self.get_object()
            
            # Sync comments from Linear first if issue is synced
            if issue.linear_issue_id:
                try:
                    success, count, error = self.linear_service.sync_comments_from_linear(issue)
                    if success and count > 0:
                        logger.info(f"Synced {count} new comments from Linear for issue {issue.issue_number}")
                    elif not success:
                        logger.warning(f"Failed to sync comments from Linear: {error}")
                except Exception as e:
                    logger.error(f"Error syncing comments from Linear: {str(e)}")
            
            # Get comments from database
            comments = issue.comments.all().order_by('created_at')
            serializer = IssueCommentSerializer(comments, many=True)
            
            return Response(
                {
                    'count': comments.count(),
                    'comments': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Not Found', 'details': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting comments for issue {pk}: {str(e)}")
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign issue to an employee - vendors and employees can assign issues in their org"""
        try:
            issue = self.get_object()
            
            # Check permission - vendors and employees can assign issues in their organization
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile and active_profile.profile_type in ['vendor', 'employee']:
                # Vendors and employees can assign issues in their organization
                if issue.organization != active_profile.organization:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('You can only assign issues in your organization.')
            else:
                # Fallback to permission check for other profile types
                self.check_permission(request, 'issue', 'update', instance=issue)
            
            # Get employee_id from request
            employee_id = request.data.get('employee_id')
            if not employee_id:
                return Response(
                    {'error': 'Bad Request', 'details': 'employee_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify employee belongs to the same organization
            try:
                employee = Employee.objects.get(
                    id=employee_id,
                    organization=issue.organization,
                    status='active'
                )
            except Employee.DoesNotExist:
                return Response(
                    {'error': 'Not Found', 'details': 'Employee not found or not active in this organization'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Assign issue to employee
            issue.assigned_to = employee
            # Update status to in_progress if it's open
            if issue.status == 'open':
                issue.status = 'in_progress'
            issue.save()
            
            logger.info(
                f"Issue {issue.issue_number} assigned to employee {employee.full_name} "
                f"by user {request.user.email}"
            )
            
            serializer = self.get_serializer(issue)
            return Response(
                {
                    'message': f'Issue assigned to {employee.full_name} successfully',
                    'issue': serializer.data
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error assigning issue {pk}: {str(e)}", exc_info=True)
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
            import traceback
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def sync_to_linear(self, request, pk=None):
        """Sync issue to Linear - vendors and employees can sync issues in their org"""
        try:
            issue = self.get_object()
            
            # Check permission - vendors and employees can sync issues in their organization
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile and active_profile.profile_type in ['vendor', 'employee']:
                # Vendors and employees can sync issues in their organization
                if issue.organization != active_profile.organization:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('You can only sync issues in your organization.')
            else:
                # Fallback to permission check for other profile types
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
        """Sync issue from Linear (pull latest changes) - vendors and employees can sync issues in their org"""
        try:
            issue = self.get_object()
            
            # Check permission - vendors and employees can sync issues in their organization
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile and active_profile.profile_type in ['vendor', 'employee']:
                # Vendors and employees can sync issues in their organization
                if issue.organization != active_profile.organization:
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied('You can only sync issues in your organization.')
            else:
                # Fallback to permission check for other profile types
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
    
    @action(detail=False, methods=['get'])
    def fetch_from_linear(self, request):
        """
        Fetch issues from Linear for the vendor/employee's organization
        Returns Linear issues that can be synced to CRM
        """
        try:
            # Get organization from active profile
            active_profile = getattr(request.user, 'active_profile', None)
            if not active_profile:
                return Response(
                    {'error': 'Bad Request', 'details': 'No active profile found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Only vendors and employees can fetch from Linear
            if active_profile.profile_type not in ['vendor', 'employee']:
                return Response(
                    {'error': 'Forbidden', 'details': 'Only vendors and employees can fetch issues from Linear'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            organization = active_profile.organization
            if not organization:
                return Response(
                    {'error': 'Bad Request', 'details': 'Organization not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get Linear team ID
            linear_team_id = organization.linear_team_id
            if not linear_team_id:
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'Linear team ID not configured for this organization'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get optional parameters
            limit = int(request.query_params.get('limit', 50))
            sync_to_crm = request.query_params.get('sync', 'false').lower() == 'true'
            
            # Fetch issues from Linear
            from crmApp.services.linear_service import LinearService
            linear_service = LinearService()
            
            linear_issues = linear_service.get_team_issues(
                team_id=linear_team_id,
                limit=limit
            )
            
            issues_data = linear_issues.get('nodes', [])
            page_info = linear_issues.get('pageInfo', {})
            
            # If sync_to_crm is True, sync Linear issues to CRM
            synced_issues = []
            if sync_to_crm:
                from crmApp.services.issue_linear_service import IssueLinearService
                sync_service = IssueLinearService()
                
                for linear_issue in issues_data:
                    # Check if issue already exists in CRM
                    existing_issue = Issue.objects.filter(
                        linear_issue_id=linear_issue['id'],
                        organization=organization
                    ).first()
                    
                    if existing_issue:
                        # Update existing issue
                        try:
                            # Map Linear state to CRM status
                            linear_state = linear_issue.get('state', {}).get('name', '').lower()
                            crm_status = 'open'
                            if 'done' in linear_state or 'completed' in linear_state or 'resolved' in linear_state:
                                crm_status = 'resolved'
                            elif 'in progress' in linear_state or 'started' in linear_state:
                                crm_status = 'in_progress'
                            elif 'closed' in linear_state or 'canceled' in linear_state:
                                crm_status = 'closed'
                            
                            existing_issue.title = linear_issue.get('title', existing_issue.title)
                            existing_issue.description = linear_issue.get('description', existing_issue.description) or ''
                            existing_issue.status = crm_status
                            existing_issue.priority = linear_service.map_linear_priority_to_crm(
                                linear_issue.get('priority', 3)
                            )
                            existing_issue.synced_to_linear = True
                            existing_issue.last_synced_at = timezone.now()
                            existing_issue.save()
                            
                            synced_issues.append({
                                'linear_id': linear_issue['id'],
                                'issue_id': existing_issue.id,
                                'issue_number': existing_issue.issue_number,
                                'action': 'updated'
                            })
                        except Exception as e:
                            logger.error(f"Error updating issue from Linear: {str(e)}", exc_info=True)
                    else:
                        # Create new issue in CRM
                        try:
                            # Map Linear state to CRM status
                            linear_state = linear_issue.get('state', {}).get('name', '').lower()
                            crm_status = 'open'
                            if 'done' in linear_state or 'completed' in linear_state or 'resolved' in linear_state:
                                crm_status = 'resolved'
                            elif 'in progress' in linear_state or 'started' in linear_state:
                                crm_status = 'in_progress'
                            elif 'closed' in linear_state or 'canceled' in linear_state:
                                crm_status = 'closed'
                            
                            new_issue = Issue.objects.create(
                                organization=organization,
                                title=linear_issue.get('title', ''),
                                description=linear_issue.get('description', '') or '',
                                status=crm_status,
                                priority=linear_service.map_linear_priority_to_crm(
                                    linear_issue.get('priority', 3)
                                ),
                                category='general',
                                linear_issue_id=linear_issue['id'],
                                linear_issue_url=linear_issue.get('url', ''),
                                linear_team_id=linear_team_id,
                                synced_to_linear=True,
                                last_synced_at=timezone.now(),
                                is_client_issue=False  # Issues from Linear are internal
                            )
                            
                            synced_issues.append({
                                'linear_id': linear_issue['id'],
                                'issue_id': new_issue.id,
                                'issue_number': new_issue.issue_number,
                                'action': 'created'
                            })
                        except Exception as e:
                            logger.error(f"Error creating issue from Linear: {str(e)}", exc_info=True)
            
            # Format response
            response_data = {
                'linear_issues': issues_data,
                'page_info': page_info,
                'organization': {
                    'id': organization.id,
                    'name': organization.name,
                    'linear_team_id': linear_team_id
                }
            }
            
            if sync_to_crm:
                response_data['synced_issues'] = synced_issues
                response_data['message'] = f"Fetched {len(issues_data)} issues from Linear, synced {len(synced_issues)} to CRM"
            else:
                response_data['message'] = f"Fetched {len(issues_data)} issues from Linear (not synced to CRM)"
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching issues from Linear: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
