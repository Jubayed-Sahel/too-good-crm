"""
Lead ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from crmApp.models import Lead
from crmApp.serializers import (
    LeadSerializer,
    LeadCreateSerializer,
    LeadUpdateSerializer,
    LeadListSerializer,
    ConvertLeadSerializer,
)


class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lead management.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
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
        """Filter leads by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Lead.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by qualification status
        qualification = self.request.query_params.get('qualification_status')
        if qualification:
            queryset = queryset.filter(qualification_status=qualification)
        
        # Filter by source
        source = self.request.query_params.get('source')
        if source:
            queryset = queryset.filter(source=source)
        
        # Filter by assigned employee
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter converted/unconverted
        is_converted = self.request.query_params.get('is_converted')
        if is_converted is not None:
            queryset = queryset.filter(is_converted=is_converted.lower() == 'true')
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                company__icontains=search
            )
        
        return queryset.select_related('organization', 'assigned_to', 'converted_by')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get lead statistics"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Lead.objects.filter(organization_id__in=user_orgs)
        
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
        """Convert lead to customer"""
        lead = self.get_object()
        
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
        """Mark lead as qualified"""
        lead = self.get_object()
        lead.qualification_status = 'qualified'
        lead.save()
        
        return Response({
            'message': 'Lead qualified successfully.',
            'lead': LeadSerializer(lead).data
        })
    
    @action(detail=True, methods=['post'])
    def disqualify(self, request, pk=None):
        """Mark lead as unqualified"""
        lead = self.get_object()
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
        """Update lead score"""
        lead = self.get_object()
        
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
        """Assign lead to an employee"""
        lead = self.get_object()
        
        assigned_to_id = request.data.get('assigned_to')
        
        if not assigned_to_id:
            return Response(
                {'error': 'assigned_to is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that the employee exists and belongs to the organization
        from crmApp.models import Employee
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
