"""
Vendor related serializers
"""

from rest_framework import serializers
from crmApp.models import Vendor


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vendor lists"""
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'code', 'name', 'email', 'phone',
            'vendor_type', 'status'
        ]


class VendorSerializer(serializers.ModelSerializer):
    """Full vendor serializer"""
    
    class Meta:
        model = Vendor
        fields = [
            'id', 'organization', 'code', 'name',
            'contact_person', 'email', 'phone', 'website',
            'vendor_type', 'status', 'payment_terms', 'tax_id',
            'credit_limit', 'address', 'city', 'state',
            'zip_code', 'country', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']


class VendorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vendors"""
    
    class Meta:
        model = Vendor
        fields = [
            'organization', 'name', 'contact_person', 'email',
            'phone', 'website', 'vendor_type', 'status',
            'payment_terms', 'tax_id', 'credit_limit',
            'address', 'city', 'state', 'zip_code', 'country', 'notes'
        ]
