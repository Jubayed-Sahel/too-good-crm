"""
Management command to remove deals and leads permissions from all organizations
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Permission, RolePermission


class Command(BaseCommand):
    help = 'Remove deals and leads permissions from all organizations'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
    
    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Find all deals and leads permissions
        deals_leads_perms = Permission.objects.filter(
            resource__in=['deal', 'deals', 'lead', 'leads']
        )
        
        total_count = deals_leads_perms.count()
        
        if total_count == 0:
            self.stdout.write(self.style.SUCCESS('✓ No deals or leads permissions found'))
            return
        
        self.stdout.write(f'Found {total_count} deals/leads permissions:')
        
        # Group by organization
        org_perms = {}
        for perm in deals_leads_perms:
            org_name = perm.organization.name
            if org_name not in org_perms:
                org_perms[org_name] = []
            org_perms[org_name].append(f'{perm.resource}:{perm.action}')
        
        for org_name, perms in org_perms.items():
            self.stdout.write(f'  {org_name}: {", ".join(perms)}')
        
        # Find role permissions that will be affected
        role_perms = RolePermission.objects.filter(
            permission__in=deals_leads_perms
        )
        role_perms_count = role_perms.count()
        
        self.stdout.write(f'\nThis will also remove {role_perms_count} role-permission assignments')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\n✓ Dry run complete. No changes were made.'))
            return
        
        # Confirm deletion
        confirm = input('\nAre you sure you want to delete these permissions? (yes/no): ')
        if confirm.lower() != 'yes':
            self.stdout.write(self.style.WARNING('Operation cancelled'))
            return
        
        # Delete with transaction
        with transaction.atomic():
            # Delete role permissions first (foreign key cascade should handle this, but being explicit)
            deleted_role_perms, _ = role_perms.delete()
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_role_perms} role-permission assignments'))
            
            # Delete permissions
            deleted_perms, _ = deals_leads_perms.delete()
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted_perms} permissions'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully removed all deals and leads permissions'))

