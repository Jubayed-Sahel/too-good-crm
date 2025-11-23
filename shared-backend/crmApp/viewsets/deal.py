"""
Deal, Pipeline, and PipelineStage ViewSets
"""

import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
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
from crmApp.services import RBACService
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin,
    QueryFilterMixin,
)

logger = logging.getLogger(__name__)


class PipelineViewSet(viewsets.ModelViewSet, OrganizationFilterMixin, QueryFilterMixin):
    """
    ViewSet for Pipeline management.
    """
    queryset = Pipeline.objects.all()
    serializer_class = PipelineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter pipelines by user's accessible organizations based on profile type"""
        queryset = Pipeline.objects.all()
        queryset = self.filter_by_organization(queryset, self.request)
        
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
    
    @action(detail=True, methods=['post'])
    def reorder_stages(self, request, pk=None):
        """Bulk reorder pipeline stages"""
        pipeline = self.get_object()
        stages_data = request.data.get('stages', [])
        
        if not stages_data:
            return Response(
                {'error': 'stages array is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Update each stage's order
            updated_stages = []
            for stage_data in stages_data:
                stage_id = stage_data.get('id')
                new_order = stage_data.get('order')
                
                if stage_id is None or new_order is None:
                    return Response(
                        {'error': 'Each stage must have id and order'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    stage = PipelineStage.objects.get(id=stage_id, pipeline=pipeline)
                    stage.order = new_order
                    stage.save()
                    updated_stages.append(stage)
                except PipelineStage.DoesNotExist:
                    return Response(
                        {'error': f'Stage with id {stage_id} not found in this pipeline'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            return Response({
                'message': 'Stages reordered successfully.',
                'stages': PipelineStageSerializer(updated_stages, many=True).data
            })
        except Exception as e:
            logger.error(f"Error reordering stages: {str(e)}")
            return Response(
                {'error': 'An error occurred while reordering stages'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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


class DealViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin,
    QueryFilterMixin,
):
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
        """Filter deals by user's accessible organizations based on profile type"""
        queryset = Deal.objects.all()
        queryset = self.filter_by_organization(queryset, self.request)
        queryset = self.apply_status_filter(queryset, self.request)
        queryset = self.apply_search_filter(queryset, self.request, ['title', 'customer__name'])
        queryset = self.apply_assigned_to_filter(queryset, self.request)
        
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
        
        # Filter won/lost
        queryset = self.apply_boolean_filter(queryset, self.request, 'is_won')
        queryset = self.apply_boolean_filter(queryset, self.request, 'is_lost')
        
        return queryset.select_related(
            'organization', 'customer', 'pipeline', 'stage', 'assigned_to'
        )
    
    def perform_create(self, serializer):
        """Override perform_create to check permissions"""
        organization = self.get_organization_from_request(self.request)
        
        if not organization:
            raise ValueError('Organization is required. Please ensure you have an active profile.')
        
        # Log incoming data for debugging
        logger.info(f"Creating deal with data: {self.request.data}")
        logger.info(f"Organization from profile: {organization.id}")
        logger.info(f"Validated data: {serializer.validated_data}")
        
        # Check permission for creating deals
        self.check_permission(
            self.request,
            resource='deal',
            action='create',
            organization=organization
        )
        
        # Only set organization if not already in validated_data
        if 'organization' not in serializer.validated_data and 'organization_id' not in serializer.validated_data:
            serializer.save(organization=organization)
        else:
            # Ensure the organization matches the user's profile
            org_id = serializer.validated_data.get('organization') or serializer.validated_data.get('organization_id')
            if org_id != organization.id:
                raise ValueError('Organization ID mismatch. You can only create deals for your own organization.')
            serializer.save()
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'deal', 'update', instance=instance)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to check permissions"""
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'deal', 'delete', instance=instance)
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get deal statistics"""
        queryset = self.get_queryset()
        
        total_value = queryset.aggregate(total=Sum('value'))['total'] or 0
        expected_revenue = queryset.aggregate(total=Sum('expected_revenue'))['total'] or 0
        
        stats = {
            'total_deals': queryset.count(),
            'total_value': float(total_value),
            'expected_revenue': float(expected_revenue),
            'won': queryset.filter(is_won=True).count(),
            'lost': queryset.filter(is_lost=True).count(),
            'open': queryset.filter(is_won=False, is_lost=False).count(),
            'by_stage': [],
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
                stats['by_stage'].append({
                    'stage_name': stage['stage__name'],
                    'count': stage['count'],
                    'total_value': float(stage['total_value'] or 0)
                })
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def move_stage(self, request, pk=None):
        """Move deal to another stage - requires deal:update permission"""
        from crmApp.models import Customer
        from django.utils import timezone
        import logging
        logger = logging.getLogger(__name__)
        
        deal = self.get_object()
        self.check_permission(request, 'deal', 'update', instance=deal)
        
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
            
            previous_stage = deal.stage
            was_won = deal.is_won
            
            deal.stage = stage
            deal.probability = stage.probability
            
            # Handle closed-won stage
            if stage.is_closed_won:
                deal.is_won = True
                deal.is_lost = False
                deal.actual_close_date = timezone.now().date()
                deal.status = 'closed'
                
                # Create or update customer from deal
                if not deal.customer:
                    # Try to get customer from lead if deal came from a lead
                    customer = None
                    if deal.lead:
                        # Check if customer already exists from lead conversion
                        customer = Customer.objects.filter(
                            organization=deal.organization,
                            email=deal.lead.email
                        ).first()
                    
                    # If no customer exists, create one from deal data
                    if not customer:
                        # Get customer data from deal or lead
                        customer_name = None
                        customer_email = None
                        customer_phone = None
                        company_name = None
                        
                        if deal.lead:
                            customer_name = deal.lead.name or deal.lead.organization_name
                            customer_email = deal.lead.email
                            customer_phone = deal.lead.phone
                            company_name = deal.lead.organization_name
                        elif deal.title:
                            # Fallback: use deal title as customer name
                            customer_name = deal.title
                            # Try to extract email from deal notes or other fields
                            customer_email = None
                        
                        if customer_name and (customer_email or customer_name):
                            # Use email as lookup if available, otherwise use name
                            if customer_email:
                                customer, created = Customer.objects.get_or_create(
                                    organization=deal.organization,
                                    email=customer_email,
                                    defaults={
                                        'name': customer_name,
                                        'company_name': company_name,
                                        'phone': customer_phone,
                                        'customer_type': 'business' if company_name else 'individual',
                                        'status': 'active',
                                        'source': deal.source or 'deal',
                                    }
                                )
                            else:
                                # No email, use name as lookup
                                customer, created = Customer.objects.get_or_create(
                                    organization=deal.organization,
                                    name=customer_name,
                                    defaults={
                                        'email': f"{customer_name.lower().replace(' ', '.')}@example.com",
                                        'company_name': company_name,
                                        'phone': customer_phone,
                                        'customer_type': 'business' if company_name else 'individual',
                                        'status': 'active',
                                        'source': deal.source or 'deal',
                                    }
                                )
                            
                            if created:
                                logger.info(f"Created customer {customer.id} from deal {deal.id}")
                            else:
                                # Update existing customer to active
                                customer.status = 'active'
                                customer.save(update_fields=['status'])
                                logger.info(f"Updated customer {customer.id} to active from deal {deal.id}")
                    
                    if customer:
                        deal.customer = customer
                else:
                    # Customer exists, ensure it's active
                    deal.customer.status = 'active'
                    deal.customer.save(update_fields=['status'])
                    logger.info(f"Customer {deal.customer.id} set to active from deal {deal.id}")
            
            # Handle moving away from closed-won
            elif was_won and not stage.is_closed_won:
                deal.is_won = False
                deal.is_lost = False
                deal.actual_close_date = None
                deal.status = 'open'
                
                # If customer exists and has no other won deals, mark as inactive
                if deal.customer:
                    # Check if customer has other won deals
                    other_won_deals = Deal.objects.filter(
                        customer=deal.customer,
                        organization=deal.organization,
                        is_won=True
                    ).exclude(id=deal.id)
                    
                    if not other_won_deals.exists():
                        deal.customer.status = 'inactive'
                        deal.customer.save(update_fields=['status'])
                        logger.info(f"Customer {deal.customer.id} set to inactive (no won deals)")
            
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
        """Mark deal as won - requires deal:update permission"""
        deal = self.get_object()
        self.check_permission(request, 'deal', 'update', instance=deal)
        
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
        """Mark deal as lost - requires deal:update permission"""
        deal = self.get_object()
        self.check_permission(request, 'deal', 'update', instance=deal)
        
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
        """Reopen a closed deal - requires deal:update permission"""
        deal = self.get_object()
        self.check_permission(request, 'deal', 'update', instance=deal)
        
        deal.is_won = False
        deal.is_lost = False
        deal.actual_close_date = None
        deal.status = 'active'
        deal.save()
        
        return Response({
            'message': 'Deal reopened.',
            'deal': DealSerializer(deal).data
        })
