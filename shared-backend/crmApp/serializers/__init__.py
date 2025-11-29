"""
Serializers package for CRM Application
"""

from .auth import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserProfileSerializer,
    UserProfileCreateSerializer,
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
    CustomerOrganizationSerializer,
)

from .call import (
    CallSerializer,
    InitiateCallSerializer,
)

from .jitsi import (
    JitsiCallSessionSerializer,
    UserPresenceSerializer,
    OnlineUserSerializer,
    InitiateCallSerializer as JitsiInitiateCallSerializer,
    UpdateCallStatusSerializer,
    UpdatePresenceSerializer,
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

from .issue import (
    IssueSerializer,
    IssueListSerializer,
    IssueCreateSerializer,
    IssueUpdateSerializer,
)

from .issue_comment import (
    IssueCommentSerializer,
    CreateIssueCommentSerializer,
)

from .order import (
    OrderItemSerializer,
    OrderSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderUpdateSerializer,
)

from .payment import (
    PaymentSerializer,
    PaymentListSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer,
)

from .activity import (
    ActivitySerializer,
    ActivityListSerializer,
    ActivityCreateSerializer,
    ActivityUpdateSerializer,
)

from .notification import (
    NotificationPreferencesSerializer,
)

__all__ = [
    # Auth
    'UserSerializer',
    'UserCreateSerializer',
    'UserUpdateSerializer',
    'UserProfileSerializer',
    'UserProfileCreateSerializer',
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
    'CustomerOrganizationSerializer',
    
    # Call
    'CallSerializer',
    'InitiateCallSerializer',
    
    # Jitsi Calls
    'JitsiCallSessionSerializer',
    'UserPresenceSerializer',
    'OnlineUserSerializer',
    'JitsiInitiateCallSerializer',
    'UpdateCallStatusSerializer',
    'UpdatePresenceSerializer',
    
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
    
    # Issue
    'IssueSerializer',
    'IssueListSerializer',
    'IssueCreateSerializer',
    'IssueUpdateSerializer',
    'IssueCommentSerializer',
    'CreateIssueCommentSerializer',
    
    # Order
    'OrderItemSerializer',
    'OrderSerializer',
    'OrderListSerializer',
    'OrderCreateSerializer',
    'OrderUpdateSerializer',
    
    # Payment
    'PaymentSerializer',
    'PaymentListSerializer',
    'PaymentCreateSerializer',
    'PaymentUpdateSerializer',
    
    # Activity
    'ActivitySerializer',
    'ActivityListSerializer',
    'ActivityCreateSerializer',
    'ActivityUpdateSerializer',
    
    # Notification
    'NotificationPreferencesSerializer',
]
