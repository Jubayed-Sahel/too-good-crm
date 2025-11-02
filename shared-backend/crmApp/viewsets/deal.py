"""
Deal, Pipeline, and PipelineStage ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q

from crmApp.models import Pipeline, PipelineStage, Deal
from crmApp.serializers import (
    PipelineSerializer,
    PipelineStageSerializer,
    DealSerializer,
    DealCreateSerializer,
    DealUpdateSerializer,
    DealListSerializer,
)


class PipelineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Pipeline management.
    """
    queryset = Pipeline.objects.all()
    serializer_class = PipelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter pipelines by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Pipeline.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter active only
        active_only = self.request.query_params.get('active_only')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        
        return queryset.prefetch_related('stages')
    
    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set pipeline as default for organization"""
        pipeline = self.get_object()
        
        # Remove default from other pipelines
        Pipeline.objects.filter(
            organization=pipeline.organization,
            is_default=True
        ).update(is_default=False)
        
        # Set this as default
        pipeline.is_default = True
        pipeline.save()
        
        return Response({
            'message': 'Pipeline set as default.',
            'pipeline': PipelineSerializer(pipeline).data
        })


class PipelineStageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PipelineStage management.
    """
    queryset = PipelineStage.objects.all()
    serializer_class = PipelineStageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter stages by pipeline"""
        queryset = PipelineStage.objects.all()
        
        # Filter by pipeline
        pipeline_id = self.request.query_params.get('pipeline')
        if pipeline_id:
            queryset = queryset.filter(pipeline_id=pipeline_id)
        
        return queryset.select_related('pipeline').order_by('order')
    
    @action(detail=True, methods=['post'])
    def reorder(self, request, pk=None):
        """Reorder stage position"""
        stage = self.get_object()
        new_order = request.data.get('order')
        
        if new_order is not None:
            stage.order = new_order
            stage.save()
            
            return Response({
                'message': 'Stage reordered successfully.',
                'stage': PipelineStageSerializer(stage).data
            })
        
        return Response(
            {'error': 'order is required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class DealViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Deal management.
    """
    queryset = Deal.objects.all()
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DealListSerializer
        elif self.action == 'create':
            return DealCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DealUpdateSerializer
        return DealSerializer
    
    def get_queryset(self):
        """Filter deals by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Deal.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by pipeline
        pipeline_id = self.request.query_params.get('pipeline')
        if pipeline_id:
            queryset = queryset.filter(pipeline_id=pipeline_id)
        
        # Filter by stage
        stage_id = self.request.query_params.get('stage')
        if stage_id:
            queryset = queryset.filter(stage_id=stage_id)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by assigned employee
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter won/lost
        is_won = self.request.query_params.get('is_won')
        if is_won is not None:
            queryset = queryset.filter(is_won=is_won.lower() == 'true')
        
        is_lost = self.request.query_params.get('is_lost')
        if is_lost is not None:
            queryset = queryset.filter(is_lost=is_lost.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                customer__name__icontains=search
            )
        
        return queryset.select_related(
            'organization', 'customer', 'pipeline', 'stage', 'assigned_to'
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get deal statistics"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Deal.objects.filter(organization_id__in=user_orgs)
        
        total_value = queryset.aggregate(total=Sum('value'))['total'] or 0
        expected_revenue = queryset.aggregate(total=Sum('expected_revenue'))['total'] or 0
        
        stats = {
            'total_deals': queryset.count(),
            'total_value': float(total_value),
            'expected_revenue': float(expected_revenue),
            'won': queryset.filter(is_won=True).count(),
            'lost': queryset.filter(is_lost=True).count(),
            'open': queryset.filter(is_won=False, is_lost=False).count(),
            'by_stage': {},
            'by_priority': {
                'low': queryset.filter(priority='low').count(),
                'medium': queryset.filter(priority='medium').count(),
                'high': queryset.filter(priority='high').count(),
                'urgent': queryset.filter(priority='urgent').count(),
            }
        }
        
        # Group by stage
        stages = queryset.values('stage__name').annotate(
            count=Count('id'),
            total_value=Sum('value')
        )
        for stage in stages:
            if stage['stage__name']:
                stats['by_stage'][stage['stage__name']] = {
                    'count': stage['count'],
                    'value': float(stage['total_value'] or 0)
                }
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def move_stage(self, request, pk=None):
        """Move deal to another stage"""
        deal = self.get_object()
        stage_id = request.data.get('stage_id')
        
        if not stage_id:
            return Response(
                {'error': 'stage_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            stage = PipelineStage.objects.get(
                id=stage_id,
                pipeline=deal.pipeline
            )
            
            deal.stage = stage
            deal.probability = stage.probability
            deal.save()
            
            return Response({
                'message': 'Deal moved to new stage.',
                'deal': DealSerializer(deal).data
            })
        except PipelineStage.DoesNotExist:
            return Response(
                {'error': 'Stage not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def mark_won(self, request, pk=None):
        """Mark deal as won"""
        deal = self.get_object()
        deal.is_won = True
        deal.is_lost = False
        deal.actual_close_date = timezone.now()
        deal.status = 'closed'
        deal.save()
        
        return Response({
            'message': 'Deal marked as won.',
            'deal': DealSerializer(deal).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_lost(self, request, pk=None):
        """Mark deal as lost"""
        deal = self.get_object()
        deal.is_won = False
        deal.is_lost = True
        deal.lost_reason = request.data.get('lost_reason', '')
        deal.actual_close_date = timezone.now()
        deal.status = 'closed'
        deal.save()
        
        return Response({
            'message': 'Deal marked as lost.',
            'deal': DealSerializer(deal).data
        })
    
    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a closed deal"""
        deal = self.get_object()
        deal.is_won = False
        deal.is_lost = False
        deal.actual_close_date = None
        deal.status = 'active'
        deal.save()
        
        return Response({
            'message': 'Deal reopened.',
            'deal': DealSerializer(deal).data
        })
