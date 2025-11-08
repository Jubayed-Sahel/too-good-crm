"""
Permission decorators for protecting views and actions
"""
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from crmApp.utils.permissions import PermissionChecker


def require_permission(resource, action):
    """
    Decorator to protect view actions with permission checks.
    
    Usage:
        @require_permission('customer', 'create')
        def create(self, request, *args, **kwargs):
            # Only users with customer.create permission can access
            ...
    
    The decorator expects:
    - request.user to be authenticated
    - request.data or request.query_params to contain 'organization' ID
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            # Get organization from request
            organization_id = None
            
            # Try to get from request data first
            if hasattr(request, 'data') and request.data:
                organization_id = request.data.get('organization')
            
            # Try query params
            if not organization_id and hasattr(request, 'query_params'):
                organization_id = request.query_params.get('organization')
            
            # Try to get from instance being accessed (for update/delete)
            if not organization_id and hasattr(view_instance, 'get_object'):
                try:
                    obj = view_instance.get_object()
                    if hasattr(obj, 'organization_id'):
                        organization_id = obj.organization_id
                    elif hasattr(obj, 'organization'):
                        organization_id = obj.organization.id if obj.organization else None
                except:
                    pass
            
            # Try to get user's primary organization
            if not organization_id:
                user_org = request.user.user_organizations.filter(is_active=True).first()
                if user_org:
                    organization_id = user_org.organization_id
            
            if not organization_id:
                return Response(
                    {'error': 'Organization context required for permission check'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get organization object
            from crmApp.models import Organization
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                return Response(
                    {'error': 'Organization not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check permission
            checker = PermissionChecker(request.user, organization)
            
            if not checker.has_permission(resource, action):
                return Response(
                    {
                        'error': 'Permission denied',
                        'detail': f'You do not have permission to {action} {resource}',
                        'required_permission': f'{resource}.{action}'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Permission granted - execute the view
            return view_func(view_instance, request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def require_any_permission(permission_list):
    """
    Decorator to protect views requiring any of the specified permissions.
    
    Usage:
        @require_any_permission(['customer.create', 'customer.update'])
        def my_action(self, request, *args, **kwargs):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            # Get organization (same logic as require_permission)
            organization_id = None
            
            if hasattr(request, 'data') and request.data:
                organization_id = request.data.get('organization')
            
            if not organization_id and hasattr(request, 'query_params'):
                organization_id = request.query_params.get('organization')
            
            if not organization_id and hasattr(view_instance, 'get_object'):
                try:
                    obj = view_instance.get_object()
                    if hasattr(obj, 'organization_id'):
                        organization_id = obj.organization_id
                    elif hasattr(obj, 'organization'):
                        organization_id = obj.organization.id if obj.organization else None
                except:
                    pass
            
            if not organization_id:
                user_org = request.user.user_organizations.filter(is_active=True).first()
                if user_org:
                    organization_id = user_org.organization_id
            
            if not organization_id:
                return Response(
                    {'error': 'Organization context required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from crmApp.models import Organization
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                return Response(
                    {'error': 'Organization not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            checker = PermissionChecker(request.user, organization)
            
            if not checker.has_any_permission(permission_list):
                return Response(
                    {
                        'error': 'Permission denied',
                        'detail': f'You need one of these permissions: {", ".join(permission_list)}',
                        'required_permissions': permission_list
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(view_instance, request, *args, **kwargs)
        
        return wrapped_view
    return decorator


def require_owner():
    """
    Decorator to ensure only organization owners can access.
    
    Usage:
        @require_owner()
        def delete_organization(self, request, *args, **kwargs):
            # Only owners can delete
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(view_instance, request, *args, **kwargs):
            organization_id = None
            
            if hasattr(request, 'data') and request.data:
                organization_id = request.data.get('organization')
            
            if not organization_id and hasattr(request, 'query_params'):
                organization_id = request.query_params.get('organization')
            
            if not organization_id and hasattr(view_instance, 'get_object'):
                try:
                    obj = view_instance.get_object()
                    if hasattr(obj, 'organization_id'):
                        organization_id = obj.organization_id
                    elif hasattr(obj, 'organization'):
                        organization_id = obj.organization.id if obj.organization else None
                except:
                    pass
            
            if not organization_id:
                user_org = request.user.user_organizations.filter(is_active=True).first()
                if user_org:
                    organization_id = user_org.organization_id
            
            if not organization_id:
                return Response(
                    {'error': 'Organization context required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from crmApp.models import Organization
            try:
                organization = Organization.objects.get(id=organization_id)
            except Organization.DoesNotExist:
                return Response(
                    {'error': 'Organization not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            checker = PermissionChecker(request.user, organization)
            
            if not checker.is_owner():
                return Response(
                    {
                        'error': 'Owner access required',
                        'detail': 'Only organization owners can perform this action'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return view_func(view_instance, request, *args, **kwargs)
        
        return wrapped_view
    return decorator
