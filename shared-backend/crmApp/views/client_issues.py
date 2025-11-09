"""
Client Issue Views - For customers to raise issues about organizations
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from crmApp.models import Issue, Customer, Organization
from crmApp.serializers import IssueSerializer
from crmApp.services.linear_service import LinearService
import logging

logger = logging.getLogger(__name__)


class ClientRaiseIssueView(APIView):
    """
    Endpoint for clients to raise issues about an organization/vendor
    POST /api/client/issues/raise/
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Raise an issue as a client about an organization
        
        Expected payload:
        {
            "organization": organization_id,
            "title": "Issue title",
            "description": "Detailed description",
            "priority": "low|medium|high|urgent",
            "category": "general|delivery|quality|billing|communication|technical|other",
            "vendor": vendor_id (optional),
            "order": order_id (optional)
        }
        """
        try:
            # Verify user is a customer
            from crmApp.models import UserProfile
            customer_profile = UserProfile.objects.filter(
                user=request.user,
                profile_type='customer',
                status='active'
            ).first()
            
            if not customer_profile:
                return Response(
                    {
                        'error': 'Forbidden',
                        'details': 'Only customers can raise issues through this endpoint'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get organization
            organization_id = request.data.get('organization')
            if not organization_id:
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'organization is required'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                return Response(
                    {
                        'error': 'Not Found',
                        'details': f'Organization with ID {organization_id} not found'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create issue in a transaction (simplified to avoid transaction conflicts)
            with transaction.atomic():
                # Get or create customer record for this organization
                user = request.user
                name = f"{user.first_name} {user.last_name}".strip() or user.username or user.email
                
                # Try to get existing customer record first
                customer = Customer.objects.filter(
                    user=request.user,
                    organization=organization
                ).first()
                
                if not customer:
                    customer_defaults = {
                        'name': name,
                        'first_name': user.first_name or '',
                        'last_name': user.last_name or '',
                        'email': user.email,
                        'customer_type': 'individual',
                        'status': 'active'
                    }
                    
                    customer, created = Customer.objects.get_or_create(
                        user=request.user,
                        organization=organization,
                        defaults=customer_defaults
                    )
                    
                    if created and not customer.user_profile:
                        existing_profile = UserProfile.objects.filter(
                            user=request.user,
                            profile_type='customer'
                        ).first()
                        if existing_profile:
                            customer.user_profile = existing_profile
                            customer.save(update_fields=['user_profile'])
                
                if not customer:
                    return Response(
                        {
                            'error': 'Bad Request',
                            'details': 'Customer record not found for this organization. Please contact support.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Map frontend category/priority to backend values
                category = request.data.get('category', 'general')
                priority = request.data.get('priority', 'medium')
                
                if category == 'payment':
                    category = 'billing'
                if priority == 'critical':
                    priority = 'urgent'
                
                valid_categories = ['general', 'delivery', 'quality', 'billing', 'communication', 'technical', 'other']
                valid_priorities = ['low', 'medium', 'high', 'urgent']
                
                if category not in valid_categories:
                    category = 'general'
                if priority not in valid_priorities:
                    priority = 'medium'
                
                # Create issue
                issue_data = {
                    'organization': organization,
                    'title': request.data.get('title'),
                    'description': request.data.get('description', ''),
                    'priority': priority,
                    'category': category,
                    'status': 'open',
                    'is_client_issue': True,
                    'raised_by_customer': customer,
                    'created_by': request.user,
                }
                
                # Optional fields
                if 'vendor' in request.data and request.data['vendor']:
                    try:
                        from crmApp.models import Vendor
                        vendor = Vendor.objects.get(id=request.data['vendor'], organization=organization)
                        issue_data['vendor'] = vendor
                    except Exception:
                        logger.warning(f"Vendor {request.data['vendor']} not found for organization {organization.id}")
                
                if 'order' in request.data and request.data['order']:
                    try:
                        from crmApp.models import Order
                        order = Order.objects.get(id=request.data['order'], organization=organization)
                        issue_data['order'] = order
                    except Exception:
                        logger.warning(f"Order {request.data['order']} not found for organization {organization.id}")
                
                # Create issue
                issue = Issue.objects.create(**issue_data)
                
                logger.info(
                    f"Issue {issue.issue_number} raised by customer {customer.email} "
                    f"for organization {organization.name}"
                )
            
            # Refresh organization to get latest linear_team_id
            organization.refresh_from_db()
            
            # Get Linear team ID (outside transaction)
            linear_team_id = organization.linear_team_id
            
            # Linear sync outside of transaction to avoid transaction conflicts
            linear_data = None
            if linear_team_id:
                try:
                    logger.info(
                        f"Attempting to sync issue {issue.issue_number} to Linear "
                        f"(team_id: {linear_team_id}, status: {issue.status})"
                    )
                    
                    # Use IssueLinearService for proper status mapping
                    from crmApp.services.issue_linear_service import IssueLinearService
                    linear_sync_service = IssueLinearService()
                    
                    # Sync issue to Linear (will map status to state)
                    success, linear_data, error = linear_sync_service.sync_issue_to_linear(
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
                        linear_data = None
                    
                except Exception as e:
                    logger.error(
                        f"Failed to auto-sync issue {issue.issue_number} to Linear: {str(e)}",
                        exc_info=True
                    )
                    # Don't fail the request if Linear sync fails - issue is still created
                    linear_data = None
            else:
                logger.info(
                    f"Linear team ID not configured for organization {organization.name} (ID: {organization.id})"
                )
            
            # Serialize issue data for response
            issue.refresh_from_db()  # Refresh to get Linear data if synced
            serializer = IssueSerializer(issue)
            response_data = {
                'message': 'Issue raised successfully',
                'issue': serializer.data
            }
            
            if linear_data:
                response_data['linear_data'] = linear_data
                response_data['message'] += ' and synced to Linear'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error raising client issue: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Internal Server Error',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClientIssueDetailView(APIView):
    """
    Endpoint for clients to view their issue details
    GET /api/client/issues/{id}/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, issue_id):
        """Get issue details if it belongs to the client"""
        try:
            # Verify user is a customer
            try:
                customer = Customer.objects.get(user=request.user)
            except Customer.DoesNotExist:
                return Response(
                    {
                        'error': 'Forbidden',
                        'details': 'Only customers can access this endpoint'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get issue and verify ownership
            try:
                issue = Issue.objects.select_related(
                    'organization', 'vendor', 'order', 'assigned_to', 'resolved_by'
                ).get(id=issue_id, raised_by_customer=customer)
            except Issue.DoesNotExist:
                return Response(
                    {
                        'error': 'Not Found',
                        'details': f'Issue with ID {issue_id} not found or does not belong to you'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            serializer = IssueSerializer(issue)
            return Response(serializer.data, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error getting client issue {issue_id}: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Internal Server Error',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ClientIssueCommentView(APIView):
    """
    Endpoint for clients to add comments to their issues
    POST /api/client/issues/{id}/comment/
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, issue_id):
        """Add a comment to the issue"""
        try:
            # Verify user is a customer
            try:
                customer = Customer.objects.get(user=request.user)
            except Customer.DoesNotExist:
                return Response(
                    {
                        'error': 'Forbidden',
                        'details': 'Only customers can access this endpoint'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get issue and verify ownership
            try:
                issue = Issue.objects.get(id=issue_id, raised_by_customer=customer)
            except Issue.DoesNotExist:
                return Response(
                    {
                        'error': 'Not Found',
                        'details': f'Issue with ID {issue_id} not found or does not belong to you'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Add comment to description (or create separate comment model in future)
            comment = request.data.get('comment', '').strip()
            if not comment:
                return Response(
                    {
                        'error': 'Bad Request',
                        'details': 'comment is required'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Append comment to description with timestamp
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
            issue.description += f"\n\n--- Comment by {customer.first_name} {customer.last_name} at {timestamp} ---\n{comment}"
            issue.save()
            
            logger.info(f"Comment added to issue {issue.issue_number} by customer {customer.email}")
            
            serializer = IssueSerializer(issue)
            return Response(
                {
                    'message': 'Comment added successfully',
                    'issue': serializer.data
                },
                status=status.HTTP_200_OK
            )
                
        except Exception as e:
            logger.error(f"Error adding comment to issue {issue_id}: {str(e)}", exc_info=True)
            return Response(
                {
                    'error': 'Internal Server Error',
                    'details': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
