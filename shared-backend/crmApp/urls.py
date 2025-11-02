"""
URL Configuration for CRM API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from crmApp.viewsets import (
    # Auth
    UserViewSet,
    LoginViewSet,
    LogoutViewSet,
    ChangePasswordViewSet,
    RefreshTokenViewSet,
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
)

# Create router
router = DefaultRouter()

# Auth endpoints
router.register(r'users', UserViewSet, basename='user')
router.register(r'auth/login', LoginViewSet, basename='login')
router.register(r'auth/logout', LogoutViewSet, basename='logout')
router.register(r'auth/change-password', ChangePasswordViewSet, basename='change-password')
router.register(r'auth/refresh-tokens', RefreshTokenViewSet, basename='refresh-token')

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

# URL patterns
urlpatterns = [
    path('api/', include(router.urls)),
]
