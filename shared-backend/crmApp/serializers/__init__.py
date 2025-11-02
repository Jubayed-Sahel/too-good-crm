"""
Serializers package for CRM Application
"""

from .auth import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    RefreshTokenSerializer,
    PasswordResetTokenSerializer,
    EmailVerificationTokenSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
)

from .organization import (
    OrganizationSerializer,
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    UserOrganizationSerializer,
)

from .rbac import (
    PermissionSerializer,
    RoleSerializer,
    RoleCreateSerializer,
    RolePermissionSerializer,
    UserRoleSerializer,
)

from .employee import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeListSerializer,
)

from .vendor import (
    VendorSerializer,
    VendorCreateSerializer,
    VendorListSerializer,
)

from .customer import (
    CustomerSerializer,
    CustomerCreateSerializer,
    CustomerListSerializer,
)

from .lead import (
    LeadSerializer,
    LeadCreateSerializer,
    LeadUpdateSerializer,
    LeadListSerializer,
    ConvertLeadSerializer,
)

from .deal import (
    PipelineSerializer,
    PipelineStageSerializer,
    DealSerializer,
    DealCreateSerializer,
    DealUpdateSerializer,
    DealListSerializer,
)

__all__ = [
    # Auth
    'UserSerializer',
    'UserCreateSerializer',
    'UserUpdateSerializer',
    'RefreshTokenSerializer',
    'PasswordResetTokenSerializer',
    'EmailVerificationTokenSerializer',
    'LoginSerializer',
    'ChangePasswordSerializer',
    
    # Organization
    'OrganizationSerializer',
    'OrganizationCreateSerializer',
    'OrganizationUpdateSerializer',
    'UserOrganizationSerializer',
    
    # RBAC
    'PermissionSerializer',
    'RoleSerializer',
    'RoleCreateSerializer',
    'RolePermissionSerializer',
    'UserRoleSerializer',
    
    # Employee
    'EmployeeSerializer',
    'EmployeeCreateSerializer',
    'EmployeeListSerializer',
    
    # Vendor
    'VendorSerializer',
    'VendorCreateSerializer',
    'VendorListSerializer',
    
    # Customer
    'CustomerSerializer',
    'CustomerCreateSerializer',
    'CustomerListSerializer',
    
    # Lead
    'LeadSerializer',
    'LeadCreateSerializer',
    'LeadUpdateSerializer',
    'LeadListSerializer',
    'ConvertLeadSerializer',
    
    # Deal
    'PipelineSerializer',
    'PipelineStageSerializer',
    'DealSerializer',
    'DealCreateSerializer',
    'DealUpdateSerializer',
    'DealListSerializer',
]
