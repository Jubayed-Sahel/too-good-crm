"""
Authentication and User ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.utils import timezone

from crmApp.models import User, UserProfile, RefreshToken as RefreshTokenModel
from crmApp.serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserProfileSerializer,
    UserProfileCreateSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    RefreshTokenSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management.
    Provides CRUD operations for users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile with all profiles"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user profile"""
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def profiles(self, request, pk=None):
        """Get all profiles for a specific user"""
        user = self.get_object()
        profiles = user.user_profiles.all()
        organization_id = request.query_params.get('organization_id')
        
        if organization_id:
            profiles = profiles.filter(organization_id=organization_id)
        
        serializer = UserProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserProfile management (multi-tenancy).
    Manages user profiles across organizations (vendor, employee, customer).
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        return UserProfileSerializer
    
    def get_queryset(self):
        """Filter profiles based on user permissions"""
        queryset = UserProfile.objects.all()
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by organization
        organization_id = self.request.query_params.get('organization_id')
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        # Filter by profile type
        profile_type = self.request.query_params.get('profile_type')
        if profile_type:
            queryset = queryset.filter(profile_type=profile_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def activate(self, request, pk=None):
        """Activate a user profile"""
        profile = self.get_object()
        profile.activate()
        return Response({
            'message': 'Profile activated successfully.',
            'profile': UserProfileSerializer(profile).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def deactivate(self, request, pk=None):
        """Deactivate a user profile"""
        profile = self.get_object()
        profile.deactivate()
        return Response({
            'message': 'Profile deactivated successfully.',
            'profile': UserProfileSerializer(profile).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def suspend(self, request, pk=None):
        """Suspend a user profile"""
        profile = self.get_object()
        profile.suspend()
        return Response({
            'message': 'Profile suspended successfully.',
            'profile': UserProfileSerializer(profile).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profiles(self, request):
        """Get all profiles for the current authenticated user"""
        profiles = request.user.user_profiles.all()
        organization_id = request.query_params.get('organization_id')
        
        if organization_id:
            profiles = profiles.filter(organization_id=organization_id)
        
        serializer = UserProfileSerializer(profiles, many=True)
        return Response(serializer.data)


class LoginViewSet(viewsets.ViewSet):
    """
    ViewSet for user authentication.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request):
        """
        Login endpoint - returns JWT tokens
        """
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Store refresh token in database
        RefreshTokenModel.objects.create(
            user=user,
            token=str(refresh),
            expires_at=timezone.now() + timezone.timedelta(days=7),
            ip_address=request.META.get('REMOTE_ADDR'),
            device_info=request.META.get('HTTP_USER_AGENT', '')[:255]
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


class LogoutViewSet(viewsets.ViewSet):
    """
    ViewSet for user logout.
    """
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Logout endpoint - revokes refresh token
        """
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshTokenModel.objects.filter(
                    user=request.user,
                    token=refresh_token,
                    is_revoked=False
                ).first()
                
                if token:
                    token.is_revoked = True
                    token.revoked_at = timezone.now()
                    token.save()
            
            logout(request)
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordViewSet(viewsets.ViewSet):
    """
    ViewSet for changing user password.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def create(self, request):
        """
        Change password endpoint
        """
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Set new password
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.password_changed_at = timezone.now()
        user.save()
        
        return Response({
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)


class RefreshTokenViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing refresh tokens.
    """
    queryset = RefreshTokenModel.objects.all()
    serializer_class = RefreshTokenSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return RefreshTokenModel.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke a specific refresh token"""
        token = self.get_object()
        token.is_revoked = True
        token.revoked_at = timezone.now()
        token.save()
        return Response({'message': 'Token revoked successfully.'})
