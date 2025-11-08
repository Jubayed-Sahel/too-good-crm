"""
Issue Action Views - Dedicated endpoints for raising and resolving issues
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from crmApp.models import Issue
from crmApp.serializers import IssueSerializer, IssueCreateSerializer
from crmApp.services.linear_service import LinearService
import logging

logger = logging.getLogger(__name__)


class RaiseIssueView(APIView):
    """
    Dedicated endpoint for raising a new issue
    POST /api/issues/raise/
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        """
        Create and raise a new issue
        
        Expected payload:
        {
            "title": "Issue title",
            "description": "Detailed description",
            "priority": "low|medium|high|urgent",
            "category": "general|delivery|quality|billing|communication|technical|other",
            "vendor": vendor_id (optional),
            "order": order_id (optional),
            "assigned_to": employee_id (optional)
        }
        """
        try:
            # Validate user has current organization
            if not hasattr(request.user, 'current_organization') or not request.user.current_organization:
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'User must have an active organization to raise an issue'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare data with organization and creator
            data = request.data.copy()
            data['organization'] = request.user.current_organization.id
            data['created_by'] = request.user.id
            data['status'] = 'open'  # New issues always start as 'open'
            
            # Use serializer to validate and create
            serializer = IssueCreateSerializer(data=data, context={'request': request})
            
            if serializer.is_valid():
                issue = serializer.save()
                
                # Log the issue creation
                logger.info(
                    f"Issue {issue.issue_number} raised by {request.user.email} "
                    f"in organization {request.user.current_organization.name}"
                )
                
                # Auto-sync to Linear if enabled and team_id provided
                linear_data = None
                auto_sync = request.data.get('auto_sync_linear', False)
                team_id = request.data.get('linear_team_id') or getattr(request.user.current_organization, 'linear_team_id', None)
                
                if auto_sync and team_id:
                    try:
                        linear_service = LinearService()
                        linear_data = linear_service.create_issue(
                            team_id=team_id,
                            title=issue.title,
                            description=issue.description or '',
                            priority=linear_service.map_priority_to_linear(issue.priority)
                        )
                        
                        # Update issue with Linear data
                        issue.linear_issue_id = linear_data['id']
                        issue.linear_issue_url = linear_data['url']
                        issue.linear_team_id = team_id
                        issue.synced_to_linear = True
                        issue.last_synced_at = timezone.now()
                        issue.save()
                        
                        logger.info(f"Issue {issue.issue_number} auto-synced to Linear: {linear_data['url']}")
                    except Exception as e:
                        logger.error(f"Failed to auto-sync issue to Linear: {str(e)}")
                        # Don't fail the request if Linear sync fails
                
                # Return full issue details
                response_serializer = IssueSerializer(issue)
                response_data = {
                    'message': 'Issue raised successfully',
                    'issue': response_serializer.data
                }
                
                if linear_data:
                    response_data['linear_data'] = linear_data
                    response_data['message'] += ' and synced to Linear'
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {
                        'error': 'Validation Error',
                        'details': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            logger.error(f"Error raising issue: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Internal Server Error',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResolveIssueView(APIView):
    """
    Dedicated endpoint for resolving an issue
    POST /api/issues/resolve/<issue_id>/
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, issue_id):
        """
        Resolve an existing issue
        
        URL parameter:
        - issue_id: ID of the issue to resolve
        
        Optional payload:
        {
            "resolution_notes": "Notes about the resolution" (optional)
        }
        """
        try:
            # Validate user has current organization
            if not hasattr(request.user, 'current_organization') or not request.user.current_organization:
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'User must have an active organization'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get the issue
            try:
                issue = Issue.objects.select_for_update().get(
                    id=issue_id,
                    organization=request.user.current_organization
                )
            except Issue.DoesNotExist:
                return Response(
                    {
                        'error': 'Not Found',
                        'details': f'Issue with ID {issue_id} not found in your organization'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if issue is already resolved or closed
            if issue.status == 'resolved':
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'Issue is already resolved'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if issue.status == 'closed':
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'Issue is already closed. Cannot resolve a closed issue.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update issue status to resolved
            old_status = issue.status
            issue.status = 'resolved'
            issue.resolved_at = timezone.now()
            
            # Try to find employee associated with this user
            # If not found, leave resolved_by as None
            try:
                from crmApp.models import Employee
                employee = Employee.objects.get(user=request.user, organization=request.user.current_organization)
                issue.resolved_by = employee
            except Employee.DoesNotExist:
                # No employee found for this user, leave resolved_by as None
                issue.resolved_by = None
            
            # Add resolution notes if provided
            resolution_notes = request.data.get('resolution_notes')
            if resolution_notes:
                if issue.description:
                    issue.description += f"\n\n--- Resolution Notes ---\n{resolution_notes}"
                else:
                    issue.description = f"--- Resolution Notes ---\n{resolution_notes}"
            
            issue.save()
            
            # Log the resolution
            logger.info(
                f"Issue {issue.issue_number} resolved by {request.user.email}. "
                f"Previous status: {old_status}"
            )
            
            # Auto-sync to Linear if already synced
            linear_updated = False
            if issue.synced_to_linear and issue.linear_issue_id:
                try:
                    linear_service = LinearService()
                    
                    # Get "Done" or "Completed" state if available
                    # For now, just update the issue description with resolution notes
                    update_description = issue.description
                    
                    linear_service.update_issue(
                        issue_id=issue.linear_issue_id,
                        description=update_description
                    )
                    
                    issue.last_synced_at = timezone.now()
                    issue.save()
                    linear_updated = True
                    
                    logger.info(f"Issue {issue.issue_number} resolution synced to Linear")
                except Exception as e:
                    logger.error(f"Failed to sync resolution to Linear: {str(e)}")
                    # Don't fail the request if Linear sync fails
            
            # Return updated issue details
            serializer = IssueSerializer(issue)
            response_data = {
                'message': 'Issue resolved successfully',
                'issue': serializer.data,
                'previous_status': old_status
            }
            
            if linear_updated:
                response_data['message'] += ' and synced to Linear'
                response_data['linear_synced'] = True
            
            return Response(response_data, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error resolving issue {issue_id}: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Internal Server Error',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
