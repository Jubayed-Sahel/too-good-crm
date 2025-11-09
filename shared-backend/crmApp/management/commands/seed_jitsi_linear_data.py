"""
Django management command to seed test data for Jitsi calls and Linear issue management.

This command creates:
- Test users (customer, vendor, employee) with all profiles
- Organizations with Linear team IDs configured
- UserPresence records for Jitsi calls
- Sample issues ready for Linear sync
- Sample Jitsi call sessions for testing

Usage:
    python manage.py seed_jitsi_linear_data [--linear-team-id TEAM_ID] [--linear-api-key API_KEY]
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.hashers import make_password
from django.conf import settings
import os

from crmApp.models import (
    User, Organization, UserProfile, Customer, Vendor, Employee,
    Role, Permission, RolePermission, Issue, UserPresence, JitsiCallSession
)


class Command(BaseCommand):
    help = 'Seed test data for Jitsi calls and Linear issue management'

    def add_arguments(self, parser):
        parser.add_argument(
            '--linear-team-id',
            type=str,
            help='Linear team ID to configure for organizations (optional)',
        )
        parser.add_argument(
            '--linear-api-key',
            type=str,
            help='Linear API key (optional, will use LINEAR_API_KEY from env if not provided)',
        )
        parser.add_argument(
            '--jitsi-server',
            type=str,
            default='meet.jit.si',
            help='Jitsi server URL (default: meet.jit.si)',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        """Create seed data for Jitsi and Linear integration."""
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('Seeding Jitsi Calls & Linear Issue Management Test Data'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        # Get Linear team ID from options or environment
        linear_team_id = options.get('linear_team_id') or os.getenv('LINEAR_TEAM_ID')
        linear_api_key = options.get('linear_api_key') or getattr(settings, 'LINEAR_API_KEY', '')
        jitsi_server = options.get('jitsi_server', 'meet.jit.si')
        
        if linear_team_id:
            self.stdout.write(self.style.SUCCESS(f'[OK] Linear Team ID: {linear_team_id}'))
        else:
            self.stdout.write(self.style.WARNING('[WARN] Linear Team ID not provided - Linear sync will be disabled'))
        
        if linear_api_key:
            self.stdout.write(self.style.SUCCESS(f'[OK] Linear API Key: {"*" * 20}...{linear_api_key[-4:]}'))
        else:
            self.stdout.write(self.style.WARNING('[WARN] Linear API Key not found - Linear sync will fail'))
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Jitsi Server: {jitsi_server}'))
        
        # ========================================================================
        # 1. CREATE TEST ORGANIZATION WITH LINEAR CONFIGURATION
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('1. Creating/Updating Test Organization'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        test_org, org_created = Organization.objects.get_or_create(
            name='Test Organization',
            defaults={
                'slug': 'test-org',
                'email': 'test@testorg.com',
                'phone': '+1234567890',
                'is_active': True,
            }
        )
        
        # Update organization with Linear team ID if provided
        if linear_team_id:
            test_org.linear_team_id = linear_team_id
            test_org.save()
            self.stdout.write(self.style.SUCCESS(f'[OK] Configured Linear Team ID for organization: {test_org.name}'))
        
        if org_created:
            self.stdout.write(self.style.SUCCESS(f'[OK] Created organization: {test_org.name}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'[OK] Using existing organization: {test_org.name}'))
        
        # ========================================================================
        # 2. CREATE CUSTOMER USER WITH PROFILE AND PRESENCE
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('2. Creating Customer User'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        customer_user, customer_user_created = User.objects.get_or_create(
            email='customer@test.com',
            defaults={
                'username': 'test_customer',
                'first_name': 'John',
                'last_name': 'Customer',
                'password': make_password('customer123'),
                'is_active': True,
                'is_verified': True,
            }
        )
        
        if not customer_user_created:
            customer_user.password = make_password('customer123')
            customer_user.save()
        
        # Create customer profile
        customer_profile, _ = UserProfile.objects.get_or_create(
            user=customer_user,
            profile_type='customer',
            defaults={
                'organization': test_org,
                'is_primary': True,
                'status': 'active',
                'activated_at': timezone.now(),
            }
        )
        customer_profile.organization = test_org
        customer_profile.status = 'active'
        customer_profile.save()
        
        # Create customer record
        customer, _ = Customer.objects.get_or_create(
            user=customer_user,
            organization=test_org,
            defaults={
                'name': 'John Customer',
                'first_name': 'John',
                'last_name': 'Customer',
                'email': customer_user.email,
                'phone': '+1234567890',
                'customer_type': 'individual',
                'status': 'active',
                'user_profile': customer_profile,
            }
        )
        customer.user_profile = customer_profile
        customer.save()
        
        # Create UserPresence for Jitsi calls
        customer_presence, presence_created = UserPresence.objects.get_or_create(
            user=customer_user,
            defaults={
                'status': 'online',
                'available_for_calls': True,
                'status_message': 'Available for calls',
            }
        )
        if presence_created:
            self.stdout.write(self.style.SUCCESS(f'[OK] Created UserPresence for customer: {customer_user.email}'))
        else:
            customer_presence.status = 'online'
            customer_presence.available_for_calls = True
            customer_presence.save()
            self.stdout.write(self.style.SUCCESS(f'[OK] Updated UserPresence for customer: {customer_user.email}'))
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Customer user: {customer_user.email} (Password: customer123)'))
        
        # ========================================================================
        # 3. CREATE VENDOR USER WITH PROFILE AND PRESENCE
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('3. Creating Vendor User'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        vendor_user, vendor_user_created = User.objects.get_or_create(
            email='vendor@test.com',
            defaults={
                'username': 'test_vendor',
                'first_name': 'Jane',
                'last_name': 'Vendor',
                'password': make_password('vendor123'),
                'is_active': True,
                'is_verified': True,
            }
        )
        
        if not vendor_user_created:
            vendor_user.password = make_password('vendor123')
            vendor_user.save()
        
        # Create vendor profile
        vendor_profile, _ = UserProfile.objects.get_or_create(
            user=vendor_user,
            profile_type='vendor',
            defaults={
                'organization': test_org,
                'is_primary': True,
                'status': 'active',
                'activated_at': timezone.now(),
            }
        )
        vendor_profile.organization = test_org
        vendor_profile.status = 'active'
        vendor_profile.save()
        
        # Create vendor record
        vendor, _ = Vendor.objects.get_or_create(
            user=vendor_user,
            organization=test_org,
            defaults={
                'name': 'Jane Vendor',
                'company_name': 'Vendor Company',
                'email': vendor_user.email,
                'phone': '+1234567891',
                'vendor_type': 'supplier',
                'status': 'active',
                'user_profile': vendor_profile,
            }
        )
        vendor.user_profile = vendor_profile
        vendor.save()
        
        # Create UserPresence for Jitsi calls
        vendor_presence, _ = UserPresence.objects.get_or_create(
            user=vendor_user,
            defaults={
                'status': 'online',
                'available_for_calls': True,
                'status_message': 'Available for calls',
            }
        )
        vendor_presence.status = 'online'
        vendor_presence.available_for_calls = True
        vendor_presence.save()
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Vendor user: {vendor_user.email} (Password: vendor123)'))
        
        # ========================================================================
        # 4. CREATE EMPLOYEE USER WITH PROFILE, ROLE, AND PRESENCE
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('4. Creating Employee User'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        employee_user, employee_user_created = User.objects.get_or_create(
            email='employee@test.com',
            defaults={
                'username': 'test_employee',
                'first_name': 'Bob',
                'last_name': 'Employee',
                'password': make_password('employee123'),
                'is_active': True,
                'is_verified': True,
            }
        )
        
        if not employee_user_created:
            employee_user.password = make_password('employee123')
            employee_user.save()
        
        # Create employee profile
        employee_profile, _ = UserProfile.objects.get_or_create(
            user=employee_user,
            profile_type='employee',
            defaults={
                'organization': test_org,
                'is_primary': False,
                'status': 'active',
                'activated_at': timezone.now(),
            }
        )
        employee_profile.organization = test_org
        employee_profile.status = 'active'
        employee_profile.save()
        
        # Create employee record
        employee, _ = Employee.objects.get_or_create(
            user=employee_user,
            organization=test_org,
            defaults={
                'first_name': 'Bob',
                'last_name': 'Employee',
                'email': employee_user.email,
                'phone': '+1234567892',
                'job_title': 'Support Manager',
                'department': 'Customer Support',
                'employment_type': 'full-time',
                'status': 'active',
                'hire_date': timezone.now().date(),
                'user_profile': employee_profile,
            }
        )
        employee.user_profile = employee_profile
        employee.save()
        
        # Create UserPresence for Jitsi calls
        employee_presence, _ = UserPresence.objects.get_or_create(
            user=employee_user,
            defaults={
                'status': 'online',
                'available_for_calls': True,
                'status_message': 'Available for calls',
            }
        )
        employee_presence.status = 'online'
        employee_presence.available_for_calls = True
        employee_presence.save()
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Employee user: {employee_user.email} (Password: employee123)'))
        
        # ========================================================================
        # 5. CREATE ROLE AND PERMISSIONS FOR EMPLOYEE
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('5. Creating Role and Permissions'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        from django.utils.text import slugify
        
        # Create Support Manager role
        support_role, _ = Role.objects.get_or_create(
            slug=slugify('Support Manager'),
            organization=test_org,
            defaults={
                'name': 'Support Manager',
                'description': 'Can manage and resolve customer issues',
                'is_active': True,
            }
        )
        
        # Assign role to employee
        employee.role = support_role
        employee.save()
        
        # Create issue permissions
        issue_permissions = [
            ('issue', 'read'),
            ('issue', 'update'),
            ('issue', 'delete'),
            ('issue', 'create'),
        ]
        
        for resource, action in issue_permissions:
            permission, _ = Permission.objects.get_or_create(
                organization=test_org,
                resource=resource,
                action=action,
                defaults={
                    'description': f'Can {action} {resource}',
                }
            )
            
            # Add permission to role
            RolePermission.objects.get_or_create(
                role=support_role,
                permission=permission
            )
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Created role: {support_role.name} with permissions'))
        
        # ========================================================================
        # 6. CREATE SAMPLE ISSUES (READY FOR LINEAR SYNC)
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('6. Creating Sample Issues'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        sample_issues = [
            {
                'title': 'Product delivery delayed',
                'description': 'My order was supposed to arrive yesterday but it has not been delivered yet. Order number: ORD-001.',
                'priority': 'high',
                'category': 'delivery',
                'status': 'open',
            },
            {
                'title': 'Quality issue with product',
                'description': 'The product I received has a defect. The packaging was damaged and the item inside is broken.',
                'priority': 'medium',
                'category': 'quality',
                'status': 'open',
            },
            {
                'title': 'Billing question',
                'description': 'I have a question about my recent invoice. Can someone clarify the charges? Invoice #INV-2025-001',
                'priority': 'low',
                'category': 'billing',
                'status': 'in_progress',
            },
            {
                'title': 'Payment processing error',
                'description': 'When I try to complete my purchase, the payment processing fails with an error message. The credit card is valid.',
                'priority': 'high',
                'category': 'billing',
                'status': 'open',
            },
            {
                'title': 'Website login not working',
                'description': 'I cannot log in to my account. The login page shows an error message after entering credentials.',
                'priority': 'urgent',
                'category': 'technical',
                'status': 'open',
            },
        ]
        
        created_issues = []
        for issue_data in sample_issues:
            # Check if issue already exists
            existing_issue = Issue.objects.filter(
                organization=test_org,
                title=issue_data['title'],
                raised_by_customer=customer
            ).first()
            
            if existing_issue:
                self.stdout.write(self.style.WARNING(f'  [SKIP] Skipping existing issue: {issue_data["title"]}'))
                created_issues.append(existing_issue)
                continue
            
            issue = Issue.objects.create(
                organization=test_org,
                title=issue_data['title'],
                description=issue_data['description'],
                priority=issue_data['priority'],
                category=issue_data['category'],
                status=issue_data['status'],
                is_client_issue=True,
                raised_by_customer=customer,
                created_by=customer_user,
                linear_team_id=linear_team_id if linear_team_id else None,
            )
            
            created_issues.append(issue)
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created issue: {issue.issue_number} - {issue.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'[OK] Total issues: {len(created_issues)}'))
        
        # ========================================================================
        # 7. CREATE SAMPLE JITSI CALL SESSIONS
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('7. Creating Sample Jitsi Call Sessions'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        from crmApp.services.jitsi_service import JitsiService
        import uuid
        
        jitsi_service = JitsiService()
        jitsi_service.jitsi_server = jitsi_server
        
        # Create a completed call session (for testing call history)
        # Only create if it doesn't exist to avoid duplicates
        completed_room_name = f'crm-test-completed-{test_org.id}'
        completed_call, call_created = JitsiCallSession.objects.get_or_create(
            room_name=completed_room_name,
            defaults={
                'call_type': 'video',
                'status': 'completed',
                'initiator': vendor_user,
                'recipient': customer_user,
                'participants': [vendor_user.id, customer_user.id],
                'organization': test_org,
                'jitsi_server': jitsi_server,
                'started_at': timezone.now() - timezone.timedelta(hours=2),
                'ended_at': timezone.now() - timezone.timedelta(hours=1, minutes=55),
                'duration_seconds': 300,  # 5 minutes
                'notes': 'Test call session for customer support',
            }
        )
        
        if call_created:
            self.stdout.write(self.style.SUCCESS(f'  [OK] Created completed call: {completed_call.room_name}'))
        else:
            self.stdout.write(self.style.WARNING(f'  [SKIP] Completed call already exists: {completed_call.room_name}'))
        
        # Don't create pending calls by default - they should be created dynamically
        # But ensure presences are set up correctly
        self.stdout.write(self.style.SUCCESS(f'  [OK] UserPresence records configured for all users'))
        self.stdout.write(self.style.SUCCESS(f'  [OK] All users are online and available for calls'))
        
        # ========================================================================
        # 8. VERIFY DATABASE SETUP
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '-' * 80))
        self.stdout.write(self.style.SUCCESS('8. Verifying Database Setup'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        
        # Check tables exist
        from django.db import connection
        with connection.cursor() as cursor:
            tables_to_check = [
                'user_presence',
                'jitsi_call_sessions',
                'issues',
                'organizations',
            ]
            
            for table in tables_to_check:
                cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                exists = cursor.fetchone()
                if exists:
                    self.stdout.write(self.style.SUCCESS(f'  [OK] Table exists: {table}'))
                else:
                    self.stdout.write(self.style.ERROR(f'  [ERROR] Table missing: {table}'))
        
        # Check record counts
        self.stdout.write(self.style.SUCCESS('\n  Record Counts:'))
        self.stdout.write(self.style.SUCCESS(f'    - UserPresence: {UserPresence.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'    - JitsiCallSessions: {JitsiCallSession.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'    - Issues: {Issue.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'    - Organizations: {Organization.objects.count()}'))
        
        # ========================================================================
        # SUMMARY
        # ========================================================================
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))
        self.stdout.write(self.style.SUCCESS('SEED DATA CREATION COMPLETE!'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        self.stdout.write(self.style.SUCCESS('\n[TEST USERS]'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        self.stdout.write(self.style.SUCCESS(f'  Customer:'))
        self.stdout.write(self.style.SUCCESS(f'    Email: {customer_user.email}'))
        self.stdout.write(self.style.SUCCESS(f'    Password: customer123'))
        self.stdout.write(self.style.SUCCESS(f'    Can: Raise issues, Make/receive calls'))
        self.stdout.write(self.style.SUCCESS(f'\n  Vendor:'))
        self.stdout.write(self.style.SUCCESS(f'    Email: {vendor_user.email}'))
        self.stdout.write(self.style.SUCCESS(f'    Password: vendor123'))
        self.stdout.write(self.style.SUCCESS(f'    Can: View/update issues, Make/receive calls'))
        self.stdout.write(self.style.SUCCESS(f'\n  Employee:'))
        self.stdout.write(self.style.SUCCESS(f'    Email: {employee_user.email}'))
        self.stdout.write(self.style.SUCCESS(f'    Password: employee123'))
        self.stdout.write(self.style.SUCCESS(f'    Can: View/update issues, Make/receive calls'))
        
        self.stdout.write(self.style.SUCCESS('\n[JITSI CALLS]'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        self.stdout.write(self.style.SUCCESS(f'  Server: {jitsi_server}'))
        self.stdout.write(self.style.SUCCESS(f'  UserPresence records: {UserPresence.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'  Call sessions: {JitsiCallSession.objects.count()}'))
        self.stdout.write(self.style.SUCCESS(f'  All users are online and available for calls'))
        
        self.stdout.write(self.style.SUCCESS('\n[LINEAR INTEGRATION]'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        if linear_team_id:
            self.stdout.write(self.style.SUCCESS(f'  Team ID: {linear_team_id}'))
            self.stdout.write(self.style.SUCCESS(f'  Organization: {test_org.name}'))
            self.stdout.write(self.style.SUCCESS(f'  Issues ready for sync: {len(created_issues)}'))
        else:
            self.stdout.write(self.style.WARNING('  [WARN] Linear Team ID not configured'))
            self.stdout.write(self.style.WARNING('  [WARN] Set LINEAR_TEAM_ID in .env or use --linear-team-id'))
        
        if linear_api_key:
            self.stdout.write(self.style.SUCCESS(f'  API Key: Configured'))
        else:
            self.stdout.write(self.style.WARNING('  [WARN] Linear API Key not configured'))
            self.stdout.write(self.style.WARNING('  [WARN] Set LINEAR_API_KEY in .env or use --linear-api-key'))
        
        self.stdout.write(self.style.SUCCESS('\n[TESTING INSTRUCTIONS]'))
        self.stdout.write(self.style.SUCCESS('-' * 80))
        self.stdout.write(self.style.SUCCESS('  1. Jitsi Calls:'))
        self.stdout.write(self.style.SUCCESS('     - Login as any user'))
        self.stdout.write(self.style.SUCCESS('     - Users can initiate calls from the UI'))
        self.stdout.write(self.style.SUCCESS('     - Check UserPresence records for online status'))
        self.stdout.write(self.style.SUCCESS('     - Test call sessions are created in database'))
        self.stdout.write(self.style.SUCCESS('\n  2. Linear Issue Management:'))
        self.stdout.write(self.style.SUCCESS('     - Login as customer@test.com'))
        self.stdout.write(self.style.SUCCESS('     - Raise a new issue (will auto-sync to Linear if configured)'))
        self.stdout.write(self.style.SUCCESS('     - Login as vendor@test.com or employee@test.com'))
        self.stdout.write(self.style.SUCCESS('     - View and update issues (changes sync to Linear)'))
        self.stdout.write(self.style.SUCCESS('\n  3. Verify Integration:'))
        self.stdout.write(self.style.SUCCESS('     - Check Linear workspace for synced issues'))
        self.stdout.write(self.style.SUCCESS('     - Verify issue status updates sync back from Linear'))
        
        self.stdout.write(self.style.SUCCESS('\n' + '=' * 80))

