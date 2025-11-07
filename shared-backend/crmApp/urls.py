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
    # Analytics
    AnalyticsViewSet,
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

# Analytics endpoints
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

# URL patterns
urlpatterns = [
    path('api/', include(router.urls)),
]
