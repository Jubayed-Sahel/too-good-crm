"""
Management command to ensure all roles have permissions assigned.
This command will:
1. Find all roles without permissions
2. Assign default permissions based on role name/type
3. Or assign a basic set of permissions (customers:read, deals:read, leads:read, activities:read)
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Role, Permission, RolePermission


class Command(BaseCommand):
    help = 'Ensure all roles have at least basic permissions assigned'

    def add_arguments(self, parser):
        parser.add_argument(
            '--organization',
            type=int,
            help='Organization ID to process (if not provided, processes all organizations)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes (dry run)',
        )
        parser.add_argument(
            '--basic-only',
            action='store_true',
            help='Only assign basic read permissions (customers, deals, leads, activities)',
        )

    def handle(self, *args, **options):
        organization_id = options.get('organization')
        dry_run = options.get('dry_run', False)
        basic_only = options.get('basic_only', False)

        # Get all roles
        roles_query = Role.objects.filter(is_active=True)
        if organization_id:
            roles_query = roles_query.filter(organization_id=organization_id)

        roles = roles_query.select_related('organization').prefetch_related('role_permissions')

        roles_without_permissions = []
        for role in roles:
            permission_count = role.role_permissions.count()
            if permission_count == 0:
                roles_without_permissions.append(role)

        if not roles_without_permissions:
            self.stdout.write(self.style.SUCCESS('✓ All roles have permissions assigned'))
            return

        self.stdout.write(f'\nFound {len(roles_without_permissions)} role(s) without permissions:')
        for role in roles_without_permissions:
            self.stdout.write(f'  - {role.name} (Organization: {role.organization.name}, ID: {role.id})')

        if dry_run:
            self.stdout.write(self.style.WARNING('\n⚠ DRY RUN - No changes will be made'))
            return

        # Define default permissions based on role name
        default_permission_sets = {
            'sales': ['customers', 'deals', 'leads', 'activities'],
            'support': ['customers', 'issues', 'activities'],
            'manager': ['customers', 'deals', 'leads', 'activities', 'employees', 'analytics'],
            'admin': ['customers', 'deals', 'leads', 'activities', 'employees', 'vendors', 'analytics', 'settings', 'roles'],
        }

        assigned_count = 0
        with transaction.atomic():
            for role in roles_without_permissions:
                org = role.organization
                
                # Determine which permissions to assign
                if basic_only:
                    # Basic read permissions only
                    resources = ['customers', 'deals', 'leads', 'activities']
                    actions = ['read']
                else:
                    # Try to match role name to permission set
                    role_name_lower = role.name.lower()
                    resources = None
                    for key, res_list in default_permission_sets.items():
                        if key in role_name_lower:
                            resources = res_list
                            break
                    
                    # Default to basic permissions if no match
                    if not resources:
                        resources = ['customers', 'deals', 'leads', 'activities']
                    
                    # Actions: read, create, update (no delete for basic roles)
                    actions = ['read', 'create', 'update']

                # Get or create permissions
                permissions_to_assign = []
                for resource in resources:
                    for action in actions:
                        permission = Permission.objects.filter(
                            organization=org,
                            resource=resource,
                            action=action
                        ).first()
                        
                        if permission:
                            permissions_to_assign.append(permission)
                        else:
                            # Create permission if it doesn't exist
                            permission = Permission.objects.create(
                                organization=org,
                                resource=resource,
                                action=action,
                                description=f'{action.title()} permission for {resource}'
                            )
                            self.stdout.write(f'  Created permission: {resource}:{action}')
                            permissions_to_assign.append(permission)

                # Assign permissions to role
                for permission in permissions_to_assign:
                    RolePermission.objects.get_or_create(
                        role=role,
                        permission=permission
                    )

                assigned_count += len(permissions_to_assign)
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Assigned {len(permissions_to_assign)} permissions to role: {role.name}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully assigned permissions to {len(roles_without_permissions)} role(s) '
                f'({assigned_count} total permissions)'
            )
        )

