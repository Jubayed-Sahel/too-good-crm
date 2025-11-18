"""
Management command to assign Linear team IDs to organizations that don't have one.
This ensures all organizations have Linear integration configured.
"""
from django.core.management.base import BaseCommand
from django.conf import settings
import os
import logging

from crmApp.models import Organization
from crmApp.services.linear_service import LinearService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Assign Linear team IDs to organizations that don\'t have one'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        # Check if Linear API key is configured
        linear_api_key = getattr(settings, 'LINEAR_API_KEY', None) or os.getenv('LINEAR_API_KEY', '')
        
        if not linear_api_key:
            self.stdout.write(self.style.ERROR(
                'LINEAR_API_KEY not configured!\n'
                'Please set LINEAR_API_KEY in your .env file or environment variables.\n'
                'Get your API key from: https://linear.app/settings/api'
            ))
            return
        
        # Get default team ID from settings
        default_team_id = getattr(settings, 'LINEAR_TEAM_ID', None)
        
        # Get organizations without Linear team ID
        organizations = Organization.objects.filter(
            linear_team_id__isnull=True
        ) | Organization.objects.filter(linear_team_id='')
        
        count = organizations.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('All organizations already have Linear team IDs configured.'))
            return
        
        self.stdout.write(f'Found {count} organization(s) without Linear team ID.')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Try to get teams from Linear API
        linear_service = LinearService(api_key=linear_api_key)
        teams = []
        
        try:
            teams = linear_service.get_teams()
            if teams:
                self.stdout.write(f'Found {len(teams)} Linear team(s) available.')
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Failed to fetch Linear teams: {str(e)}'))
        
        # Assign team IDs
        assigned_count = 0
        failed_count = 0
        
        for organization in organizations:
            team_id = None
            
            # Try default from settings first
            if default_team_id:
                team_id = default_team_id
                self.stdout.write(
                    f'Using default LINEAR_TEAM_ID from settings for organization "{organization.name}"'
                )
            elif teams and len(teams) > 0:
                # Use first available team
                team_id = teams[0]['id']
                self.stdout.write(
                    f'Using first available Linear team "{teams[0].get("name", "N/A")}" '
                    f'for organization "{organization.name}"'
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'No Linear team ID available for organization "{organization.name}" '
                        f'(ID: {organization.id})'
                    )
                )
                failed_count += 1
                continue
            
            if not dry_run and team_id:
                try:
                    organization.linear_team_id = team_id
                    organization.save(update_fields=['linear_team_id'])
                    assigned_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'[OK] Assigned Linear team ID {team_id} to organization "{organization.name}" (ID: {organization.id})'
                        )
                    )
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'[ERROR] Failed to assign Linear team ID to organization "{organization.name}": {str(e)}'
                        )
                    )
                    failed_count += 1
            elif dry_run and team_id:
                self.stdout.write(
                    self.style.WARNING(
                        f'[DRY RUN] Would assign Linear team ID {team_id} to organization "{organization.name}" (ID: {organization.id})'
                    )
                )
        
        # Summary
        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN SUMMARY'))
        else:
            self.stdout.write(self.style.SUCCESS('ASSIGNMENT SUMMARY'))
        self.stdout.write('='*50)
        self.stdout.write(f'Total organizations processed: {count}')
        if not dry_run:
            self.stdout.write(f'Successfully assigned: {assigned_count}')
            self.stdout.write(f'Failed: {failed_count}')
        self.stdout.write('='*50)

