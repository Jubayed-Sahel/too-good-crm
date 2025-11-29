"""
Employee ViewSet
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from crmApp.models import Employee
from crmApp.serializers import (
    EmployeeSerializer,
    EmployeeCreateSerializer,
    EmployeeListSerializer,
)
from crmApp.viewsets.mixins import PermissionCheckMixin


class EmployeeViewSet(viewsets.ModelViewSet, PermissionCheckMixin):
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
        Only shows employees from organizations where the user has an active link.
        """
        try:
            user_orgs = self.request.user.user_organizations.filter(
                is_active=True
            ).values_list('organization_id', flat=True)
            
            # Get employees in user's active organizations OR where the user is the employee
            # BUT only if the user still has an active link to that organization
            from django.db.models import Q
            from crmApp.models import UserOrganization
            
            if user_orgs:
                # Only show employee records where:
                # 1. The employee is in one of the user's active organizations, OR
                # 2. The employee IS the user AND they still have an active link to that organization
                active_user_org_ids = list(user_orgs)
                queryset = Employee.objects.filter(
                    Q(organization_id__in=active_user_org_ids) | 
                    Q(
                        user=self.request.user,
                        organization_id__in=UserOrganization.objects.filter(
                            user=self.request.user,
                            is_active=True
                        ).values_list('organization_id', flat=True)
                    )
                )
            else:
                # If user has no active organizations, only show their own employee records
                # where they still have an active organization link
                active_org_ids = UserOrganization.objects.filter(
                    user=self.request.user,
                    is_active=True
                ).values_list('organization_id', flat=True)
                queryset = Employee.objects.filter(
                    user=self.request.user,
                    organization_id__in=active_org_ids
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
            
            return queryset.select_related('user', 'manager', 'organization', 'role', 'user_profile').order_by('-created_at', 'first_name', 'last_name').distinct()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in EmployeeViewSet.get_queryset: {str(e)}", exc_info=True)
            return Employee.objects.none()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to ensure proper error handling and data loading
        """
        try:
            instance = self.get_object()
            
            # Ensure related objects are loaded to avoid N+1 queries and None errors
            instance = Employee.objects.select_related(
                'user', 'user_profile', 'manager', 'organization', 'role'
            ).prefetch_related(
                'user__user_profiles',
                'user__user_organizations__organization'
            ).get(pk=instance.pk)
            
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Employee.DoesNotExist:
            return Response(
                {'error': 'Employee not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error retrieving employee: {str(e)}", exc_info=True)
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to retrieve employee: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        """Override update to check permissions and ensure role is properly loaded"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Check permission for updating employees
        # Vendors can update employees in their organization
        # Employees cannot update other employees (only their own info if needed)
        organization = self.get_organization_from_request(request, instance=instance)
        if organization:
            active_profile = getattr(request.user, 'active_profile', None)
            if active_profile:
                if active_profile.profile_type == 'employee':
                    # Employees can only update their own employee record
                    if instance.user != request.user:
                        raise PermissionDenied('You can only update your own employee information.')
                elif active_profile.profile_type == 'vendor':
                    # Vendors can update employees in their organization
                    if instance.organization != organization:
                        raise PermissionDenied('You can only update employees in your organization.')
                # For other profile types, check explicit permission
                else:
                    try:
                        self.check_permission(request, 'employee', 'update', organization=organization, instance=instance)
                    except Exception:
                        # If permission check fails, deny access
                        raise PermissionDenied('You do not have permission to update employees.')
        
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔄 Updating employee {instance.id}: {request.data}")
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Refresh from DB to get related role data with select_related
        instance = Employee.objects.select_related('role', 'user', 'manager', 'organization').get(pk=instance.pk)
        
        logger.info(f"✅ Employee updated. Role: {instance.role}, Role name: {instance.role.name if instance.role else None}")
        
        response_serializer = EmployeeSerializer(instance)
        return Response(response_serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to ensure role is properly loaded"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an employee and clean up all related data.
        - Deletes Employee record
        - Deactivates UserOrganization link for that organization
        - Deactivates UserProfile (employee type) for that organization
        - Ensures user cannot access the organization's data
        """
        from crmApp.models import UserOrganization, UserProfile
        from django.db import transaction
        from django.utils import timezone
        
        instance = self.get_object()
        employee_user = instance.user
        employee_organization = instance.organization
        
        # Check permissions - only organization owners/admins can delete employees
        request_organization = self.get_organization_from_request(request, instance=instance)
        if not request_organization:
            raise PermissionDenied('You must belong to an organization to delete employees.')
        
        active_profile = getattr(request.user, 'active_profile', None)
        if active_profile:
            if active_profile.profile_type == 'employee':
                # Employees cannot delete other employees
                raise PermissionDenied('You do not have permission to delete employees.')
            elif active_profile.profile_type == 'vendor':
                # Vendors can only delete employees in their organization
                if instance.organization != request_organization:
                    raise PermissionDenied('You can only delete employees in your organization.')
            else:
                # For other profile types, check explicit permission
                try:
                    self.check_permission(request, 'employee', 'delete', organization=request_organization, instance=instance)
                except Exception:
                    raise PermissionDenied('You do not have permission to delete employees.')
        
        try:
            with transaction.atomic():
                # Store data before deletion for response
                employee_id = instance.id
                employee_name = f"{instance.first_name} {instance.last_name}"
                
                # Safety check: Prevent vendor from deleting themselves
                if employee_user and employee_user == request.user:
                    raise PermissionDenied('You cannot delete your own employee record.')
                
                # Safety check: Ensure we're only deleting an Employee, not affecting Vendor records
                # This is redundant but added for extra safety
                if active_profile and active_profile.profile_type == 'vendor':
                    from crmApp.models import Vendor
                    # Verify the user being deleted is not the vendor themselves
                    vendor_record = Vendor.objects.filter(
                        user=request.user,
                        organization=employee_organization
                    ).first()
                    if vendor_record and vendor_record.user == employee_user:
                        raise PermissionDenied('Cannot delete your own vendor account through employee deletion.')
                
                # 1. Delete the Employee record (this will NOT delete the User due to SET_NULL)
                import logging
                logger = logging.getLogger(__name__)
                logger.info(f"[Employee Delete] Deleting employee {employee_name} (ID: {employee_id}) from organization {employee_organization.name}")
                
                instance.delete()
                logger.info(f"[Employee Delete] Employee record deleted. User account preserved: {employee_user.email if employee_user else 'N/A'}")
                
                # 2. Deactivate UserOrganization link for this organization ONLY
                if employee_user:
                    user_org_link = UserOrganization.objects.filter(
                        user=employee_user,
                        organization=employee_organization
                    ).first()
                    
                    if user_org_link:
                        user_org_link.is_active = False
                        user_org_link.left_at = timezone.now()
                        user_org_link.save()
                        logger.info(f"[Employee Delete] Deactivated UserOrganization link for user {employee_user.email}")
                    
                    # 3. Deactivate UserProfile (employee type) for this organization ONLY
                    # Note: We only touch the employee profile, NOT vendor profiles
                    employee_profile = UserProfile.objects.filter(
                        user=employee_user,
                        profile_type='employee',
                        organization=employee_organization
                    ).first()
                    
                    if employee_profile:
                        # Deactivate the profile
                        employee_profile.deactivate()
                        # Clear the organization link so they can't access it
                        employee_profile.organization = None
                        employee_profile.save()
                        logger.info(f"[Employee Delete] Deactivated employee UserProfile for user {employee_user.email}")
                    
                    # 4. Safety verification: Ensure vendor profiles are untouched
                    from crmApp.models import Vendor
                    vendor_profile = UserProfile.objects.filter(
                        user=employee_user,
                        profile_type='vendor'
                    ).first()
                    vendor_record = Vendor.objects.filter(user=employee_user).first()
                    
                    if vendor_profile or vendor_record:
                        logger.info(f"[Employee Delete] VERIFIED: Vendor profile/record for user {employee_user.email} remains intact")
                    
                    logger.info(f"[Employee Delete] Cleanup complete. User {employee_user.email} can still access system with other profiles.")
                
                return Response({
                    'message': f'Employee {employee_name} has been deleted and removed from the organization.',
                    'deleted_employee_id': employee_id
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            import logging
            import traceback
            logger = logging.getLogger(__name__)
            logger.error(f"Error deleting employee: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to delete employee: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
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
        - If user doesn't exist: Creates User, UserOrganization, UserProfile, and Employee
        - If user exists: Links existing user to organization, creates/updates UserProfile, and creates Employee record
        """
        from crmApp.models import User, UserOrganization, UserProfile
        from django.utils.crypto import get_random_string
        from django.db import transaction
        from django.utils import timezone
        
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
            with transaction.atomic():
                # Search for user by email in database
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
                    
                    # Create or update UserProfile for employee
                    # Note: UserProfile has unique constraint on (user, profile_type)
                    # So we get or create the employee profile and update organization/status
                    user_profile, profile_created = UserProfile.objects.get_or_create(
                        user=user,
                        profile_type='employee',
                        defaults={
                            'organization': organization,
                            'is_primary': False,
                            'status': 'active',
                            'activated_at': timezone.now()
                        }
                    )
                    
                    # If profile already existed, update it to link to this organization
                    if not profile_created:
                        user_profile.organization = organization
                        user_profile.status = 'active'
                        if not user_profile.activated_at:
                            user_profile.activated_at = timezone.now()
                        user_profile.deactivated_at = None
                        user_profile.save()
                    
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
                    
                    # Create UserProfile for employee
                    user_profile = UserProfile.objects.create(
                        user=user,
                        organization=organization,
                        profile_type='employee',
                        is_primary=False,
                        status='active',
                        activated_at=timezone.now()
                    )
                    
                    message = f'New user created and invited as employee'
                
                # Create employee record
                employee = Employee.objects.create(
                    organization=organization,
                    user=user,
                    user_profile=user_profile,  # Explicitly link the UserProfile
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
