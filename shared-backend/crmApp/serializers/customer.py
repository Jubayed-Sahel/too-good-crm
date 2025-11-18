"""
Customer related serializers
"""

from rest_framework import serializers
from crmApp.models import Customer, UserProfile
from .employee import EmployeeListSerializer
from .auth import UserSerializer, UserProfileSerializer


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for customer lists"""
    assigned_to_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    organization = serializers.CharField(source='company_name', read_only=True)  # Alias for frontend compatibility
    zip_code = serializers.CharField(source='postal_code', read_only=True)  # Alias for frontend compatibility
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)  # For Jitsi calls
    
    class Meta:
        model = Customer
        fields = [
            'id', 'code', 'name', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'organization', 'company_name',
            'customer_type', 'status', 'assigned_to', 'assigned_to_name',
            'total_value', 'address', 'city', 'state', 'country', 'postal_code', 'zip_code',
            'notes', 'website', 'user_id', 'created_at', 'updated_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None
    
    def get_full_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.name
    
    def get_total_value(self, obj):
        """Calculate total value from related deals"""
        from crmApp.models import Deal
        total = Deal.objects.filter(
            customer=obj,
            is_won=True
        ).aggregate(total=serializers.models.Sum('value'))['total']
        return float(total) if total else 0.0


class CustomerSerializer(serializers.ModelSerializer):
    """Full customer serializer"""
    user = UserSerializer(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    assigned_to = EmployeeListSerializer(read_only=True)
    converted_from_lead = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)  # Alias for frontend compatibility
    
    class Meta:
        model = Customer
        fields = [
            'id', 'organization', 'user', 'user_profile', 'code',
            'name', 'first_name', 'last_name', 'full_name',
            'company_name', 'contact_person', 'email', 'phone',
            'website', 'customer_type', 'customer_type_display',
            'status', 'status_display', 'industry', 'rating',
            'assigned_to', 'payment_terms', 'credit_limit',
            'tax_id', 'address', 'city', 'state', 'postal_code', 'zip_code',
            'country', 'source', 'tags', 'notes',
            'converted_from_lead', 'converted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'user_profile', 'created_at', 'updated_at', 'converted_at']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_converted_from_lead(self, obj):
        if obj.converted_from_lead:
            return {
                'id': obj.converted_from_lead.id,
                'name': f"{obj.converted_from_lead.first_name} {obj.converted_from_lead.last_name}".strip()
            }
        return None


class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating customers"""
    user_id = serializers.IntegerField(required=False, allow_null=True)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)  # Alias for frontend compatibility
    organization = serializers.IntegerField(required=False, write_only=True)  # Accept but don't require organization from frontend
    
    class Meta:
        model = Customer
        fields = [
            'organization', 'user_id', 'name', 'first_name', 'last_name',
            'company_name', 'contact_person', 'email', 'phone', 'website',
            'customer_type', 'status', 'industry', 'rating',
            'assigned_to_id', 'payment_terms', 'credit_limit', 'tax_id',
            'address', 'city', 'state', 'postal_code', 'zip_code', 'country',
            'source', 'tags', 'notes'
        ]
    
    def validate_email(self, value):
        """Validate email is unique within organization"""
        if not value:
            return value
        
        # Try to get organization from multiple sources
        organization = self.initial_data.get('organization')
        
        # If organization is not in initial_data, try to get from context
        if not organization:
            request = self.context.get('request')
            if request and hasattr(request.user, 'current_organization') and request.user.current_organization:
                organization = request.user.current_organization.id
        
        if organization:
            # Check if email exists for this organization
            if Customer.objects.filter(
                organization_id=organization,
                email__iexact=value
            ).exists():
                raise serializers.ValidationError(
                    "A customer with this email already exists in your organization."
                )
        return value.lower() if value else value
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if not value:
            return value
        
        # Remove common separators
        cleaned = value.replace('-', '').replace(' ', '').replace('(', '').replace(')', '').replace('.', '')
        
        # Check if it's mostly digits (allow + at start for country codes)
        if cleaned.startswith('+'):
            if not cleaned[1:].isdigit():
                raise serializers.ValidationError(
                    "Phone number should only contain digits, spaces, hyphens, parentheses, and a leading plus sign."
                )
        elif not cleaned.isdigit():
            raise serializers.ValidationError(
                "Phone number should only contain digits, spaces, hyphens, and parentheses."
            )
        
        # Check minimum length (allow shorter for extensions or special formats)
        digits_only = cleaned.replace('+', '')
        if len(digits_only) < 7:
            raise serializers.ValidationError(
                "Phone number must be at least 7 digits."
            )
        
        return value
    
    def validate_company_name(self, value):
        """Validate company name"""
        if value and len(value) < 2:
            raise serializers.ValidationError(
                "Company name must be at least 2 characters long."
            )
        return value
    
    def validate_credit_limit(self, value):
        """Validate credit limit is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Credit limit cannot be negative."
            )
        return value
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value
    
    def validate(self, attrs):
        """Object-level validation"""
        # Generate name if not provided
        name = attrs.get('name')
        first_name = attrs.get('first_name')
        last_name = attrs.get('last_name')
        company_name = attrs.get('company_name')
        customer_type = attrs.get('customer_type', 'individual')
        email = attrs.get('email')
        
        # If no name is provided, try to construct it
        if not name:
            if customer_type == 'business' and company_name:
                attrs['name'] = company_name
            elif first_name and last_name:
                attrs['name'] = f"{first_name} {last_name}".strip()
            elif first_name:
                attrs['name'] = first_name
            elif last_name:
                attrs['name'] = last_name
            elif email:
                # Use email as fallback name
                attrs['name'] = email.split('@')[0]
            else:
                attrs['name'] = 'Customer'  # Final fallback
        
        # Ensure name is set (should always be set by now)
        if not attrs.get('name'):
            raise serializers.ValidationError({
                'name': "Customer name is required. Please provide a name, first/last name, or company name."
            })
        
        # If customer_type is business, ensure company_name is set
        if customer_type == 'business' and not company_name and not attrs.get('company_name'):
            # Use name as company_name if not provided
            attrs['company_name'] = attrs.get('name')
        
        return attrs
    
    def create(self, validated_data):
        """Create customer and auto-create user profile if user is linked"""
        user_id = validated_data.pop('user_id', None)
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        customer = Customer(**validated_data)
        
        # If user_id is provided, use it
        if user_id:
            from crmApp.models import User
            customer.user = User.objects.get(id=user_id)
        # Otherwise, try to auto-link based on email
        elif validated_data.get('email'):
            from crmApp.models import User
            try:
                # Try to find a user with matching email
                matching_user = User.objects.filter(email__iexact=validated_data['email']).first()
                if matching_user:
                    customer.user = matching_user
            except Exception as e:
                # If auto-linking fails, just continue without linking
                pass
        
        if assigned_to_id:
            from crmApp.models import Employee
            customer.assigned_to = Employee.objects.get(id=assigned_to_id)
        
        customer.save()  # This will auto-create UserProfile
        return customer
