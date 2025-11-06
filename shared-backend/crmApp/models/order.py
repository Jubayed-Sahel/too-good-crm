"""
Order management models for tracking purchases and service orders.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, StatusMixin


class Order(TimestampedModel, CodeMixin, StatusMixin):
    """
    Order model for managing purchase orders and service orders.
    Tracks orders from vendors and for customers.
    """
    
    ORDER_TYPE_CHOICES = [
        ('purchase', 'Purchase Order'),
        ('service', 'Service Order'),
        ('subscription', 'Subscription'),
        ('maintenance', 'Maintenance'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='orders'
    )
    
    # Basic information
    order_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    # Relationships
    vendor = models.ForeignKey(
        'Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    
    # Order details
    order_type = models.CharField(
        max_length=20,
        choices=ORDER_TYPE_CHOICES,
        default='purchase'
    )
    
    # Financial
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    currency = models.CharField(max_length=3, default='USD')
    tax_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    # Dates
    order_date = models.DateField()
    expected_delivery = models.DateField(null=True, blank=True)
    actual_delivery = models.DateField(null=True, blank=True)
    
    # Assignment
    assigned_to = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_orders'
    )
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_orders'
    )
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    terms_and_conditions = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'order_type']),
            models.Index(fields=['vendor']),
            models.Index(fields=['customer']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['order_number']),
            models.Index(fields=['order_date']),
        ]
        ordering = ['-order_date', '-created_at']
    
    def __str__(self):
        return f"{self.order_number}: {self.title}"
    
    def save(self, *args, **kwargs):
        """Generate order number if not provided."""
        if not self.order_number:
            # Generate order number: ORD-YYYY-NNNN
            from django.utils import timezone
            year = timezone.now().year
            last_order = Order.objects.filter(
                organization=self.organization,
                order_number__startswith=f'ORD-{year}'
            ).order_by('-order_number').first()
            
            if last_order:
                last_num = int(last_order.order_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.order_number = f'ORD-{year}-{new_num:04d}'
        
        super().save(*args, **kwargs)


class OrderItem(TimestampedModel):
    """
    Order line items for detailed order tracking.
    """
    order = models.ForeignKey(
        'Order',
        on_delete=models.CASCADE,
        related_name='items'
    )
    
    # Item details
    product_name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    sku = models.CharField(max_length=100, null=True, blank=True)
    
    # Quantities and pricing
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'
        ordering = ['id']
    
    def __str__(self):
        return f"{self.order.order_number} - {self.product_name}"
    
    def save(self, *args, **kwargs):
        """Calculate total price if not provided."""
        if self.quantity and self.unit_price and not self.total_price:
            self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)
