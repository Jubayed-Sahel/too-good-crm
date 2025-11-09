"""
Service for handling Issue-Linear synchronization operations.
"""

from django.db import transaction
from django.utils import timezone
from crmApp.services.linear_service import LinearService
from crmApp.models import Issue
import logging

logger = logging.getLogger(__name__)


class IssueLinearService:
    """
    Service for managing Linear synchronization for issues.
    """
    
    def __init__(self):
        self.linear_service = LinearService()
    
    def get_team_id(self, request, organization=None, issue=None):
        """
        Get Linear team ID from various sources.
        
        Args:
            request: Request object
            organization: Organization instance
            issue: Issue instance
            
        Returns:
            Linear team ID or None
        """
        # Try request data first
        team_id = request.data.get('team_id') if hasattr(request, 'data') else None
        
        # Try organization
        if not team_id and organization:
            team_id = getattr(organization, 'linear_team_id', None)
            if not team_id and hasattr(organization, 'settings'):
                team_id = organization.settings.get('linear_team_id')
        
        # Try issue
        if not team_id and issue:
            team_id = getattr(issue, 'linear_team_id', None)
        
        return team_id
    
    def map_status_to_linear_state(self, status, team_id):
        """
        Map CRM issue status to Linear state ID.
        
        Args:
            status: CRM issue status
            team_id: Linear team ID
            
        Returns:
            Linear state ID or None
        """
        if not team_id:
            return None
        
        status_state_map = {
            'open': ['Todo', 'Backlog', 'Triage', 'Open'],
            'in_progress': ['In Progress', 'Started', 'Working'],
            'resolved': ['Done', 'Completed', 'Resolved', 'Closed'],
            'closed': ['Canceled', 'Closed', 'Cancelled'],
        }
        
        state_names = status_state_map.get(status, [])
        for state_name in state_names:
            state_id = self.linear_service.find_state_by_name(team_id, state_name)
            if state_id:
                return state_id
        
        return None
    
    def sync_issue_to_linear(self, issue, team_id, update_existing=False):
        """
        Sync issue to Linear (create or update).
        
        Args:
            issue: Issue instance
            team_id: Linear team ID
            update_existing: Whether to update existing issue
            
        Returns:
            Tuple of (success: bool, linear_data: dict or None, error: str or None)
        """
        try:
            with transaction.atomic():
                if update_existing and issue.synced_to_linear and issue.linear_issue_id:
                    # Update existing Linear issue
                    linear_data = self.linear_service.update_issue(
                        issue_id=issue.linear_issue_id,
                        title=issue.title,
                        description=issue.description,
                        priority=self.linear_service.map_priority_to_linear(issue.priority)
                    )
                else:
                    # Create new Linear issue
                    linear_data = self.linear_service.create_issue(
                        team_id=team_id,
                        title=issue.title,
                        description=issue.description or '',
                        priority=self.linear_service.map_priority_to_linear(issue.priority)
                    )
                    
                    issue.linear_issue_id = linear_data['id']
                    issue.linear_issue_url = linear_data['url']
                    issue.linear_team_id = team_id
                
                issue.synced_to_linear = True
                issue.last_synced_at = timezone.now()
                issue.save()
                
                logger.info(f"Issue {issue.issue_number} synced to Linear: {linear_data['url']}")
                return True, linear_data, None
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to sync issue {issue.id} to Linear: {error_msg}")
            return False, None, error_msg
    
    def sync_issue_status_to_linear(self, issue, old_status, description=None):
        """
        Sync issue status change to Linear.
        
        Args:
            issue: Issue instance
            old_status: Previous status
            description: Optional description to update (for resolution notes)
            
        Returns:
            Tuple of (success: bool, error: str or None)
        """
        if not (issue.synced_to_linear and issue.linear_issue_id):
            return False, None
        
        try:
            state_id = None
            if issue.status != old_status:
                state_id = self.map_status_to_linear_state(issue.status, issue.linear_team_id)
            
            # Prepare update data
            update_data = {}
            if state_id:
                update_data['state_id'] = state_id
            if description:
                update_data['description'] = description
            
            if update_data:
                self.linear_service.update_issue(
                    issue_id=issue.linear_issue_id,
                    **update_data
                )
                
                issue.last_synced_at = timezone.now()
                issue.save()
                
                logger.info(f"Issue {issue.issue_number} status change synced to Linear")
                return True, None
            else:
                return False, "No changes to sync"
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to sync status change to Linear: {error_msg}")
            return False, error_msg
    
    def sync_issue_from_linear(self, issue):
        """
        Pull latest changes from Linear to local issue.
        
        Args:
            issue: Issue instance
            
        Returns:
            Tuple of (success: bool, error: str or None)
        """
        if not (issue.synced_to_linear and issue.linear_issue_id):
            return False, "Issue is not synced to Linear"
        
        try:
            with transaction.atomic():
                linear_issue = self.linear_service.get_issue(issue.linear_issue_id)
                
                # Update local issue with Linear data
                issue.title = linear_issue.get('title', issue.title)
                issue.description = linear_issue.get('description', issue.description)
                
                # Map Linear priority to CRM priority
                linear_priority = linear_issue.get('priority', 3)
                issue.priority = self.linear_service.map_linear_priority_to_crm(linear_priority)
                
                issue.last_synced_at = timezone.now()
                issue.save()
                
                logger.info(f"Issue {issue.issue_number} synced from Linear")
                return True, None
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to sync issue {issue.id} from Linear: {error_msg}")
            return False, error_msg
    
    def bulk_sync_issues_to_linear(self, issues, team_id):
        """
        Bulk sync multiple issues to Linear.
        
        Args:
            issues: QuerySet or list of Issue instances
            team_id: Linear team ID
            
        Returns:
            Dict with synced_count, failed_count, and results list
        """
        synced_count = 0
        failed_count = 0
        results = []
        
        for issue in issues:
            success, linear_data, error = self.sync_issue_to_linear(issue, team_id, update_existing=True)
            
            if success:
                synced_count += 1
                results.append({
                    'issue_id': issue.id,
                    'issue_number': issue.issue_number,
                    'status': 'success',
                    'linear_url': issue.linear_issue_url
                })
            else:
                failed_count += 1
                results.append({
                    'issue_id': issue.id,
                    'issue_number': issue.issue_number,
                    'status': 'failed',
                    'error': error
                })
        
        return {
            'synced_count': synced_count,
            'failed_count': failed_count,
            'results': results
        }

