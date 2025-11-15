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
    organizations = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'profile_image', 'phone', 'is_active',
            'is_verified', 'is_staff', 'two_factor_enabled',
            'last_login_at', 'email_verified_at', 'profiles',
            'organizations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_profiles(self, obj):
        """Get all active user profiles"""
        profiles = obj.user_profiles.filter(status='active').select_related('organization')
        return UserProfileSerializer(profiles, many=True).data
    
    def get_organizations(self, obj):
        """Get all organizations user belongs to with ownership status"""
        from crmApp.models import UserOrganization
        
        user_orgs = UserOrganization.objects.filter(
            user=obj,
            is_active=True
        ).select_related('organization')
        
        return [{
            'id': uo.organization.id,
            'name': uo.organization.name,
            'slug': uo.organization.slug,
            'is_owner': uo.is_owner,
            'joined_at': uo.joined_at,
        } for uo in user_orgs]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles (multi-tenancy)"""
    profile_type_display = serializers.CharField(source='get_profile_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    roles = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'user_email', 'organization', 'organization_name',
            'profile_type', 'profile_type_display', 'is_primary',
            'status', 'status_display', 'activated_at', 'deactivated_at',
            'roles', 'is_owner', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_roles(self, obj):
        """Get user's roles for this organization"""
        from crmApp.models import UserRole, Employee
        
        roles = []
        
        # Get Employee primary role
        if obj.profile_type == 'employee':
            try:
                employee = Employee.objects.get(
                    user=obj.user,
                    organization=obj.organization,
                    status='active'
                )
                if employee.role:
                    roles.append({
                        'id': employee.role.id,
                        'name': employee.role.name,
                        'slug': employee.role.slug,
                        'is_primary': True
                    })
            except Employee.DoesNotExist:
                pass
        
        # Get additional UserRole assignments
        user_roles = UserRole.objects.filter(
            user=obj.user,
            organization=obj.organization,
            is_active=True
        ).select_related('role')
        
        for ur in user_roles:
            roles.append({
                'id': ur.role.id,
                'name': ur.role.name,
                'slug': ur.role.slug,
                'is_primary': False
            })
        
        return roles
    
    def get_is_owner(self, obj):
        """Check if user is owner of this organization"""
        from crmApp.models import UserOrganization
        
        return UserOrganization.objects.filter(
            user=obj.user,
            organization=obj.organization,
            is_owner=True,
            is_active=True
        ).exists()


class UserProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating user profiles"""
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'organization', 'profile_type', 'is_primary', 'status'
        ]
    
    def validate(self, attrs):
        """Validate that profile doesn't already exist for this user"""
        user = attrs.get('user')
        profile_type = attrs.get('profile_type')
        
        # Check if user already has this profile type
        if UserProfile.objects.filter(
            user=user,
            profile_type=profile_type
        ).exists():
            raise serializers.ValidationError(
                f"User already has a {profile_type} profile. Each user can only have one profile of each type."
            )
        
        # Validate organization requirement
        organization = attrs.get('organization')
        if profile_type in ['vendor', 'employee'] and not organization:
            raise serializers.ValidationError(
                f"{profile_type} profile must have an organization."
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
        """
        Create a new user with auto-created profiles.
        Automatically creates all 3 profiles (vendor, employee, customer) for the user.
        """
        from crmApp.models import Organization, UserOrganization, UserProfile, Vendor
        from django.utils.text import slugify
        from django.utils import timezone
        from django.db import transaction
        
        validated_data.pop('password_confirm')
        organization_name = validated_data.pop('organization_name', None)
        
        # Use organization_name if provided, otherwise create default from user's name
        if not organization_name:
            user_full_name = f"{validated_data.get('first_name', '')} {validated_data.get('last_name', '')}".strip()
            if user_full_name:
                organization_name = f"{user_full_name}'s Organization"
            else:
                organization_name = f"{validated_data.get('username', 'User')}'s Organization"
        
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(**validated_data)
            
            # Create organization for the user
            base_slug = slugify(organization_name)
            slug = base_slug
            counter = 1
            while Organization.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            
            # Get Linear team ID from environment
            from django.conf import settings
            linear_team_id = getattr(settings, 'LINEAR_TEAM_ID', None)
            
            organization = Organization.objects.create(
                name=organization_name,
                slug=slug,
                email=user.email,
                is_active=True,
                linear_team_id=linear_team_id  # Auto-configure Linear on registration
            )
            
            # Link user to organization as owner
            UserOrganization.objects.create(
                user=user,
                organization=organization,
                is_owner=True,
                is_active=True
            )
            
            # Create all 3 profiles (vendor, employee, customer)
            # Vendor profile is primary by default
            profiles_to_create = [
                ('vendor', True),    # Primary profile
                ('employee', False),
                ('customer', False),
            ]
            
            vendor_profile = None
            for profile_type, is_primary in profiles_to_create:
                profile = UserProfile.objects.create(
                    user=user,
                    organization=organization,
                    profile_type=profile_type,
                    is_primary=is_primary,
                    status='active',
                    activated_at=timezone.now()
                )
                if profile_type == 'vendor':
                    vendor_profile = profile
            
            # Create vendor record linked to the vendor profile
            if vendor_profile:
                try:
                    vendor, created = Vendor.objects.get_or_create(
                        user=user,
                        organization=organization,
                        defaults={
                            'user_profile': vendor_profile,
                            'name': organization_name,
                            'email': user.email,
                            'status': 'active'
                        }
                    )
                    # Update user_profile if it wasn't set
                    if not vendor.user_profile:
                        vendor.user_profile = vendor_profile
                        vendor.save(update_fields=['user_profile'])
                except Exception as e:
                    # Log error but don't fail registration
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Failed to create vendor record during registration: {e}")
        
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
                raise serializers.ValidationError({
                    'non_field_errors': ['Unable to log in with provided credentials.']
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    'non_field_errors': ['User account is disabled.']
                })
        else:
            raise serializers.ValidationError({
                'non_field_errors': ['Must include "username" and "password".']
            })
        
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
