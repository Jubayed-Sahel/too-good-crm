"""
Organization Context Middleware
Handles organization-scoped requests for multi-tenancy
"""

from django.utils.deprecation import MiddlewareMixin
from crmApp.models import UserOrganization, UserProfile


class OrganizationContextMiddleware(MiddlewareMixin):
    """
    Middleware to set the active organization context for each request.
    
    Uses X-Organization-ID header to determine which organization
    the user is currently working with.
    
    Validates that the user has access to the requested organization.
    """
    
    def process_request(self, request):
        """Process incoming request to set organization context"""
        
        # Skip for unauthenticated requests
        if not request.user or not request.user.is_authenticated:
            request.organization = None
            request.is_organization_owner = False
            return None
        
        # Get organization ID from header
        org_id = request.headers.get('X-Organization-ID')
        
        if not org_id:
            # No organization context - used for standalone customers or multi-org selection
            request.organization = None
            request.is_organization_owner = False
            return None
        
        try:
            org_id = int(org_id)
        except (ValueError, TypeError):
            request.organization = None
            request.is_organization_owner = False
            return None
        
        # Check if user has access to this organization
        try:
            user_org = UserOrganization.objects.select_related('organization').get(
                user=request.user,
                organization_id=org_id,
                is_active=True
            )
            
            request.organization = user_org.organization
            request.is_organization_owner = user_org.is_owner
            
        except UserOrganization.DoesNotExist:
            # User doesn't have access to this organization
            request.organization = None
            request.is_organization_owner = False
        
        return None
    
    def process_response(self, request, response):
        """Add organization context to response headers"""
        
        if hasattr(request, 'organization') and request.organization:
            response['X-Active-Organization'] = str(request.organization.id)
            response['X-Organization-Name'] = request.organization.name
            response['X-Is-Owner'] = str(request.is_organization_owner).lower()
        
        return response
