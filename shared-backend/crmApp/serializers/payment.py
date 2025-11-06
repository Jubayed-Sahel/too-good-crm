"""
Payment related serializers
"""

from rest_framework import serializers
from crmApp.models import Payment
from .vendor import VendorListSerializer
from .customer import CustomerListSerializer
from .employee import EmployeeListSerializer


class PaymentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for payment lists"""
    vendor_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'code', 'payment_number', 'invoice_number',
            'vendor', 'vendor_name', 'customer', 'customer_name',
            'order', 'order_number', 'payment_type', 'payment_type_display',
            'payment_method', 'payment_method_display',
            'amount', 'currency', 'payment_date', 'due_date',
            'status', 'status_display', 'created_at', 'updated_at'
        ]
    
    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None
    
    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None
    
    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else None


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment serializer"""
    from crmApp.models import Vendor, Customer, Order
    
    vendor = VendorListSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=Vendor.objects.none(),
        source='vendor',
        write_only=True,
        required=False,
        allow_null=True
    )
    customer = CustomerListSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.none(),
        source='customer',
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
    processed_by = EmployeeListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'organization', 'code', 'payment_number',
            'invoice_number', 'reference_number',
            'vendor', 'vendor_id', 'customer', 'customer_id',
            'order', 'order_id',
            'payment_type', 'payment_type_display',
            'payment_method', 'payment_method_display',
            'amount', 'currency', 'payment_date', 'due_date',
            'status', 'status_display',
            'transaction_id', 'processed_at', 'processed_by',
            'notes', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'payment_number', 'organization', 'created_by', 'created_at', 'updated_at', 'processed_by', 'processed_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from crmApp.models import Vendor, Customer, Order
            organization = getattr(request.user, 'current_organization', None)
            if organization:
                self.fields['vendor_id'].queryset = Vendor.objects.filter(organization=organization)
                self.fields['customer_id'].queryset = Customer.objects.filter(organization=organization)
                self.fields['order_id'].queryset = Order.objects.filter(organization=organization)


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    
    class Meta:
        model = Payment
        fields = [
            'invoice_number', 'reference_number',
            'vendor', 'customer', 'order',
            'payment_type', 'payment_method',
            'amount', 'currency', 'payment_date', 'due_date',
            'status', 'transaction_id', 'notes'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['organization'] = getattr(request.user, 'current_organization')
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating payments"""
    
    class Meta:
        model = Payment
        fields = [
            'invoice_number', 'reference_number',
            'vendor', 'customer', 'order',
            'payment_type', 'payment_method',
            'amount', 'currency', 'payment_date', 'due_date',
            'status', 'transaction_id', 'notes'
        ]
