"""
Management command to show organization-employee relationships
Helps track which employees belong to which organizations and their roles
"""

from django.core.management.base import BaseCommand
from django.db.models import Count, Q
from crmApp.models import Organization, Employee, UserProfile, UserRole, Role


class Command(BaseCommand):
    help = 'Display organization-employee relationships and their roles'

    def add_arguments(self, parser):
        parser.add_argument(
            '--org-id',
            type=int,
            help='Show employees for a specific organization ID',
        )
        parser.add_argument(
            '--user-email',
            type=str,
            help='Show organizations for a specific user email',
        )
        parser.add_argument(
            '--detailed',
            action='store_true',
            help='Show detailed information including permissions',
        )

    def handle(self, *args, **options):
        org_id = options.get('org_id')
        user_email = options.get('user_email')
        detailed = options.get('detailed', False)

        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('ORGANIZATION-EMPLOYEE TRACKER'))
        self.stdout.write(self.style.SUCCESS('=' * 80))

        if user_email:
            self.show_user_organizations(user_email, detailed)
        elif org_id:
            self.show_organization_employees(org_id, detailed)
        else:
            self.show_all_organizations(detailed)

    def show_all_organizations(self, detailed=False):
        """Show all organizations with employee counts"""
        organizations = Organization.objects.annotate(
            employee_count=Count('employees', filter=Q(employees__status='active')),
            vendor_count=Count('user_profiles', filter=Q(user_profiles__profile_type='vendor', user_profiles__status='active')),
            customer_count=Count('user_profiles', filter=Q(user_profiles__profile_type='customer', user_profiles__status='active'))
        ).order_by('name')

        self.stdout.write(f'\nTotal Organizations: {organizations.count()}\n')

        for org in organizations:
            self.stdout.write(self.style.SUCCESS(f'\n[ORG] {org.name} (ID: {org.id})'))
            self.stdout.write(f'  Linear Team ID: {org.linear_team_id or "Not assigned"}')
            self.stdout.write(f'  Active Employees: {org.employee_count}')
            self.stdout.write(f'  Vendors: {org.vendor_count}')
            self.stdout.write(f'  Customers: {org.customer_count}')

            if detailed:
                self.show_organization_employees(org.id, detailed=False)

    def show_organization_employees(self, org_id, detailed=False):
        """Show all employees for a specific organization"""
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Organization with ID {org_id} not found'))
            return

        self.stdout.write(self.style.SUCCESS(f'\n[ORGANIZATION] {org.name} (ID: {org.id})'))
        self.stdout.write(f'Linear Team ID: {org.linear_team_id or "Not assigned"}\n')

        # Get employees
        employees = Employee.objects.filter(
            organization=org,
            status='active'
        ).select_related('user', 'role', 'manager').order_by('first_name', 'last_name')

        if not employees.exists():
            self.stdout.write('  [INFO] No active employees found\n')
            return

        self.stdout.write(f'Active Employees: {employees.count()}\n')

        for emp in employees:
            self.stdout.write(self.style.WARNING(f'  [EMPLOYEE] {emp.full_name}'))
            self.stdout.write(f'    Email: {emp.user.email if emp.user else "N/A"}')
            self.stdout.write(f'    Job Title: {emp.job_title or "N/A"}')
            self.stdout.write(f'    Department: {emp.department or "N/A"}')
            self.stdout.write(f'    Primary Role: {emp.role.name if emp.role else "No role assigned"}')
            
            if emp.manager:
                self.stdout.write(f'    Manager: {emp.manager.full_name}')

            if detailed and emp.user:
                # Show additional roles
                additional_roles = UserRole.objects.filter(
                    user=emp.user,
                    organization=org,
                    is_active=True
                ).select_related('role')

                if additional_roles.exists():
                    self.stdout.write(f'    Additional Roles:')
                    for ur in additional_roles:
                        self.stdout.write(f'      - {ur.role.name}')

                # Show permissions
                from crmApp.utils.permissions import PermissionChecker
                checker = PermissionChecker(emp.user, org)
                perms = checker.get_all_permissions()
                
                if perms:
                    self.stdout.write(f'    Permissions ({len(perms)}):')
                    # Group by resource
                    from collections import defaultdict
                    grouped = defaultdict(list)
                    for perm in perms:
                        if '.' in perm:
                            resource, action = perm.split('.', 1)
                            grouped[resource].append(action)
                    
                    for resource in sorted(grouped.keys())[:5]:  # Show first 5
                        actions = ', '.join(sorted(grouped[resource]))
                        self.stdout.write(f'      {resource}: {actions}')
                    
                    if len(grouped) > 5:
                        self.stdout.write(f'      ... and {len(grouped) - 5} more resources')
                else:
                    self.stdout.write(f'    Permissions: None')

            self.stdout.write('')  # Empty line

    def show_user_organizations(self, user_email, detailed=False):
        """Show all organizations for a specific user"""
        from crmApp.models import User

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User with email {user_email} not found'))
            return

        self.stdout.write(self.style.SUCCESS(f'\n[USER] {user.email} ({user.full_name})'))

        # Get all profiles
        profiles = UserProfile.objects.filter(
            user=user,
            status='active'
        ).select_related('organization').order_by('profile_type')

        if not profiles.exists():
            self.stdout.write('  [INFO] No active profiles found\n')
            return

        self.stdout.write(f'\nActive Profiles: {profiles.count()}\n')

        for profile in profiles:
            self.stdout.write(self.style.WARNING(f'  [PROFILE] {profile.profile_type.upper()}'))
            if profile.organization:
                self.stdout.write(f'    Organization: {profile.organization.name} (ID: {profile.organization.id})')
                self.stdout.write(f'    Is Primary: {profile.is_primary}')

                if profile.profile_type == 'employee':
                    # Show employee details
                    try:
                        emp = Employee.objects.get(user=user, organization=profile.organization, status='active')
                        self.stdout.write(f'    Job Title: {emp.job_title or "N/A"}')
                        self.stdout.write(f'    Department: {emp.department or "N/A"}')
                        self.stdout.write(f'    Primary Role: {emp.role.name if emp.role else "No role assigned"}')

                        if detailed:
                            # Show permissions
                            from crmApp.utils.permissions import PermissionChecker
                            checker = PermissionChecker(user, profile.organization)
                            perms = checker.get_all_permissions()
                            self.stdout.write(f'    Total Permissions: {len(perms)}')
                    except Employee.DoesNotExist:
                        self.stdout.write(f'    [WARNING] Employee record not found')
            else:
                self.stdout.write(f'    Organization: Not assigned')

            self.stdout.write('')  # Empty line

