"""
Customer related serializers
"""

from rest_framework import serializers
from crmApp.models import Customer
from .employee import EmployeeListSerializer


class CustomerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for customer lists"""
    assigned_to_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'code', 'name', 'email', 'phone',
            'customer_type', 'status', 'assigned_to_name'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None


class CustomerSerializer(serializers.ModelSerializer):
    """Full customer serializer"""
    assigned_to = EmployeeListSerializer(read_only=True)
    converted_from_lead = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'organization', 'code', 'name',
            'company_name', 'contact_person', 'email', 'phone',
            'website', 'customer_type', 'status', 'industry',
            'assigned_to', 'payment_terms', 'credit_limit',
            'tax_id', 'address', 'city', 'state', 'zip_code',
            'country', 'source', 'tags', 'notes',
            'converted_from_lead', 'converted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'converted_at']
    
    def get_converted_from_lead(self, obj):
        if obj.converted_from_lead:
            return {
                'id': obj.converted_from_lead.id,
                'name': obj.converted_from_lead.name
            }
        return None


class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating customers"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Customer
        fields = [
            'organization', 'name', 'company_name', 'contact_person',
            'email', 'phone', 'website', 'customer_type', 'status',
            'industry', 'assigned_to_id', 'payment_terms',
            'credit_limit', 'tax_id', 'address', 'city', 'state',
            'zip_code', 'country', 'source', 'tags', 'notes'
        ]
