#!/usr/bin/env python
"""Django management command to fix admin user"""
from django.core.management.base import BaseCommand
from crmApp.models import User, Organization, UserProfile
from django.contrib.auth import authenticate

class Command(BaseCommand):
    help = 'Fix admin user login credentials'

    def handle(self, *args, **options):
        # Try to get or create admin user
        admin_user = None
        
        # Try admin@crm.com
        try:
            admin_user = User.objects.get(email='admin@crm.com')
            self.stdout.write(self.style.SUCCESS(f'Found user: {admin_user.email}'))
        except User.DoesNotExist:
            # Try admin@test.com
            try:
                admin_user = User.objects.get(email='admin@test.com')
                admin_user.email = 'admin@crm.com'
                admin_user.save()
                self.stdout.write(self.style.SUCCESS(f'Updated user email to: {admin_user.email}'))
            except User.DoesNotExist:
                # Create new user
                admin_user = User.objects.create_user(
                    email='admin@crm.com',
                    username=f'admin_crm_{User.objects.count()}',
                    password='admin123',
                    first_name='Admin',
                    last_name='User',
                    is_active=True,
                    is_staff=True,
                )
                self.stdout.write(self.style.SUCCESS(f'Created user: {admin_user.email}'))

        # Set password
        admin_user.set_password('admin123')
        admin_user.is_active = True
        admin_user.save()
        self.stdout.write(self.style.SUCCESS('Password set to: admin123'))

        # Verify password works
        auth_user = authenticate(email='admin@crm.com', password='admin123')
        if auth_user:
            self.stdout.write(self.style.SUCCESS('✓ Password verification successful'))
        else:
            self.stdout.write(self.style.ERROR('✗ Password verification failed'))

        # Get or create organization
        org, org_created = Organization.objects.get_or_create(
            name='Admin Organization',
            defaults={'slug': 'admin-org'}
        )
        self.stdout.write(self.style.SUCCESS(f'Organization: {org.name}'))

        # Get or update profile
        existing_profile = UserProfile.objects.filter(
            user=admin_user,
            profile_type='vendor'
        ).first()

        if existing_profile:
            existing_profile.organization = org
            existing_profile.is_primary = True
            existing_profile.status = 'active'
            existing_profile.save()
            self.stdout.write(self.style.SUCCESS('Profile updated'))
        else:
            profile = UserProfile.objects.create(
                user=admin_user,
                organization=org,
                profile_type='vendor',
                is_primary=True,
                status='active'
            )
            self.stdout.write(self.style.SUCCESS('Profile created'))

        self.stdout.write(self.style.SUCCESS('\n✅ Setup complete!'))
        self.stdout.write(f'Email: {admin_user.email}')
        self.stdout.write(f'Password: admin123')

