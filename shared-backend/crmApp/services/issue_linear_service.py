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
        
        try:
            # Get team states
            team = self.linear_service.get_team_by_id(team_id)
            states = team.get('states', {}).get('nodes', [])
            
            # Map CRM status to Linear state types and names
            status_mapping = {
                'open': {
                    'types': ['unstarted', 'started'],  # Can be in unstarted or started
                    'names': ['todo', 'backlog', 'triage', 'open', 'new'],
                },
                'in_progress': {
                    'types': ['started'],
                    'names': ['in progress', 'in-progress', 'started', 'working', 'active'],
                },
                'resolved': {
                    'types': ['completed'],
                    'names': ['done', 'completed', 'resolved', 'fixed'],
                },
                'closed': {
                    'types': ['canceled', 'completed'],
                    'names': ['canceled', 'cancelled', 'closed'],
                },
            }
            
            mapping = status_mapping.get(status.lower())
            if not mapping:
                logger.warning(f"Unknown CRM status: {status}, using default state")
                # Return default state for unknown status
                return self.linear_service.get_default_state_id(team_id)
            
            # First, try to find by type (more reliable)
            for state in states:
                state_type = state.get('type', '').lower()
                if state_type in mapping['types']:
                    # Prefer states that match both type and name if possible
                    state_name = state.get('name', '').lower()
                    if any(name in state_name for name in mapping['names']):
                        logger.info(f"Mapped CRM status '{status}' to Linear state '{state.get('name')}' (type: {state_type})")
                        return state.get('id')
            
            # If no exact match by type, try by name
            for state in states:
                state_name = state.get('name', '').lower()
                if any(name in state_name for name in mapping['names']):
                    logger.info(f"Mapped CRM status '{status}' to Linear state '{state.get('name')}' (by name)")
                    return state.get('id')
            
            # Fallback: use first state of matching type
            for state in states:
                state_type = state.get('type', '').lower()
                if state_type in mapping['types']:
                    logger.info(f"Mapped CRM status '{status}' to Linear state '{state.get('name')}' (first of type)")
                    return state.get('id')
            
            # Last resort: use default state
            default_state_id = self.linear_service.get_default_state_id(team_id)
            if default_state_id:
                logger.warning(f"Could not map CRM status '{status}', using default Linear state")
                return default_state_id
            
            logger.error(f"Failed to map CRM status '{status}' to Linear state for team {team_id}")
            return None
            
        except Exception as e:
            logger.error(f"Error mapping status to Linear state: {str(e)}", exc_info=True)
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
                    # Map status to Linear state
                    state_id = self.map_status_to_linear_state(issue.status, team_id)
                    
                    linear_data = self.linear_service.update_issue(
                        issue_id=issue.linear_issue_id,
                        title=issue.title,
                        description=issue.description or '',
                        priority=self.linear_service.map_priority_to_linear(issue.priority),
                        state_id=state_id
                    )
                else:
                    # Create new Linear issue
                    # Map status to Linear state for initial creation
                    state_id = self.map_status_to_linear_state(issue.status, team_id)
                    
                    linear_data = self.linear_service.create_issue(
                        team_id=team_id,
                        title=issue.title,
                        description=issue.description or '',
                        priority=self.linear_service.map_priority_to_linear(issue.priority),
                        state_id=state_id,
                        auto_set_state=True  # Fallback to default state if mapping fails
                    )
                    
                    issue.linear_issue_id = linear_data['id']
                    issue.linear_issue_url = linear_data.get('url', '')
                    issue.linear_team_id = team_id
                
                issue.synced_to_linear = True
                issue.last_synced_at = timezone.now()
                issue.save()
                
                logger.info(
                    f"Issue {issue.issue_number} synced to Linear: {linear_data.get('url', 'N/A')} "
                    f"(Status: {issue.status}, Linear State: {linear_data.get('state', 'N/A')})"
                )
                return True, linear_data, None
                
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Failed to sync issue {issue.issue_number} (ID: {issue.id}) to Linear: {error_msg}", exc_info=True)
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
        if not (issue.synced_to_linear and issue.linear_issue_id and issue.linear_team_id):
            if not issue.synced_to_linear:
                logger.debug(f"Issue {issue.issue_number} is not synced to Linear, skipping status sync")
            elif not issue.linear_issue_id:
                logger.warning(f"Issue {issue.issue_number} is marked as synced but has no linear_issue_id")
            elif not issue.linear_team_id:
                logger.warning(f"Issue {issue.issue_number} is marked as synced but has no linear_team_id")
            return False, "Issue not synced to Linear"
        
        try:
            # Always map status to state (even if status hasn't changed, description might have)
            state_id = self.map_status_to_linear_state(issue.status, issue.linear_team_id)
            
            # Prepare update data
            update_data = {}
            if state_id:
                update_data['state_id'] = state_id
                logger.info(
                    f"Syncing issue {issue.issue_number} status change: "
                    f"{old_status} -> {issue.status} (Linear state ID: {state_id})"
                )
            else:
                logger.warning(
                    f"Could not map CRM status '{issue.status}' to Linear state for issue {issue.issue_number}"
                )
            
            if description:
                update_data['description'] = description
            
            # Always update if there's a status change or description update
            if update_data or issue.status != old_status:
                if not update_data and issue.status != old_status:
                    # Status changed but couldn't map to state - still try to update
                    logger.warning(f"Status changed but no state mapping found, attempting update anyway")
                    # Get default state as fallback
                    state_id = self.linear_service.get_default_state_id(issue.linear_team_id)
                    if state_id:
                        update_data['state_id'] = state_id
                
                if update_data:
                    self.linear_service.update_issue(
                        issue_id=issue.linear_issue_id,
                        **update_data
                    )
                    
                    issue.last_synced_at = timezone.now()
                    issue.save(update_fields=['last_synced_at'])
                    
                    logger.info(
                        f"Issue {issue.issue_number} status change synced to Linear "
                        f"(Status: {old_status} -> {issue.status})"
                    )
                    return True, None
                else:
                    return False, "No state mapping available"
            else:
                return False, "No changes to sync"
                
        except Exception as e:
            error_msg = str(e)
            logger.error(
                f"Failed to sync status change to Linear for issue {issue.issue_number}: {error_msg}",
                exc_info=True
            )
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

