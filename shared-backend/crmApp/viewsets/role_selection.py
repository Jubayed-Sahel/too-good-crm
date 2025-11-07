"""
Role Selection ViewSet
Handles switching between user profiles (vendor, employee, client)
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from crmApp.models import UserProfile
from crmApp.serializers import UserProfileSerializer, UserSerializer


class RoleSelectionViewSet(viewsets.ViewSet):
    """
    ViewSet for role selection after login.
    Allows users to select which profile to use (vendor, employee, customer).
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def available_roles(self, request):
        """
        Get all available roles/profiles for the current user.
        Returns active profiles across all organizations.
        """
        user = request.user
        profiles = UserProfile.objects.filter(
            user=user,
            status='active'
        ).select_related('organization')
        
        serializer = UserProfileSerializer(profiles, many=True)
        return Response({
            'profiles': serializer.data,
            'count': profiles.count()
        })
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def select_role(self, request):
        """
        Select a specific role/profile to use.
        Updates the user's active profile and returns updated user data.
        
        Expected payload:
        {
            "profile_id": 123  # UserProfile ID to activate
        }
        """
        profile_id = request.data.get('profile_id')
        
        if not profile_id:
            return Response(
                {'error': 'profile_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get the requested profile
            profile = UserProfile.objects.select_related('organization').get(
                id=profile_id,
                user=request.user,
                status='active'
            )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found or not active'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mark all user profiles as non-primary
        UserProfile.objects.filter(
            user=request.user
        ).update(is_primary=False)
        
        # Mark selected profile as primary
        profile.is_primary = True
        profile.save(update_fields=['is_primary'])
        
        # Return updated user data
        user_serializer = UserSerializer(request.user)
        return Response({
            'message': f'Switched to {profile.get_profile_type_display()} role',
            'user': user_serializer.data,
            'active_profile': UserProfileSerializer(profile).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def current_role(self, request):
        """
        Get the current active role/profile.
        Returns the primary profile if set, or the first active profile.
        """
        user = request.user
        
        # Try to get primary profile
        profile = UserProfile.objects.filter(
            user=user,
            is_primary=True,
            status='active'
        ).select_related('organization').first()
        
        # If no primary, get first active profile
        if not profile:
            profile = UserProfile.objects.filter(
                user=user,
                status='active'
            ).select_related('organization').first()
        
        if not profile:
            return Response(
                {'error': 'No active profile found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'profile': UserProfileSerializer(profile).data
        })
