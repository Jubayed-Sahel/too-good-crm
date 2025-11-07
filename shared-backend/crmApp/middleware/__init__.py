"""
Middleware package for CRM application
"""

from .organization_context import OrganizationContextMiddleware

__all__ = ['OrganizationContextMiddleware']
