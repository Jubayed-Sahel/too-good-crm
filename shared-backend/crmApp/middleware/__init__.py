"""
Middleware package for CRM application
"""

from .organization_context import OrganizationContextMiddleware, get_current_user, set_current_user

__all__ = ['OrganizationContextMiddleware', 'get_current_user', 'set_current_user']
