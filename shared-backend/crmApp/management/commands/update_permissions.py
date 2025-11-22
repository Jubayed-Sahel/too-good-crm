"""
Management command to update permissions for existing organizations
Replaces old permissions with new simplified structure:
- sales, activities, issue, analytics, team
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Organization, Permission


class Command(BaseCommand):
    help = 'Update permissions for existing organizations to new structure'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('UPDATING PERMISSIONS'))
        self.stdout.write(self.style.SUCCESS('=' * 60))

        organizations = Organization.objects.all()
        self.stdout.write(f"\nProcessing {organizations.count()} organizations...")

        for org in organizations:
            self.stdout.write(f"\n[OK] Organization: {org.name} (ID: {org.id})")
            
            # Count old permissions
            old_count = Permission.objects.filter(organization=org).count()
            self.stdout.write(f"  Old permissions: {old_count}")
            
            # Delete old permissions
            Permission.objects.filter(organization=org).delete()
            
            # Create new permissions
            new_permissions = [
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
            
            permissions_to_create = []
            for perm_data in new_permissions:
                permissions_to_create.append(
                    Permission(
                        organization=org,
                        resource=perm_data['resource'],
                        action=perm_data['action'],
                        description=perm_data['description'],
                        is_system_permission=False
                    )
                )
            
            Permission.objects.bulk_create(permissions_to_create, ignore_conflicts=True)
            
            new_count = Permission.objects.filter(organization=org).count()
            self.stdout.write(f"  New permissions: {new_count}")

        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS('[SUCCESS] Permissions updated!'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        self.stdout.write('\nNew permission structure:')
        self.stdout.write('  - sales (view, create, edit, delete)')
        self.stdout.write('  - activities (view, create, edit, delete)')
        self.stdout.write('  - issue (view, create, edit, delete)')
        self.stdout.write('  - analytics (view, export)')
        self.stdout.write('  - team (view, invite, edit, remove, manage_roles)')
        
        self.stdout.write('\n' + '=' * 60)

