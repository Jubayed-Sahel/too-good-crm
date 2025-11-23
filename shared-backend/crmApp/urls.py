"""
URL Configuration for CRM API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from crmApp.viewsets import (
    # Auth
    UserViewSet,
    UserProfileViewSet,
    LoginViewSet,
    LogoutViewSet,
    ChangePasswordViewSet,
    RoleSelectionViewSet,
    EmployeeInvitationViewSet,
    # RefreshTokenViewSet removed - using simple Token auth
    # Organization
    OrganizationViewSet,
    UserOrganizationViewSet,
    # RBAC
    PermissionViewSet,
    RoleViewSet,
    UserRoleViewSet,
    # User Context
    UserContextViewSet,
    # CRM
    EmployeeViewSet,
    VendorViewSet,
    CustomerViewSet,
    LeadViewSet,
    PipelineViewSet,
    PipelineStageViewSet,
    DealViewSet,
    # New Models
    IssueViewSet,
    OrderViewSet,
    PaymentViewSet,
    ActivityViewSet,
    NotificationPreferencesViewSet,
    # Messages
    MessageViewSet,
    ConversationViewSet,
    # Gemini AI
    GeminiViewSet,
    # Jitsi Calls
    JitsiCallViewSet,
    UserPresenceViewSet,
)

# Import issue action views
from crmApp.views.issue_actions import RaiseIssueView, ResolveIssueView
from crmApp.views.linear_webhook import LinearWebhookView
from crmApp.views.client_issues import ClientRaiseIssueView, ClientIssueDetailView, ClientIssueCommentView
from crmApp.views.pusher_auth import pusher_auth

# Import Telegram webhook views
from crmApp.viewsets.telegram import (
    telegram_webhook,
    telegram_webhook_info,
    telegram_set_webhook,
    telegram_bot_info,
)

# Create router
router = DefaultRouter()

# Auth endpoints
router.register(r'users', UserViewSet, basename='user')
router.register(r'user-profiles', UserProfileViewSet, basename='user-profile')
router.register(r'auth/login', LoginViewSet, basename='login')
router.register(r'auth/logout', LogoutViewSet, basename='logout')
router.register(r'auth/change-password', ChangePasswordViewSet, basename='change-password')
router.register(r'auth/role-selection', RoleSelectionViewSet, basename='role-selection')
router.register(r'employee-invitations', EmployeeInvitationViewSet, basename='employee-invitation')
# router.register(r'auth/refresh-tokens', RefreshTokenViewSet, basename='refresh-token')  # Removed - using Token auth

# Organization endpoints
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'user-organizations', UserOrganizationViewSet, basename='user-organization')

# RBAC endpoints
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRoleViewSet, basename='user-role')

# User Context endpoints
router.register(r'user-context', UserContextViewSet, basename='user-context')

# CRM endpoints
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'pipelines', PipelineViewSet, basename='pipeline')
router.register(r'pipeline-stages', PipelineStageViewSet, basename='pipeline-stage')
router.register(r'deals', DealViewSet, basename='deal')

# New Model endpoints
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'notification-preferences', NotificationPreferencesViewSet, basename='notification-preferences')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'conversations', ConversationViewSet, basename='conversation')

# Gemini AI endpoints
router.register(r'gemini', GeminiViewSet, basename='gemini')

# Jitsi call endpoints
router.register(r'jitsi-calls', JitsiCallViewSet, basename='jitsi-call')
router.register(r'user-presence', UserPresenceViewSet, basename='user-presence')

# URL patterns
urlpatterns = [
    # Dedicated issue action endpoints (MUST come BEFORE router.urls)
    path('api/issues/raise/', RaiseIssueView.as_view(), name='issue-raise'),
    path('api/issues/resolve/<int:issue_id>/', ResolveIssueView.as_view(), name='issue-resolve'),
    
    # Client issue endpoints
    path('api/client/issues/raise/', ClientRaiseIssueView.as_view(), name='client-issue-raise'),
    path('api/client/issues/<int:issue_id>/', ClientIssueDetailView.as_view(), name='client-issue-detail'),
    path('api/client/issues/<int:issue_id>/comment/', ClientIssueCommentView.as_view(), name='client-issue-comment'),
    
    # Linear webhook endpoint
    path('api/webhooks/linear/', LinearWebhookView.as_view(), name='linear-webhook'),
    
    # Pusher authentication endpoint
    path('api/pusher/auth/', pusher_auth, name='pusher-auth'),
    
    # Telegram bot endpoints
    path('api/telegram/webhook/', telegram_webhook, name='telegram-webhook'),
    path('api/telegram/webhook/info/', telegram_webhook_info, name='telegram-webhook-info'),
    path('api/telegram/webhook/set/', telegram_set_webhook, name='telegram-set-webhook'),
    path('api/telegram/bot/info/', telegram_bot_info, name='telegram-bot-info'),
    
    # Router URLs (catch-all, must be last)
    path('api/', include(router.urls)),
]
