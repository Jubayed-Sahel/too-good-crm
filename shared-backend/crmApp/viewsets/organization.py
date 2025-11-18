"""
Organization ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Organization, UserOrganization
from crmApp.serializers import (
    OrganizationSerializer,
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer,
    UserOrganizationSerializer,
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Organization management.
    Only organization owners can update/delete organizations.
    Employees can only view organizations they belong to.
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrganizationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrganizationUpdateSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        """Filter organizations by user membership or ownership based on profile type"""
        user = self.request.user
        
        # Get active profile to determine context
        from crmApp.models import UserProfile
        active_profile = UserProfile.objects.filter(
            user=user,
            is_primary=True,
            status='active'
        ).first()
        
        # If user is in vendor profile, only show organizations they OWN
        if active_profile and active_profile.profile_type == 'vendor':
            return Organization.objects.filter(
                user_organizations__user=user,
                user_organizations__is_owner=True,
                user_organizations__is_active=True
            ).distinct()
        
        # For employee/customer profiles, show organizations they're a member of
        return Organization.objects.filter(
            user_organizations__user=user,
            user_organizations__is_active=True
        ).distinct()
    
    def update(self, request, *args, **kwargs):
        """Override update to ensure only owners can update organizations"""
        organization = self.get_object()
        
        # Check if user is owner of this organization
        membership = UserOrganization.objects.filter(
            organization=organization,
            user=request.user,
            is_owner=True,
            is_active=True
        ).first()
        
        if not membership:
            return Response(
                {
                    'error': 'Permission denied',
                    'detail': 'Only organization owners can update organization details. Employees can only view organizations.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to ensure only owners can update organizations"""
        return self.update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to ensure only owners can delete organizations"""
        organization = self.get_object()
        
        # Check if user is owner of this organization
        membership = UserOrganization.objects.filter(
            organization=organization,
            user=request.user,
            is_owner=True,
            is_active=True
        ).first()
        
        if not membership:
            return Response(
                {
                    'error': 'Permission denied',
                    'detail': 'Only organization owners can delete organizations.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def my_organizations(self, request):
        """Get all organizations for current user"""
        organizations = self.get_queryset()
        serializer = self.get_serializer(organizations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members of an organization"""
        organization = self.get_object()
        memberships = UserOrganization.objects.filter(
            organization=organization,
            is_active=True
        )
        serializer = UserOrganizationSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def all_organizations(self, request):
        """
        Get all organizations in the database.
        This is useful for customers raising issues - they should be able to see all organizations.
        """
        # For customers, return all organizations
        # For other profile types, return filtered organizations (same as list)
        from crmApp.models import UserProfile
        active_profile = UserProfile.objects.filter(
            user=request.user,
            is_primary=True,
            status='active'
        ).first()
        
        if active_profile and active_profile.profile_type == 'customer':
            # Customers can see all organizations when raising issues
            organizations = Organization.objects.all().order_by('name')
        else:
            # For other profile types, use the same filtering as list
            organizations = self.get_queryset()
        
        serializer = self.get_serializer(organizations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to an organization"""
        organization = self.get_object()
        
        # Check if user is owner
        membership = UserOrganization.objects.filter(
            organization=organization,
            user=request.user,
            is_owner=True
        ).first()
        
        if not membership:
            return Response(
                {'error': 'Only organization owners can add members.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserOrganizationSerializer(data={
            **request.data,
            'organization_id': organization.id
        })
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserOrganizationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserOrganization relationships.
    """
    queryset = UserOrganization.objects.all()
    serializer_class = UserOrganizationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by user's organizations"""
        user = self.request.user
        return UserOrganization.objects.filter(
            organization__user_organizations__user=user,
            organization__user_organizations__is_active=True
        ).distinct()
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user's membership"""
        membership = self.get_object()
        membership.is_active = False
        membership.save()
        return Response({'message': 'Membership deactivated successfully.'})
    
    @action(detail=False, methods=['post'])
    def add_collaborator(self, request):
        """
        Add an existing user as a collaborator to your organization.
        This is for adding partners or external collaborators who already have accounts.
        """
        from crmApp.models import User
        
        # Get vendor's organization
        user_org = request.user.user_organizations.filter(
            is_active=True,
            is_owner=True  # Only owners can add collaborators
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'You must be an organization owner to add collaborators'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        organization = user_org.organization
        
        # Get the user to add (by email or user_id)
        email = request.data.get('email')
        user_id = request.data.get('user_id')
        
        if not email and not user_id:
            return Response(
                {'error': 'Either email or user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find the user
            if email:
                user_to_add = User.objects.get(email=email)
            else:
                user_to_add = User.objects.get(id=user_id)
            
            # Check if already a member
            if UserOrganization.objects.filter(
                user=user_to_add,
                organization=organization
            ).exists():
                return Response(
                    {'error': 'User is already a member of this organization'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add to organization
            membership = UserOrganization.objects.create(
                user=user_to_add,
                organization=organization,
                is_owner=False,
                is_active=True
            )
            
            return Response({
                'message': 'Collaborator added successfully',
                'membership': UserOrganizationSerializer(membership).data
            }, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
