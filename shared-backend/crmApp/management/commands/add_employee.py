"""
Management command to quickly add an employee to an organization
Usage: python manage.py add_employee <email> <organization_id>
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction

from crmApp.models import UserProfile, UserOrganization, Organization, Employee

User = get_user_model()


class Command(BaseCommand):
    help = 'Add a user as an employee to an organization'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email of the user to add as employee')
        parser.add_argument('organization_id', type=int, help='Organization ID')

    def handle(self, *args, **options):
        email = options['email']
        organization_id = options['organization_id']

        # Get user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CommandError(f'User with email "{email}" does not exist')

        # Get organization
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            raise CommandError(f'Organization with ID {organization_id} does not exist')

        # Check if already employee
        existing_profile = UserProfile.objects.filter(
            user=user,
            organization=organization,
            profile_type='employee'
        ).first()

        if existing_profile:
            if existing_profile.status == 'active':
                self.stdout.write(
                    self.style.WARNING(f'{email} is already an active employee of {organization.name}')
                )
                return
            else:
                # Reactivate
                existing_profile.activate()
                self.stdout.write(
                    self.style.SUCCESS(f'Reactivated employee profile for {email}')
                )
                return

        with transaction.atomic():
            # Create employee profile
            employee_profile = UserProfile.objects.create(
                user=user,
                organization=organization,
                profile_type='employee',
                is_primary=False,
                status='active',
                activated_at=timezone.now()
            )

            # Link user to organization
            user_org, created = UserOrganization.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    'is_active': True,
                    'invitation_accepted_at': timezone.now()
                }
            )

            if not created:
                user_org.is_active = True
                user_org.save()

            # Create Employee record
            Employee.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    'email': user.email,
                    'first_name': user.first_name or '',
                    'last_name': user.last_name or '',
                    'status': 'active'
                }
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully added {email} as an employee of {organization.name}'
            )
        )
        self.stdout.write(f'User now has the following profiles:')
        for profile in UserProfile.objects.filter(user=user, status='active'):
            primary = ' (PRIMARY)' if profile.is_primary else ''
            self.stdout.write(
                f'  - {profile.get_profile_type_display()} at {profile.organization.name}{primary}'
            )
