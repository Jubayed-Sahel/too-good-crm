"""
Deal, Pipeline, and PipelineStage serializers
"""

from rest_framework import serializers
from crmApp.models import Pipeline, PipelineStage, Deal
from .customer import CustomerListSerializer
from .employee import EmployeeListSerializer


class PipelineStageSerializer(serializers.ModelSerializer):
    """Serializer for pipeline stages"""
    
    class Meta:
        model = PipelineStage
        fields = [
            'id', 'pipeline', 'name', 'description', 'order',
            'probability', 'is_active', 'is_closed_won',
            'is_closed_lost', 'auto_move_after_days', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class PipelineSerializer(serializers.ModelSerializer):
    """Serializer for pipelines with stages"""
    stages = PipelineStageSerializer(many=True, read_only=True)
    stage_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Pipeline
        fields = [
            'id', 'organization', 'code', 'name', 'description',
            'is_active', 'is_default', 'created_at', 'updated_at',
            'stages', 'stage_count'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
    
    def get_stage_count(self, obj):
        return obj.stages.count()


class DealListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for deal lists"""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    stage_id = serializers.IntegerField(source='stage.id', read_only=True)
    
    # Map stage to frontend-compatible string format
    stage = serializers.SerializerMethodField()
    
    class Meta:
        model = Deal
        fields = [
            'id', 'code', 'title', 'customer', 'customer_name', 'value',
            'currency', 'stage', 'stage_id', 'stage_name', 'probability',
            'expected_close_date', 'assigned_to', 'assigned_to_name',
            'status', 'priority', 'is_won', 'is_lost', 'created_at', 'updated_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None
    
    def get_stage(self, obj):
        """
        Map PipelineStage to frontend DealStage enum.
        Returns a string matching the frontend DealStage type.
        """
        if not obj.stage:
            return 'lead'  # Default stage
        
        # Map stage names to frontend enum values
        stage_mapping = {
            'lead': 'lead',
            'qualified': 'qualified',
            'proposal': 'proposal',
            'negotiation': 'negotiation',
            'closed won': 'closed-won',
            'closed-won': 'closed-won',
            'won': 'closed-won',
            'closed lost': 'closed-lost',
            'closed-lost': 'closed-lost',
            'lost': 'closed-lost',
        }
        
        stage_name_lower = obj.stage.name.lower()
        return stage_mapping.get(stage_name_lower, 'lead')


class DealSerializer(serializers.ModelSerializer):
    """Full deal serializer"""
    customer = CustomerListSerializer(read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    pipeline = PipelineSerializer(read_only=True)
    stage_obj = PipelineStageSerializer(source='stage', read_only=True)
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    stage_id = serializers.IntegerField(source='stage.id', read_only=True)
    assigned_to = EmployeeListSerializer(read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    
    # Map stage to frontend-compatible string format
    stage = serializers.SerializerMethodField()
    
    class Meta:
        model = Deal
        fields = [
            'id', 'organization', 'code', 'customer', 'customer_name', 'pipeline',
            'stage', 'stage_id', 'stage_name', 'stage_obj', 'title', 'description',
            'value', 'currency', 'probability', 'expected_revenue',
            'expected_close_date', 'actual_close_date', 'status', 'priority',
            'assigned_to', 'assigned_to_name', 'is_won', 'is_lost', 'lost_reason',
            'source', 'tags', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'expected_revenue', 'created_at', 'updated_at']
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None
    
    def get_stage(self, obj):
        """
        Map PipelineStage to frontend DealStage enum.
        Returns a string matching the frontend DealStage type.
        """
        if not obj.stage:
            return 'lead'  # Default stage
        
        # Map stage names to frontend enum values
        stage_mapping = {
            'lead': 'lead',
            'qualified': 'qualified',
            'proposal': 'proposal',
            'negotiation': 'negotiation',
            'closed won': 'closed-won',
            'closed-won': 'closed-won',
            'won': 'closed-won',
            'closed lost': 'closed-lost',
            'closed-lost': 'closed-lost',
            'lost': 'closed-lost',
        }
        
        stage_name_lower = obj.stage.name.lower()
        return stage_mapping.get(stage_name_lower, 'lead')


class DealCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating deals"""
    customer_id = serializers.IntegerField(required=False, allow_null=True)
    customer = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    pipeline_id = serializers.IntegerField(required=False, allow_null=True)
    pipeline = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    stage_id = serializers.IntegerField(required=False, allow_null=True)
    stage = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    assigned_to = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Deal
        fields = [
            'organization', 'customer', 'customer_id', 'pipeline', 'pipeline_id',
            'stage', 'stage_id', 'title', 'description', 'value', 'currency',
            'probability', 'expected_close_date', 'priority',
            'assigned_to', 'assigned_to_id', 'source', 'tags', 'notes'
        ]
    
    def validate_value(self, value):
        """Validate deal value is positive"""
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Deal value cannot be negative."
            )
        return value
    
    def validate_probability(self, value):
        """Validate probability is between 0 and 100"""
        if value is not None:
            if value < 0 or value > 100:
                raise serializers.ValidationError(
                    "Probability must be between 0 and 100 percent."
                )
        return value
    
    def validate_title(self, value):
        """Validate title is not empty and has minimum length"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Deal title must be at least 3 characters long."
            )
        return value
    
    def validate_expected_close_date(self, value):
        """Validate expected close date is not in the past"""
        if value:
            from datetime import date
            if value < date.today():
                raise serializers.ValidationError(
                    "Expected close date cannot be in the past."
                )
        return value
    
    def validate(self, attrs):
        # Handle backward compatibility for customer/customer_id
        if 'customer' in attrs:
            attrs['customer_id'] = attrs.pop('customer')
        if 'pipeline' in attrs:
            attrs['pipeline_id'] = attrs.pop('pipeline')
        if 'stage' in attrs:
            attrs['stage_id'] = attrs.pop('stage')
        if 'assigned_to' in attrs:
            attrs['assigned_to_id'] = attrs.pop('assigned_to')
        
        # Ensure customer is provided
        if not attrs.get('customer_id'):
            raise serializers.ValidationError({
                'customer': "Customer is required for creating a deal."
            })
        
        # Ensure title is provided
        if not attrs.get('title'):
            raise serializers.ValidationError({
                'title': "Deal title is required."
            })
        
        return attrs


class DealUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating deals"""
    stage_id = serializers.IntegerField(required=False, allow_null=True)
    stage = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    assigned_to = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Deal
        fields = [
            'title', 'description', 'value', 'currency', 'probability',
            'expected_close_date', 'actual_close_date', 'status',
            'priority', 'stage', 'stage_id', 'assigned_to', 'assigned_to_id',
            'is_won', 'is_lost', 'lost_reason', 'source', 'tags', 'notes'
        ]
    
    def validate(self, attrs):
        # Handle backward compatibility for stage/stage_id
        if 'stage' in attrs:
            attrs['stage_id'] = attrs.pop('stage')
        if 'assigned_to' in attrs:
            attrs['assigned_to_id'] = attrs.pop('assigned_to')
        
        return attrs
