"""
Authentication and User ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import login, logout
from django.utils import timezone

from crmApp.models import User, UserProfile
from crmApp.serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    UserProfileSerializer,
    UserProfileCreateSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
)
from crmApp.services import AuthService


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
    
    def create(self, request, *args, **kwargs):
        """Register a new user and return JWT tokens"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            # Generate JWT tokens for new user
            result = AuthService.login_user(user.email, request.data.get('password'))
            
            return Response({
                'user': UserSerializer(user).data,
                'access': result['tokens']['access'],
                'refresh': result['tokens']['refresh'],
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Registration error: {type(e).__name__}: {str(e)}")
            if hasattr(e, 'detail'):
                print(f"Error detail: {e.detail}")
            import traceback
            traceback.print_exc()
            raise
    
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
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """Change current user's password"""
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'old_password': ['Wrong password.']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)
    
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
    ViewSet for user authentication with JWT tokens.
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    def create(self, request):
        """
        Login endpoint - returns JWT access and refresh tokens
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Log request data for debugging
        logger.info(f"Login request received: {request.data}")
        
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            logger.warning(f"Login validation failed: {serializer.errors}")
        
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Update last login
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        # Generate JWT tokens using AuthService
        result = AuthService.login_user(user.email, request.data.get('password'))
        
        logger.info(f"Login successful for user: {user.email}")
        
        return Response({
            'user': UserSerializer(user).data,
            'access': result['tokens']['access'],
            'refresh': result['tokens']['refresh'],
            'message': 'Login successful'
        })


class LogoutViewSet(viewsets.ViewSet):
    """
    ViewSet for user logout (JWT doesn't require server-side logout).
    """
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Logout endpoint - JWT tokens are stateless, so client just needs to delete tokens
        """
        try:
            logout(request)
            return Response({
                'message': 'Successfully logged out. Please delete tokens on client side.'
            }, status=status.HTTP_200_OK)
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


class RefreshTokenViewSet(viewsets.ViewSet):
    """
    ViewSet for refreshing JWT access tokens.
    """
    permission_classes = [AllowAny]
    
    def create(self, request):
        """
        Refresh token endpoint - returns new access token
        POST /api/auth/refresh/
        Body: { "refresh": "<refresh_token>" }
        """
        import logging
        logger = logging.getLogger(__name__)
        
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Use AuthService to refresh the access token
            result = AuthService.refresh_access_token(refresh_token)
            
            logger.info("Token refresh successful")
            
            return Response({
                'access': result['tokens']['access'],
                'refresh': result['tokens']['refresh'],
                'message': 'Token refreshed successfully'
            })
        except Exception as e:
            logger.warning(f"Token refresh failed: {str(e)}")
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


# RefreshTokenViewSet now implemented above - using JWT authentication
