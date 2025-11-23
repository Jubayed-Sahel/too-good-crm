"""
Management command to diagnose employee permission issues
"""
from django.core.management.base import BaseCommand
from crmApp.models import User, Employee, Role, Permission, UserRole, RolePermission, UserProfile
from crmApp.services import RBACService


class Command(BaseCommand):
    help = 'Diagnose employee permission issues'

    def add_arguments(self, parser):
        parser.add_argument('--user-id', type=int, help='User ID to diagnose')
        parser.add_argument('--email', type=str, help='User email to diagnose')
        parser.add_argument('--organization-id', type=int, help='Organization ID')

    def handle(self, *args, **options):
        user_id = options.get('user_id')
        email = options.get('email')
        org_id = options.get('organization_id')

        # Get user
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with ID {user_id} not found'))
                return
        elif email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'User with email {email} not found'))
                return
        else:
            self.stdout.write(self.style.ERROR('Please provide --user-id or --email'))
            return

        self.stdout.write(self.style.SUCCESS(f'\n=== Diagnosing User: {user.email} (ID: {user.id}) ===\n'))

        # Get user profiles
        profiles = UserProfile.objects.filter(user=user)
        self.stdout.write(self.style.SUCCESS(f'User Profiles ({profiles.count()}):'))
        for profile in profiles:
            self.stdout.write(f'  - Type: {profile.profile_type}, Org: {profile.organization.name if profile.organization else "None"}, Status: {profile.status}, Primary: {profile.is_primary}')

        # Get employee records
        employees = Employee.objects.filter(user=user).select_related('role', 'organization')
        self.stdout.write(self.style.SUCCESS(f'\nEmployee Records ({employees.count()}):'))
        for emp in employees:
            self.stdout.write(f'  - Org: {emp.organization.name}, Status: {emp.status}')
            if emp.role:
                self.stdout.write(f'    Role: {emp.role.name} (ID: {emp.role.id})')
                # Get permissions for this role
                role_perms = Permission.objects.filter(
                    role_permissions__role=emp.role
                ).values_list('resource', 'action', flat=False)
                self.stdout.write(f'    Role Permissions ({len(role_perms)}):')
                for resource, action in role_perms:
                    self.stdout.write(f'      - {resource}:{action}')
            else:
                self.stdout.write(self.style.WARNING('    ⚠️  No role assigned!'))

        # Get UserRole assignments
        user_roles = UserRole.objects.filter(user=user, is_active=True).select_related('role', 'organization')
        self.stdout.write(self.style.SUCCESS(f'\nUserRole Assignments ({user_roles.count()}):'))
        for ur in user_roles:
            self.stdout.write(f'  - Role: {ur.role.name}, Org: {ur.organization.name}')
            # Get permissions for this role
            role_perms = Permission.objects.filter(
                role_permissions__role=ur.role
            ).values_list('resource', 'action', flat=False)
            self.stdout.write(f'    Role Permissions ({len(role_perms)}):')
            for resource, action in role_perms:
                self.stdout.write(f'      - {resource}:{action}')

        # Test RBACService for specific organization
        if org_id:
            from crmApp.models import Organization
            try:
                org = Organization.objects.get(id=org_id)
                self.stdout.write(self.style.SUCCESS(f'\n=== Testing RBACService for Organization: {org.name} ==='))
                
                # Get permissions via RBACService
                permissions = RBACService.get_user_permissions(user, org)
                self.stdout.write(f'\nRBACService.get_user_permissions() returned {len(permissions)} permissions:')
                for perm in permissions:
                    self.stdout.write(f'  - {perm["resource"]}:{perm["action"]} (ID: {perm["id"]})')
                
                # Test specific permission checks
                test_cases = [
                    ('customer', 'read'),
                    ('customer', 'create'),
                    ('customer', 'update'),
                    ('customer', 'delete'),
                    ('employee', 'read'),
                    ('issue', 'read'),
                ]
                
                self.stdout.write(f'\nTesting specific permission checks:')
                for resource, action in test_cases:
                    has_perm = RBACService.check_permission(user, org, resource, action)
                    status_icon = '✅' if has_perm else '❌'
                    self.stdout.write(f'  {status_icon} {resource}:{action} = {has_perm}')
                
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Organization with ID {org_id} not found'))
        else:
            self.stdout.write(self.style.WARNING('\nProvide --organization-id to test RBACService'))

        self.stdout.write(self.style.SUCCESS('\n=== Diagnosis Complete ===\n'))

