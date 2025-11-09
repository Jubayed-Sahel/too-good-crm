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
        """
        Filter employees by user's organizations.
        Returns employees in organizations where user is a member,
        PLUS the user's own employee records in any organization.
        """
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        # Get employees in user's organizations OR where the user is the employee
        from django.db.models import Q
        queryset = Employee.objects.filter(
            Q(organization_id__in=user_orgs) | Q(user=self.request.user)
        )
        
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
        
        return queryset.select_related('user', 'manager', 'organization', 'role').order_by('-created_at', 'first_name', 'last_name').distinct()
    
    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        """Get all issues assigned to this employee or raised for their organization"""
        employee = self.get_object()
        from crmApp.models import Issue
        from crmApp.serializers import IssueListSerializer
        
        # Get issues assigned to this employee OR issues in their organization
        from django.db.models import Q
        issues = Issue.objects.filter(
            Q(assigned_to=employee) | Q(organization=employee.organization)
        ).select_related(
            'organization', 'vendor', 'order', 'assigned_to', 'resolved_by', 'raised_by_customer'
        ).order_by('-created_at')
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            issues = issues.filter(status=status_filter)
        
        priority_filter = request.query_params.get('priority')
        if priority_filter:
            issues = issues.filter(priority=priority_filter)
        
        category_filter = request.query_params.get('category')
        if category_filter:
            issues = issues.filter(category=category_filter)
        
        # Filter by assigned vs all organization issues
        assigned_only = request.query_params.get('assigned_only', 'false').lower() == 'true'
        if assigned_only:
            issues = issues.filter(assigned_to=employee)
        
        # Paginate
        page = self.paginate_queryset(issues)
        if page is not None:
            serializer = IssueListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = IssueListSerializer(issues, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def assigned_issues(self, request, pk=None):
        """Get issues assigned to this employee"""
        employee = self.get_object()
        from crmApp.models import Issue
        from crmApp.serializers import IssueListSerializer
        
        issues = Issue.objects.filter(assigned_to=employee).select_related(
            'organization', 'vendor', 'order', 'assigned_to', 'resolved_by', 'raised_by_customer'
        ).order_by('-created_at')
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            issues = issues.filter(status=status_filter)
        
        # Paginate
        page = self.paginate_queryset(issues)
        if page is not None:
            serializer = IssueListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = IssueListSerializer(issues, many=True)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """Override update to ensure role is properly loaded"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        print(f"🔄 Updating employee {instance.id}: {request.data}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh from DB to get related role data with select_related
        instance = Employee.objects.select_related('role', 'user', 'manager', 'organization').get(pk=instance.pk)
        
        print(f"✅ Employee updated. Role: {instance.role}, Role name: {instance.role.name if instance.role else None}")
        
        response_serializer = EmployeeSerializer(instance)
        return Response(response_serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to ensure role is properly loaded"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
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
        Invite a new or existing employee to join the organization.
        - If user doesn't exist: Creates User, UserOrganization, and Employee
        - If user exists: Links existing user to organization and creates Employee record
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
        phone = request.data.get('phone') or None  # Convert empty string to None
        department = request.data.get('department') or None
        job_title = request.data.get('job_title') or None
        role_id = request.data.get('role_id') or None
        
        # Validate required fields
        if not email or not first_name or not last_name:
            return Response(
                {'error': 'email, first_name, and last_name are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if user already exists
            existing_user = User.objects.filter(email=email).first()
            temp_password = None
            user_created = False
            
            if existing_user:
                # User exists - check if already an employee in this organization
                existing_employee = Employee.objects.filter(
                    organization=organization,
                    user=existing_user
                ).first()
                
                if existing_employee:
                    return Response(
                        {'error': f'{existing_user.full_name} is already an employee in this organization'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Use existing user
                user = existing_user
                
                # Check if user is already linked to this organization
                user_org_link = UserOrganization.objects.filter(
                    user=user,
                    organization=organization
                ).first()
                
                if not user_org_link:
                    # Link user to organization
                    UserOrganization.objects.create(
                        user=user,
                        organization=organization,
                        is_owner=False,
                        is_active=True
                    )
                elif not user_org_link.is_active:
                    # Reactivate existing link
                    user_org_link.is_active = True
                    user_org_link.save()
                
                message = f'Existing user {user.full_name} added as employee'
                
            else:
                # User doesn't exist - create new user
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
                
                user_created = True
                
                # Link user to organization
                UserOrganization.objects.create(
                    user=user,
                    organization=organization,
                    is_owner=False,
                    is_active=True
                )
                
                message = f'New user created and invited as employee'
            
            # Create employee record
            employee = Employee.objects.create(
                organization=organization,
                user=user,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone or user.phone,
                department=department,
                job_title=job_title,
                status='active',
                role_id=role_id
            )
            
            # Build response
            response_data = {
                'message': message,
                'employee': EmployeeSerializer(employee).data,
                'user_created': user_created
            }
            
            if temp_password:
                response_data['temporary_password'] = temp_password
                response_data['note'] = 'Send this password to the employee securely'
            else:
                response_data['note'] = 'User already had an account. They can login with their existing credentials.'
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            print(f"❌ Error inviting employee: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
