"""
Lead ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

from crmApp.models import Lead, Employee
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
        try:
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
            
            # Only prefetch activities if we're using LeadSerializer (detail view), not for list view
            queryset = queryset.select_related('organization', 'assigned_to', 'converted_by')
            # Note: activities prefetch removed to avoid issues - serializer handles it gracefully
            return queryset
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in LeadViewSet.get_queryset: {str(e)}", exc_info=True)
            # Return empty queryset on error to prevent 500
            return Lead.objects.none()
    
    def perform_create(self, serializer):
        """Override perform_create to check permissions"""
        import logging
        logger = logging.getLogger(__name__)
        
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
        
        try:
            # Pass organization object instead of organization_id to avoid issues
            serializer.save(organization=organization)
        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}", exc_info=True)
            # Re-raise as ValidationError with more details for API response
            from rest_framework.exceptions import ValidationError
            if isinstance(e, ValidationError):
                raise
            raise ValidationError({'detail': str(e)})
    
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
    def convert_to_deal(self, request, pk=None):
        """Convert lead to deal directly (no customer created until deal is won) - requires lead:update permission"""
        import logging
        from crmApp.models import Deal, Pipeline, PipelineStage
        from django.db import transaction
        from decimal import Decimal
        from rest_framework.exceptions import ValidationError
        
        logger = logging.getLogger(__name__)
        
        try:
            lead = self.get_object()
            
            # Check permissions
            try:
                self.check_permission(request, 'lead', 'update', instance=lead)
                self.check_permission(request, 'deal', 'create', organization=lead.organization)
            except Exception as e:
                logger.error(f"Permission check failed for convert_to_deal: {str(e)}")
                return Response(
                    {'error': f'Permission denied: {str(e)}'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if lead.is_converted:
                return Response(
                    {'error': 'Lead has already been converted.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get deal data from request
            deal_title = request.data.get('deal_title') or f"Deal for {lead.name}"
            deal_value = request.data.get('deal_value') or lead.estimated_value
            deal_description = request.data.get('description') or lead.notes
            
            with transaction.atomic():
                # Mark lead as converted (to deal, not customer)
                lead.is_converted = True
                lead.qualification_status = 'converted'
                lead.converted_at = timezone.now()
                lead.save()
                
                # Get or create default pipeline
                pipeline = Pipeline.objects.filter(
                    organization=lead.organization,
                    is_default=True
                ).first()
                
                if not pipeline:
                    pipeline = Pipeline.objects.create(
                        organization=lead.organization,
                        name='Default Sales Pipeline',
                        description='Default pipeline for sales deals',
                        is_default=True,
                        is_active=True
                    )
                    
                    # Create default stages
                    default_stages = [
                        {'name': 'Lead', 'order': 1, 'probability': 10, 'is_active': True},
                        {'name': 'Qualified', 'order': 2, 'probability': 25, 'is_active': True},
                        {'name': 'Proposal', 'order': 3, 'probability': 50, 'is_active': True},
                        {'name': 'Negotiation', 'order': 4, 'probability': 75, 'is_active': True},
                        {'name': 'Closed Won', 'order': 5, 'probability': 100, 'is_active': True, 'is_closed_won': True},
                        {'name': 'Closed Lost', 'order': 6, 'probability': 0, 'is_active': True, 'is_closed_lost': True},
                    ]
                    
                    for stage_data in default_stages:
                        PipelineStage.objects.create(
                            pipeline=pipeline,
                            **stage_data
                        )
                
                # Get first stage
                first_stage = pipeline.stages.filter(is_active=True).order_by('order').first()
                
                # Convert deal_value to Decimal
                if deal_value:
                    if not isinstance(deal_value, Decimal):
                        deal_value = Decimal(str(deal_value))
                else:
                    deal_value = Decimal('0')
                
                # Create deal WITHOUT customer (customer will be created when deal is won)
                try:
                    deal = Deal.objects.create(
                        organization=lead.organization,
                        customer=None,  # No customer yet - will be created when deal is won
                        lead=lead,
                        pipeline=pipeline,
                        stage=first_stage,
                        title=deal_title,
                        description=deal_description,
                        value=deal_value,
                        probability=first_stage.probability if first_stage else 10,
                        assigned_to=lead.assigned_to,
                        notes=f"Converted from lead: {lead.name}",
                    )
                except Exception as e:
                    logger.error(f"Error creating deal: {str(e)}", exc_info=True)
                    raise ValidationError({'detail': f'Failed to create deal: {str(e)}'})
                
                return Response({
                    'message': 'Lead converted to deal successfully. Customer will be created when deal is won.',
                    'deal_id': deal.id,
                    'lead': LeadSerializer(lead).data
                }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            logger.error(f"Validation error in convert_to_deal: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in convert_to_deal: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to convert lead to deal: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
    def schedule_followup(self, request, pk=None):
        """Schedule a follow-up for a lead - requires lead:update permission"""
        from django.utils import timezone
        from datetime import timedelta
        
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        follow_up_date = request.data.get('follow_up_date')
        follow_up_notes = request.data.get('follow_up_notes', '')
        reminder_days = request.data.get('reminder_days', 1)  # Default 1 day before
        
        if not follow_up_date:
            return Response(
                {'error': 'follow_up_date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from dateutil import parser
            follow_up_dt = parser.parse(follow_up_date)
            lead.follow_up_date = follow_up_dt
            lead.follow_up_notes = follow_up_notes
            
            # Set reminder date (reminder_days before follow_up_date)
            reminder_dt = follow_up_dt - timedelta(days=int(reminder_days))
            lead.next_follow_up_reminder = reminder_dt
            
            lead.save()
            
            return Response({
                'message': 'Follow-up scheduled successfully.',
                'lead': LeadSerializer(lead).data
            })
        except Exception as e:
            return Response(
                {'error': f'Invalid date format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_contacted(self, request, pk=None):
        """Mark lead as contacted - updates last_contacted_at - requires lead:update permission"""
        from django.utils import timezone
        
        lead = self.get_object()
        self.check_permission(request, 'lead', 'update', instance=lead)
        
        lead.last_contacted_at = timezone.now()
        
        # Update qualification status if still new
        if lead.qualification_status == 'new':
            lead.qualification_status = 'contacted'
        
        lead.save()
        
        return Response({
            'message': 'Lead marked as contacted.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=False, methods=['get'])
    def upcoming_followups(self, request):
        """Get all leads with upcoming follow-ups - requires lead:read permission"""
        from django.utils import timezone
        
        organization = self.get_organization_from_request(request)
        if not organization:
            return Response(
                {'error': 'Organization is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.check_permission(request, 'lead', 'read', organization=organization)
        
        now = timezone.now()
        queryset = self.get_queryset().filter(
            organization=organization,
            next_follow_up_reminder__lte=now,
            is_converted=False
        ).order_by('next_follow_up_reminder')
        
        serializer = LeadListSerializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'count': queryset.count()
        })
