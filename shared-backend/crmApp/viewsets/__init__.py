"""
ViewSets package for CRM Application
Centralized exports for all API viewsets organized by domain
"""

# Authentication & Authorization
from .auth import (
    UserViewSet,
    UserProfileViewSet,
    LoginViewSet,
    LogoutViewSet,
    ChangePasswordViewSet,
)
from .role_selection import RoleSelectionViewSet
from .employee_invitation import EmployeeInvitationViewSet

# RBAC (Role-Based Access Control)
from .rbac import (
    PermissionViewSet,
    RoleViewSet,
    UserRoleViewSet,
)
from .user_context import UserContextViewSet

# Organization Management
from .organization import (
    OrganizationViewSet,
    UserOrganizationViewSet,
)

# User & Employee Management
from .employee import EmployeeViewSet

# CRM Core Entities
from .vendor import VendorViewSet
from .customer import CustomerViewSet
from .lead import LeadViewSet
from .deal import (
    PipelineViewSet,
    PipelineStageViewSet,
    DealViewSet,
)

# Operations & Activities
from .issue import IssueViewSet
from .order import OrderViewSet
from .payment import PaymentViewSet
from .activity import ActivityViewSet

# Jitsi Calls
from .jitsi import (
    JitsiCallViewSet,
    UserPresenceViewSet,
)

# Settings & Preferences
from .notification import NotificationPreferencesViewSet

# Messaging
from .message import MessageViewSet, ConversationViewSet

# Gemini AI Assistant
from .gemini import GeminiViewSet


__all__ = [
    # Authentication & Authorization
    'UserViewSet',
    'UserProfileViewSet',
    'LoginViewSet',
    'LogoutViewSet',
    'ChangePasswordViewSet',
    'RoleSelectionViewSet',
    'EmployeeInvitationViewSet',
    
    # RBAC
    'PermissionViewSet',
    'RoleViewSet',
    'UserRoleViewSet',
    'UserContextViewSet',
    
    # Organization Management
    'OrganizationViewSet',
    'UserOrganizationViewSet',
    
    # User & Employee Management
    'EmployeeViewSet',
    
    # CRM Core
    'VendorViewSet',
    'CustomerViewSet',
    'LeadViewSet',
    'PipelineViewSet',
    'PipelineStageViewSet',
    'DealViewSet',
    
    # Operations
    'IssueViewSet',
    'OrderViewSet',
    'PaymentViewSet',
    'ActivityViewSet',
    
    # Jitsi Calls
    'JitsiCallViewSet',
    'UserPresenceViewSet',
    
    # Settings
    'NotificationPreferencesViewSet',
    
    # Messaging
    'MessageViewSet',
    'ConversationViewSet',
    
    # Gemini AI
    'GeminiViewSet',
]
