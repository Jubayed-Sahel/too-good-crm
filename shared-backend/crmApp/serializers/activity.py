"""
Activity related serializers
"""

from rest_framework import serializers
from crmApp.models import Activity
from .customer import CustomerListSerializer
from .lead import LeadListSerializer
from .deal import DealListSerializer
from .employee import EmployeeListSerializer


class ActivityListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for activity lists"""
    customer_name = serializers.CharField(read_only=True)
    lead_name = serializers.SerializerMethodField()
    deal_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'activity_type', 'activity_type_display',
            'title', 'customer', 'customer_name',
            'lead', 'lead_name', 'deal', 'deal_name',
            'assigned_to', 'assigned_to_name',
            'status', 'status_display',
            'scheduled_at', 'completed_at', 'created_at'
        ]
    
    def get_lead_name(self, obj):
        return obj.lead.name if obj.lead else None
    
    def get_deal_name(self, obj):
        return obj.deal.deal_name if obj.deal else None
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
        return None


class ActivitySerializer(serializers.ModelSerializer):
    """Full activity serializer"""
    from crmApp.models import Customer, Lead, Deal, Employee
    
    customer = CustomerListSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.none(),
        source='customer',
        write_only=True,
        required=False,
        allow_null=True
    )
    lead = LeadListSerializer(read_only=True)
    lead_id = serializers.PrimaryKeyRelatedField(
        queryset=Lead.objects.none(),
        source='lead',
        write_only=True,
        required=False,
        allow_null=True
    )
    deal = DealListSerializer(read_only=True)
    deal_id = serializers.PrimaryKeyRelatedField(
        queryset=Deal.objects.none(),
        source='deal',
        write_only=True,
        required=False,
        allow_null=True
    )
    assigned_to = EmployeeListSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.none(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'organization', 'activity_type', 'activity_type_display',
            'title', 'description',
            'customer', 'customer_id', 'customer_name',
            'lead', 'lead_id', 'deal', 'deal_id',
            'assigned_to', 'assigned_to_id',
            'status', 'status_display',
            'scheduled_at', 'completed_at', 'duration_minutes',
            # Call fields
            'phone_number', 'call_duration', 'call_recording_url',
            # Email fields
            'email_subject', 'email_body', 'email_attachments',
            # Telegram fields
            'telegram_username', 'telegram_chat_id',
            # Meeting fields
            'meeting_location', 'meeting_url', 'attendees',
            # Task fields
            'task_priority', 'task_due_date',
            # Note fields
            'is_pinned',
            # Metadata
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organization', 'customer_name', 'created_by', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from crmApp.models import Customer, Lead, Deal, Employee
            # Get first active organization for the user
            user_org = request.user.user_organizations.filter(is_active=True).first()
            if user_org:
                organization = user_org.organization
                self.fields['customer_id'].queryset = Customer.objects.filter(organization=organization)
                self.fields['lead_id'].queryset = Lead.objects.filter(organization=organization)
                self.fields['deal_id'].queryset = Deal.objects.filter(organization=organization)
                self.fields['assigned_to_id'].queryset = Employee.objects.filter(organization=organization)


class ActivityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating activities"""
    
    class Meta:
        model = Activity
        fields = [
            'activity_type', 'title', 'description',
            'customer', 'lead', 'deal', 'assigned_to',
            'status', 'scheduled_at', 'duration_minutes',
            # Call fields
            'phone_number', 'call_duration', 'call_recording_url',
            # Email fields
            'email_subject', 'email_body', 'email_attachments',
            # Telegram fields
            'telegram_username', 'telegram_chat_id',
            # Meeting fields
            'meeting_location', 'meeting_url', 'attendees',
            # Task fields
            'task_priority', 'task_due_date',
            # Note fields
            'is_pinned'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # Get the first active organization for the user
            user_org = request.user.user_organizations.filter(is_active=True).first()
            if user_org:
                validated_data['organization'] = user_org.organization
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class ActivityUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating activities"""
    
    class Meta:
        model = Activity
        fields = [
            'activity_type', 'title', 'description',
            'customer', 'lead', 'deal', 'assigned_to',
            'status', 'scheduled_at', 'completed_at', 'duration_minutes',
            # Call fields
            'phone_number', 'call_duration', 'call_recording_url',
            # Email fields
            'email_subject', 'email_body', 'email_attachments',
            # Telegram fields
            'telegram_username', 'telegram_chat_id',
            # Meeting fields
            'meeting_location', 'meeting_url', 'attendees',
            # Task fields
            'task_priority', 'task_due_date',
            # Note fields
            'is_pinned'
        ]
