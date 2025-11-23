"""
Services Package

Business logic layer for CRM application.
Separates business logic from views for better testability and reusability.
"""

from .auth_service import AuthService
from .customer_service import CustomerService
from .lead_service import LeadService
from .deal_service import DealService
from .rbac_service import RBACService
from .linear_service import LinearService
from .issue_linear_service import IssueLinearService

__all__ = [
    'AuthService',
    'CustomerService',
    'LeadService',
    'DealService',
    'RBACService',
    'LinearService',
    'IssueLinearService',
]
