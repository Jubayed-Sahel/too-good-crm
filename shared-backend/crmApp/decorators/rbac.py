"""
RBAC Decorators
Decorators for enforcing role-based access control on viewset actions.
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status

from crmApp.services import RBACService


def require_permission(resource, action):
    """
    Decorator to enforce permission checking on viewset actions.
    
    Usage:
        @require_permission('customer', 'create')
        def create(self, request, *args, **kwargs):
            # Only users with 'customer:create' permission can access this
            return super().create(request, *args, **kwargs)
    
    Args:
        resource: Resource name (e.g., 'customer', 'deal', 'lead')
        action: Action name (e.g., 'create', 'read', 'update', 'delete')
    
    Returns:
        403 Forbidden if user lacks permission, otherwise executes the view
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            # Get organization from active profile (set by middleware)
            organization = None
            if hasattr(request.user, 'current_organization') and request.user.current_organization:
                organization = request.user.current_organization
            elif hasattr(request.user, 'active_profile') and request.user.active_profile:
                organization = request.user.active_profile.organization
            
            if not organization:
                return Response(
                    {'error': 'User must have an active profile with an organization'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check permission using RBACService
            has_permission = RBACService.check_permission(
                user=request.user,
                organization=organization,
                resource=resource,
                action=action
            )
            
            if not has_permission:
                return Response(
                    {
                        'error': f'Permission denied. Required: {resource}:{action}',
                        'required_permission': f'{resource}:{action}',
                        'profile_type': request.user.active_profile.profile_type if hasattr(request.user, 'active_profile') and request.user.active_profile else None
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # User has permission, execute the view
            return view_func(self, request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def require_any_permission(*permission_pairs):
    """
    Decorator that requires user to have at least ONE of the specified permissions.
    
    Usage:
        @require_any_permission(('customer', 'read'), ('lead', 'read'))
        def list(self, request, *args, **kwargs):
            # Users with either 'customer:read' OR 'lead:read' can access this
            return super().list(request, *args, **kwargs)
    
    Args:
        *permission_pairs: Tuples of (resource, action) pairs
    
    Returns:
        403 Forbidden if user lacks all permissions, otherwise executes the view
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            # Get organization from active profile (set by middleware)
            organization = None
            if hasattr(request.user, 'current_organization') and request.user.current_organization:
                organization = request.user.current_organization
            elif hasattr(request.user, 'active_profile') and request.user.active_profile:
                organization = request.user.active_profile.organization
            
            if not organization:
                return Response(
                    {'error': 'User must have an active profile with an organization'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if user has ANY of the required permissions
            has_any = False
            for resource, action in permission_pairs:
                if RBACService.check_permission(
                    user=request.user,
                    organization=organization,
                    resource=resource,
                    action=action
                ):
                    has_any = True
                    break
            
            if not has_any:
                required_perms = [f'{r}:{a}' for r, a in permission_pairs]
                return Response(
                    {
                        'error': 'Permission denied. Required at least one of: ' + ', '.join(required_perms),
                        'required_permissions': required_perms
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # User has at least one permission, execute the view
            return view_func(self, request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def require_all_permissions(*permission_pairs):
    """
    Decorator that requires user to have ALL of the specified permissions.
    
    Usage:
        @require_all_permissions(('customer', 'update'), ('deal', 'create'))
        def special_action(self, request, *args, **kwargs):
            # Users must have BOTH 'customer:update' AND 'deal:create'
            pass
    
    Args:
        *permission_pairs: Tuples of (resource, action) pairs
    
    Returns:
        403 Forbidden if user lacks any permission, otherwise executes the view
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(self, request, *args, **kwargs):
            # Get organization from active profile (set by middleware)
            organization = None
            if hasattr(request.user, 'current_organization') and request.user.current_organization:
                organization = request.user.current_organization
            elif hasattr(request.user, 'active_profile') and request.user.active_profile:
                organization = request.user.active_profile.organization
            
            if not organization:
                return Response(
                    {'error': 'User must have an active profile with an organization'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if user has ALL required permissions
            missing_perms = []
            for resource, action in permission_pairs:
                if not RBACService.check_permission(
                    user=request.user,
                    organization=organization,
                    resource=resource,
                    action=action
                ):
                    missing_perms.append(f'{resource}:{action}')
            
            if missing_perms:
                return Response(
                    {
                        'error': 'Permission denied. Missing: ' + ', '.join(missing_perms),
                        'missing_permissions': missing_perms
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # User has all permissions, execute the view
            return view_func(self, request, *args, **kwargs)
        
        return wrapped_view
    return decorator


class PermissionMixin:
    """
    Mixin for ViewSets to add standard permission checking for CRUD operations.
    
    Usage:
        class CustomerViewSet(PermissionMixin, viewsets.ModelViewSet):
            permission_resource = 'customer'
            # Now all CRUD actions will check customer:create, customer:read, etc.
    
    Set `permission_resource` on your ViewSet to enable automatic permission checking.
    """
    permission_resource = None  # Must be set by subclass
    
    def get_permission_action(self):
        """Map DRF action to RBAC action"""
        action_map = {
            'list': 'read',
            'retrieve': 'read',
            'create': 'create',
            'update': 'update',
            'partial_update': 'update',
            'destroy': 'delete',
        }
        return action_map.get(self.action, self.action)
    
    def check_object_permissions(self, request, obj):
        """Override to add RBAC check"""
        super().check_object_permissions(request, obj)
        
        if not self.permission_resource:
            return  # Skip RBAC if not configured
        
        # Get organization from active profile (set by middleware)
        organization = None
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            organization = request.user.current_organization
        elif hasattr(request.user, 'active_profile') and request.user.active_profile:
            organization = request.user.active_profile.organization
        elif hasattr(obj, 'organization'):
            organization = obj.organization
        
        if not organization:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('User must have an active profile with an organization')
        
        # Get the action to check
        rbac_action = self.get_permission_action()
        
        # Check permission
        has_permission = RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=self.permission_resource,
            action=rbac_action
        )
        
        if not has_permission:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f'Permission denied. Required: {self.permission_resource}:{rbac_action}'
            )
    
    def check_permissions(self, request):
        """Override to add RBAC check for list/create actions"""
        super().check_permissions(request)
        
        if not self.permission_resource:
            return  # Skip RBAC if not configured
        
        # Skip permission check for safe methods (GET, HEAD, OPTIONS) - employees can view
        # Only enforce permissions for write operations (POST, PUT, PATCH, DELETE)
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return
        
        # Get organization from active profile (set by middleware)
        organization = None
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            organization = request.user.current_organization
        elif hasattr(request.user, 'active_profile') and request.user.active_profile:
            organization = request.user.active_profile.organization
        
        if not organization:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('User must have an active profile with an organization')
        
        # Get the action to check
        rbac_action = self.get_permission_action()
        
        # Check permission
        has_permission = RBACService.check_permission(
            user=request.user,
            organization=organization,
            resource=self.permission_resource,
            action=rbac_action
        )
        
        if not has_permission:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(
                f'Permission denied. Required: {self.permission_resource}:{rbac_action}'
            )
