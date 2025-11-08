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
import logging

logger = logging.getLogger(__name__)


class ClientRaiseIssueView(APIView):
    """
    Endpoint for clients to raise issues about an organization/vendor
    POST /api/client/issues/raise/
    """
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
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
            try:
                customer = Customer.objects.get(user=request.user)
            except Customer.DoesNotExist:
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
            
            # Create issue
            issue_data = {
                'organization': organization,
                'title': request.data.get('title'),
                'description': request.data.get('description', ''),
                'priority': request.data.get('priority', 'medium'),
                'category': request.data.get('category', 'general'),
                'status': 'open',
                'is_client_issue': True,
                'raised_by_customer': customer,
                'created_by': request.user,
            }
            
            # Optional fields
            if 'vendor' in request.data:
                issue_data['vendor_id'] = request.data['vendor']
            if 'order' in request.data:
                issue_data['order_id'] = request.data['order']
            
            issue = Issue.objects.create(**issue_data)
            
            logger.info(
                f"Issue {issue.issue_number} raised by customer {customer.email} "
                f"for organization {organization.name}"
            )
            
            # Return issue details
            serializer = IssueSerializer(issue)
            return Response(
                {
                    'message': 'Issue raised successfully',
                    'issue': serializer.data
                },
                status=status.HTTP_201_CREATED
            )
                
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
