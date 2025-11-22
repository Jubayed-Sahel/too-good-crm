"""
Organization and User Context Tools for MCP Server
"""

import logging
from typing import Dict, Any, List
from crmApp.models import Organization, UserProfile
from crmApp.serializers import OrganizationSerializer

logger = logging.getLogger(__name__)

def register_organization_tools(mcp):
    """Register all organization and user context-related tools"""
    
    @mcp.tool()
    def get_current_user_context() -> Dict[str, Any]:
        """
        Get current user's context information.
        
        Returns:
            User context including role, organization, and permissions
        """
        try:
            context = mcp.get_user_context()
            
            # Get user details
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            user_id = context.get('user_id')
            user = User.objects.get(id=user_id)
            
            # Get active profile
            active_profile = user.user_profiles.filter(
                is_primary=True,
                status='active'
            ).first() or user.user_profiles.filter(status='active').first()
            
            user_info = {
                'user_id': user.id,
                'email': user.email,
                'username': user.username,
                'role': context.get('role'),
                'organization_id': context.get('organization_id'),
                'permissions': context.get('permissions', [])
            }
            
            if active_profile:
                user_info['profile'] = {
                    'id': active_profile.id,
                    'profile_type': active_profile.profile_type,
                    'is_primary': active_profile.is_primary,
                    'status': active_profile.status
                }
            
            logger.info(f"Retrieved context for user {user_id}")
            return user_info
            
        except Exception as e:
            logger.error(f"Error getting user context: {str(e)}", exc_info=True)
            return {"error": f"Failed to get user context: {str(e)}"}
    
    @mcp.tool()
    def get_current_organization() -> Dict[str, Any]:
        """
        Get information about the current user's organization.
        
        Returns:
            Organization details
        """
        try:
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            org = Organization.objects.get(id=org_id)
            serializer = OrganizationSerializer(org)
            
            logger.info(f"Retrieved organization {org_id}")
            return serializer.data
            
        except Organization.DoesNotExist:
            return {"error": "Organization not found"}
        except Exception as e:
            logger.error(f"Error getting organization: {str(e)}", exc_info=True)
            return {"error": f"Failed to get organization: {str(e)}"}
    
    @mcp.tool()
    def list_organizations() -> List[Dict[str, Any]]:
        """
        List all organizations the user has access to.
        
        Returns:
            List of organization objects
        """
        try:
            user_id = mcp.get_user_id()
            
            from django.contrib.auth import get_user_model
            User = get_user_model()
            
            user = User.objects.get(id=user_id)
            
            # Get all organizations user has profiles in
            org_ids = user.user_profiles.filter(status='active').values_list('organization_id', flat=True)
            organizations = Organization.objects.filter(id__in=org_ids)
            
            serializer = OrganizationSerializer(organizations, many=True)
            logger.info(f"Retrieved {len(serializer.data)} organizations for user {user_id}")
            return serializer.data
            
        except Exception as e:
            logger.error(f"Error listing organizations: {str(e)}", exc_info=True)
            return {"error": f"Failed to list organizations: {str(e)}"}
    
    @mcp.tool()
    def get_user_permissions() -> List[str]:
        """
        Get list of all permissions for the current user.
        
        Returns:
            List of permission strings (e.g., ['customer:read', 'lead:create', ...])
        """
        try:
            context = mcp.get_user_context()
            permissions = context.get('permissions', [])
            
            logger.info(f"Retrieved {len(permissions)} permissions for user {context.get('user_id')}")
            return permissions
            
        except Exception as e:
            logger.error(f"Error getting permissions: {str(e)}", exc_info=True)
            return {"error": f"Failed to get permissions: {str(e)}"}
    
    logger.info("Organization and user context tools registered")

