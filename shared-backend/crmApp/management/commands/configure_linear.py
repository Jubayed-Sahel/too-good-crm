"""
Django management command to configure Linear integration for organizations.
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Organization
from crmApp.services.linear_service import LinearService
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Configure Linear integration for organizations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--organization-id',
            type=int,
            help='Organization ID to configure Linear for',
        )
        parser.add_argument(
            '--organization-name',
            type=str,
            help='Organization name to configure Linear for',
        )
        parser.add_argument(
            '--team-id',
            type=str,
            help='Linear team ID (optional, will fetch if not provided)',
        )
        parser.add_argument(
            '--list-teams',
            action='store_true',
            help='List all available Linear teams',
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test Linear integration by creating a test issue',
        )

    def handle(self, *args, **options):
        # Check if Linear API key is configured
        linear_api_key = getattr(settings, 'LINEAR_API_KEY', None) or os.getenv('LINEAR_API_KEY', '')
        
        if not linear_api_key:
            self.stdout.write(self.style.ERROR(
                'LINEAR_API_KEY not configured!\n'
                'Please set LINEAR_API_KEY in your .env file or environment variables.\n'
                'Get your API key from: https://linear.app/settings/api'
            ))
            return
        
        linear_service = LinearService(api_key=linear_api_key)
        
        # List teams if requested
        if options['list_teams']:
            self.list_teams(linear_service)
            return
        
        # Get organization
        organization = None
        if options['organization_id']:
            try:
                organization = Organization.objects.get(id=options['organization_id'])
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(
                    f'Organization with ID {options["organization_id"]} not found'
                ))
                return
        elif options['organization_name']:
            try:
                organization = Organization.objects.get(name=options['organization_name'])
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(
                    f'Organization "{options["organization_name"]}" not found'
                ))
                return
        else:
            # List all organizations and let user choose
            organizations = Organization.objects.filter(is_active=True)
            if not organizations.exists():
                self.stdout.write(self.style.ERROR('No active organizations found'))
                return
            
            self.stdout.write(self.style.SUCCESS('\nAvailable Organizations:'))
            for org in organizations:
                linear_status = 'Configured' if org.linear_team_id else 'Not configured'
                self.stdout.write(f'  {org.id}. {org.name} - {linear_status}')
            
            org_id = input('\nEnter organization ID to configure: ')
            try:
                organization = Organization.objects.get(id=int(org_id))
            except (Organization.DoesNotExist, ValueError):
                self.stdout.write(self.style.ERROR('Invalid organization ID'))
                return
        
        # Get team ID
        team_id = options['team_id']
        if not team_id:
            # Fetch teams and let user choose
            teams = self.get_teams(linear_service)
            if not teams:
                self.stdout.write(self.style.ERROR('No teams found. Please create a team in Linear first.'))
                return
            
            self.stdout.write(self.style.SUCCESS('\nAvailable Linear Teams:'))
            for i, team in enumerate(teams, 1):
                self.stdout.write(f'  {i}. {team["name"]} (ID: {team["id"]})')
            
            team_choice = input('\nEnter team number to use: ')
            try:
                team_index = int(team_choice) - 1
                team_id = teams[team_index]['id']
            except (ValueError, IndexError):
                self.stdout.write(self.style.ERROR('Invalid team selection'))
                return
        
        # Configure organization
        with transaction.atomic():
            organization.linear_team_id = team_id
            organization.save()
            
            self.stdout.write(self.style.SUCCESS(
                f'Configured Linear team ID for organization: {organization.name}'
            ))
            self.stdout.write(self.style.SUCCESS(f'   Team ID: {team_id}'))
        
        # Test integration if requested
        if options['test']:
            self.test_integration(linear_service, organization, team_id)

    def get_teams(self, linear_service):
        """Get list of Linear teams."""
        try:
            # Use the LinearService's get_teams method
            teams = linear_service.get_teams()
            return teams
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to fetch teams: {str(e)}'))
            import traceback
            self.stdout.write(self.style.ERROR(traceback.format_exc()))
            return []

    def list_teams(self, linear_service):
        """List all Linear teams."""
        self.stdout.write(self.style.SUCCESS('\nFetching Linear teams...\n'))
        
        try:
            # Get viewer info for display
            viewer = linear_service.get_viewer()
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(self.style.SUCCESS('YOUR LINEAR ACCOUNT'))
            self.stdout.write(self.style.SUCCESS('=' * 60))
            self.stdout.write(f"Name: {viewer.get('name', 'N/A')}")
            self.stdout.write(f"Email: {viewer.get('email', 'N/A')}")
            if viewer.get('organization'):
                self.stdout.write(f"Organization: {viewer['organization'].get('name', 'N/A')}")
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not fetch viewer info: {str(e)}'))
        
        teams = self.get_teams(linear_service)
        
        if not teams:
            self.stdout.write(self.style.ERROR('\nNo teams found'))
            self.stdout.write(self.style.WARNING('Please create a team in Linear first.'))
            return
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS('AVAILABLE LINEAR TEAMS'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        for i, team in enumerate(teams, 1):
            self.stdout.write(f'\n{i}. {team["name"]}')
            self.stdout.write(f'   Team ID: {team["id"]}')
            self.stdout.write(f'   Team Key: {team["key"]}')
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 60))
        self.stdout.write(self.style.SUCCESS(
            '\nTo configure an organization with a team, run:\n'
            'python manage.py configure_linear --organization-name "Org Name" --team-id "TEAM_ID"\n'
            '\nOr run interactively:\n'
            'python manage.py configure_linear'
        ))

    def test_integration(self, linear_service, organization, team_id):
        """Test Linear integration by creating a test issue."""
        self.stdout.write(self.style.SUCCESS('\nTesting Linear integration...\n'))
        
        try:
            test_issue = linear_service.create_issue(
                team_id=team_id,
                title='Test Issue - Linear Integration',
                description='This is a test issue to verify Linear integration is working correctly.',
                priority=3  # Normal priority
            )
            
            self.stdout.write(self.style.SUCCESS('Test issue created successfully!'))
            self.stdout.write(self.style.SUCCESS(f'   Issue ID: {test_issue["id"]}'))
            self.stdout.write(self.style.SUCCESS(f'   Issue URL: {test_issue["url"]}'))
            self.stdout.write(self.style.SUCCESS(
                '\nLinear integration is working correctly!'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'\nNext steps:\n'
                f'   1. Issues raised by customers will automatically sync to Linear\n'
                f'   2. Status changes will sync to Linear automatically\n'
                f'   3. View issues in Linear: {test_issue["url"]}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Test failed: {str(e)}'))
            self.stdout.write(self.style.WARNING(
                'Please check your Linear API key and team ID'
            ))

