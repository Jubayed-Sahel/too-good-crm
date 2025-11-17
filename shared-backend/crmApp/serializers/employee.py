"""
Employee related serializers
"""

from rest_framework import serializers
from crmApp.models import Employee, UserProfile, Role
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
    # Define role field with default queryset - will be refined in __init__ for write operations
    role = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),  # Default queryset, refined in __init__ for write operations
        required=False,
        allow_null=True
    )
    role_name = serializers.CharField(source='role.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)  # Alias for frontend compatibility
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Now refine the queryset for write operations only
        if 'role' not in self.fields:
            return
        
        # Check if this is a write operation (has data in kwargs or first arg is dict)
        has_data = 'data' in kwargs or (args and len(args) > 0 and isinstance(args[0], dict))
        
        # Only modify queryset for write operations
        # For read operations, the default queryset is fine
        if not has_data:
            # This is a read operation - default queryset is sufficient
            return
        
        try:
            if self.instance:
                # For updates, filter by employee's organization
                if hasattr(self.instance, 'organization') and self.instance.organization:
                    self.fields['role'].queryset = Role.objects.filter(
                        organization=self.instance.organization
                    )
            else:
                # For creates, try to get organization from context
                organization = None
                try:
                    if hasattr(self, 'context') and self.context and isinstance(self.context, dict) and 'request' in self.context:
                        request = self.context.get('request')
                        if request and hasattr(request, 'user'):
                            # Try to get organization from request user's active profile
                            if hasattr(request.user, 'current_organization') and request.user.current_organization:
                                organization = request.user.current_organization
                            elif hasattr(request.user, 'active_profile') and request.user.active_profile:
                                organization = request.user.active_profile.organization
                except (AttributeError, KeyError, TypeError):
                    # If any error occurs accessing context, just use fallback
                    pass
                
                if organization:
                    self.fields['role'].queryset = Role.objects.filter(organization=organization)
        except Exception as e:
            # If anything goes wrong, log it but don't break
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error setting role queryset in EmployeeSerializer: {str(e)}")
            # Keep default queryset
    
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
        
        # Validate organization change - prevent if user is already employee of another org
        new_organization = validated_data.get('organization')
        if new_organization and new_organization != instance.organization and instance.user:
            # Check if user is already an employee of a different organization
            existing_employee = Employee.objects.filter(
                user=instance.user,
                status='active'
            ).exclude(id=instance.id).exclude(organization=new_organization).first()
            
            if existing_employee:
                raise serializers.ValidationError({
                    'organization': f"This user is already an employee of {existing_employee.organization.name}. An employee cannot belong to multiple organizations."
                })
        
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
        
        # Validate that user is not already an employee of another organization
        user_id = self.initial_data.get('user_id')
        organization = attrs.get('organization')
        
        if user_id and organization:
            # Check if user is already an employee of a different organization
            existing_employee = Employee.objects.filter(
                user_id=user_id,
                status='active'
            ).exclude(organization=organization).first()
            
            if existing_employee:
                raise serializers.ValidationError({
                    'user_id': f"This user is already an employee of {existing_employee.organization.name}. An employee cannot belong to multiple organizations."
                })
        
        return attrs
    
    def create(self, validated_data):
        """
        Create employee. UserProfile is NOT auto-created.
        UserProfile should only be created when a vendor explicitly assigns
        an employee through the proper workflow (e.g., via invite/assignment endpoint).
        """
        user_id = validated_data.pop('user_id', None)
        manager_id = validated_data.pop('manager_id', None)
        role_id = validated_data.pop('role_id', None)
        
        employee = Employee(**validated_data)
        
        if user_id:
            from crmApp.models import User
            employee.user = User.objects.get(id=user_id)
            
            # Validate user is not already an active employee elsewhere
            existing_active = Employee.objects.filter(
                user_id=user_id,
                status='active'
            ).first()
            
            if existing_active:
                raise serializers.ValidationError({
                    'user_id': f"This user is already an active employee of {existing_active.organization.name}. "
                               "An employee cannot belong to multiple organizations."
                })
        
        if manager_id:
            employee.manager = Employee.objects.get(id=manager_id)
        
        if role_id:
            from crmApp.models import Role
            employee.role = Role.objects.get(id=role_id)
        
        employee.save()
        
        # Note: UserProfile is NOT auto-created here. It should be created explicitly
        # when the vendor assigns the employee through the proper assignment workflow.
        # This ensures employees don't have profiles until explicitly assigned.
        
        return employee
