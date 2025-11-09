"""
Services Package

Business logic layer for CRM application.
Separates business logic from views for better testability and reusability.
"""

from .auth_service import AuthService
from .customer_service import CustomerService
from .lead_service import LeadService
from .deal_service import DealService
from .analytics_service import AnalyticsService
from .rbac_service import RBACService
from .twilio_service import twilio_service
from .linear_service import LinearService
from .issue_linear_service import IssueLinearService

__all__ = [
    'AuthService',
    'CustomerService',
    'LeadService',
    'DealService',
    'AnalyticsService',
    'RBACService',
    'twilio_service',
    'LinearService',
    'IssueLinearService',
]
