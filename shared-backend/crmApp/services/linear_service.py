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
        # Linear API uses Bearer token authentication
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}' if self.api_key else ''
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
                logger.error(f"Linear API errors: {data['errors']}")
                raise Exception(f"Linear API error: {data['errors']}")
            
            return data.get('data', {})
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Linear API request failed: {str(e)}")
            raise Exception(f"Failed to connect to Linear API: {str(e)}")
    
    def create_issue(
        self,
        team_id: str,
        title: str,
        description: str,
        priority: int = 2,
        state_id: Optional[str] = None,
        assignee_id: Optional[str] = None,
        label_ids: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Create a new issue in Linear
        
        Args:
            team_id: Linear team ID
            title: Issue title
            description: Issue description
            priority: Priority (0=No priority, 1=Urgent, 2=High, 3=Normal, 4=Low)
            state_id: Optional workflow state ID
            assignee_id: Optional assignee user ID
            label_ids: Optional list of label IDs
            
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
                }
            }
        }
        """
        
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
            logger.info(f"Created Linear issue: {issue_data['identifier']} - {title}")
            return {
                'id': issue_data['id'],
                'identifier': issue_data['identifier'],
                'url': issue_data['url'],
                'title': issue_data['title'],
                'state': issue_data.get('state', {}).get('name'),
            }
        else:
            raise Exception("Failed to create Linear issue")
    
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
        
        variables = {
            'id': issue_id,
            'input': input_data
        }
        
        result = self._execute_query(query, variables)
        
        if result.get('issueUpdate', {}).get('success'):
            issue_data = result['issueUpdate']['issue']
            logger.info(f"Updated Linear issue: {issue_data['identifier']}")
            return {
                'id': issue_data['id'],
                'identifier': issue_data['identifier'],
                'url': issue_data['url'],
                'title': issue_data['title'],
                'state': issue_data.get('state', {}).get('name'),
            }
        else:
            raise Exception("Failed to update Linear issue")
    
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
