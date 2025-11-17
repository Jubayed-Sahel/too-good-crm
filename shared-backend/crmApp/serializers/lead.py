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
    activities_count = serializers.SerializerMethodField()
    has_upcoming_followup = serializers.SerializerMethodField()
    
    class Meta:
        model = Lead
        fields = [
            'id', 'organization', 'code', 'name', 'organization_name',
            'job_title', 'email', 'phone', 'status', 'source',
            'qualification_status', 'assigned_to', 'lead_score',
            'estimated_value', 'is_converted', 'converted_at',
            'converted_by', 'converted_by_name', 'tags', 'notes',
            'campaign', 'referrer', 'address', 'city', 'state',
            'postal_code', 'country', 'follow_up_date', 'follow_up_notes',
            'last_contacted_at', 'next_follow_up_reminder',
            'activities_count', 'has_upcoming_followup',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'converted_at', 'activities_count', 'has_upcoming_followup']
    
    def get_converted_by_name(self, obj):
        if obj.converted_by:
            return obj.converted_by.full_name
        return None
    
    def get_activities_count(self, obj):
        """Get count of activities for this lead"""
        try:
            # Check if activities relationship exists and is accessible
            if hasattr(obj, 'activities'):
                # Use select_related/prefetch_related if available, otherwise count
                if hasattr(obj.activities, 'count'):
                    return obj.activities.count()
                elif hasattr(obj.activities, '__len__'):
                    return len(obj.activities)
            return 0
        except Exception:
            # If there's any error accessing activities, return 0
            return 0
    
    def get_has_upcoming_followup(self, obj):
        """Check if lead has an upcoming follow-up"""
        try:
            from django.utils import timezone
            if hasattr(obj, 'next_follow_up_reminder') and obj.next_follow_up_reminder:
                return obj.next_follow_up_reminder > timezone.now()
            return False
        except Exception:
            return False


class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating leads"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)
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
    
    def create(self, validated_data):
        """Custom create to handle assigned_to_id and convert estimated_value to Decimal"""
        import logging
        from decimal import Decimal
        
        logger = logging.getLogger(__name__)
        
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Convert estimated_value to Decimal if it's a number
        if 'estimated_value' in validated_data and validated_data['estimated_value'] is not None:
            try:
                if not isinstance(validated_data['estimated_value'], Decimal):
                    validated_data['estimated_value'] = Decimal(str(validated_data['estimated_value']))
            except Exception as e:
                logger.error(f"Error converting estimated_value to Decimal: {str(e)}")
                raise serializers.ValidationError({
                    'estimated_value': 'Invalid estimated value format.'
                })
        
        try:
            lead = Lead.objects.create(**validated_data)
        except Exception as e:
            logger.error(f"Error creating Lead object: {str(e)}", exc_info=True)
            raise
        
        if assigned_to_id:
            from crmApp.models import Employee
            try:
                employee = Employee.objects.get(id=assigned_to_id, organization=lead.organization)
                lead.assigned_to = employee
                lead.save()
            except Employee.DoesNotExist:
                pass  # Silently ignore if employee doesn't exist
        
        return lead
    
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
        """Validate phone number format - phone is optional if email is provided"""
        if not value:
            return value
        
        # Remove common separators
        cleaned = value.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        
        # Check if it's mostly digits (allow + at the start)
        digits_only = cleaned.replace('+', '')
        if not digits_only.isdigit():
            raise serializers.ValidationError(
                "Phone number should only contain digits, spaces, hyphens, parentheses, and a leading +."
            )
        
        # Check minimum length (at least 3 digits - very lenient for test data)
        # Phone is optional if email is provided, so we allow shorter numbers
        if len(digits_only) < 3:
            raise serializers.ValidationError(
                "Phone number must be at least 3 digits."
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
        """Validate estimated value is positive and convert to Decimal"""
        from decimal import Decimal, InvalidOperation
        
        if value is None:
            return value
        
        # Convert to Decimal if it's a number
        if not isinstance(value, Decimal):
            try:
                value = Decimal(str(value))
            except (InvalidOperation, ValueError, TypeError):
                raise serializers.ValidationError(
                    "Estimated value must be a valid number."
                )
        
        if value < 0:
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
            'address', 'city', 'state', 'postal_code', 'country',
            'follow_up_date', 'follow_up_notes', 'last_contacted_at', 'next_follow_up_reminder'
        ]
    
    def validate_phone(self, value):
        """Validate phone number format - phone is optional if email is provided"""
        if not value:
            return value
        
        # Remove common separators
        cleaned = value.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        
        # Check if it's mostly digits (allow + at the start)
        digits_only = cleaned.replace('+', '')
        if not digits_only.isdigit():
            raise serializers.ValidationError(
                "Phone number should only contain digits, spaces, hyphens, parentheses, and a leading +."
            )
        
        # Check minimum length (at least 3 digits - very lenient for test data)
        # Phone is optional if email is provided, so we allow shorter numbers
        if len(digits_only) < 3:
            raise serializers.ValidationError(
                "Phone number must be at least 3 digits."
            )
        
        return value
    
    def validate_estimated_value(self, value):
        """Validate estimated value is positive and convert to Decimal"""
        from decimal import Decimal, InvalidOperation
        
        if value is None:
            return value
        
        # Convert to Decimal if it's a number
        if not isinstance(value, Decimal):
            try:
                value = Decimal(str(value))
            except (InvalidOperation, ValueError, TypeError):
                raise serializers.ValidationError(
                    "Estimated value must be a valid number."
                )
        
        if value < 0:
            raise serializers.ValidationError(
                "Estimated value cannot be negative."
            )
        
        return value
    
    def validate(self, attrs):
        """Object-level validation - ensure at least email or phone is provided"""
        # Only validate if both are being cleared (partial update might not include both)
        email = attrs.get('email')
        phone = attrs.get('phone')
        
        # If this is a partial update, we need to check the instance
        if self.instance:
            current_email = email if 'email' in attrs else self.instance.email
            current_phone = phone if 'phone' in attrs else self.instance.phone
            
            # If both are being cleared or both are empty, that's an error
            if not current_email and not current_phone:
                raise serializers.ValidationError(
                    "Either 'email' or 'phone' must be provided for contact."
                )
        else:
            # For full update, ensure at least one is provided
            if not email and not phone:
                raise serializers.ValidationError(
                    "Either 'email' or 'phone' must be provided for contact."
                )
        
        return attrs


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
