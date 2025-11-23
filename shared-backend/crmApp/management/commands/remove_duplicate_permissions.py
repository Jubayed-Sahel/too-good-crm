"""
Management command to remove duplicate permissions.
Keeps singular resource names with standard CRUD actions (read, create, update, delete).
Removes plural resource names and old action names (view, edit).
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Permission, RolePermission


class Command(BaseCommand):
    help = 'Remove duplicate permissions (plural names and old actions)'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
    
    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made\n'))
        
        # Define what to remove
        plural_resources = ['customers', 'employees', 'vendors', 'activities', 'issues', 'orders', 'payments', 'deals', 'leads']
        old_actions = ['view', 'edit']  # We keep read/update
        
        # Find duplicate permissions
        duplicates_to_remove = []
        
        # 1. Find permissions with plural resource names
        plural_perms = Permission.objects.filter(resource__in=plural_resources)
        plural_count = plural_perms.count()
        
        if plural_count > 0:
            self.stdout.write(f'\n📋 Found {plural_count} permissions with plural resource names:')
            for perm in plural_perms:
                self.stdout.write(f'   - {perm.organization.name}: {perm.resource}:{perm.action}')
            duplicates_to_remove.extend(plural_perms)
        
        # 2. Find permissions with old action names (view, edit)
        old_action_perms = Permission.objects.filter(action__in=old_actions)
        old_action_count = old_action_perms.count()
        
        if old_action_count > 0:
            self.stdout.write(f'\n📋 Found {old_action_count} permissions with old action names (view/edit):')
            for perm in old_action_perms:
                self.stdout.write(f'   - {perm.organization.name}: {perm.resource}:{perm.action}')
            # Add to list (avoid duplicates if already in plural list)
            for perm in old_action_perms:
                if perm not in duplicates_to_remove:
                    duplicates_to_remove.append(perm)
        
        # Get role permission assignments that will be affected
        if duplicates_to_remove:
            duplicate_ids = [p.id for p in duplicates_to_remove]
            role_perms = RolePermission.objects.filter(permission_id__in=duplicate_ids)
            role_perms_count = role_perms.count()
            
            self.stdout.write(f'\n⚠️  This will also remove {role_perms_count} role-permission assignments')
        else:
            self.stdout.write(self.style.SUCCESS('\n✅ No duplicate permissions found!'))
            return
        
        # Show summary
        total_to_remove = len(duplicates_to_remove)
        self.stdout.write(f'\n📊 Summary:')
        self.stdout.write(f'   - Permissions to remove: {total_to_remove}')
        self.stdout.write(f'   - Role assignments to remove: {role_perms_count}')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n✓ Dry run complete. No changes were made.'))
            self.stdout.write(self.style.WARNING('Run without --dry-run to apply changes.'))
            return
        
        # Confirm deletion
        self.stdout.write(self.style.WARNING('\n⚠️  WARNING: This will permanently delete these permissions!'))
        confirm = input('\nAre you sure you want to delete these duplicate permissions? (yes/no): ')
        if confirm.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Operation cancelled'))
            return
        
        # Delete with transaction
        with transaction.atomic():
            # Delete role permissions first (foreign key cascade should handle this, but being explicit)
            deleted_role_perms = role_perms.delete()[0]
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_role_perms} role-permission assignments'))
            
            # Delete permissions
            deleted_perms = 0
            for perm in duplicates_to_remove:
                perm.delete()
                deleted_perms += 1
            
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_perms} duplicate permissions'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully removed all duplicate permissions!'))
        self.stdout.write(self.style.SUCCESS('\nNow using standardized convention:'))
        self.stdout.write('   - Resource names: customer, employee, vendor, activity, issue, order, payment (singular)')
        self.stdout.write('   - Actions: read, create, update, delete (standard CRUD)')

