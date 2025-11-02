"""
Authentication and User related serializers
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from crmApp.models import (
    User,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
)


class UserSerializer(serializers.ModelSerializer):
    """Full user serializer with all fields"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name',
            'phone', 'is_active', 'is_verified', 'is_staff',
            'two_factor_enabled', 'last_login_at', 'email_verified_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login_at']
    
    def get_full_name(self, obj):
        return obj.username


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
            'email', 'username', 'password', 'password_confirm', 'phone'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ['username', 'phone']


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
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
                'Must include "email" and "password".',
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
