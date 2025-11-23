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
            'organizations', 'created_at', 'updated_at',
            'title', 'department', 'bio', 'location', 'timezone', 'language'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']
    
    def get_full_name(self, obj):
        return obj.full_name
    
    def get_profiles(self, obj):
        """Get all active user profiles with valid organization links"""
        try:
            from crmApp.models import UserOrganization
            from django.db.models import Q
            # Prefetch organization and user organizations for efficient lookups
            # Only return active profiles that have valid organization links
            # For employee profiles, also ensure they have an active Employee record
            profiles = obj.user_profiles.filter(
                status='active'
            ).select_related('organization').prefetch_related(
                'user__user_organizations__organization'
            )
            
            # Filter profiles based on type:
            # - Vendor profiles: Always show (new users can sign up as vendors)
            # - Customer profiles: Always show (new users can sign up as customers)
            # - Employee profiles: Only show if assigned by vendor (has organization + active employee record)
            from crmApp.models import Employee
            valid_profiles = []
            for profile in profiles:
                if profile.profile_type == 'employee':
                    # Employee profiles: Only show if user has been assigned by a vendor
                    # This means they must have:
                    # 1. An organization (assigned by vendor)
                    # 2. An active Employee record
                    # 3. An active UserOrganization link
                    if not profile.organization:
                        continue  # Skip employee profiles without organization
                    
                    # Check if user has an active Employee record for this organization
                    has_active_employee = Employee.objects.filter(
                        user=obj,
                        organization=profile.organization,
                        status='active'
                    ).exists()
                    
                    # Also check if user has an active UserOrganization link
                    has_active_org_link = UserOrganization.objects.filter(
                        user=obj,
                        organization=profile.organization,
                        is_active=True
                    ).exists()
                    
                    # Only include if both conditions are met
                    if has_active_employee and has_active_org_link:
                        valid_profiles.append(profile)
                elif profile.profile_type == 'vendor':
                    # Vendor profiles: Always show (even without organization for new signups)
                    valid_profiles.append(profile)
                elif profile.profile_type == 'customer':
                    # Customer profiles: Always show
                    valid_profiles.append(profile)
                else:
                    # For any other profile types, include if they have an organization
                    if profile.organization:
                        valid_profiles.append(profile)
            
            return UserProfileSerializer(valid_profiles, many=True).data
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in UserSerializer.get_profiles: {str(e)}", exc_info=True)
            return []
    
    def get_organizations(self, obj):
        """Get all organizations user belongs to with ownership status"""
        try:
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
            } for uo in user_orgs if uo.organization]
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in UserSerializer.get_organizations: {str(e)}", exc_info=True)
            return []


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles (multi-tenancy)"""
    profile_type_display = serializers.CharField(source='get_profile_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    organization_name = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()  # Return as nested object instead of ID
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
    
    def get_organization(self, obj):
        """Return organization as nested object for mobile app compatibility"""
        if obj.organization:
            return {
                'id': obj.organization.id,
                'name': obj.organization.name,
                'slug': obj.organization.slug,
                'description': obj.organization.description,
                'website': obj.organization.website,
                'phone': obj.organization.phone,
                'email': obj.organization.email,
                'address': obj.organization.address,
                'city': obj.organization.city,
                'state': obj.organization.state,
                'country': obj.organization.country,
                'postal_code': obj.organization.postal_code,
                'is_active': obj.organization.is_active,
            }
        return None
    
    def get_organization_name(self, obj):
        """Get organization name for the profile"""
        from crmApp.models import UserOrganization
        
        # Customer profiles always show "Independent Customer" (they don't belong to a specific org)
        if obj.profile_type == 'customer':
            return "Independent Customer"
        
        # For vendor profiles: Show the organization they OWN
        if obj.profile_type == 'vendor':
            # First check UserOrganization where user is owner (source of truth for ownership)
            user_org = UserOrganization.objects.filter(
                user=obj.user,
                is_owner=True,
                is_active=True
            ).select_related('organization').first()
            
            if user_org and user_org.organization:
                return user_org.organization.name
            
            # Fallback to profile.organization if set
            if obj.organization:
                return obj.organization.name
        
        # For employee profiles: Show the organization they WORK FOR
        if obj.profile_type == 'employee':
            from crmApp.models import Employee
            # Employee record is the source of truth for which organization they work for
            try:
                employee = Employee.objects.filter(
                    user=obj.user,
                    status='active'
                ).select_related('organization').first()
                
                if employee and employee.organization:
                    return employee.organization.name
            except Employee.DoesNotExist:
                pass
            
            # Fallback to profile.organization if set
            if obj.organization:
                return obj.organization.name
        
        # For other profile types without organization, return None
        return None
    
    def get_roles(self, obj):
        """Get user's roles for this organization"""
        from crmApp.models import UserRole, Employee, UserOrganization
        
        # Get the organization for this profile
        organization = obj.organization
        
        # For vendor profiles, get organization from UserOrganization if not set on profile
        if obj.profile_type == 'vendor' and not organization:
            user_org = UserOrganization.objects.filter(
                user=obj.user,
                is_owner=True,
                is_active=True
            ).select_related('organization').first()
            
            if user_org:
                organization = user_org.organization
        
        # For employee profiles, get organization from Employee record if not set on profile
        if obj.profile_type == 'employee' and not organization:
            try:
                employee = Employee.objects.filter(
                    user=obj.user,
                    status='active'
                ).select_related('organization').first()
                
                if employee:
                    organization = employee.organization
            except Employee.DoesNotExist:
                pass
        
        if not organization:
            return []
        
        roles = []
        
        # Get Employee primary role
        if obj.profile_type == 'employee':
            try:
                employee = Employee.objects.get(
                    user=obj.user,
                    organization=organization,
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
            organization=organization,
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
        
        # Get the organization for this profile
        organization = obj.organization
        
        # For vendor profiles, get organization from UserOrganization if not set on profile
        if obj.profile_type == 'vendor' and not organization:
            user_org = UserOrganization.objects.filter(
                user=obj.user,
                is_owner=True,
                is_active=True
            ).select_related('organization').first()
            
            if user_org:
                organization = user_org.organization
        
        if not organization:
            return False
        
        return UserOrganization.objects.filter(
            user=obj.user,
            organization=organization,
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
        
        # Validate organization requirement - only vendor profiles require organization
        organization = attrs.get('organization')
        if profile_type == 'vendor' and not organization:
            raise serializers.ValidationError(
                "Vendor profile must have an organization."
            )
        
        # Employee and customer profiles should not have organization specified
        if profile_type in ['employee', 'customer'] and organization:
            raise serializers.ValidationError(
                f"{profile_type} profiles should not have an organization directly assigned."
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
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'password', 'password_confirm', 'phone', 'profile_image'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """
        Create a new user with ALL three profile types (vendor, employee, customer).
        Users can switch between profiles after registration.
        - vendor profile: Set as primary by default (organization will be created later from settings)
        - employee profile: Available when user joins organization via invitation
        - customer profile: Available for browsing vendors and placing orders
        """
        from django.db import transaction
        from django.utils import timezone
        
        validated_data.pop('password_confirm')
        
        with transaction.atomic():
            # Create user
            user = User.objects.create_user(**validated_data)
            
            # Create vendor profile (primary by default)
            UserProfile.objects.create(
                user=user,
                organization=None,
                profile_type='vendor',
                is_primary=True,  # Vendor is primary by default
                status='active',
                activated_at=timezone.now()
            )
            
            # Create employee profile
            UserProfile.objects.create(
                user=user,
                organization=None,
                profile_type='employee',
                is_primary=False,
                status='active',
                activated_at=timezone.now()
            )
            
            # Create customer profile
            UserProfile.objects.create(
                user=user,
                organization=None,
                profile_type='customer',
                is_primary=False,
                status='active',
                activated_at=timezone.now()
            )
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'username', 
            'first_name', 
            'last_name', 
            'phone', 
            'profile_image',
            'title',
            'department',
            'bio',
            'location',
            'timezone',
            'language',
        ]


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
