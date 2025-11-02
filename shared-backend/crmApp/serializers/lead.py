"""
Lead related serializers
"""

from rest_framework import serializers
from crmApp.models import Lead, Customer
from .employee import EmployeeListSerializer


class LeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for lead lists"""
    assigned_to_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id', 'code', 'name', 'email', 'phone', 'company',
            'job_title', 'status', 'source', 'qualification_status',
            'lead_score', 'estimated_value', 'assigned_to_name',
            'is_converted', 'created_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None


class LeadSerializer(serializers.ModelSerializer):
    """Full lead serializer"""
    assigned_to = EmployeeListSerializer(read_only=True)
    converted_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id', 'organization', 'code', 'name', 'company',
            'job_title', 'email', 'phone', 'status', 'source',
            'qualification_status', 'assigned_to', 'lead_score',
            'estimated_value', 'is_converted', 'converted_at',
            'converted_by', 'converted_by_name', 'tags', 'notes',
            'campaign', 'referrer', 'address', 'city', 'state',
            'zip_code', 'country', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'converted_at']
    
    def get_converted_by_name(self, obj):
        if obj.converted_by:
            return obj.converted_by.full_name
        return None


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Lead
        fields = [
            'organization', 'name', 'company', 'job_title',
            'email', 'phone', 'source', 'qualification_status',
            'assigned_to_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'zip_code', 'country'
        ]


class LeadUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Lead
        fields = [
            'name', 'company', 'job_title', 'email', 'phone',
            'status', 'source', 'qualification_status',
            'assigned_to_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'zip_code', 'country'
        ]


class ConvertLeadSerializer(serializers.Serializer):
    """Serializer for converting lead to customer"""
    customer_type = serializers.ChoiceField(
        choices=['individual', 'business'],
        default='business'
    )
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, attrs):
        lead = self.context['lead']
        if lead.is_converted:
            raise serializers.ValidationError("Lead has already been converted.")
        return attrs
    
    def save(self):
        lead = self.context['lead']
        validated_data = self.validated_data
        
        # Create customer from lead
        customer = Customer.objects.create(
            organization=lead.organization,
            name=lead.name,
            company_name=lead.company,
            email=lead.email,
            phone=lead.phone,
            customer_type=validated_data.get('customer_type', 'business'),
            status='active',
            assigned_to_id=validated_data.get('assigned_to_id'),
            source=lead.source,
            address=lead.address,
            city=lead.city,
            state=lead.state,
            zip_code=lead.zip_code,
            country=lead.country,
            notes=lead.notes,
            converted_from_lead=lead,
        )
        
        # Update lead
        lead.is_converted = True
        lead.converted_by = self.context['request'].user.employee_profiles.filter(
            organization=lead.organization
        ).first()
        lead.save()
        
        return customer
