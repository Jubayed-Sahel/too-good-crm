"""
Customer related serializers
"""

from rest_framework import serializers
from crmApp.models import Customer, CustomerOrganization, UserProfile
from .employee import EmployeeListSerializer
from .auth import UserSerializer, UserProfileSerializer


class CustomerOrganizationSerializer(serializers.ModelSerializer):
    """Serializer for customer-organization relationships"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomerOrganization
        fields = [
            'id', 'customer', 'customer_name', 'organization', 'organization_name',
            'relationship_status', 'assigned_employee', 'assigned_employee_name',
            'vendor_notes', 'vendor_customer_code', 'credit_limit', 'payment_terms',
            'relationship_started', 'last_interaction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'relationship_started', 'created_at', 'updated_at']
    
    def get_assigned_employee_name(self, obj):
        if obj.assigned_employee:
            return f"{obj.assigned_employee.first_name} {obj.assigned_employee.last_name}"
        return None


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
        """Calculate total value from won deals linked to customer or converted lead"""
        from django.db.models import Sum, Q
        from crmApp.models import Deal
        
        # Build query to find all won deals for this customer
        # Deals can be linked directly to customer OR to the lead that was converted to this customer
        query = Q(is_won=True)
        
        # Add customer filter
        customer_filter = Q(customer=obj)
        
        # Add lead filter if customer was converted from a lead
        if obj.converted_from_lead:
            lead_filter = Q(lead=obj.converted_from_lead)
            query = query & (customer_filter | lead_filter)
        else:
            query = query & customer_filter
        
        # Sum values from all matching deals
        total = Deal.objects.filter(query).aggregate(total=Sum('value'))['total']
        deal_total = float(total) if total else 0.0
        
        # If no deals found and customer was converted from a lead, use lead's estimated_value
        if deal_total == 0.0 and obj.converted_from_lead and obj.converted_from_lead.estimated_value:
            return float(obj.converted_from_lead.estimated_value)
        
        return deal_total


class CustomerSerializer(serializers.ModelSerializer):
    """Full customer serializer"""
    user = UserSerializer(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    assigned_to = EmployeeListSerializer(read_only=True)
    converted_from_lead = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    customer_type_display = serializers.CharField(source='get_customer_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)  # Alias for frontend compatibility
    organization = serializers.IntegerField(source='organization_id', read_only=True)  # Primary organization (backward compatibility)
    vendor_organizations = CustomerOrganizationSerializer(source='customer_organizations', many=True, read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'organization', 'vendor_organizations', 'user', 'user_profile', 'code',
            'name', 'first_name', 'last_name', 'full_name',
            'company_name', 'contact_person', 'email', 'phone',
            'website', 'customer_type', 'customer_type_display',
            'status', 'status_display', 'industry', 'rating',
            'assigned_to', 'payment_terms', 'credit_limit',
            'tax_id', 'address', 'city', 'state', 'postal_code', 'zip_code',
            'country', 'source', 'tags', 'notes',
            'converted_from_lead', 'converted_at',
            'total_value', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'user_profile', 'created_at', 'updated_at', 'converted_at']
        extra_kwargs = {
            'email': {'required': False},  # Allow email to be optional for updates
            'organization': {'read_only': True},  # Organization is read-only via explicit field definition
        }
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_total_value(self, obj):
        """Calculate total value from won deals linked to customer or converted lead"""
        from django.db.models import Sum, Q
        from crmApp.models import Deal
        
        # Build query to find all won deals for this customer
        # Deals can be linked directly to customer OR to the lead that was converted to this customer
        query = Q(is_won=True)
        
        # Add customer filter
        customer_filter = Q(customer=obj)
        
        # Add lead filter if customer was converted from a lead
        if obj.converted_from_lead:
            lead_filter = Q(lead=obj.converted_from_lead)
            query = query & (customer_filter | lead_filter)
        else:
            query = query & customer_filter
        
        # Sum values from all matching deals
        total = Deal.objects.filter(query).aggregate(total=Sum('value'))['total']
        deal_total = float(total) if total else 0.0
        
        # If no deals found and customer was converted from a lead, use lead's estimated_value
        if deal_total == 0.0 and obj.converted_from_lead and obj.converted_from_lead.estimated_value:
            return float(obj.converted_from_lead.estimated_value)
        
        return deal_total
    
    def get_converted_from_lead(self, obj):
        if obj.converted_from_lead:
            lead = obj.converted_from_lead
            # Lead model uses 'name' field, not 'first_name' and 'last_name'
            lead_name = lead.name or 'Unknown Lead'
            return {
                'id': lead.id,
                'name': lead_name
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
        """
        Validate email format and handle multi-vendor scenarios.
        
        Note: Email is NOT unique per organization to support multi-vendor.
        The same customer email can exist across multiple vendor organizations
        through the CustomerOrganization junction table.
        """
        if not value:
            return value
        
        # Just validate format and normalize - uniqueness handled in perform_create
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
