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
        
        # Automatically assign Linear team ID when organization is created
        # This ensures every organization has Linear integration ready
        self._assign_linear_team_id(organization)
        
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
        
        # Create default pipeline for the organization
        self._create_default_pipeline(organization)
        
        return organization
    
    def _assign_linear_team_id(self, organization):
        """
        Assign a UNIQUE Linear team ID to the organization.
        
        Strategy:
        1. Generate a unique team ID based on organization slug
        2. This ensures each organization has its own isolated Linear team
        3. For production, admin should create actual Linear teams and assign real IDs
        
        Note: These are mock IDs for isolation. To sync with actual Linear:
        - Create teams in Linear (https://linear.app)
        - Use management command: python manage.py setup_linear_teams --assign <ORG_ID> <REAL_TEAM_ID>
        """
        from django.conf import settings
        import os
        import logging
        import uuid
        
        logger = logging.getLogger(__name__)
        
        # Generate a unique team ID for this organization
        # Format: <base-team-id>-<org-slug>-<unique-suffix>
        base_team_id = getattr(settings, 'LINEAR_TEAM_ID', 'b95250db-8430-4dbc-88f8-9fc109369df0')
        
        # Create unique identifier using organization slug and a short UUID
        unique_suffix = str(uuid.uuid4())[:8]
        linear_team_id = f"{base_team_id}-{organization.slug}-{unique_suffix}"
        
        # Alternative: If you want simpler IDs, use just the slug
        # linear_team_id = f"{base_team_id}-{organization.slug}"
        
        # Save the Linear team ID to the organization
        organization.linear_team_id = linear_team_id
        organization.save(update_fields=['linear_team_id'])
        
        logger.info(
            f"[OK] Organization '{organization.name}' (ID: {organization.id}) created with unique Linear team ID: {linear_team_id}"
        )
        logger.info(
            f"[INFO] This is a mock team ID for data isolation. "
            f"To enable actual Linear sync, create a team in Linear and run: "
            f"python manage.py setup_linear_teams --assign {organization.id} <REAL_LINEAR_TEAM_ID>"
        )
    
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
        # Only include: sales, activities, issue, analytics, team
        default_permissions = [
            # Sales (deals, leads, customers)
            {'resource': 'sales', 'action': 'view', 'description': 'View sales (deals, leads, customers)'},
            {'resource': 'sales', 'action': 'create', 'description': 'Create sales records'},
            {'resource': 'sales', 'action': 'edit', 'description': 'Edit sales records'},
            {'resource': 'sales', 'action': 'delete', 'description': 'Delete sales records'},
            
            # Activities
            {'resource': 'activities', 'action': 'view', 'description': 'View activities'},
            {'resource': 'activities', 'action': 'create', 'description': 'Create activities'},
            {'resource': 'activities', 'action': 'edit', 'description': 'Edit activities'},
            {'resource': 'activities', 'action': 'delete', 'description': 'Delete activities'},
            
            # Issues
            {'resource': 'issue', 'action': 'view', 'description': 'View issues'},
            {'resource': 'issue', 'action': 'create', 'description': 'Create issues'},
            {'resource': 'issue', 'action': 'edit', 'description': 'Edit issues'},
            {'resource': 'issue', 'action': 'delete', 'description': 'Delete issues'},
            
            # Analytics
            {'resource': 'analytics', 'action': 'view', 'description': 'View analytics and reports'},
            {'resource': 'analytics', 'action': 'export', 'description': 'Export analytics data'},
            
            # Team (employees, roles, permissions)
            {'resource': 'team', 'action': 'view', 'description': 'View team members'},
            {'resource': 'team', 'action': 'invite', 'description': 'Invite team members'},
            {'resource': 'team', 'action': 'edit', 'description': 'Edit team members'},
            {'resource': 'team', 'action': 'remove', 'description': 'Remove team members'},
            {'resource': 'team', 'action': 'manage_roles', 'description': 'Manage roles and permissions'},
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
    
    def _create_default_pipeline(self, organization):
        """Create default pipeline with stages for a new organization"""
        from crmApp.models import Pipeline, PipelineStage
        
        # Check if pipeline already exists
        if Pipeline.objects.filter(organization=organization, is_default=True).exists():
            return
        
        # Create default pipeline
        pipeline = Pipeline.objects.create(
            organization=organization,
            name='Sales Pipeline',
            code='SALES',
            is_active=True,
            is_default=True
        )
        
        # Create default pipeline stages
        default_stages = [
            {'name': 'Lead', 'order': 1, 'probability': 10.00, 'description': 'Initial contact and research'},
            {'name': 'Qualified', 'order': 2, 'probability': 25.00, 'description': 'Qualifying the opportunity'},
            {'name': 'Proposal', 'order': 3, 'probability': 50.00, 'description': 'Proposal submitted'},
            {'name': 'Negotiation', 'order': 4, 'probability': 75.00, 'description': 'Contract negotiation'},
            {'name': 'Closed Won', 'order': 5, 'probability': 100.00, 'is_closed_won': True, 'description': 'Deal won'},
            {'name': 'Closed Lost', 'order': 6, 'probability': 0.00, 'is_closed_lost': True, 'description': 'Deal lost'},
        ]
        
        for stage_data in default_stages:
            PipelineStage.objects.create(
                pipeline=pipeline,
                **stage_data
            )


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
