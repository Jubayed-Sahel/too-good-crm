"""
Organization related serializers
"""

from rest_framework import serializers
from crmApp.models import Organization, UserOrganization
from .auth import UserSerializer


class OrganizationSerializer(serializers.ModelSerializer):
    """Full organization serializer"""
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'industry',
            'website', 'phone', 'email', 'address', 'city',
            'state', 'zip_code', 'country', 'settings',
            'subscription_plan', 'subscription_status',
            'is_active', 'created_at', 'updated_at', 'member_count'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.user_organizations.filter(is_active=True).count()


class OrganizationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating organizations"""
    
    class Meta:
        model = Organization
        fields = [
            'name', 'description', 'industry', 'website',
            'phone', 'email', 'address', 'city', 'state',
            'zip_code', 'country'
        ]
    
    def create(self, validated_data):
        # The slug will be auto-generated in the model's save method
        organization = Organization.objects.create(**validated_data)
        
        # Add the creator as owner
        user = self.context['request'].user
        UserOrganization.objects.create(
            user=user,
            organization=organization,
            is_owner=True,
            is_active=True
        )
        
        return organization


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating organizations"""
    
    class Meta:
        model = Organization
        fields = [
            'name', 'description', 'industry', 'website',
            'phone', 'email', 'address', 'city', 'state',
            'zip_code', 'country', 'settings', 'is_active'
        ]


class UserOrganizationSerializer(serializers.ModelSerializer):
    """Serializer for user-organization relationships"""
    user = UserSerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    organization_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = UserOrganization
        fields = [
            'id', 'user', 'organization', 'user_id', 'organization_id',
            'is_active', 'is_owner', 'joined_at'
        ]
        read_only_fields = ['id', 'joined_at']
