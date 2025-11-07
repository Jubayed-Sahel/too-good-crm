"""
Employee Invitation ViewSet
Handles inviting new employees to organizations
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction

from crmApp.models import UserProfile, UserOrganization, Organization, Employee, Role, UserRole
from crmApp.serializers import UserProfileSerializer, UserSerializer

User = get_user_model()


class EmployeeInvitationViewSet(viewsets.ViewSet):
    """
    ViewSet for inviting and managing employees.
    Allows organization owners/admins to invite users as employees.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def invite_employee(self, request):
        """
        Invite a user to join as an employee.
        Creates employee profile and assigns default employee role.
        
        Expected payload:
        {
            "email": "employee@example.com",
            "organization_id": 123,
            "role_name": "employee"  # optional, defaults to "employee"
        }
        """
        email = request.data.get('email')
        organization_id = request.data.get('organization_id')
        role_name = request.data.get('role_name', 'employee')
        
        if not email or not organization_id:
            return Response(
                {'error': 'email and organization_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if requester is owner or admin of the organization
        is_owner = UserOrganization.objects.filter(
            user=request.user,
            organization=organization,
            is_owner=True,
            is_active=True
        ).exists()
        
        if not is_owner:
            return Response(
                {'error': 'Only organization owners can invite employees'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            user_exists = True
        except User.DoesNotExist:
            user_exists = False
            return Response(
                {'error': f'User with email {email} does not exist. They need to sign up first.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user already has employee profile
        existing_profile = UserProfile.objects.filter(
            user=user,
            organization=organization,
            profile_type='employee'
        ).first()
        
        if existing_profile:
            return Response(
                {'error': 'User is already an employee of this organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Create employee profile
            employee_profile = UserProfile.objects.create(
                user=user,
                organization=organization,
                profile_type='employee',
                is_primary=False,
                status='active',
                activated_at=timezone.now()
            )
            
            # Link user to organization
            user_org, created = UserOrganization.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    'is_active': True,
                    'invited_by': request.user,
                    'invitation_accepted_at': timezone.now()
                }
            )
            
            if not created:
                user_org.is_active = True
                user_org.save()
            
            # Create Employee record
            employee, created = Employee.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'status': 'active'
                }
            )
            
            # Assign default employee role if it exists
            try:
                employee_role = Role.objects.get(
                    organization=organization,
                    slug=role_name
                )
                
                UserRole.objects.get_or_create(
                    user=user,
                    role=employee_role,
                    organization=organization,
                    defaults={
                        'is_active': True,
                        'assigned_by': request.user
                    }
                )
            except Role.DoesNotExist:
                # Role doesn't exist, we'll create it
                pass
        
        return Response({
            'message': f'Successfully added {email} as an employee',
            'profile': UserProfileSerializer(employee_profile).data,
            'employee': {
                'id': employee.id,
                'email': employee.email,
                'name': employee.full_name,
                'status': employee.status
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def remove_employee(self, request):
        """
        Remove an employee from the organization.
        Deactivates their employee profile.
        
        Expected payload:
        {
            "user_id": 123,
            "organization_id": 456
        }
        """
        user_id = request.data.get('user_id')
        organization_id = request.data.get('organization_id')
        
        if not user_id or not organization_id:
            return Response(
                {'error': 'user_id and organization_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if requester is owner
        is_owner = UserOrganization.objects.filter(
            user=request.user,
            organization=organization,
            is_owner=True,
            is_active=True
        ).exists()
        
        if not is_owner:
            return Response(
                {'error': 'Only organization owners can remove employees'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Find and deactivate employee profile
        try:
            employee_profile = UserProfile.objects.get(
                user_id=user_id,
                organization=organization,
                profile_type='employee'
            )
            
            employee_profile.deactivate()
            
            # Also deactivate Employee record
            Employee.objects.filter(
                user_id=user_id,
                organization=organization
            ).update(status='inactive')
            
            return Response({
                'message': 'Employee removed successfully'
            })
            
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Employee profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def list_employees(self, request):
        """
        List all employees in an organization.
        
        Query params:
        - organization_id: required
        """
        organization_id = request.query_params.get('organization_id')
        
        if not organization_id:
            return Response(
                {'error': 'organization_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get all employee profiles for this organization
        employee_profiles = UserProfile.objects.filter(
            organization=organization,
            profile_type='employee'
        ).select_related('user')
        
        serializer = UserProfileSerializer(employee_profiles, many=True)
        return Response({
            'employees': serializer.data,
            'count': employee_profiles.count()
        })
