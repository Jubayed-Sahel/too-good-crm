"""
Order related serializers
"""

from rest_framework import serializers
from crmApp.models import Order, OrderItem
from .vendor import VendorListSerializer
from .customer import CustomerListSerializer
from .employee import EmployeeListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'description', 'sku',
            'quantity', 'unit_price', 'total_price', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order lists"""
    vendor_name = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'code', 'order_number', 'title',
            'vendor', 'vendor_name', 'customer', 'customer_name',
            'order_type', 'order_type_display', 'status', 'status_display',
            'total_amount', 'currency', 'order_date',
            'expected_delivery', 'actual_delivery',
            'assigned_to', 'assigned_to_name', 'items_count',
            'created_at', 'updated_at'
        ]
    
    def get_vendor_name(self, obj):
        return obj.vendor.name if obj.vendor else None
    
    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer else None
    
    def get_assigned_to_name(self, obj):
        return obj.assigned_to.full_name if obj.assigned_to else None
    
    def get_items_count(self, obj):
        return obj.items.count()


class OrderSerializer(serializers.ModelSerializer):
    """Full order serializer"""
    from crmApp.models import Vendor, Customer, Employee
    
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
    assigned_to = EmployeeListSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.none(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True
    )
    items = OrderItemSerializer(many=True, read_only=True)
    order_type_display = serializers.CharField(source='get_order_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'organization', 'code', 'order_number',
            'title', 'description',
            'vendor', 'vendor_id', 'customer', 'customer_id',
            'order_type', 'order_type_display',
            'status', 'status_display',
            'total_amount', 'currency', 'tax_amount', 'discount_amount',
            'order_date', 'expected_delivery', 'actual_delivery',
            'assigned_to', 'assigned_to_id',
            'notes', 'terms_and_conditions',
            'items', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'order_number', 'organization', 'created_by', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            from crmApp.models import Vendor, Customer, Employee
            organization = getattr(request.user, 'current_organization', None)
            if organization:
                self.fields['vendor_id'].queryset = Vendor.objects.filter(organization=organization)
                self.fields['customer_id'].queryset = Customer.objects.filter(organization=organization)
                self.fields['assigned_to_id'].queryset = Employee.objects.filter(organization=organization)


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = Order
        fields = [
            'title', 'description', 'vendor', 'customer',
            'order_type', 'status', 'total_amount', 'currency',
            'tax_amount', 'discount_amount', 'order_date',
            'expected_delivery', 'assigned_to', 'notes',
            'terms_and_conditions', 'items'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        items_data = validated_data.pop('items', [])
        
        if request and hasattr(request, 'user'):
            validated_data['organization'] = getattr(request.user, 'current_organization')
            validated_data['created_by'] = request.user
        
        order = super().create(validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating orders"""
    items = OrderItemSerializer(many=True, required=False)
    
    class Meta:
        model = Order
        fields = [
            'title', 'description', 'vendor', 'customer',
            'order_type', 'status', 'total_amount', 'currency',
            'tax_amount', 'discount_amount', 'order_date',
            'expected_delivery', 'actual_delivery', 'assigned_to',
            'notes', 'terms_and_conditions', 'items'
        ]
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Clear existing items
            instance.items.all().delete()
            # Create new items
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
        
        return instance
