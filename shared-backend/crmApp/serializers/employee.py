"""
Employee related serializers
"""

from rest_framework import serializers
from crmApp.models import Employee, UserProfile
from .auth import UserSerializer, UserProfileSerializer


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for employee lists"""
    full_name = serializers.SerializerMethodField()
    manager_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Employee
        fields = [
            'id', 'code', 'full_name', 'email', 'phone',
            'department', 'job_title', 'status', 'manager_name'
        ]
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.full_name
        return None


class EmployeeSerializer(serializers.ModelSerializer):
    """Full employee serializer"""
    user = UserSerializer(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    manager = EmployeeListSerializer(read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'organization', 'user', 'user_profile', 'code',
            'first_name', 'last_name', 'full_name', 'email', 'phone',
            'profile_image', 'department', 'job_title', 'role', 'role_name',
            'employment_type', 'employment_type_display',
            'hire_date', 'termination_date', 'status', 'status_display',
            'emergency_contact', 'salary', 'commission_rate', 'manager',
            'address', 'city', 'state', 'zip_code', 'country',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'user_profile', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.full_name


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating employees"""
    user_id = serializers.IntegerField(required=False, allow_null=True)
    manager_id = serializers.IntegerField(required=False, allow_null=True)
    role_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Employee
        fields = [
            'organization', 'user_id', 'first_name', 'last_name',
            'email', 'phone', 'profile_image', 'department', 'job_title',
            'role_id', 'employment_type', 'hire_date', 'status',
            'emergency_contact', 'salary', 'commission_rate', 'manager_id',
            'address', 'city', 'state', 'zip_code', 'country'
        ]
    
    def create(self, validated_data):
        """Create employee and auto-create user profile if user is linked"""
        user_id = validated_data.pop('user_id', None)
        manager_id = validated_data.pop('manager_id', None)
        role_id = validated_data.pop('role_id', None)
        
        employee = Employee(**validated_data)
        
        if user_id:
            from crmApp.models import User
            employee.user = User.objects.get(id=user_id)
        
        if manager_id:
            employee.manager = Employee.objects.get(id=manager_id)
        
        if role_id:
            from crmApp.models import Role
            employee.role = Role.objects.get(id=role_id)
        
        employee.save()  # This will auto-create UserProfile
        return employee
