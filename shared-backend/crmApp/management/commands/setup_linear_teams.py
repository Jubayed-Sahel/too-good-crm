"""
Management command to set up unique Linear teams for each organization.

This command helps configure Linear integration by:
1. Listing all available Linear teams
2. Allowing assignment of specific teams to organizations
3. Ensuring each organization has its own Linear team for proper isolation

Usage:
    python manage.py setup_linear_teams
    python manage.py setup_linear_teams --list-teams
    python manage.py setup_linear_teams --assign <org_id> <team_id>
"""

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from crmApp.models import Organization
from crmApp.services.linear_service import LinearService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Set up unique Linear teams for each organization'

    def add_arguments(self, parser):
        parser.add_argument(
            '--list-teams',
            action='store_true',
            help='List all available Linear teams',
        )
        parser.add_argument(
            '--list-orgs',
            action='store_true',
            help='List all organizations and their Linear team assignments',
        )
        parser.add_argument(
            '--assign',
            nargs=2,
            metavar=('ORG_ID', 'TEAM_ID'),
            help='Assign a Linear team to an organization',
        )
        parser.add_argument(
            '--clear',
            type=int,
            metavar='ORG_ID',
            help='Clear Linear team assignment for an organization',
        )

    def handle(self, *args, **options):
        # Check if Linear API key is configured
        if not settings.LINEAR_API_KEY:
            raise CommandError(
                'LINEAR_API_KEY is not configured. '
                'Please set it in your .env file or environment variables.'
            )

        linear_service = LinearService()

        # List all Linear teams
        if options['list_teams']:
            self.list_linear_teams(linear_service)
            return

        # List all organizations
        if options['list_orgs']:
            self.list_organizations()
            return

        # Assign team to organization
        if options['assign']:
            org_id, team_id = options['assign']
            self.assign_team_to_org(org_id, team_id)
            return

        # Clear team assignment
        if options['clear']:
            self.clear_team_assignment(options['clear'])
            return

        # Default: Show interactive menu
        self.interactive_setup(linear_service)

    def list_linear_teams(self, linear_service):
        """List all available Linear teams"""
        self.stdout.write(self.style.SUCCESS('\n=== Available Linear Teams ===\n'))
        
        try:
            teams = linear_service.get_teams()
            
            if not teams:
                self.stdout.write(self.style.WARNING('No teams found in Linear workspace.'))
                return
            
            for team in teams:
                self.stdout.write(
                    f"  • {self.style.SUCCESS(team['name'])} "
                    f"({team['key']})\n"
                    f"    ID: {self.style.WARNING(team['id'])}\n"
                )
            
            self.stdout.write(f"\nTotal teams: {len(teams)}\n")
            
        except Exception as e:
            raise CommandError(f'Failed to fetch Linear teams: {str(e)}')

    def list_organizations(self):
        """List all organizations and their Linear team assignments"""
        self.stdout.write(self.style.SUCCESS('\n=== Organizations and Linear Teams ===\n'))
        
        organizations = Organization.objects.all().order_by('name')
        
        if not organizations:
            self.stdout.write(self.style.WARNING('No organizations found.'))
            return
        
        for org in organizations:
            status = '[OK]' if org.linear_team_id else '[NO]'
            color = self.style.SUCCESS if org.linear_team_id else self.style.ERROR
            
            self.stdout.write(
                f"  {status} {color(org.name)} (ID: {org.id})\n"
                f"    Linear Team ID: {org.linear_team_id or 'Not assigned'}\n"
            )
        
        # Summary
        assigned_count = organizations.filter(linear_team_id__isnull=False).count()
        total_count = organizations.count()
        
        self.stdout.write(
            f"\n{assigned_count}/{total_count} organizations have Linear teams assigned.\n"
        )
        
        # Check for duplicate team IDs
        from django.db.models import Count
        duplicates = Organization.objects.values('linear_team_id').annotate(
            count=Count('id')
        ).filter(count__gt=1, linear_team_id__isnull=False)
        
        if duplicates:
            self.stdout.write(
                self.style.WARNING(
                    f"\n[WARNING] {len(duplicates)} Linear team(s) are shared by multiple organizations:"
                )
            )
            for dup in duplicates:
                orgs = Organization.objects.filter(linear_team_id=dup['linear_team_id'])
                org_names = ', '.join([org.name for org in orgs])
                self.stdout.write(
                    f"  • Team ID {dup['linear_team_id']}: {org_names}"
                )
            self.stdout.write(
                self.style.WARNING(
                    "\nFor proper isolation, each organization should have its own Linear team.\n"
                )
            )

    def assign_team_to_org(self, org_id, team_id):
        """Assign a Linear team to an organization"""
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f'Organization with ID {org_id} does not exist.')
        
        # Check if team ID is already used
        existing_org = Organization.objects.filter(
            linear_team_id=team_id
        ).exclude(id=org_id).first()
        
        if existing_org:
            self.stdout.write(
                self.style.WARNING(
                    f'\n[WARNING] Linear team {team_id} is already assigned to '
                    f'"{existing_org.name}".\n'
                    f'Assigning the same team to multiple organizations will cause '
                    f'issues to be shared between them.\n'
                )
            )
            confirm = input('Do you want to continue? (yes/no): ')
            if confirm.lower() not in ['yes', 'y']:
                self.stdout.write('Assignment cancelled.')
                return
        
        org.linear_team_id = team_id
        org.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n[SUCCESS] Assigned Linear team {team_id} to "{org.name}".\n'
            )
        )

    def clear_team_assignment(self, org_id):
        """Clear Linear team assignment for an organization"""
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f'Organization with ID {org_id} does not exist.')
        
        if not org.linear_team_id:
            self.stdout.write(
                self.style.WARNING(
                    f'Organization "{org.name}" does not have a Linear team assigned.'
                )
            )
            return
        
        old_team_id = org.linear_team_id
        org.linear_team_id = None
        org.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\n[SUCCESS] Cleared Linear team assignment ({old_team_id}) from "{org.name}".\n'
            )
        )

    def interactive_setup(self, linear_service):
        """Interactive setup wizard"""
        self.stdout.write(
            self.style.SUCCESS('\n=== Linear Teams Setup Wizard ===\n')
        )
        
        # Show current status
        self.list_organizations()
        
        self.stdout.write('\nOptions:')
        self.stdout.write('  1. List available Linear teams')
        self.stdout.write('  2. Assign team to organization')
        self.stdout.write('  3. Clear team assignment')
        self.stdout.write('  4. Exit')
        
        choice = input('\nSelect an option (1-4): ')
        
        if choice == '1':
            self.list_linear_teams(linear_service)
        elif choice == '2':
            org_id = input('Enter organization ID: ')
            team_id = input('Enter Linear team ID: ')
            self.assign_team_to_org(org_id, team_id)
        elif choice == '3':
            org_id = input('Enter organization ID: ')
            self.clear_team_assignment(int(org_id))
        elif choice == '4':
            self.stdout.write('Goodbye!')
        else:
            self.stdout.write(self.style.ERROR('Invalid option.'))

