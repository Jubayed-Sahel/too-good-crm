"""
CRM Application Models Package

This package contains all Django models for the CRM application,
organized into logical modules for better maintainability.
"""

# Authentication models
from .auth import (
    User,
    UserManager,
    UserProfile,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
)

# Organization models
from .organization import (
    Organization,
    UserOrganization,
)

# RBAC models
from .rbac import (
    Role,
    Permission,
    RolePermission,
    UserRole,
)

# Employee model
from .employee import Employee

# Vendor model
from .vendor import Vendor

# Customer model
from .customer import Customer

# Call model
from .call import Call

# Jitsi call models
from .jitsi_call import JitsiCallSession, UserPresence

# Lead model
from .lead import Lead

# Deal models
from .deal import (
    Deal,
    Pipeline,
    PipelineStage,
)

# Issue models
from .issue import Issue

# Order models
from .order import (
    Order,
    OrderItem,
)

# Payment model
from .payment import Payment

# Activity model
from .activity import Activity

# Notification model
from .notification import NotificationPreferences

# Export all models for backward compatibility
__all__ = [
    # Authentication
    'User',
    'UserManager',
    'UserProfile',
    'RefreshToken',
    'PasswordResetToken',
    'EmailVerificationToken',
    
    # Organization
    'Organization',
    'UserOrganization',
    
    # RBAC
    'Role',
    'Permission',
    'RolePermission',
    'UserRole',
    
    # CRM Core
    'Employee',
    'Vendor',
    'Customer',
    'Call',
    'JitsiCallSession',
    'UserPresence',
    'Lead',
    'Deal',
    'Pipeline',
    'PipelineStage',
    
    # Operations
    'Issue',
    'Order',
    'OrderItem',
    'Payment',
    'Activity',
    
    # Notifications
    'NotificationPreferences',
]
