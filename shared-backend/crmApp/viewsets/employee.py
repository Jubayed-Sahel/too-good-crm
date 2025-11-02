"""
Employee ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Employee
from crmApp.serializers import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeListSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Employee management.
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        elif self.action == 'create':
            return EmployeeCreateSerializer
        return EmployeeSerializer
    
    def get_queryset(self):
        """Filter employees by user's organizations"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        queryset = Employee.objects.filter(organization_id__in=user_orgs)
        
        # Filter by organization if provided
        org_id = self.request.query_params.get('organization')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department=department)
        
        # Search by name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )
        
        return queryset.select_related('user', 'manager', 'organization')
    
    @action(detail=False, methods=['get'])
    def departments(self, request):
        """Get list of unique departments"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        departments = Employee.objects.filter(
            organization_id__in=user_orgs,
            department__isnull=False
        ).values_list('department', flat=True).distinct()
        
        return Response(list(departments))
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate an employee"""
        employee = self.get_object()
        employee.status = 'inactive'
        employee.termination_date = request.data.get('termination_date')
        employee.save()
        
        return Response({
            'message': 'Employee terminated successfully.',
            'employee': EmployeeSerializer(employee).data
        })
