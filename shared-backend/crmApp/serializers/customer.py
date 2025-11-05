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
    
    class Meta:
        model = Customer
        fields = [
            'id', 'code', 'name', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'company', 'job_title',
            'customer_type', 'status', 'assigned_to', 'assigned_to_name',
            'total_value', 'address', 'city', 'state', 'country', 'postal_code',
            'notes', 'website', 'created_at', 'updated_at', 'created_by'
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
    
    class Meta:
        model = Customer
        fields = [
            'id', 'organization', 'user', 'user_profile', 'code',
            'name', 'first_name', 'last_name', 'full_name',
            'company_name', 'contact_person', 'email', 'phone',
            'website', 'customer_type', 'customer_type_display',
            'status', 'status_display', 'industry', 'rating',
            'assigned_to', 'payment_terms', 'credit_limit',
            'tax_id', 'address', 'city', 'state', 'postal_code',
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
    
    class Meta:
        model = Customer
        fields = [
            'organization', 'user_id', 'name', 'first_name', 'last_name',
            'company_name', 'contact_person', 'email', 'phone', 'website',
            'customer_type', 'status', 'industry', 'rating',
            'assigned_to_id', 'payment_terms', 'credit_limit', 'tax_id',
            'address', 'city', 'state', 'postal_code', 'country',
            'source', 'tags', 'notes'
        ]
    
    def create(self, validated_data):
        """Create customer and auto-create user profile if user is linked"""
        user_id = validated_data.pop('user_id', None)
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        customer = Customer(**validated_data)
        
        if user_id:
            from crmApp.models import User
            customer.user = User.objects.get(id=user_id)
        
        if assigned_to_id:
            from crmApp.models import Employee
            customer.assigned_to = Employee.objects.get(id=assigned_to_id)
        
        customer.save()  # This will auto-create UserProfile
        return customer
