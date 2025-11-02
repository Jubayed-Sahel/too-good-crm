"""
RBAC ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Permission, Role, RolePermission, UserRole
from crmApp.serializers import (
    PermissionSerializer,
    RoleSerializer,
    RoleCreateSerializer,
    UserRoleSerializer,
)


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Permission management.
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter permissions by organization"""
        # Get user's organizations
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        return Permission.objects.filter(organization_id__in=user_orgs)
    
    @action(detail=False, methods=['get'])
    def by_resource(self, request):
        """Group permissions by resource"""
        permissions = self.get_queryset()
        grouped = {}
        
        for perm in permissions:
            if perm.resource not in grouped:
                grouped[perm.resource] = []
            grouped[perm.resource].append(PermissionSerializer(perm).data)
        
        return Response(grouped)


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Role management.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RoleCreateSerializer
        return RoleSerializer
    
    def get_queryset(self):
        """Filter roles by organization"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        return Role.objects.filter(organization_id__in=user_orgs)
    
    @action(detail=True, methods=['post'])
    def assign_permission(self, request, pk=None):
        """Assign a permission to a role"""
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        
        if not permission_id:
            return Response(
                {'error': 'permission_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            permission = Permission.objects.get(
                id=permission_id,
                organization=role.organization
            )
            
            RolePermission.objects.get_or_create(
                role=role,
                permission=permission
            )
            
            return Response({'message': 'Permission assigned successfully.'})
        except Permission.DoesNotExist:
            return Response(
                {'error': 'Permission not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        """Remove a permission from a role"""
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        
        RolePermission.objects.filter(
            role=role,
            permission_id=permission_id
        ).delete()
        
        return Response({'message': 'Permission removed successfully.'})


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserRole assignments.
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        return UserRole.objects.filter(organization_id__in=user_orgs)
    
    @action(detail=False, methods=['get'])
    def my_roles(self, request):
        """Get roles for current user"""
        roles = UserRole.objects.filter(
            user=request.user,
            is_active=True
        )
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)
