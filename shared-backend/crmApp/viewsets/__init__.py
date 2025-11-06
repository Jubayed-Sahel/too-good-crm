"""
ViewSets package for CRM Application
"""

from .auth import (
    UserViewSet,
    UserProfileViewSet,
    LoginViewSet,
    LogoutViewSet,
    ChangePasswordViewSet,
    # RefreshTokenViewSet removed - using simple Token auth
)

from .organization import (
    OrganizationViewSet,
    UserOrganizationViewSet,
)

from .rbac import (
    PermissionViewSet,
    RoleViewSet,
    UserRoleViewSet,
)

from .employee import EmployeeViewSet
from .vendor import VendorViewSet
from .customer import CustomerViewSet
from .lead import LeadViewSet
from .deal import (
    PipelineViewSet,
    PipelineStageViewSet,
    DealViewSet,
)
from .issue import IssueViewSet
from .order import OrderViewSet
from .payment import PaymentViewSet
from .activity import ActivityViewSet
from .analytics import AnalyticsViewSet

__all__ = [
    # Auth
    'UserViewSet',
    'UserProfileViewSet',
    'LoginViewSet',
    'LogoutViewSet',
    'ChangePasswordViewSet',
    # 'RefreshTokenViewSet' removed - using simple Token auth
    
    # Organization
    'OrganizationViewSet',
    'UserOrganizationViewSet',
    
    # RBAC
    'PermissionViewSet',
    'RoleViewSet',
    'UserRoleViewSet',
    
    # CRM
    'EmployeeViewSet',
    'VendorViewSet',
    'CustomerViewSet',
    'LeadViewSet',
    'PipelineViewSet',
    'PipelineStageViewSet',
    'DealViewSet',
    
    # New Models
    'IssueViewSet',
    'OrderViewSet',
    'PaymentViewSet',
    'ActivityViewSet',
    
    # Analytics
    'AnalyticsViewSet',
]
