"""
JWT Service for Custom Token Claims
Generates JWT tokens with embedded RBAC context
"""

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from typing import Dict, List, Optional
import logging

from crmApp.models import UserProfile, Employee, Role, Permission, UserRole
from crmApp.utils.profile_context import get_user_active_profile

logger = logging.getLogger(__name__)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that adds RBAC claims to tokens.
    
    Claims added:
    - is_superuser: Django superuser flag (FULL access to everything)
    - is_staff: Django staff flag (FULL access to everything)
    - profile_type: vendor, employee, or customer
    - profile_id: ID of active UserProfile
    - organization_id: User's organization
    - organization_name: Organization name
    - is_owner: Whether user is organization owner
    - roles: List of role names (for employees)
    - role_ids: List of role IDs (for employees)
    - permissions: List of permissions (resource:action format)
    
    Authorization hierarchy:
    1. is_superuser=true → ALL permissions everywhere
    2. is_staff=true → ALL permissions everywhere
    3. is_owner=true (vendor) → ALL permissions in their organization
    4. Employee → permissions based on assigned roles
    """
    
    @classmethod
    def get_token(cls, user):
        """Generate token with custom RBAC claims"""
        token = super().get_token(user)
        
        # Add basic user info
        token['user_id'] = user.id
        token['email'] = user.email
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        # Add admin/superuser flags - CRITICAL for authorization
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff
        
        # Get active profile
        active_profile = get_user_active_profile(user)
        
        if active_profile:
            # Add profile information
            token['profile_type'] = active_profile.profile_type
            token['profile_id'] = active_profile.id
            
            # Add organization information
            if active_profile.organization:
                token['organization_id'] = active_profile.organization.id
                token['organization_name'] = active_profile.organization.name
                
                # Determine if user is owner
                token['is_owner'] = active_profile.profile_type == 'vendor'
                
                # Add roles and permissions based on profile type
                # NOTE: Superusers and staff already have full access via is_superuser/is_staff flags
                if active_profile.profile_type == 'employee':
                    roles, permissions = cls._get_employee_roles_and_permissions(
                        user, 
                        active_profile.organization
                    )
                    token['roles'] = roles
                    token['role_ids'] = list(roles.keys()) if isinstance(roles, dict) else []
                    token['permissions'] = permissions
                elif active_profile.profile_type == 'vendor':
                    # Vendors have all permissions in their organization
                    token['roles'] = ['owner']
                    token['role_ids'] = []
                    token['permissions'] = ['*:*']  # All permissions
                else:
                    # Customer has no roles/permissions
                    token['roles'] = []
                    token['role_ids'] = []
                    token['permissions'] = []
            else:
                # No organization
                token['organization_id'] = None
                token['organization_name'] = None
                token['is_owner'] = False
                token['roles'] = []
                token['role_ids'] = []
                token['permissions'] = []
        else:
            # No active profile
            token['profile_type'] = None
            token['profile_id'] = None
            token['organization_id'] = None
            token['organization_name'] = None
            token['is_owner'] = False
            token['roles'] = []
            token['role_ids'] = []
            token['permissions'] = []
        
        logger.info(f"Generated JWT for user {user.email} with profile {token.get('profile_type')}")
        
        return token
    
    @staticmethod
    def _get_employee_roles_and_permissions(user, organization) -> tuple[Dict[int, str], List[str]]:
        """
        Get roles and permissions for an employee.
        
        Returns:
            tuple: (roles_dict, permissions_list)
                - roles_dict: {role_id: role_name}
                - permissions_list: ["resource:action", ...]
        """
        roles_dict = {}
        permissions_set = set()
        
        try:
            # Get employee record
            employee = Employee.objects.filter(
                user=user,
                organization=organization,
                status='active'
            ).first()
            
            if not employee:
                return {}, []
            
            # Get primary role from Employee
            if employee.role:
                roles_dict[employee.role.id] = employee.role.name
                # Get permissions for this role
                role_permissions = Permission.objects.filter(
                    organization=organization,
                    role_permissions__role=employee.role
                ).values_list('resource', 'action')
                
                for resource, action in role_permissions:
                    permissions_set.add(f"{resource}:{action}")
            
            # Get additional roles from UserRole
            user_roles = UserRole.objects.filter(
                user=user,
                organization=organization,
                is_active=True
            ).select_related('role')
            
            for user_role in user_roles:
                if user_role.role:
                    roles_dict[user_role.role.id] = user_role.role.name
                    # Get permissions for this role
                    role_permissions = Permission.objects.filter(
                        organization=organization,
                        role_permissions__role=user_role.role
                    ).values_list('resource', 'action')
                    
                    for resource, action in role_permissions:
                        permissions_set.add(f"{resource}:{action}")
        
        except Exception as e:
            logger.error(f"Error getting roles/permissions: {str(e)}", exc_info=True)
        
        return roles_dict, sorted(list(permissions_set))


class JWTService:
    """Service class for JWT token operations"""
    
    @staticmethod
    def generate_tokens_for_user(user) -> Dict[str, str]:
        """
        Generate access and refresh tokens for a user.
        
        Args:
            user: User instance
            
        Returns:
            dict: {
                'access': 'access_token_here',
                'refresh': 'refresh_token_here',
                'access_expires_in': 86400,  # seconds
                'refresh_expires_in': 604800  # seconds
            }
        """
        refresh = CustomTokenObtainPairSerializer.get_token(user)
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'access_expires_in': 86400,  # 1 day in seconds
            'refresh_expires_in': 604800,  # 7 days in seconds
        }
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict]:
        """
        Decode a JWT token and return claims.
        
        Args:
            token: JWT token string
            
        Returns:
            dict: Token claims or None if invalid
        """
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError
        
        try:
            access_token = AccessToken(token)
            return dict(access_token.payload)
        except TokenError as e:
            logger.error(f"Token decode error: {str(e)}")
            return None
    
    @staticmethod
    def get_user_permissions_from_token(token: str) -> List[str]:
        """
        Extract permissions from a JWT token.
        
        Args:
            token: JWT token string
            
        Returns:
            list: List of permissions ["resource:action", ...]
        """
        claims = JWTService.decode_token(token)
        if claims:
            return claims.get('permissions', [])
        return []
    
    @staticmethod
    def has_permission_in_token(token: str, resource: str, action: str) -> bool:
        """
        Check if token has a specific permission.
        
        Args:
            token: JWT token string
            resource: Resource name (e.g., 'customer')
            action: Action name (e.g., 'create')
            
        Returns:
            bool: True if permission exists in token
        """
        permissions = JWTService.get_user_permissions_from_token(token)
        
        # Check for wildcard permission (vendors have *:*)
        if '*:*' in permissions:
            return True
        
        # Check for specific permission
        permission_string = f"{resource}:{action}"
        return permission_string in permissions

