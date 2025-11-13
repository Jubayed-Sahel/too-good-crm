"""
Authentication Service

Handles authentication-related business logic:
- User registration
- Login/logout
- Token management
- Password reset
"""

from typing import Dict, Optional
from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken

from crmApp.models import User, Organization, UserOrganization, UserProfile


class AuthService:
    """Service class for authentication operations"""
    
    @staticmethod
    def register_user(
        email: str,
        username: str,
        password: str,
        first_name: str = '',
        last_name: str = '',
        organization_name: Optional[str] = None
    ) -> Dict:
        """
        Register a new user and optionally create an organization
        
        Args:
            email: User email
            username: Username
            password: Password
            first_name: First name
            last_name: Last name
            organization_name: Optional organization name to create
            
        Returns:
            Dict with user and tokens
        """
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(
                email=email,
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create organization if requested
            organization = None
            if organization_name:
                from django.utils.text import slugify
                organization = Organization.objects.create(
                    name=organization_name,
                    slug=slugify(organization_name)
                )
                
                # Link user to organization as owner
                UserOrganization.objects.create(
                    user=user,
                    organization=organization,
                    is_owner=True,
                    is_active=True
                )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return {
                'user': user,
                'organization': organization,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
    
    @staticmethod
    def login_user(username: str, password: str) -> Optional[Dict]:
        """
        Authenticate user and return tokens
        
        Args:
            username: Username or email
            password: Password
            
        Returns:
            Dict with user and tokens, or None if authentication fails
        """
        user = authenticate(username=username, password=password)
        
        if user is None:
            return None
        
        refresh = RefreshToken.for_user(user)
        
        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
    
    @staticmethod
    def refresh_access_token(refresh_token: str) -> Optional[Dict]:
        """
        Generate new access token from refresh token
        
        Args:
            refresh_token: Refresh token string
            
        Returns:
            Dict with new tokens, or None if invalid
        """
        try:
            refresh = RefreshToken(refresh_token)
            # Rotate refresh token for security
            refresh.set_jti()
            refresh.set_exp()
            
            return {
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        except Exception:
            return None
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> bool:
        """
        Change user password
        
        Args:
            user: User instance
            old_password: Current password
            new_password: New password
            
        Returns:
            True if successful, False otherwise
        """
        if not user.check_password(old_password):
            return False
        
        user.set_password(new_password)
        user.save()
        return True
    
    @staticmethod
    def create_user_profile(
        user: User,
        organization: Organization,
        profile_type: str
    ) -> UserProfile:
        """
        Create a user profile for multi-tenancy
        
        Args:
            user: User instance
            organization: Organization instance
            profile_type: Type of profile ('employee', 'vendor', 'customer')
            
        Returns:
            Created UserProfile instance
        """
        return UserProfile.objects.create(
            user=user,
            organization=organization,
            profile_type=profile_type,
            is_primary=not user.profiles.exists()
        )
