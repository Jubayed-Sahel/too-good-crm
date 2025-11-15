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
        
        serializer.save(organization_id=organization.id)
    
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
