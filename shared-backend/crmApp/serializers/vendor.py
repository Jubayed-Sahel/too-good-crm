"""
Vendor related serializers
"""

from rest_framework import serializers
from crmApp.models import Vendor, UserProfile
from .auth import UserSerializer, UserProfileSerializer


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vendor lists"""
    assigned_employee_name = serializers.CharField(source='assigned_employee.full_name', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)  # For Jitsi calls
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'code', 'name', 'company_name', 'email', 'phone',
            'vendor_type', 'status', 'assigned_employee_name', 'user_id'
        ]


class VendorSerializer(serializers.ModelSerializer):
    """Full vendor serializer"""
    user = UserSerializer(read_only=True)
    user_profile = UserProfileSerializer(read_only=True)
    assigned_employee = serializers.SerializerMethodField()
    vendor_type_display = serializers.CharField(source='get_vendor_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'organization', 'user', 'user_profile', 'code',
            'name', 'company_name', 'contact_person', 'email', 'phone',
            'website', 'vendor_type', 'vendor_type_display', 'status',
            'status_display', 'payment_terms', 'tax_id', 'industry',
            'rating', 'credit_limit', 'assigned_employee',
            'address', 'city', 'state', 'zip_code', 'country', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'user_profile', 'created_at', 'updated_at']
    
    def get_assigned_employee(self, obj):
        if obj.assigned_employee:
            return {
                'id': obj.assigned_employee.id,
                'full_name': obj.assigned_employee.full_name,
                'email': obj.assigned_employee.email
            }
        return None


class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors"""
    user_id = serializers.IntegerField(required=False, allow_null=True)
    assigned_employee_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Vendor
        fields = [
            'organization', 'user_id', 'name', 'company_name',
            'contact_person', 'email', 'phone', 'website',
            'vendor_type', 'status', 'payment_terms', 'tax_id',
            'industry', 'rating', 'credit_limit', 'assigned_employee_id',
            'address', 'city', 'state', 'zip_code', 'country', 'notes'
        ]
    
    def create(self, validated_data):
        """Create vendor and auto-create user profile if user is linked"""
        user_id = validated_data.pop('user_id', None)
        assigned_employee_id = validated_data.pop('assigned_employee_id', None)
        
        vendor = Vendor(**validated_data)
        
        if user_id:
            from crmApp.models import User
            vendor.user = User.objects.get(id=user_id)
        
        if assigned_employee_id:
            from crmApp.models import Employee
            vendor.assigned_employee = Employee.objects.get(id=assigned_employee_id)
        
        vendor.save()  # This will auto-create UserProfile
        return vendor
