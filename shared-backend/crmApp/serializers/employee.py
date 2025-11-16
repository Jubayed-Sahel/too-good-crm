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
    role_name = serializers.CharField(source='role.name', read_only=True)
    
    class Meta:
        model = Employee
        fields = [
            'id', 'code', 'full_name', 'email', 'phone',
            'department', 'job_title', 'role', 'role_name', 'status', 'manager_name'
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
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)  # Alias for frontend compatibility
    
    class Meta:
        model = Employee
        fields = [
            'id', 'organization', 'user', 'user_profile', 'code',
            'first_name', 'last_name', 'full_name', 'email', 'phone',
            'profile_image', 'department', 'job_title', 'role', 'role_name',
            'employment_type', 'employment_type_display',
            'hire_date', 'termination_date', 'status', 'status_display',
            'emergency_contact', 'salary', 'commission_rate', 'manager',
            'address', 'city', 'state', 'postal_code', 'zip_code', 'country',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'user_profile', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def update(self, instance, validated_data):
        """Override update to handle role assignment properly"""
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"📝 EmployeeSerializer.update called")
        logger.info(f"   validated_data: {validated_data}")
        logger.info(f"   initial_data: {self.initial_data}")
        
        # Handle role field - check both validated_data and initial_data
        # The role might come as an integer ID in initial_data but not be in validated_data
        role_id = validated_data.pop('role', None)
        
        # If role not in validated_data, check initial_data
        if role_id is None and 'role' in self.initial_data:
            role_id = self.initial_data.get('role')
            logger.info(f"   Role found in initial_data: {role_id}")
        
        logger.info(f"🎯 Role ID: {role_id} (type: {type(role_id)})")
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set role if provided
        if role_id is not None:
            from crmApp.models import Role
            if isinstance(role_id, int):
                # If it's an integer, fetch the Role object
                try:
                    # Validate that role belongs to the same organization
                    role = Role.objects.get(
                        id=role_id,
                        organization=instance.organization
                    )
                    instance.role = role
                    logger.info(f"✅ Role set to: {role.name} (ID: {role.id})")
                except Role.DoesNotExist:
                    logger.error(f"❌ Role with ID {role_id} not found or doesn't belong to organization {instance.organization.id}")
                    raise serializers.ValidationError({
                        'role': f'Role with ID {role_id} not found or does not belong to your organization.'
                    })
            elif role_id is None:
                # Explicitly set to None to remove role
                instance.role = None
                logger.info("✅ Role removed (set to None)")
            else:
                # If it's already a Role object, validate it belongs to organization
                if role_id.organization != instance.organization:
                    raise serializers.ValidationError({
                        'role': 'Role does not belong to your organization.'
                    })
                instance.role = role_id
                logger.info(f"✅ Role object set directly: {role_id}")
        elif 'role' in self.initial_data and self.initial_data['role'] is None:
            # Explicitly setting role to None
            instance.role = None
            logger.info("✅ Role removed (explicit None)")
        
        instance.save()
        logger.info(f"💾 Employee saved. Current role: {instance.role} (ID: {instance.role.id if instance.role else None})")
        return instance


class EmployeeCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating employees"""
    user_id = serializers.IntegerField(required=False, allow_null=True)
    manager_id = serializers.IntegerField(required=False, allow_null=True)
    role_id = serializers.IntegerField(required=False, allow_null=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)
    
    class Meta:
        model = Employee
        fields = [
            'organization', 'user_id', 'first_name', 'last_name',
            'email', 'phone', 'profile_image', 'department', 'job_title',
            'role_id', 'employment_type', 'hire_date', 'status',
            'emergency_contact', 'salary', 'commission_rate', 'manager_id',
            'address', 'city', 'state', 'zip_code', 'country'
        ]
    
    def validate_email(self, value):
        """Validate email is unique within organization"""
        if not value:
            return value
        
        organization = self.initial_data.get('organization')
        if organization:
            # Check if employee with this email exists in the organization
            if Employee.objects.filter(
                organization_id=organization,
                email__iexact=value
            ).exists():
                raise serializers.ValidationError(
                    "An employee with this email already exists in your organization."
                )
        
        return value.lower()
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if not value:
            return value
        
        # Remove common separators
        cleaned = value.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        
        # Check if it's mostly digits
        if not cleaned.replace('+', '').isdigit():
            raise serializers.ValidationError(
                "Phone number should only contain digits, spaces, hyphens, and parentheses."
            )
        
        # Check minimum length
        if len(cleaned) < 10:
            raise serializers.ValidationError(
                "Phone number must be at least 10 digits."
            )
        
        return value
    
    def validate_salary(self, value):
        """Validate salary is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Salary cannot be negative."
            )
        return value
    
    def validate_commission_rate(self, value):
        """Validate commission rate is between 0 and 100"""
        if value is not None:
            if value < 0 or value > 100:
                raise serializers.ValidationError(
                    "Commission rate must be between 0 and 100 percent."
                )
        return value
    
    def validate(self, attrs):
        """Object-level validation"""
        # Ensure first_name and last_name are provided
        if not attrs.get('first_name') or not attrs.get('last_name'):
            raise serializers.ValidationError(
                "Both first name and last name are required."
            )
        
        # If employment_type is contract, check hire_date is provided
        if attrs.get('employment_type') == 'contract' and not attrs.get('hire_date'):
            raise serializers.ValidationError({
                'hire_date': "Hire date is required for contract employees."
            })
        
        return attrs
    
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
