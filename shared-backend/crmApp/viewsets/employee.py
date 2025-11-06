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
    
    @action(detail=False, methods=['post'])
    def invite(self, request):
        """
        Invite a new employee to join the organization.
        Creates User, UserOrganization, and Employee in one step.
        """
        from crmApp.models import User, UserOrganization
        from django.utils.crypto import get_random_string
        
        # Get vendor's organization
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'You must belong to an organization to invite employees'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        organization = user_org.organization
        
        # Extract employee data
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone')
        department = request.data.get('department')
        job_title = request.data.get('job_title')
        role_id = request.data.get('role_id')
        
        # Validate required fields
        if not email or not first_name or not last_name:
            return Response(
                {'error': 'email, first_name, and last_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'A user with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Generate username from email
            username = email.split('@')[0]
            if User.objects.filter(username=username).exists():
                username = f"{username}_{get_random_string(4)}"
            
            # Generate temporary password
            temp_password = get_random_string(12)
            
            # Create user account
            user = User.objects.create_user(
                username=username,
                email=email,
                password=temp_password,
                first_name=first_name,
                last_name=last_name,
                phone=phone
            )
            
            # Link user to organization
            UserOrganization.objects.create(
                user=user,
                organization=organization,
                is_owner=False,  # Employee, not owner
                is_active=True
            )
            
            # Create employee record
            employee = Employee.objects.create(
                organization=organization,
                user=user,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                department=department,
                job_title=job_title,
                status='active',
                role_id=role_id
            )
            
            # TODO: Send invitation email with temp password
            # For now, return the temp password (in production, send via email)
            
            return Response({
                'message': 'Employee invited successfully',
                'employee': EmployeeSerializer(employee).data,
                'temporary_password': temp_password,  # Remove in production
                'note': 'Send this password to the employee securely'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
