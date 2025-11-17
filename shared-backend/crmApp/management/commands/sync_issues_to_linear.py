"""
Management command to sync all unsynced issues to Linear
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import Issue, Organization
from crmApp.services.issue_linear_service import IssueLinearService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Sync all unsynced issues to Linear'

    def add_arguments(self, parser):
        parser.add_argument(
            '--organization-id',
            type=int,
            help='Sync issues for a specific organization only',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force sync even if already synced',
        )

    def handle(self, *args, **options):
        organization_id = options.get('organization_id')
        force = options.get('force', False)
        
        self.stdout.write(self.style.SUCCESS('\n' + '='*80))
        self.stdout.write(self.style.SUCCESS('SYNCING ISSUES TO LINEAR'))
        self.stdout.write(self.style.SUCCESS('='*80 + '\n'))
        
        # Get issues to sync
        if organization_id:
            try:
                organization = Organization.objects.get(id=organization_id)
                organizations = [organization]
                self.stdout.write(f"Syncing issues for organization: {organization.name} (ID: {organization_id})\n")
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Organization with ID {organization_id} not found'))
                return
        else:
            organizations = Organization.objects.filter(linear_team_id__isnull=False).exclude(linear_team_id='')
            self.stdout.write(f"Found {organizations.count()} organization(s) with Linear team ID configured\n")
        
        if not organizations.exists():
            self.stdout.write(self.style.WARNING('No organizations with Linear team ID configured'))
            return
        
        linear_service = IssueLinearService()
        total_synced = 0
        total_failed = 0
        
        for organization in organizations:
            self.stdout.write(f"\n{'-'*80}")
            self.stdout.write(f"Organization: {organization.name} (ID: {organization.id})")
            self.stdout.write(f"Linear Team ID: {organization.linear_team_id}")
            self.stdout.write(f"{'-'*80}\n")
            
            # Get unsynced issues for this organization
            if force:
                issues = Issue.objects.filter(organization=organization)
                self.stdout.write(f"Force mode: Syncing ALL issues (including already synced)")
            else:
                issues = Issue.objects.filter(
                    organization=organization,
                    synced_to_linear=False
                )
                self.stdout.write(f"Syncing unsynced issues only")
            
            issue_count = issues.count()
            self.stdout.write(f"Found {issue_count} issue(s) to sync\n")
            
            if issue_count == 0:
                self.stdout.write(self.style.WARNING('  No issues to sync'))
                continue
            
            org_synced = 0
            org_failed = 0
            
            for issue in issues:
                try:
                    self.stdout.write(f"  Syncing issue {issue.issue_number}: {issue.title[:50]}...", ending=' ')
                    
                    success, linear_data, error = linear_service.sync_issue_to_linear(
                        issue=issue,
                        team_id=organization.linear_team_id,
                        update_existing=force and issue.synced_to_linear
                    )
                    
                    if success:
                        org_synced += 1
                        total_synced += 1
                        linear_url = linear_data.get('url', 'N/A') if linear_data else 'N/A'
                        self.stdout.write(self.style.SUCCESS(f'[OK] {linear_url}'))
                    else:
                        org_failed += 1
                        total_failed += 1
                        self.stdout.write(self.style.ERROR(f'[FAILED] {error or "Unknown error"}'))
                        
                except Exception as e:
                    org_failed += 1
                    total_failed += 1
                    self.stdout.write(self.style.ERROR(f'[ERROR] {str(e)}'))
                    logger.error(f"Error syncing issue {issue.id} to Linear: {str(e)}", exc_info=True)
            
            self.stdout.write(f"\n  Summary: {org_synced} synced, {org_failed} failed\n")
        
        # Final summary
        self.stdout.write(f"\n{'='*80}")
        self.stdout.write(self.style.SUCCESS('SYNC SUMMARY'))
        self.stdout.write(f"{'='*80}\n")
        self.stdout.write(f"Total synced: {total_synced}")
        self.stdout.write(f"Total failed: {total_failed}")
        self.stdout.write(f"Total processed: {total_synced + total_failed}\n")
        
        if total_failed > 0:
            self.stdout.write(self.style.WARNING(f'Some issues failed to sync. Check logs for details.'))
        else:
            self.stdout.write(self.style.SUCCESS('All issues synced successfully!'))
        
        self.stdout.write(f"\n{'='*80}\n")

