"""
Organization Context Middleware
Handles organization-scoped requests for multi-tenancy
Uses UserProfile to determine organization context based on profile type
"""

import threading
from django.utils.deprecation import MiddlewareMixin
from crmApp.models import UserProfile, Organization
from crmApp.utils.profile_context import (
    get_user_active_profile,
    get_user_accessible_organizations,
    get_customer_vendor_organizations,
)

# Thread-local storage for current user (for signal handlers)
_thread_locals = threading.local()


def get_current_user():
    """Get the current user from thread-local storage."""
    return getattr(_thread_locals, 'user', None)


def set_current_user(user):
    """Set the current user in thread-local storage."""
    _thread_locals.user = user


class OrganizationContextMiddleware(MiddlewareMixin):
    """
    Middleware to set the active organization context for each request.
    
    Uses active UserProfile to determine which organization the user is working with.
    
    Rules:
    - Vendor: Uses organization from vendor profile
    - Employee: Uses organization from employee profile (org they work for)
    - Customer: No single organization (can access multiple vendor orgs via Customer records)
    """
    
    def process_request(self, request):
        """Process incoming request to set organization context"""
        
        # Store current user in thread-local for signal handlers
        user_to_set = request.user if request.user.is_authenticated else None
        set_current_user(user_to_set)
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        if request.path.startswith('/api/customers'):
            logger.info(f"🔧 Middleware: Setting current_user to {user_to_set} (authenticated: {getattr(request.user, 'is_authenticated', False)})")
        
        # Skip for unauthenticated requests
        if not request.user or not request.user.is_authenticated:
            request.user.current_organization = None
            request.user.active_profile = None
            request.user.accessible_organization_ids = []
            return None
        
        # Get active profile
        active_profile = get_user_active_profile(request.user)
        request.user.active_profile = active_profile
        
        if not active_profile:
            request.user.current_organization = None
            request.user.accessible_organization_ids = []
            return None
        
        # Get organization based on profile type
        if active_profile.profile_type in ['vendor', 'employee']:
            # Vendor and Employee have a single organization
            request.user.current_organization = active_profile.organization
            request.user.accessible_organization_ids = [active_profile.organization.id] if active_profile.organization else []
        elif active_profile.profile_type == 'customer':
            # Customer can access multiple vendor organizations
            from crmApp.utils.profile_context import get_customer_vendor_organizations
            customer_orgs = get_customer_vendor_organizations(request.user)
            request.user.current_organization = customer_orgs[0] if customer_orgs else None
            request.user.accessible_organization_ids = [org.id for org in customer_orgs]
        else:
            request.user.current_organization = None
            request.user.accessible_organization_ids = []
        
        # Set is_organization_owner (only vendors own their organization)
        request.user.is_organization_owner = (
            active_profile.profile_type == 'vendor' and 
            active_profile.organization is not None
        )
        
        return None
    
    def process_response(self, request, response):
        """Add organization context to response headers"""
        
        # Clear thread-local storage
        set_current_user(None)
        
        if hasattr(request.user, 'current_organization') and request.user.current_organization:
            response['X-Active-Organization'] = str(request.user.current_organization.id)
            response['X-Organization-Name'] = request.user.current_organization.name
            response['X-Is-Owner'] = str(getattr(request.user, 'is_organization_owner', False)).lower()
        
        if hasattr(request.user, 'active_profile') and request.user.active_profile:
            response['X-Active-Profile-Type'] = request.user.active_profile.profile_type
        
        return response
