"""
Linear sync mixin for Issue-related viewsets.
"""

from django.utils import timezone
from crmApp.services.linear_service import LinearService
import logging

logger = logging.getLogger(__name__)


class LinearSyncMixin:
    """
    Mixin to handle Linear issue synchronization.
    """
    
    def get_linear_team_id(self, request, organization=None, issue=None):
        """
        Get Linear team ID from request, organization, or issue.
        
        Args:
            request: Request object
            organization: Organization instance
            issue: Issue instance (optional)
            
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
    
    def map_status_to_linear_state(self, status, linear_service, team_id):
        """
        Map CRM issue status to Linear state.
        
        Args:
            status: CRM issue status
            linear_service: LinearService instance
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
            state_id = linear_service.find_state_by_name(team_id, state_name)
            if state_id:
                return state_id
        
        return None
    
    def sync_issue_to_linear(self, issue, linear_service, team_id, update_existing=False):
        """
        Sync issue to Linear.
        
        Args:
            issue: Issue instance
            linear_service: LinearService instance
            team_id: Linear team ID
            update_existing: Whether to update existing Linear issue
            
        Returns:
            Linear issue data or None
        """
        try:
            if update_existing and issue.synced_to_linear and issue.linear_issue_id:
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
            
            logger.info(f"Issue {issue.issue_number} synced to Linear: {linear_data['url']}")
            return linear_data
            
        except Exception as e:
            logger.error(f"Failed to sync issue {issue.id} to Linear: {str(e)}")
            return None
    
    def sync_issue_status_to_linear(self, issue, old_status, linear_service):
        """
        Sync issue status change to Linear.
        
        Args:
            issue: Issue instance
            old_status: Previous status
            linear_service: LinearService instance
            
        Returns:
            bool: True if synced successfully
        """
        if not (issue.synced_to_linear and issue.linear_issue_id and issue.status != old_status):
            return False
        
        try:
            state_id = self.map_status_to_linear_state(
                issue.status,
                linear_service,
                issue.linear_team_id
            )
            
            if state_id:
                linear_service.update_issue(
                    issue_id=issue.linear_issue_id,
                    state_id=state_id
                )
                
                issue.last_synced_at = timezone.now()
                issue.save()
                
                logger.info(f"Issue {issue.issue_number} status change synced to Linear")
                return True
                
        except Exception as e:
            logger.error(f"Failed to sync status change to Linear: {str(e)}")
        
        return False

