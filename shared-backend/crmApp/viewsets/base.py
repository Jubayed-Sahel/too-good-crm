"""
Base ViewSet classes with RBAC enforcement.
Provides reusable base classes following Django REST Framework best practices.
"""

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from crmApp.permissions import HasResourcePermission
from crmApp.viewsets.mixins import OrganizationFilterMixin, QueryFilterMixin


class RBACModelViewSet(viewsets.ModelViewSet, OrganizationFilterMixin, QueryFilterMixin):
    """
    Base ModelViewSet with strict RBAC enforcement.
    
    Features:
    - Automatic permission checking for all CRUD operations
    - Organization-scoped queryset filtering
    - Support for search and filtering
    
    Usage:
        class CustomerViewSet(RBACModelViewSet):
            queryset = Customer.objects.all()
            serializer_class = CustomerSerializer
            resource_name = 'customers'  # Required for RBAC
            search_fields = ['name', 'email']  # Optional
    
    This will automatically:
    - Enforce permissions for all operations (read, create, update, delete)
    - Filter queryset to user's accessible organizations
    - Apply search and filter query parameters
    """
    
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = None  # Must be set by subclass
    
    def get_queryset(self):
        """
        Get queryset filtered by user's accessible organizations.
        Override in subclass for additional filtering.
        """
        queryset = super().get_queryset()
        
        # Apply organization filtering
        queryset = self.filter_by_organization(queryset, self.request)
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Create object with organization context.
        Override in subclass for custom create logic.
        """
        # Get organization from active profile
        organization = None
        if hasattr(self.request.user, 'current_organization'):
            organization = self.request.user.current_organization
        elif hasattr(self.request.user, 'active_profile') and self.request.user.active_profile:
            organization = self.request.user.active_profile.organization
        
        # Save with organization if model has organization field
        if organization and hasattr(serializer.Meta.model, 'organization'):
            serializer.save(organization=organization)
        else:
            serializer.save()


class RBACReadOnlyModelViewSet(viewsets.ReadOnlyModelViewSet, OrganizationFilterMixin, QueryFilterMixin):
    """
    Base ReadOnlyModelViewSet with strict RBAC enforcement.
    
    Features:
    - Automatic permission checking for read operations
    - Organization-scoped queryset filtering
    - Support for search and filtering
    
    Usage:
        class ReportViewSet(RBACReadOnlyModelViewSet):
            queryset = Report.objects.all()
            serializer_class = ReportSerializer
            resource_name = 'reports'  # Required for RBAC
    """
    
    permission_classes = [IsAuthenticated, HasResourcePermission]
    resource_name = None  # Must be set by subclass
    
    def get_queryset(self):
        """
        Get queryset filtered by user's accessible organizations.
        Override in subclass for additional filtering.
        """
        queryset = super().get_queryset()
        
        # Apply organization filtering
        queryset = self.filter_by_organization(queryset, self.request)
        
        return queryset

