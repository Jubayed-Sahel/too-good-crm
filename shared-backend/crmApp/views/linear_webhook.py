"""
Linear Webhook Handler
Receives webhook events from Linear for bidirectional sync
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from crmApp.models import Issue
from crmApp.services.linear_service import LinearService
import logging
import hmac
import hashlib

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class LinearWebhookView(APIView):
    """
    Webhook endpoint for Linear events
    POST /api/webhooks/linear/
    """
    authentication_classes = []  # Webhooks don't use standard auth
    permission_classes = []
    
    def verify_signature(self, request, webhook_secret):
        """Verify Linear webhook signature"""
        signature = request.headers.get('Linear-Signature', '')
        
        if not webhook_secret:
            logger.warning("LINEAR_WEBHOOK_SECRET not configured, skipping signature verification")
            return True
        
        # Linear sends signature in format: timestamp,signature
        if ',' not in signature:
            return False
        
        timestamp, received_signature = signature.split(',', 1)
        
        # Create expected signature
        payload = f"{timestamp}.{request.body.decode('utf-8')}"
        expected_signature = hmac.new(
            webhook_secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, received_signature)
    
    def post(self, request):
        """
        Handle Linear webhook events
        
        Event types:
        - Issue (created, updated, removed)
        - Comment (created)
        - etc.
        """
        try:
            # Verify webhook signature
            from django.conf import settings
            webhook_secret = getattr(settings, 'LINEAR_WEBHOOK_SECRET', None)
            
            if webhook_secret and not self.verify_signature(request, webhook_secret):
                logger.warning("Invalid Linear webhook signature")
                return Response(
                    {'error': 'Invalid signature'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            data = request.data
            event_type = data.get('type')
            action = data.get('action')
            issue_data = data.get('data', {})
            
            logger.info(f"Received Linear webhook: type={event_type}, action={action}")
            
            # Handle Issue events
            if event_type == 'Issue':
                return self.handle_issue_event(action, issue_data)
            
            # Handle Comment events
            elif event_type == 'Comment':
                logger.info(f"Comment event received (not implemented): {action}")
                return Response({'message': 'Comment event received'}, status=status.HTTP_200_OK)
            
            else:
                logger.info(f"Unhandled event type: {event_type}")
                return Response({'message': 'Event received'}, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error processing Linear webhook: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal Server Error', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def handle_issue_event(self, action, issue_data):
        """Handle Linear Issue events"""
        try:
            linear_issue_id = issue_data.get('id')
            
            if not linear_issue_id:
                logger.warning("No issue ID in webhook data")
                return Response({'message': 'No issue ID'}, status=status.HTTP_200_OK)
            
            # Find corresponding CRM issue
            try:
                issue = Issue.objects.get(linear_issue_id=linear_issue_id)
            except Issue.DoesNotExist:
                logger.info(f"No CRM issue found for Linear ID: {linear_issue_id}")
                return Response({'message': 'Issue not found in CRM'}, status=status.HTTP_200_OK)
            
            with transaction.atomic():
                if action == 'create':
                    # Issue was created in Linear (shouldn't happen if we create from CRM)
                    logger.info(f"Linear issue created: {linear_issue_id}")
                    
                elif action == 'update':
                    # Issue was updated in Linear - sync changes to CRM
                    logger.info(f"Syncing Linear issue update to CRM: {issue.issue_number}")
                    
                    # Update title and description if changed
                    if 'title' in issue_data:
                        issue.title = issue_data['title']
                    
                    if 'description' in issue_data:
                        issue.description = issue_data['description']
                    
                    # Update priority
                    if 'priority' in issue_data:
                        linear_service = LinearService()
                        issue.priority = linear_service.map_linear_priority_to_crm(issue_data['priority'])
                    
                    # Update status based on Linear state
                    if 'state' in issue_data:
                        state_name = issue_data['state'].get('name', '').lower()
                        
                        # Map Linear states to CRM statuses
                        if state_name in ['backlog', 'todo', 'triage']:
                            issue.status = 'open'
                        elif state_name in ['in progress', 'in review']:
                            issue.status = 'in_progress'
                        elif state_name in ['done', 'completed']:
                            issue.status = 'resolved'
                        elif state_name in ['canceled', 'duplicate']:
                            issue.status = 'closed'
                    
                    issue.last_synced_at = timezone.now()
                    issue.save()
                    
                    logger.info(f"CRM issue {issue.issue_number} updated from Linear")
                    
                elif action == 'remove':
                    # Issue was deleted in Linear
                    logger.info(f"Linear issue removed: {linear_issue_id}")
                    
                    # Mark as no longer synced
                    issue.synced_to_linear = False
                    issue.linear_issue_id = None
                    issue.linear_issue_url = None
                    issue.save()
                    
                    logger.info(f"CRM issue {issue.issue_number} unmarked from Linear sync")
            
            return Response(
                {'message': f'Issue {action} processed successfully'},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error handling issue event: {str(e)}", exc_info=True)
            raise
