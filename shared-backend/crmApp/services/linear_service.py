"""
Linear API Integration Service
Handles creating, updating, and syncing issues with Linear.app
"""

import requests
import logging
from typing import Dict, Optional, Any
from django.conf import settings

logger = logging.getLogger(__name__)


class LinearService:
    """Service class for Linear API integration"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Linear service with API key
        
        Args:
            api_key: Linear API key (if not provided, uses settings.LINEAR_API_KEY)
        """
        self.api_key = api_key or getattr(settings, 'LINEAR_API_KEY', None)
        self.api_url = 'https://api.linear.app/graphql'
        # Linear API uses the API key directly as Authorization header
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': self.api_key if self.api_key else ''
        }
    
    def _execute_query(self, query: str, variables: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query against Linear API
        
        Args:
            query: GraphQL query string
            variables: Query variables
            
        Returns:
            API response data
        """
        try:
            payload = {'query': query}
            if variables:
                payload['variables'] = variables
            
            response = requests.post(
                self.api_url,
                json=payload,
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'errors' in data:
                error_msg = str(data['errors'])
                logger.error(f"Linear API errors: {error_msg}")
                raise Exception(f"Linear API error: {error_msg}")
            
            return data.get('data', {})
            
        except requests.exceptions.HTTPError as e:
            # Try to get error details from response
            try:
                error_data = e.response.json()
                error_msg = error_data.get('errors', [{}])[0].get('message', str(e)) if 'errors' in error_data else str(e)
                logger.error(f"Linear API HTTP error: {error_msg}")
                logger.error(f"Response: {e.response.text}")
                raise Exception(f"Linear API error: {error_msg}")
            except:
                logger.error(f"Linear API request failed: {str(e)}")
                logger.error(f"Response: {e.response.text if hasattr(e, 'response') else 'No response'}")
                raise Exception(f"Failed to connect to Linear API: {str(e)}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Linear API request failed: {str(e)}")
            raise Exception(f"Failed to connect to Linear API: {str(e)}")
    
    def get_default_state_id(self, team_id: str) -> Optional[str]:
        """
        Get the default workflow state ID for a team (usually "Todo" or "Backlog")
        
        Args:
            team_id: Linear team ID
            
        Returns:
            Default state ID or None
        """
        try:
            team = self.get_team_by_id(team_id)
            states = team.get('states', {}).get('nodes', [])
            
            # Try to find "Todo" state first (most common default)
            for state in states:
                state_name = state.get('name', '').lower()
                state_type = state.get('type', '').lower()
                # Linear default states are usually "unstarted" type with names like "Todo", "Backlog"
                if state_type == 'unstarted' or state_name in ['todo', 'backlog', 'triage']:
                    return state.get('id')
            
            # If no default found, return the first unstarted state
            for state in states:
                if state.get('type', '').lower() == 'unstarted':
                    return state.get('id')
            
            # Last resort: return the first state
            if states:
                return states[0].get('id')
                
            return None
        except Exception as e:
            logger.error(f"Error getting default state for team {team_id}: {str(e)}")
            return None
    
    def create_issue(
        self,
        team_id: str,
        title: str,
        description: str,
        priority: int = 2,
        state_id: Optional[str] = None,
        assignee_id: Optional[str] = None,
        label_ids: Optional[list] = None,
        auto_set_state: bool = True
    ) -> Dict[str, Any]:
        """
        Create a new issue in Linear
        
        Args:
            team_id: Linear team ID
            title: Issue title
            description: Issue description
            priority: Priority (0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low)
            state_id: Optional workflow state ID (if not provided and auto_set_state=True, uses default state)
            assignee_id: Optional assignee user ID
            label_ids: Optional list of label IDs
            auto_set_state: If True and state_id is None, automatically sets default state
            
        Returns:
            Created issue data with id and url
        """
        query = """
        mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    description
                    priority
                    url
                    state {
                        id
                        name
                    }
                    assignee {
                        id
                        name
                    }
                    team {
                        id
                        name
                    }
                }
            }
        }
        """
        
        # If state_id is not provided and auto_set_state is True, get default state
        if not state_id and auto_set_state:
            state_id = self.get_default_state_id(team_id)
            if state_id:
                logger.info(f"Using default Linear state for team {team_id}: {state_id}")
        
        variables = {
            'input': {
                'teamId': team_id,
                'title': title,
                'description': description,
                'priority': priority,
            }
        }
        
        if state_id:
            variables['input']['stateId'] = state_id
        if assignee_id:
            variables['input']['assigneeId'] = assignee_id
        if label_ids:
            variables['input']['labelIds'] = label_ids
        
        result = self._execute_query(query, variables)
        
        if result.get('issueCreate', {}).get('success'):
            issue_data = result['issueCreate']['issue']
            logger.info(
                f"Created Linear issue: {issue_data['identifier']} - {title} "
                f"(State: {issue_data.get('state', {}).get('name', 'N/A')})"
            )
            return {
                'id': issue_data['id'],
                'identifier': issue_data['identifier'],
                'url': issue_data['url'],
                'title': issue_data['title'],
                'state': issue_data.get('state', {}).get('name'),
                'state_id': issue_data.get('state', {}).get('id'),
            }
        else:
            errors = result.get('issueCreate', {}).get('errors', [])
            error_msg = str(errors) if errors else "Failed to create Linear issue"
            logger.error(f"Linear issue creation failed: {error_msg}")
            raise Exception(f"Failed to create Linear issue: {error_msg}")
    
    def update_issue(
        self,
        issue_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[int] = None,
        state_id: Optional[str] = None,
        assignee_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update an existing Linear issue
        
        Args:
            issue_id: Linear issue ID
            title: New title
            description: New description
            priority: New priority
            state_id: New workflow state ID
            assignee_id: New assignee user ID
            
        Returns:
            Updated issue data
        """
        query = """
        mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
            issueUpdate(id: $id, input: $input) {
                success
                issue {
                    id
                    identifier
                    title
                    description
                    priority
                    url
                    state {
                        id
                        name
                    }
                }
            }
        }
        """
        
        input_data = {}
        if title is not None:
            input_data['title'] = title
        if description is not None:
            input_data['description'] = description
        if priority is not None:
            input_data['priority'] = priority
        if state_id is not None:
            input_data['stateId'] = state_id
        if assignee_id is not None:
            input_data['assigneeId'] = assignee_id
        
        # Don't send empty input
        if not input_data:
            logger.warning(f"No update data provided for Linear issue {issue_id}")
            # Return current issue data
            return self.get_issue(issue_id)
        
        variables = {
            'id': issue_id,
            'input': input_data
        }
        
        result = self._execute_query(query, variables)
        
        if result.get('issueUpdate', {}).get('success'):
            issue_data = result['issueUpdate']['issue']
            logger.info(
                f"Updated Linear issue: {issue_data['identifier']} "
                f"(State: {issue_data.get('state', {}).get('name', 'N/A')})"
            )
            return {
                'id': issue_data['id'],
                'identifier': issue_data['identifier'],
                'url': issue_data['url'],
                'title': issue_data['title'],
                'state': issue_data.get('state', {}).get('name'),
                'state_id': issue_data.get('state', {}).get('id'),
            }
        else:
            errors = result.get('issueUpdate', {}).get('errors', [])
            error_msg = str(errors) if errors else "Failed to update Linear issue"
            logger.error(f"Linear issue update failed: {error_msg}")
            raise Exception(f"Failed to update Linear issue: {error_msg}")
    
    def get_issue(self, issue_id: str) -> Dict[str, Any]:
        """
        Get issue details from Linear
        
        Args:
            issue_id: Linear issue ID
            
        Returns:
            Issue data
        """
        query = """
        query Issue($id: String!) {
            issue(id: $id) {
                id
                identifier
                title
                description
                priority
                url
                state {
                    id
                    name
                }
                assignee {
                    id
                    name
                }
                createdAt
                updatedAt
            }
        }
        """
        
        variables = {'id': issue_id}
        result = self._execute_query(query, variables)
        
        return result.get('issue', {})
    
    def get_team_states(self, team_id: str) -> list:
        """
        Get workflow states for a team
        
        Args:
            team_id: Linear team ID
            
        Returns:
            List of workflow states
        """
        query = """
        query Team($id: String!) {
            team(id: $id) {
                states {
                    nodes {
                        id
                        name
                        type
                    }
                }
            }
        }
        """
        
        variables = {'id': team_id}
        result = self._execute_query(query, variables)
        
        return result.get('team', {}).get('states', {}).get('nodes', [])
    
    def map_priority_to_linear(self, crm_priority: str) -> int:
        """
        Map CRM priority to Linear priority
        
        Args:
            crm_priority: CRM priority (low, medium, high, urgent)
            
        Returns:
            Linear priority (0-4)
        """
        priority_map = {
            'urgent': 1,    # Urgent
            'high': 2,      # High
            'medium': 3,    # Normal
            'low': 4,       # Low
        }
        return priority_map.get(crm_priority.lower(), 3)
    
    def map_linear_priority_to_crm(self, linear_priority: int) -> str:
        """
        Map Linear priority to CRM priority
        
        Args:
            linear_priority: Linear priority (0-4)
            
        Returns:
            CRM priority string
        """
        priority_map = {
            0: 'medium',  # No priority -> medium
            1: 'urgent',  # Urgent
            2: 'high',    # High
            3: 'medium',  # Normal
            4: 'low',     # Low
        }
        return priority_map.get(linear_priority, 'medium')
    
    def get_viewer(self) -> Dict[str, Any]:
        """
        Get current user (viewer) information
        
        Returns:
            Viewer data including teams
        """
        query = """
        query {
            viewer {
                id
                name
                email
                organization {
                    id
                    name
                }
                teams {
                    nodes {
                        id
                        name
                        key
                    }
                }
            }
        }
        """
        
        result = self._execute_query(query)
        return result.get('viewer', {})
    
    def get_teams(self) -> list:
        """
        Get all teams available to the authenticated user
        
        Returns:
            List of team objects with id, name, and key
        """
        query = """
        query {
            viewer {
                teams {
                    nodes {
                        id
                        name
                        key
                    }
                }
            }
        }
        """
        
        result = self._execute_query(query)
        teams = result.get('viewer', {}).get('teams', {}).get('nodes', [])
        return teams
    
    def get_team_by_id(self, team_id: str) -> Dict[str, Any]:
        """
        Get team details by ID
        
        Args:
            team_id: Linear team ID
            
        Returns:
            Team data with states
        """
        query = """
        query Team($id: String!) {
            team(id: $id) {
                id
                name
                key
                states {
                    nodes {
                        id
                        name
                        type
                        position
                    }
                }
            }
        }
        """
        
        variables = {'id': team_id}
        result = self._execute_query(query, variables)
        return result.get('team', {})
    
    def find_state_by_name(self, team_id: str, state_name: str) -> Optional[str]:
        """
        Find a workflow state ID by name for a team
        
        Args:
            team_id: Linear team ID
            state_name: State name to find (case-insensitive)
            
        Returns:
            State ID or None if not found
        """
        team = self.get_team_by_id(team_id)
        states = team.get('states', {}).get('nodes', [])
        
        state_name_lower = state_name.lower().strip()
        for state in states:
            if state.get('name', '').lower() == state_name_lower:
                return state.get('id')
        
        return None
    
    def get_team_issues(
        self,
        team_id: str,
        limit: int = 50,
        after: Optional[str] = None,
        filter: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get issues from a Linear team
        
        Args:
            team_id: Linear team ID
            limit: Maximum number of issues to return (default: 50, max: 100)
            after: Cursor for pagination (from previous response)
            filter: Optional filter dictionary (e.g., {'state': {'type': {'neq': 'canceled'}}})
            
        Returns:
            Dictionary with 'nodes' (list of issues) and 'pageInfo' (pagination info)
        """
        query = """
        query TeamIssues($teamId: String!, $first: Int!, $after: String, $filter: IssueFilter) {
            team(id: $teamId) {
                issues(
                    first: $first,
                    after: $after,
                    filter: $filter,
                    orderBy: updatedAt
                ) {
                    nodes {
                        id
                        identifier
                        title
                        description
                        priority
                        url
                        createdAt
                        updatedAt
                        state {
                            id
                            name
                            type
                        }
                        assignee {
                            id
                            name
                            email
                        }
                        creator {
                            id
                            name
                            email
                        }
                        team {
                            id
                            name
                            key
                        }
                    }
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                }
            }
        }
        """
        
        variables = {
            'teamId': team_id,
            'first': min(limit, 100),  # Linear max is 100
        }
        
        if after:
            variables['after'] = after
        
        if filter:
            variables['filter'] = filter
        
        result = self._execute_query(query, variables)
        team_data = result.get('team', {})
        issues_data = team_data.get('issues', {})
        
        return {
            'nodes': issues_data.get('nodes', []),
            'pageInfo': issues_data.get('pageInfo', {})
        }
    
    def get_all_team_issues(self, team_id: str, filter: Optional[Dict[str, Any]] = None) -> list:
        """
        Get all issues from a Linear team (with pagination)
        
        Args:
            team_id: Linear team ID
            filter: Optional filter dictionary
            
        Returns:
            List of all issues
        """
        all_issues = []
        after = None
        page_size = 50
        
        while True:
            result = self.get_team_issues(
                team_id=team_id,
                limit=page_size,
                after=after,
                filter=filter
            )
            
            issues = result.get('nodes', [])
            all_issues.extend(issues)
            
            page_info = result.get('pageInfo', {})
            if not page_info.get('hasNextPage', False):
                break
            
            after = page_info.get('endCursor')
        
        logger.info(f"Fetched {len(all_issues)} issues from Linear team {team_id}")
        return all_issues
