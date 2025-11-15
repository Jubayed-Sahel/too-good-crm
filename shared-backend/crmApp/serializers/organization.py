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
            'linear_team_id', 'subscription_plan', 'subscription_status',
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
        
        # Create vendor profile for the user
        self._create_vendor_profile(user, organization)
        
        # Create default permissions for the organization
        self._create_default_permissions(organization)
        
        return organization
    
    def _create_vendor_profile(self, user, organization):
        """Create vendor profile and vendor record for the user"""
        from crmApp.models import UserProfile, Vendor
        from django.utils import timezone
        
        # Check if vendor profile already exists
        vendor_profile = UserProfile.objects.filter(
            user=user,
            profile_type='vendor'
        ).first()
        
        if not vendor_profile:
            # Create vendor profile
            vendor_profile = UserProfile.objects.create(
                user=user,
                organization=organization,
                profile_type='vendor',
                is_primary=True,
                status='active',
                activated_at=timezone.now()
            )
        else:
            # Update existing vendor profile with organization
            vendor_profile.organization = organization
            vendor_profile.status = 'active'
            vendor_profile.activated_at = timezone.now()
            vendor_profile.save()
        
        # Create or update vendor record
        Vendor.objects.update_or_create(
            user=user,
            organization=organization,
            defaults={
                'user_profile': vendor_profile,
                'name': organization.name,
                'email': user.email,
                'status': 'active'
            }
        )
    
    def _create_default_permissions(self, organization):
        """Create default permissions for a new organization"""
        from crmApp.models import Permission
        
        # Define default resources and actions
        default_permissions = [
            # Customers
            {'resource': 'customer', 'action': 'view', 'description': 'View customers'},
            {'resource': 'customer', 'action': 'create', 'description': 'Create customers'},
            {'resource': 'customer', 'action': 'edit', 'description': 'Edit customers'},
            {'resource': 'customer', 'action': 'delete', 'description': 'Delete customers'},
            
            # Deals
            {'resource': 'deal', 'action': 'view', 'description': 'View deals'},
            {'resource': 'deal', 'action': 'create', 'description': 'Create deals'},
            {'resource': 'deal', 'action': 'edit', 'description': 'Edit deals'},
            {'resource': 'deal', 'action': 'delete', 'description': 'Delete deals'},
            
            # Leads
            {'resource': 'lead', 'action': 'view', 'description': 'View leads'},
            {'resource': 'lead', 'action': 'create', 'description': 'Create leads'},
            {'resource': 'lead', 'action': 'edit', 'description': 'Edit leads'},
            {'resource': 'lead', 'action': 'delete', 'description': 'Delete leads'},
            
            # Activities
            {'resource': 'activity', 'action': 'view', 'description': 'View activities'},
            {'resource': 'activity', 'action': 'create', 'description': 'Create activities'},
            {'resource': 'activity', 'action': 'edit', 'description': 'Edit activities'},
            {'resource': 'activity', 'action': 'delete', 'description': 'Delete activities'},
            
            # Employees/Team
            {'resource': 'employee', 'action': 'view', 'description': 'View team members'},
            {'resource': 'employee', 'action': 'create', 'description': 'Invite team members'},
            {'resource': 'employee', 'action': 'edit', 'description': 'Edit team members'},
            {'resource': 'employee', 'action': 'delete', 'description': 'Remove team members'},
            
            # Orders
            {'resource': 'order', 'action': 'view', 'description': 'View orders'},
            {'resource': 'order', 'action': 'create', 'description': 'Create orders'},
            {'resource': 'order', 'action': 'edit', 'description': 'Edit orders'},
            {'resource': 'order', 'action': 'delete', 'description': 'Delete orders'},
            
            # Payments
            {'resource': 'payment', 'action': 'view', 'description': 'View payments'},
            {'resource': 'payment', 'action': 'create', 'description': 'Create payments'},
            {'resource': 'payment', 'action': 'edit', 'description': 'Edit payments'},
            {'resource': 'payment', 'action': 'delete', 'description': 'Delete payments'},
            
            # Vendors
            {'resource': 'vendor', 'action': 'view', 'description': 'View vendors'},
            {'resource': 'vendor', 'action': 'create', 'description': 'Create vendors'},
            {'resource': 'vendor', 'action': 'edit', 'description': 'Edit vendors'},
            {'resource': 'vendor', 'action': 'delete', 'description': 'Delete vendors'},
            
            # Issues
            {'resource': 'issue', 'action': 'view', 'description': 'View issues'},
            {'resource': 'issue', 'action': 'create', 'description': 'Create issues'},
            {'resource': 'issue', 'action': 'edit', 'description': 'Edit issues'},
            {'resource': 'issue', 'action': 'delete', 'description': 'Delete issues'},
            
            # Analytics
            {'resource': 'analytics', 'action': 'view', 'description': 'View analytics and reports'},
            
            # Settings
            {'resource': 'settings', 'action': 'view', 'description': 'View settings'},
            {'resource': 'settings', 'action': 'edit', 'description': 'Edit settings'},
            
            # Roles
            {'resource': 'role', 'action': 'view', 'description': 'View roles'},
            {'resource': 'role', 'action': 'create', 'description': 'Create roles'},
            {'resource': 'role', 'action': 'edit', 'description': 'Edit roles'},
            {'resource': 'role', 'action': 'delete', 'description': 'Delete roles'},
        ]
        
        # Create permissions in bulk
        permissions_to_create = []
        for perm_data in default_permissions:
            permissions_to_create.append(
                Permission(
                    organization=organization,
                    resource=perm_data['resource'],
                    action=perm_data['action'],
                    description=perm_data['description'],
                    is_system_permission=False  # These are default but not system permissions
                )
            )
        
        Permission.objects.bulk_create(permissions_to_create, ignore_conflicts=True)


class OrganizationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating organizations"""
    
    class Meta:
        model = Organization
        fields = [
            'name', 'description', 'industry', 'website',
            'phone', 'email', 'address', 'city', 'state',
            'zip_code', 'country', 'settings', 'linear_team_id', 'is_active'
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
