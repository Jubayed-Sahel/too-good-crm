"""
Role-Based Access Control serializers
"""

from rest_framework import serializers
from crmApp.models import Permission, Role, RolePermission, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for permissions"""
    
    class Meta:
        model = Permission
        fields = [
            'id', 'organization', 'resource', 'action',
            'description', 'is_system_permission', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RoleSerializer(serializers.ModelSerializer):
    """Full role serializer with permissions"""
    permissions = PermissionSerializer(many=True, read_only=True, source='role_permissions.permission')
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = [
            'id', 'organization', 'name', 'slug', 'description',
            'is_system_role', 'is_active', 'created_at', 'updated_at',
            'permissions', 'permission_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_permission_count(self, obj):
        return obj.role_permissions.count()


class RoleCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating roles"""
    permission_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Role
        fields = [
            'name', 'description', 'permission_ids'
        ]
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        
        # organization and slug are passed from perform_create via serializer.save()
        role = Role.objects.create(**validated_data)
        
        # Assign permissions
        if permission_ids:
            permissions = Permission.objects.filter(
                id__in=permission_ids,
                organization=role.organization
            )
            for permission in permissions:
                RolePermission.objects.create(
                    role=role,
                    permission=permission
                )
        
        return role


class RolePermissionSerializer(serializers.ModelSerializer):
    """Serializer for role-permission relationships"""
    role = RoleSerializer(read_only=True)
    permission = PermissionSerializer(read_only=True)
    
    class Meta:
        model = RolePermission
        fields = ['id', 'role', 'permission', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer for user-role assignments"""
    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserRole
        fields = [
            'id', 'user', 'organization', 'role',
            'role_id', 'is_active', 'assigned_at'
        ]
        read_only_fields = ['id', 'assigned_at']
