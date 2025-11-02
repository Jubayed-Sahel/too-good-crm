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
    
    class Meta:
        model = Deal
        fields = [
            'id', 'code', 'title', 'customer_name', 'value',
            'currency', 'stage_name', 'probability',
            'expected_close_date', 'assigned_to_name',
            'status', 'priority', 'is_won', 'is_lost', 'created_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name
        return None


class DealSerializer(serializers.ModelSerializer):
    """Full deal serializer"""
    customer = CustomerListSerializer(read_only=True)
    pipeline = PipelineSerializer(read_only=True)
    stage = PipelineStageSerializer(read_only=True)
    assigned_to = EmployeeListSerializer(read_only=True)
    
    class Meta:
        model = Deal
        fields = [
            'id', 'organization', 'code', 'customer', 'pipeline',
            'stage', 'title', 'description', 'value', 'currency',
            'probability', 'expected_revenue', 'expected_close_date',
            'actual_close_date', 'status', 'priority', 'assigned_to',
            'is_won', 'is_lost', 'lost_reason', 'source',
            'tags', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'expected_revenue', 'created_at', 'updated_at']


class DealCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating deals"""
    customer_id = serializers.IntegerField()
    pipeline_id = serializers.IntegerField()
    stage_id = serializers.IntegerField()
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Deal
        fields = [
            'organization', 'customer_id', 'pipeline_id', 'stage_id',
            'title', 'description', 'value', 'currency', 'probability',
            'expected_close_date', 'priority', 'assigned_to_id',
            'source', 'tags', 'notes'
        ]


class DealUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating deals"""
    stage_id = serializers.IntegerField(required=False)
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Deal
        fields = [
            'title', 'description', 'value', 'currency', 'probability',
            'expected_close_date', 'actual_close_date', 'status',
            'priority', 'stage_id', 'assigned_to_id', 'is_won',
            'is_lost', 'lost_reason', 'source', 'tags', 'notes'
        ]
