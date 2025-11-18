"""
Lead ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

from crmApp.models import Lead, LeadStageHistory, Employee
from crmApp.serializers import (
    LeadSerializer,
    LeadCreateSerializer,
    LeadUpdateSerializer,
    LeadListSerializer,
    ConvertLeadSerializer,
)
from crmApp.services import RBACService
from crmApp.viewsets.mixins import (
    PermissionCheckMixin,
    OrganizationFilterMixin,
    QueryFilterMixin,
)


class LeadViewSet(
    viewsets.ModelViewSet,
    PermissionCheckMixin,
    OrganizationFilterMixin,
    QueryFilterMixin,
):
    """
    ViewSet for Lead management.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['organization']
    
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        elif self.action == 'create':
            return LeadCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LeadUpdateSerializer
        elif self.action == 'convert':
            return ConvertLeadSerializer
        return LeadSerializer
    
    def get_queryset(self):
        """Filter leads by user's accessible organizations based on profile type"""
        queryset = Lead.objects.all()
        queryset = self.filter_by_organization(queryset, self.request)
        queryset = self.apply_status_filter(queryset, self.request)
        queryset = self.apply_search_filter(queryset, self.request, ['name', 'email', 'organization_name'])
        queryset = self.apply_assigned_to_filter(queryset, self.request)
        
        # Filter by qualification status
        qualification = self.request.query_params.get('qualification_status')
        if qualification:
            queryset = queryset.filter(qualification_status=qualification)
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Filter converted/unconverted
        queryset = self.apply_boolean_filter(queryset, self.request, 'is_converted')
        
        return queryset.select_related('organization', 'assigned_to', 'converted_by')
    
    def perform_create(self, serializer):
        """Override perform_create to check permissions"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            organization = self.get_organization_from_request(self.request)
            
            if not organization:
                raise ValueError('Organization is required. Please ensure you have an active profile.')
            
            # Check permission for creating leads
            self.check_permission(
                self.request,
                resource='lead',
                action='create',
                organization=organization
            )
            
            # Pass organization object directly to serializer
            serializer.save(organization=organization)
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': f'Failed to create lead: {str(e)}'})
    
    def update(self, request, *args, **kwargs):
        """Override update to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=instance)
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to check permissions"""
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check permissions"""
        instance = self.get_object()
        self.check_permission(request, 'lead', 'delete', instance=instance)
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get lead statistics"""
        queryset = self.get_queryset()
        
        total = queryset.count()
        converted = queryset.filter(is_converted=True).count()
        
        # Calculate conversion rate
        conversion_rate = (converted / total * 100) if total > 0 else 0
        
        # Calculate average score
        from django.db.models import Avg, Sum
        avg_score = queryset.aggregate(avg=Avg('lead_score'))['avg'] or 0
        
        # Calculate total estimated value
        total_value = queryset.aggregate(total=Sum('estimated_value'))['total'] or 0
        
        stats = {
            'totalLeads': total,
            'statusCounts': {
                'new': queryset.filter(qualification_status='new').count(),
                'contacted': queryset.filter(qualification_status='contacted').count(),
                'qualified': queryset.filter(qualification_status='qualified').count(),
                'unqualified': queryset.filter(qualification_status='unqualified').count(),
                'converted': converted,
                'lost': queryset.filter(qualification_status='lost').count(),
            },
            'averageScore': round(avg_score, 2),
            'totalEstimatedValue': float(total_value),
            'conversionRate': round(conversion_rate, 2),
            'by_source': {}
        }
        
        # Group by source
        sources = queryset.values_list('source', flat=True).distinct()
        for source in sources:
            stats['by_source'][source] = queryset.filter(source=source).count()
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert lead to customer - requires lead:update permission"""
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        serializer = ConvertLeadSerializer(
            data=request.data,
            context={'lead': lead, 'request': request}
        )
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        
        return Response({
            'message': 'Lead converted successfully.',
            'customer_id': customer.id,
            'lead': LeadSerializer(lead).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def qualify(self, request, pk=None):
        """Mark lead as qualified - requires lead:update permission"""
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        lead.qualification_status = 'qualified'
        lead.save()
        
        return Response({
            'message': 'Lead qualified successfully.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['post'])
    def disqualify(self, request, pk=None):
        """Mark lead as unqualified - requires lead:update permission"""
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        lead.qualification_status = 'unqualified'
        lead.save()
        
        return Response({
            'message': 'Lead disqualified.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get all activities for a lead"""
        lead = self.get_object()
        
        # For now, return empty list until Activity model is properly integrated
        # TODO: Implement Activity tracking for leads
        return Response({
            'results': [],
            'count': 0
        })
    
    @action(detail=True, methods=['post'])
    def add_activity(self, request, pk=None):
        """Add an activity to a lead"""
        lead = self.get_object()
        
        # For now, just acknowledge the activity
        # TODO: Implement Activity model and tracking
        activity_type = request.data.get('type', 'note')
        description = request.data.get('description', '')
        
        # You can store in notes field temporarily
        current_notes = lead.notes or ''
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        new_note = f"[{timestamp}] {activity_type}: {description}\n"
        lead.notes = new_note + current_notes
        lead.save()
        
        return Response({
            'message': 'Activity added successfully.',
            'activity': {
                'id': f'temp-{timezone.now().timestamp()}',
                'type': activity_type,
                'description': description,
                'created_at': timezone.now().isoformat(),
            }
        })
    
    @action(detail=True, methods=['post'])
    def update_score(self, request, pk=None):
        """Update lead score - requires lead:update permission"""
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        new_score = request.data.get('score')
        reason = request.data.get('reason', '')
        
        if new_score is None:
            return Response(
                {'error': 'Score is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_score = int(new_score)
            if new_score < 0 or new_score > 100:
                return Response(
                    {'error': 'Score must be between 0 and 100'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (ValueError, TypeError):
            return Response(
                {'error': 'Score must be a valid number'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_score = lead.lead_score
        lead.lead_score = new_score
        
        # Log the score change in notes
        if reason:
            timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
            score_note = f"[{timestamp}] Score updated: {old_score} → {new_score}. Reason: {reason}\n"
            lead.notes = score_note + (lead.notes or '')
        
        lead.save()
        
        return Response({
            'message': 'Lead score updated successfully.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign lead to an employee - requires lead:update permission"""
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        assigned_to_id = request.data.get('assigned_to')
        
        if not assigned_to_id:
            return Response(
                {'error': 'assigned_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that the employee exists and belongs to the organization
        try:
            employee = Employee.objects.get(
                id=assigned_to_id,
                organization_id=lead.organization_id,
                status='active'
            )
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee not found or not in the same organization'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        lead.assigned_to = employee
        lead.save()
        
        return Response({
            'message': 'Lead assigned successfully.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['post'])
    def move_stage(self, request, pk=None):
        """
        Move lead to a different stage.
        Requires lead:update permission.
        """
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        stage_id = request.data.get('stage_id')
        
        if not stage_id:
            return Response(
                {'error': 'stage_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from crmApp.models import PipelineStage, Pipeline
            import logging
            logger = logging.getLogger(__name__)
            
            stage = None
            
            # First, try to get stage directly by ID (works even without pipeline)
            try:
                stage = PipelineStage.objects.get(id=stage_id)
                logger.info(f"Found stage {stage_id} directly: {stage.name}")
            except PipelineStage.DoesNotExist:
                logger.warning(f"Stage {stage_id} not found directly, trying to find by pipeline...")
                
                # Get or create default pipeline for organization
                pipeline = Pipeline.objects.filter(
                    organization=lead.organization,
                    is_active=True
                ).order_by('-is_default', '-created_at').first()
                
                if pipeline:
                    try:
                        stage = PipelineStage.objects.get(
                            id=stage_id,
                            pipeline=pipeline
                        )
                        logger.info(f"Found stage {stage_id} in pipeline {pipeline.id}: {stage.name}")
                    except PipelineStage.DoesNotExist:
                        # Try to find stage by name if ID doesn't match
                        # This handles cases where frontend sends a stage_id that doesn't exist
                        stage_name_map = {
                            'lead': 'Lead',
                            'qualified': 'Qualified',
                            'proposal': 'Proposal',
                            'negotiation': 'Negotiation',
                            'closed-won': 'Closed Won',
                            'closed_won': 'Closed Won',
                        }
                        # Try to get stage by name
                        for key, name in stage_name_map.items():
                            try:
                                stage = PipelineStage.objects.get(
                                    pipeline=pipeline,
                                    name__iexact=name
                                )
                                logger.info(f"Found stage by name '{name}' in pipeline {pipeline.id}: {stage.name}")
                                break
                            except PipelineStage.DoesNotExist:
                                continue
                else:
                    logger.warning(f"No active pipeline found for organization {lead.organization.id}, but trying to find stage {stage_id} anyway...")
                    # Even without a pipeline, try to get the stage - it might be valid
                    try:
                        stage = PipelineStage.objects.get(id=stage_id)
                        logger.info(f"Found stage {stage_id} without pipeline check: {stage.name}")
                    except PipelineStage.DoesNotExist:
                        logger.error(f"Stage {stage_id} does not exist at all")
            
            if not stage:
                return Response(
                    {'error': f'Stage with ID {stage_id} not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Track stage change in history
            previous_stage = lead.stage
            was_in_closed_won = previous_stage and previous_stage.is_closed_won if previous_stage else False
            
            lead.stage = stage
            
            # Handle closed-won stage - create/update customer
            if stage.is_closed_won:
                from crmApp.models import Customer
                from django.utils import timezone
                
                # Mark lead as converted
                lead.is_converted = True
                if not lead.converted_at:
                    lead.converted_at = timezone.now()
                
                # Create or update customer from lead
                # Use email if available, otherwise use name as lookup
                # Parse lead name into first_name and last_name if possible
                lead_name = lead.name or ''
                first_name = ''
                last_name = ''
                if lead_name:
                    name_parts = lead_name.strip().split(maxsplit=1)
                    if len(name_parts) >= 2:
                        first_name = name_parts[0]
                        last_name = name_parts[1]
                    else:
                        first_name = name_parts[0]
                        last_name = ''
                
                if lead.email:
                    customer, created = Customer.objects.get_or_create(
                        organization=lead.organization,
                        email=lead.email,
                        defaults={
                            'name': lead.name or lead.organization_name or 'Customer',
                            'first_name': first_name or lead.organization_name or '',
                            'last_name': last_name,
                            'company_name': lead.organization_name,
                            'phone': lead.phone,
                            'customer_type': 'business' if lead.organization_name else 'individual',
                            'status': 'active',
                            'source': lead.source or 'lead',
                            'address': lead.address,
                            'city': lead.city,
                            'state': lead.state,
                            'postal_code': lead.postal_code,
                            'country': lead.country,
                            'converted_from_lead': lead,
                            'converted_at': timezone.now(),
                        }
                    )
                else:
                    # No email, use name as lookup
                    customer_name = lead.name or lead.organization_name or 'Customer'
                    customer, created = Customer.objects.get_or_create(
                        organization=lead.organization,
                        name=customer_name,
                        defaults={
                            'first_name': first_name or lead.organization_name or '',
                            'last_name': last_name,
                            'email': f"{customer_name.lower().replace(' ', '.')}@example.com",
                            'company_name': lead.organization_name,
                            'phone': lead.phone,
                            'customer_type': 'business' if lead.organization_name else 'individual',
                            'status': 'active',
                            'source': lead.source or 'lead',
                            'address': lead.address,
                            'city': lead.city,
                            'state': lead.state,
                            'postal_code': lead.postal_code,
                            'country': lead.country,
                            'converted_from_lead': lead,
                            'converted_at': timezone.now(),
                        }
                    )
                
                if created:
                    logger.info(f"Created customer {customer.id} from lead {lead.id} moved to closed-won")
                else:
                    # Update existing customer to active
                    customer.status = 'active'
                    if not customer.converted_from_lead:
                        customer.converted_from_lead = lead
                    if not customer.converted_at:
                        customer.converted_at = timezone.now()
                    customer.save(update_fields=['status', 'converted_from_lead', 'converted_at'])
                    logger.info(f"Updated customer {customer.id} to active from lead {lead.id}")
            
            # Handle moving away from closed-won - mark customer as inactive if no won deals
            elif was_in_closed_won and not stage.is_closed_won:
                from crmApp.models import Customer, Deal
                
                # Find customer created from this lead
                customer = Customer.objects.filter(
                    organization=lead.organization,
                    converted_from_lead=lead
                ).first()
                
                if customer:
                    # Check if customer has any won deals
                    won_deals = Deal.objects.filter(
                        customer=customer,
                        organization=lead.organization,
                        is_won=True
                    )
                    
                    if not won_deals.exists():
                        # No won deals, mark customer as inactive
                        customer.status = 'inactive'
                        customer.save(update_fields=['status'])
                        logger.info(f"Customer {customer.id} set to inactive (lead {lead.id} moved away from closed-won, no won deals)")
                    else:
                        logger.info(f"Customer {customer.id} remains active (has {won_deals.count()} won deals)")
            
            lead.save()
            
            # Create history entry
            try:
                # Get current user's employee profile for the organization
                employee = None
                if request.user and hasattr(request.user, 'employee_profiles'):
                    employee = request.user.employee_profiles.filter(
                        organization=lead.organization
                    ).first()
                
                LeadStageHistory.objects.create(
                    lead=lead,
                    organization=lead.organization,
                    stage=stage,
                    previous_stage=previous_stage,
                    changed_by=employee,
                    notes=request.data.get('notes', '')
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Failed to create stage history: {str(e)}")
            
            from crmApp.serializers import LeadSerializer
            return Response({
                'message': 'Lead moved to new stage.',
                'lead': LeadSerializer(lead).data
            })
        except PipelineStage.DoesNotExist:
            return Response(
                {'error': 'Stage not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error moving lead to stage: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to move lead: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def convert_to_deal(self, request, pk=None):
        """
        Convert lead to deal and move to a specific stage.
        Requires lead:update and deal:create permissions.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        # Get stage key or stage_id from request
        stage_key = request.data.get('stage_key')  # e.g., 'qualified', 'proposal', 'negotiation', 'closed-won'
        stage_id = request.data.get('stage_id')
        
        if not stage_key and not stage_id:
            return Response(
                {'error': 'Either stage_key or stage_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from crmApp.models import Deal, Pipeline, PipelineStage
            
            # Get or create default pipeline for organization
            pipeline = Pipeline.objects.filter(
                organization=lead.organization,
                is_active=True
            ).order_by('-is_default', '-created_at').first()
            
            if not pipeline:
                # Create default pipeline
                pipeline = Pipeline.objects.create(
                    organization=lead.organization,
                    name='Default Pipeline',
                    is_default=True,
                    is_active=True
                )
                logger.info(f"Created default pipeline for organization {lead.organization.id}")
            
            # Find the target stage
            stage = None
            if stage_id:
                try:
                    stage = PipelineStage.objects.get(id=stage_id, pipeline=pipeline)
                except PipelineStage.DoesNotExist:
                    pass
            
            if not stage and stage_key:
                # Map stage_key to stage name
                stage_name_map = {
                    'qualified': 'Qualified',
                    'proposal': 'Proposal',
                    'negotiation': 'Negotiation',
                    'closed-won': 'Closed Won',
                }
                stage_name = stage_name_map.get(stage_key.lower())
                
                if stage_name:
                    stage = PipelineStage.objects.filter(
                        pipeline=pipeline,
                        name__icontains=stage_name
                    ).first()
                    
                    # If stage doesn't exist, create it
                    if not stage:
                        order_map = {
                            'qualified': 1,
                            'proposal': 2,
                            'negotiation': 3,
                            'closed-won': 4,
                        }
                        probability_map = {
                            'qualified': 25,
                            'proposal': 50,
                            'negotiation': 75,
                            'closed-won': 100,
                        }
                        stage = PipelineStage.objects.create(
                            pipeline=pipeline,
                            name=stage_name,
                            order=order_map.get(stage_key.lower(), 0),
                            probability=probability_map.get(stage_key.lower(), 0),
                            is_closed_won=(stage_key.lower() == 'closed-won')
                        )
                        logger.info(f"Created stage {stage_name} for pipeline {pipeline.id}")
            
            if not stage:
                return Response(
                    {'error': 'Stage not found or could not be created'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check deal:create permission
            self.check_permission(
                request,
                resource='deal',
                action='create',
                organization=lead.organization
            )
            
            # Create deal from lead
            deal_value = lead.estimated_value or 0
            deal_title = f"{lead.name or lead.organization_name or 'Deal'}"
            
            deal = Deal.objects.create(
                organization=lead.organization,
                customer=None,  # No customer yet - will be created when deal is won
                lead=lead,
                pipeline=pipeline,
                stage=stage,
                title=deal_title,
                description=lead.notes or '',
                value=deal_value,
                probability=stage.probability,
                assigned_to=lead.assigned_to,
                source=lead.source,
                tags=lead.tags or [],
                notes=f"Converted from lead: {lead.code}\n{lead.notes or ''}"
            )
            
            # Mark lead as converted
            lead.is_converted = True
            lead.converted_at = timezone.now()
            if lead.assigned_to:
                lead.converted_by = lead.assigned_to
            lead.save()
            
            # If stage is closed-won, create customer
            if stage.is_closed_won:
                from crmApp.models import Customer
                customer, created = Customer.objects.get_or_create(
                    organization=lead.organization,
                    email=lead.email,
                    defaults={
                        'name': lead.name or lead.organization_name or 'Customer',
                        'company_name': lead.organization_name,
                        'phone': lead.phone,
                        'customer_type': 'business' if lead.organization_name else 'individual',
                        'status': 'active',
                        'source': lead.source,
                        'address': lead.address,
                        'city': lead.city,
                        'state': lead.state,
                        'postal_code': lead.postal_code,
                        'country': lead.country,
                    }
                )
                deal.customer = customer
                deal.is_won = True
                deal.is_lost = False
                deal.actual_close_date = timezone.now()
                deal.status = 'closed'
                deal.save()
            
            from crmApp.serializers import DealSerializer
            return Response({
                'message': f'Lead converted to deal and moved to {stage.name} stage.',
                'deal': DealSerializer(deal).data,
                'lead': LeadSerializer(lead).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error converting lead to deal: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to convert lead to deal: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
