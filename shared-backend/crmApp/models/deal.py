"""
Deal and pipeline management models.
"""
from django.db import models
from .base import TimestampedModel, CodeMixin, StatusMixin


class Pipeline(TimestampedModel, CodeMixin):
    """
    Sales pipeline definition model.
    Each organization can have multiple pipelines for different sales processes.
    """
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='pipelines')
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'pipelines'
        verbose_name = 'Pipeline'
        verbose_name_plural = 'Pipelines'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.organization.name})"


class PipelineStage(TimestampedModel):
    """
    Pipeline stage model defining the steps in a sales pipeline.
    Each stage has a probability of closing and an order position.
    """
    pipeline = models.ForeignKey('Pipeline', on_delete=models.CASCADE, related_name='stages')
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    # Stage configuration
    order = models.IntegerField(default=0)
    probability = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Win probability percentage
    is_active = models.BooleanField(default=True)
    is_closed_won = models.BooleanField(default=False)
    is_closed_lost = models.BooleanField(default=False)
    
    # Automation
    auto_move_after_days = models.IntegerField(null=True, blank=True)
    
    class Meta:
        db_table = 'pipeline_stages'
        verbose_name = 'Pipeline Stage'
        verbose_name_plural = 'Pipeline Stages'
        ordering = ['pipeline', 'order']
        unique_together = [('pipeline', 'name')]
        indexes = [
            models.Index(fields=['pipeline', 'order']),
        ]
    
    def __str__(self):
        return f"{self.pipeline.name} - {self.name}"


class Deal(TimestampedModel, CodeMixin, StatusMixin):
    """
    Deal/Opportunity model for managing sales opportunities.
    Tracks deals through pipeline stages to closure.
    """
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='deals')
    
    # Basic information
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    # Relationships
    customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    lead = models.ForeignKey('Lead', on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    pipeline = models.ForeignKey('Pipeline', on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    stage = models.ForeignKey('PipelineStage', on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    
    # Assignment
    assigned_to = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='deals')
    
    # Financial
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    probability = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    expected_revenue = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Timeline
    expected_close_date = models.DateField(null=True, blank=True)
    actual_close_date = models.DateField(null=True, blank=True)
    
    # Status
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    is_won = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)
    lost_reason = models.TextField(null=True, blank=True)
    
    # Additional info
    source = models.CharField(max_length=100, null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'deals'
        verbose_name = 'Deal'
        verbose_name_plural = 'Deals'
        unique_together = [('organization', 'code')]
        indexes = [
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['organization', 'stage']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['expected_close_date']),
            models.Index(fields=['is_won']),
            models.Index(fields=['is_lost']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.organization.name})"
    
    def save(self, *args, **kwargs):
        """Calculate expected revenue based on value and probability."""
        if self.value and self.probability:
            from decimal import Decimal
            # Convert value to Decimal if it's not already
            value_decimal = Decimal(str(self.value)) if not isinstance(self.value, Decimal) else self.value
            self.expected_revenue = value_decimal * (self.probability / Decimal('100'))
        super().save(*args, **kwargs)
