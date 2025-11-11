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
            'id', 'code', 'name', 'email', 'phone', 'organization_name',
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
            'id', 'organization', 'code', 'name', 'organization_name',
            'job_title', 'email', 'phone', 'status', 'source',
            'qualification_status', 'assigned_to', 'lead_score',
            'estimated_value', 'is_converted', 'converted_at',
            'converted_by', 'converted_by_name', 'tags', 'notes',
            'campaign', 'referrer', 'address', 'city', 'state',
            'postal_code', 'country', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'converted_at']
    
    def get_converted_by_name(self, obj):
        if obj.converted_by:
            return obj.converted_by.full_name
        return None


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)
    
    class Meta:
        model = Lead
        fields = [
            'organization', 'name', 'organization_name', 'job_title',
            'email', 'phone', 'source', 'qualification_status',
            'assigned_to_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'postal_code', 'zip_code', 'country'
        ]
    
    def validate_email(self, value):
        """Validate email format and uniqueness within organization"""
        if not value:
            return value
        
        organization = self.initial_data.get('organization')
        if organization:
            # Check if lead with this email exists in the organization
            if Lead.objects.filter(
                organization_id=organization,
                email__iexact=value,
                is_converted=False  # Only check unconverted leads
            ).exists():
                raise serializers.ValidationError(
                    "A lead with this email already exists in your organization."
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
    
    def validate_lead_score(self, value):
        """Validate lead score is between 0 and 100"""
        if value is not None:
            if value < 0 or value > 100:
                raise serializers.ValidationError(
                    "Lead score must be between 0 and 100."
                )
        return value
    
    def validate_estimated_value(self, value):
        """Validate estimated value is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Estimated value cannot be negative."
            )
        return value
    
    def validate(self, attrs):
        """Object-level validation"""
        # Ensure at least name or organization_name is provided
        if not attrs.get('name') and not attrs.get('organization_name'):
            raise serializers.ValidationError(
                "Either 'name' or 'organization_name' must be provided."
            )
        
        # Ensure at least email or phone is provided
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError(
                "Either 'email' or 'phone' must be provided for contact."
            )
        
        return attrs


class LeadUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Lead
        fields = [
            'name', 'organization_name', 'job_title', 'email', 'phone',
            'status', 'source', 'qualification_status',
            'assigned_to_id', 'lead_score', 'estimated_value',
            'tags', 'notes', 'campaign', 'referrer',
            'address', 'city', 'state', 'postal_code', 'country'
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
            company_name=lead.organization_name,
            email=lead.email,
            phone=lead.phone,
            customer_type=validated_data.get('customer_type', 'business'),
            status='active',
            assigned_to_id=validated_data.get('assigned_to_id'),
            source=lead.source,
            address=lead.address,
            city=lead.city,
            state=lead.state,
            postal_code=lead.postal_code,
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
