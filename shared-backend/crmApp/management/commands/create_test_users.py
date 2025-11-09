"""
Management command to create dummy test users for testing Jitsi calling functionality.
Usage: python manage.py create_test_users --count=5
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from crmApp.models import Organization, UserProfile, UserPresence
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Create dummy test users for Jitsi calling tests'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of test users to create (default: 5)'
        )
        parser.add_argument(
            '--organization',
            type=str,
            default=None,
            help='Organization name (will be created if not exists). Default: "Test Organization"'
        )
        parser.add_argument(
            '--prefix',
            type=str,
            default='testuser',
            help='Username prefix (default: testuser)'
        )

    def handle(self, *args, **options):
        count = options['count']
        prefix = options['prefix']
        org_name = options['organization'] or 'Test Organization'
        
        self.stdout.write(self.style.SUCCESS(f'\n=== Creating {count} Test Users ===\n'))
        
        # Get or create test organization
        organization, org_created = Organization.objects.get_or_create(
            name=org_name,
            defaults={
                'description': 'Organization for testing Jitsi calls',
                'phone': '+1234567890',
                'email': 'test@example.com',
                'website': 'https://test.example.com',
                'address': '123 Test Street',
            }
        )
        
        if org_created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created organization: {org_name}'))
        else:
            self.stdout.write(self.style.WARNING(f'✓ Using existing organization: {org_name}'))
        
        # Presence status options
        status_choices = ['online', 'busy', 'away', 'offline']
        status_messages = {
            'online': ['Available', 'Ready to help', 'At my desk'],
            'busy': ['In a meeting', 'Do not disturb', 'Focused work'],
            'away': ['On a break', 'Be back soon', 'Lunch time'],
            'offline': ['', '', ''],
        }
        
        created_users = []
        
        for i in range(1, count + 1):
            username = f'{prefix}{i}'
            email = f'{username}@example.com'
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f'✗ User {username} already exists, skipping...'))
                continue
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password='testpass123',  # Simple password for testing
                first_name=f'Test',
                last_name=f'User {i}',
            )
            
            # Create employee profile for the user
            profile = UserProfile.objects.create(
                user=user,
                organization=organization,
                profile_type='employee',  # Employee profile type
                is_primary=True,
                status='active',
            )
            
            # Create user presence with varied statuses
            status = status_choices[i % len(status_choices)]
            status_message = random.choice(status_messages[status])
            
            presence = UserPresence.objects.create(
                user=user,
                status=status,
                available_for_calls=(status in ['online']),  # Only online users are available
                status_message=status_message,
            )
            
            created_users.append({
                'username': username,
                'email': email,
                'status': status,
                'available': presence.available_for_calls,
            })
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Created: {username} | Email: {email} | Status: {status} | '
                    f'Available: {"Yes" if presence.available_for_calls else "No"}'
                )
            )
        
        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n=== Summary ==='))
        self.stdout.write(self.style.SUCCESS(f'Organization: {org_name}'))
        self.stdout.write(self.style.SUCCESS(f'Users created: {len(created_users)}'))
        self.stdout.write(self.style.SUCCESS(f'Password for all test users: testpass123'))
        
        # Show online users
        online_users = [u for u in created_users if u['status'] == 'online']
        if online_users:
            self.stdout.write(self.style.SUCCESS(f'\n=== Online & Available Users ==='))
            for user in online_users:
                self.stdout.write(self.style.SUCCESS(f"  • {user['username']} ({user['email']})"))
        
        self.stdout.write(self.style.SUCCESS('\n=== Login Instructions ==='))
        self.stdout.write('1. Use any username above with password: testpass123')
        self.stdout.write('2. POST to /api/login/ with username and password')
        self.stdout.write('3. Use the returned token in Authorization header')
        self.stdout.write('4. Call /api/user-presence/online_users/ to see available users')
        self.stdout.write('5. Call /api/jitsi-calls/initiate_call/ to start a call')
        self.stdout.write(self.style.SUCCESS('\n✓ Test users ready for Jitsi calling!\n'))
