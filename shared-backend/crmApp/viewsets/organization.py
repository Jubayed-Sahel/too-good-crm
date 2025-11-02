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
        """Filter organizations by user membership"""
        user = self.request.user
        return Organization.objects.filter(
            user_organizations__user=user,
            user_organizations__is_active=True
        ).distinct()
    
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
