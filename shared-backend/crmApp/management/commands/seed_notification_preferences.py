"""
Management command to seed notification preferences for existing users
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from crmApp.models import NotificationPreferences

User = get_user_model()


class Command(BaseCommand):
    help = 'Create notification preferences for all existing users'

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        existing_count = 0

        for user in users:
            prefs, created = NotificationPreferences.objects.get_or_create(
                user=user,
                defaults={
                    'email_new_lead': True,
                    'email_new_deal': True,
                    'email_deal_won': True,
                    'email_deal_lost': False,
                    'email_team_activity': True,
                    'email_weekly_summary': True,
                    'email_monthly_report': True,
                    'push_new_lead': True,
                    'push_new_deal': True,
                    'push_deal_won': True,
                    'push_deal_lost': False,
                    'push_team_activity': True,
                    'push_mentions': True,
                    'push_tasks_due': True,
                    'digest_frequency': 'daily',
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created notification preferences for {user.email}')
                )
            else:
                existing_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSummary:\n'
                f'- Created: {created_count}\n'
                f'- Already existed: {existing_count}\n'
                f'- Total users: {users.count()}'
            )
        )
