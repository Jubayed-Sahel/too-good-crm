"""
CRM Application Models Package

This package contains all Django models for the CRM application,
organized into logical modules for better maintainability.
"""

# Authentication models
from .auth import (
    User,
    UserManager,
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

# Lead model
from .lead import Lead

# Deal models
from .deal import (
    Deal,
    Pipeline,
    PipelineStage,
)

# Export all models for backward compatibility
__all__ = [
    # Authentication
    'User',
    'UserManager',
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
    'Lead',
    'Deal',
    'Pipeline',
    'PipelineStage',
]
