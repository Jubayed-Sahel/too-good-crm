"""
Serializers for Audit Log
"""
from rest_framework import serializers
from crmApp.models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit log entries."""
    
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    
    # Related entity names for display
    customer_name = serializers.SerializerMethodField()
    lead_name = serializers.SerializerMethodField()
    deal_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'created_at',
            'updated_at',
            'organization',
            'user',
            'user_email',
            'user_profile_type',
            'action',
            'action_display',
            'resource_type',
            'resource_type_display',
            'resource_id',
            'resource_name',
            'description',
            'changes',
            'ip_address',
            'user_agent',
            'request_path',
            'request_method',
            'related_customer',
            'related_lead',
            'related_deal',
            'customer_name',
            'lead_name',
            'deal_name',
        ]
        read_only_fields = fields  # All fields are read-only
    
    def get_customer_name(self, obj):
        """Get customer name if related."""
        return obj.related_customer.name if obj.related_customer else None
    
    def get_lead_name(self, obj):
        """Get lead name if related."""
        return obj.related_lead.name if obj.related_lead else None
    
    def get_deal_name(self, obj):
        """Get deal title if related."""
        return obj.related_deal.title if obj.related_deal else None


class AuditLogListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list view."""
    
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'created_at',
            'user_email',
            'user_profile_type',
            'action',
            'action_display',
            'resource_type',
            'resource_type_display',
            'resource_id',
            'resource_name',
            'description',
        ]
        read_only_fields = fields

