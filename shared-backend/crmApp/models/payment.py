"""
Payment management models for tracking financial transactions.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin


class Payment(TimestampedModel, CodeMixin):
    """
    Payment model for managing payments, invoices, and financial transactions.
    Can be linked to orders, vendors, and customers.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('check', 'Check'),
        ('cash', 'Cash'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('other', 'Other'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('incoming', 'Incoming Payment'),
        ('outgoing', 'Outgoing Payment'),
    ]
    
    organization = models.ForeignKey(
        'Organization',
        on_delete=models.CASCADE,
        related_name='payments'
    )
    
    # Basic information
    payment_number = models.CharField(max_length=50, unique=True)
    invoice_number = models.CharField(max_length=50, null=True, blank=True)
    reference_number = models.CharField(max_length=100, null=True, blank=True)
    
    # Relationships
    order = models.ForeignKey(
        'Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    vendor = models.ForeignKey(
        'Vendor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )
    
    # Payment details
    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default='outgoing'
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHOD_CHOICES,
        default='bank_transfer'
    )
    
    # Financial
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Dates
    payment_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Processing info
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payments'
    )
    
    # Additional info
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_payments'
    )
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'payment_type']),
            models.Index(fields=['order']),
            models.Index(fields=['vendor']),
            models.Index(fields=['customer']),
            models.Index(fields=['payment_number']),
            models.Index(fields=['payment_date']),
            models.Index(fields=['due_date']),
        ]
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"{self.payment_number}: {self.amount} {self.currency}"
    
    def save(self, *args, **kwargs):
        """Generate payment number if not provided."""
        if not self.payment_number:
            # Generate payment number: PAY-YYYY-NNNN
            from django.utils import timezone
            year = timezone.now().year
            last_payment = Payment.objects.filter(
                organization=self.organization,
                payment_number__startswith=f'PAY-{year}'
            ).order_by('-payment_number').first()
            
            if last_payment:
                last_num = int(last_payment.payment_number.split('-')[-1])
                new_num = last_num + 1
            else:
                new_num = 1
            
            self.payment_number = f'PAY-{year}-{new_num:04d}'
        
        # Auto-set processed_at when status changes to completed
        if self.status == 'completed' and not self.processed_at:
            from django.utils import timezone
            self.processed_at = timezone.now()
        
        super().save(*args, **kwargs)
