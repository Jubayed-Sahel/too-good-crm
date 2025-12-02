"""
Issue related serializers
"""

from rest_framework import serializers
from crmApp.models import Issue
from .vendor import VendorListSerializer
from .employee import EmployeeListSerializer


class IssueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for issue lists"""
    vendor = VendorListSerializer(read_only=True)
    assigned_to = EmployeeListSerializer(read_only=True)
    resolved_by = EmployeeListSerializer(read_only=True)
    raised_by_customer_name = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    order_number = serializers.CharField(source='order.order_number', read_only=True, allow_null=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'code', 'issue_number', 'title', 'description',
            'vendor', 'order', 'order_number',
            'priority', 'priority_display', 'category', 'category_display',
            'status', 'status_display', 'assigned_to',
            'is_client_issue', 'raised_by_customer', 'raised_by_customer_name',
            'organization', 'organization_name',
            'linear_issue_id', 'linear_issue_url', 'synced_to_linear',
            'resolved_by', 'resolved_at',
            'created_at', 'updated_at'
        ]
    
    def get_raised_by_customer_name(self, obj):
        if obj.raised_by_customer:
            return f"{obj.raised_by_customer.first_name} {obj.raised_by_customer.last_name}".strip()
        return None


class IssueSerializer(serializers.ModelSerializer):
    """Full issue serializer"""
    from crmApp.models import Vendor, Order, Employee
    from .issue_comment import IssueCommentSerializer
    
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
    raised_by_customer_name = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    comments = IssueCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Issue
        fields = [
            'id', 'organization', 'organization_name', 'code', 'issue_number',
            'title', 'description',
            'vendor', 'vendor_id', 'order', 'order_id',
            'priority', 'priority_display',
            'category', 'category_display',
            'status', 'status_display',
            'assigned_to', 'assigned_to_id',
            'resolved_at', 'resolved_by', 'resolution_notes',
            'is_client_issue', 'raised_by_customer', 'raised_by_customer_name',
            'created_by', 'created_at', 'updated_at',
            'linear_issue_id', 'linear_issue_url', 'linear_team_id',
            'synced_to_linear', 'last_synced_at',
            'comments'
        ]
        read_only_fields = ['id', 'code', 'issue_number', 'organization', 'created_by', 'created_at', 'updated_at', 'resolved_by', 'last_synced_at']
    
    def get_raised_by_customer_name(self, obj):
        if obj.raised_by_customer:
            return f"{obj.raised_by_customer.first_name} {obj.raised_by_customer.last_name}".strip()
        return None
    
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
            'title', 'description', 'vendor', 'order', 'organization',
            'priority', 'category', 'status', 'assigned_to',
            'raised_by_customer', 'is_client_issue'
        ]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Organization field is already defined in the model
        # No need to override queryset here
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            # If organization not provided, use user's current organization
            if 'organization' not in validated_data:
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
