"""
Issue related serializers
"""

from rest_framework import serializers
from crmApp.models import Issue
from .vendor import VendorListSerializer
from .employee import EmployeeListSerializer


class IssueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for issue lists"""
    vendor_name = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'code', 'issue_number', 'title', 'description',
            'vendor', 'vendor_name', 'order', 'order_number',
            'priority', 'priority_display', 'category', 'category_display',
            'status', 'status_display', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'resolved_at'
        ]
    
    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None
    
    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else None
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None


class IssueSerializer(serializers.ModelSerializer):
    """Full issue serializer"""
    from crmApp.models import Vendor, Order, Employee
    
    vendor = VendorListSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.none(),
        source='vendor',
        write_only=True,
        required=False,
        allow_null=True
    )
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.none(),
        source='order',
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
    resolved_by = EmployeeListSerializer(read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'organization', 'code', 'issue_number',
            'title', 'description',
            'vendor', 'vendor_id', 'order', 'order_id',
            'priority', 'priority_display',
            'category', 'category_display',
            'status', 'status_display',
            'assigned_to', 'assigned_to_id',
            'resolved_at', 'resolved_by', 'resolution_notes',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'issue_number', 'organization', 'created_by', 'created_at', 'updated_at', 'resolved_by']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from crmApp.models import Vendor, Order, Employee
            organization = getattr(request.user, 'current_organization', None)
            if organization:
                self.fields['vendor_id'].queryset = Vendor.objects.filter(organization=organization)
                self.fields['order_id'].queryset = Order.objects.filter(organization=organization)
                self.fields['assigned_to_id'].queryset = Employee.objects.filter(organization=organization)


class IssueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating issues"""
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'vendor', 'order',
            'priority', 'category', 'status', 'assigned_to'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organization'] = getattr(request.user, 'current_organization')
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class IssueUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating issues"""
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'vendor', 'order',
            'priority', 'category', 'status', 'assigned_to',
            'resolution_notes'
        ]
