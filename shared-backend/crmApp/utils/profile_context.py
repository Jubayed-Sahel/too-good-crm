"""
Profile Context Utilities
Helper functions to get organization context based on user's active profile
"""

from typing import Optional, List
from django.contrib.auth import get_user_model
from crmApp.models import UserProfile, Organization, Customer

User = get_user_model()


def get_active_profile_organization(user: User) -> Optional[Organization]:
    """
    Get the organization for the user's active (primary) profile.
    
    Rules:
    - Vendor: Returns their own organization (from vendor profile)
    - Employee: Returns the organization they work for (from employee profile)
    - Customer: Returns None (customers see data from multiple vendor orgs via Customer records)
    
    Args:
        user: The user object
        
    Returns:
        Organization object or None
    """
    if not user or not user.is_authenticated:
        return None
    
    # Get primary/active profile
    active_profile = UserProfile.objects.filter(
        user=user,
        is_primary=True,
        status='active'
    ).select_related('organization').first()
    
    # If no primary, get first active profile
    if not active_profile:
        active_profile = UserProfile.objects.filter(
            user=user,
            status='active'
        ).select_related('organization').first()
    
    if not active_profile:
        return None
    
    # Vendor and Employee profiles have organization
    if active_profile.profile_type in ['vendor', 'employee']:
        return active_profile.organization
    
    # Customer profile doesn't have a single organization
    # They see data from multiple vendor organizations
    return None


def get_customer_vendor_organizations(user: User) -> List[Organization]:
    """
    Get all vendor organizations where the user is a customer.
    Uses the CustomerOrganization junction table for proper many-to-many support.
    
    Args:
        user: The user object
        
    Returns:
        List of Organization objects
    """
    if not user or not user.is_authenticated:
        return []
    
    # Get all organizations linked to customers for this user
    # through the CustomerOrganization many-to-many relationship
    from crmApp.models import Customer, Organization
    
    # Get organization IDs from CustomerOrganization (proper M2M)
    organization_ids = Customer.objects.filter(
        user=user
    ).values_list('organizations__id', flat=True).distinct()
    
    # Filter out None values and get organization objects
    organization_ids = [org_id for org_id in organization_ids if org_id is not None]
    
    if not organization_ids:
        return []
    
    # Get organization objects
    organizations = Organization.objects.filter(id__in=organization_ids)
    return list(organizations)


def get_user_accessible_organizations(user: User) -> List[int]:
    """
    Get list of organization IDs that the user can access based on their profile type.
    
    Rules:
    - Vendor: Returns [their_own_org_id]
    - Employee: Returns [org_they_work_for_id]
    - Customer: Returns [all_vendor_org_ids_where_they_are_customer]
    
    Args:
        user: The user object
        
    Returns:
        List of organization IDs
    """
    if not user or not user.is_authenticated:
        return []
    
    # Get active profile
    active_profile = UserProfile.objects.filter(
        user=user,
        is_primary=True,
        status='active'
    ).first()
    
    if not active_profile:
        active_profile = UserProfile.objects.filter(
            user=user,
            status='active'
        ).first()
    
    if not active_profile:
        return []
    
    # Vendor: return their own organization
    if active_profile.profile_type == 'vendor':
        if active_profile.organization:
            return [active_profile.organization.id]
        return []
    
    # Employee: return the organization they work for
    if active_profile.profile_type == 'employee':
        if active_profile.organization:
            return [active_profile.organization.id]
        return []
    
    # Customer: return all vendor organizations where they are a customer
    if active_profile.profile_type == 'customer':
        customer_orgs = get_customer_vendor_organizations(user)
        return [org.id for org in customer_orgs]
    
    return []


def get_user_active_profile(user: User) -> Optional[UserProfile]:
    """
    Get the user's active (primary) profile.
    
    Args:
        user: The user object
        
    Returns:
        UserProfile object or None
    """
    if not user or not user.is_authenticated:
        return None
    
    # Get primary profile
    profile = UserProfile.objects.filter(
        user=user,
        is_primary=True,
        status='active'
    ).select_related('organization').first()
    
    # If no primary, get first active profile
    if not profile:
        profile = UserProfile.objects.filter(
            user=user,
            status='active'
        ).select_related('organization').first()
    
    return profile

