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
from .customer import Customer, CustomerOrganization

# Call model
from .call import Call

# Jitsi call models
from .jitsi_call import JitsiCallSession, UserPresence

# Lead model
from .lead import Lead, LeadStageHistory

# Deal models
from .deal import (
    Deal,
    Pipeline,
    PipelineStage,
)

# Issue models
from .issue import Issue
from .issue_comment import IssueComment

# Order models
from .order import (
    Order,
    OrderItem,
)

# Payment model
from .payment import Payment

# Activity model
from .activity import Activity

# Audit Log model
from .audit_log import AuditLog

# Notification model
from .notification import NotificationPreferences

# Message models
from .message import Message, Conversation, GeminiConversation

# Telegram models
from .telegram import TelegramUser

# Phone verification model
from .phone_verification import PhoneVerification

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
    'CustomerOrganization',
    'Call',
    'JitsiCallSession',
    'UserPresence',
    'Lead',
    'LeadStageHistory',
    'Deal',
    'Pipeline',
    'PipelineStage',
    
    # Operations
    'Issue',
    'IssueComment',
    'Order',
    'OrderItem',
    'Payment',
    'Activity',
    
    # Notifications
    'NotificationPreferences',
    
    # Messages
    'Message',
    'Conversation',
    'GeminiConversation',
    
    # Telegram
    'TelegramUser',
    
    # Phone Verification
    'PhoneVerification',
]
