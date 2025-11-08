from rest_framework import serializers
from crmApp.models import Call, Customer, User


class CallSerializer(serializers.ModelSerializer):
    """Serializer for Call model."""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    initiated_by_name = serializers.SerializerMethodField()
    duration_formatted = serializers.CharField(read_only=True)
    
    class Meta:
        model = Call
        fields = [
            'id',
            'call_sid',
            'from_number',
            'to_number',
            'direction',
            'status',
            'start_time',
            'end_time',
            'duration',
            'duration_formatted',
            'recording_url',
            'notes',
            'error_message',
            'organization',
            'customer',
            'customer_name',
            'initiated_by',
            'initiated_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'call_sid',
            'start_time',
            'end_time',
            'duration',
            'duration_formatted',
            'recording_url',
            'error_message',
            'organization',
            'created_at',
            'updated_at',
        ]
    
    def get_initiated_by_name(self, obj):
        """Get the name of the user who initiated the call."""
        if obj.initiated_by:
            if obj.initiated_by.first_name or obj.initiated_by.last_name:
                return f"{obj.initiated_by.first_name} {obj.initiated_by.last_name}".strip()
            return obj.initiated_by.username
        return None


class InitiateCallSerializer(serializers.Serializer):
    """Serializer for initiating a call."""
    
    customer_id = serializers.IntegerField(required=True)
    
    def validate_customer_id(self, value):
        """Validate that the customer exists and has a phone number."""
        try:
            customer = Customer.objects.get(id=value)
        except Customer.DoesNotExist:
            raise serializers.ValidationError("Customer not found.")
        
        if not customer.phone:
            raise serializers.ValidationError("Customer does not have a phone number.")
        
        return value
