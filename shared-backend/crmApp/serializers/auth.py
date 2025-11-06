"""
Authentication and User related serializers
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from crmApp.models import (
    User,
    UserProfile,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
)


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer with all fields and profiles"""
    full_name = serializers.SerializerMethodField()
    profiles = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'profile_image', 'phone', 'is_active',
            'is_verified', 'is_staff', 'two_factor_enabled',
            'last_login_at', 'email_verified_at', 'profiles',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_profiles(self, obj):
        """Get all active user profiles"""
        profiles = obj.user_profiles.filter(status='active')
        return UserProfileSerializer(profiles, many=True).data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles (multi-tenancy)"""
    profile_type_display = serializers.CharField(source='get_profile_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'user_email', 'organization', 'organization_name',
            'profile_type', 'profile_type_display', 'is_primary',
            'status', 'status_display', 'activated_at', 'deactivated_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user profiles"""
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'organization', 'profile_type', 'is_primary', 'status'
        ]
    
    def validate(self, attrs):
        """Validate that profile doesn't already exist"""
        user = attrs.get('user')
        organization = attrs.get('organization')
        profile_type = attrs.get('profile_type')
        
        if UserProfile.objects.filter(
            user=user,
            organization=organization,
            profile_type=profile_type
        ).exists():
            raise serializers.ValidationError(
                f"User already has a {profile_type} profile for this organization."
            )
        
        return attrs


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    organization_name = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Organization name for vendor signup"
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone', 'profile_image',
            'organization_name'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        from crmApp.models import Organization, UserOrganization
        from django.utils.text import slugify
        
        validated_data.pop('password_confirm')
        organization_name = validated_data.pop('organization_name', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        
        # Create organization for vendor signup
        if organization_name:
            # Generate unique slug
            base_slug = slugify(organization_name)
            slug = base_slug
            counter = 1
            while Organization.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Create organization
            organization = Organization.objects.create(
                name=organization_name,
                slug=slug,
                email=user.email
            )
            
            # Link user to organization as owner
            UserOrganization.objects.create(
                user=user,
                organization=organization,
                is_owner=True,
                is_active=True
            )
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'phone', 'profile_image']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        
        if username_or_email and password:
            user = None
            
            # Since USERNAME_FIELD is 'email', authenticate expects email
            # Try to find user by email or username
            if '@' in username_or_email:
                # Input looks like email, authenticate directly
                user = authenticate(
                    request=self.context.get('request'),
                    email=username_or_email,
                    password=password
                )
            else:
                # Input is username, get email and authenticate
                try:
                    user_obj = User.objects.get(username=username_or_email)
                    user = authenticate(
                        request=self.context.get('request'),
                        email=user_obj.email,
                        password=password
                    )
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError(
                    'Unable to log in with provided credentials.',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.',
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Must include "username" and "password".',
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class RefreshTokenSerializer(serializers.ModelSerializer):
    """Serializer for refresh tokens"""
    
    class Meta:
        model = RefreshToken
        fields = ['id', 'user', 'token', 'expires_at', 'is_revoked', 'created_at']
        read_only_fields = ['id', 'created_at']


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    """Serializer for password reset tokens"""
    
    class Meta:
        model = PasswordResetToken
        fields = ['id', 'user', 'token', 'expires_at', 'is_used', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmailVerificationTokenSerializer(serializers.ModelSerializer):
    """Serializer for email verification tokens"""
    
    class Meta:
        model = EmailVerificationToken
        fields = ['id', 'user', 'token', 'expires_at', 'is_used', 'created_at']
        read_only_fields = ['id', 'created_at']
