"""
Management command to clear all data from the database.
This will delete all users, organizations, customers, leads, deals, and all related data.
Use with caution!
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model

from crmApp.models import (
    # Activities and notifications
    Activity,
    NotificationPreferences,
    Call,
    
    # Issues
    IssueComment,
    Issue,
    
    # Orders and payments
    OrderItem,
    Order,
    Payment,
    
    # Deals and leads
    Deal,
    LeadStageHistory,
    Lead,
    PipelineStage,
    Pipeline,
    
    # Customers
    Customer,
    
    # Employees and vendors
    Employee,
    Vendor,
    
    # RBAC
    UserRole,
    RolePermission,
    Role,
    Permission,
    
    # User profiles and organizations
    UserProfile,
    UserOrganization,
    Organization,
    
    # Auth tokens
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Clear all data from the database (except superusers if --keep-superusers is used)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-superusers',
            action='store_true',
            help='Keep superuser accounts (admin users)',
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Skip confirmation prompt (use with caution)',
        )

    def handle(self, *args, **options):
        keep_superusers = options.get('keep_superusers', False)
        confirm = options.get('confirm', False)
        
        if not confirm:
            self.stdout.write(self.style.WARNING(
                '\n⚠️  WARNING: This will delete ALL data from the database!\n'
                'This includes:\n'
                '  - All users (except superusers if --keep-superusers is used)\n'
                '  - All organizations\n'
                '  - All customers, leads, deals\n'
                '  - All activities, issues, orders, payments\n'
                '  - All employees, vendors\n'
                '  - All RBAC data (roles, permissions)\n'
                '  - Everything else in the database\n\n'
                'This action CANNOT be undone!\n'
            ))
            
            response = input('Type "DELETE ALL DATA" to confirm: ')
            if response != 'DELETE ALL DATA':
                self.stdout.write(self.style.ERROR('Operation cancelled.'))
                return
        
        self.stdout.write(self.style.WARNING('Starting database cleanup...'))
        
        with transaction.atomic():
            # Count records before deletion
            counts = {}
            
            # Activities and notifications
            counts['activities'] = Activity.objects.count()
            counts['notifications'] = NotificationPreferences.objects.count()
            counts['calls'] = Call.objects.count()
            
            # Issues
            counts['issue_comments'] = IssueComment.objects.count()
            counts['issues'] = Issue.objects.count()
            
            # Orders and payments
            counts['order_items'] = OrderItem.objects.count()
            counts['orders'] = Order.objects.count()
            counts['payments'] = Payment.objects.count()
            
            # Deals and leads
            counts['deals'] = Deal.objects.count()
            counts['lead_stage_history'] = LeadStageHistory.objects.count()
            counts['leads'] = Lead.objects.count()
            counts['pipeline_stages'] = PipelineStage.objects.count()
            counts['pipelines'] = Pipeline.objects.count()
            
            # Customers
            counts['customers'] = Customer.objects.count()
            
            # Employees and vendors
            counts['employees'] = Employee.objects.count()
            counts['vendors'] = Vendor.objects.count()
            
            # RBAC
            counts['user_roles'] = UserRole.objects.count()
            counts['role_permissions'] = RolePermission.objects.count()
            counts['roles'] = Role.objects.count()
            counts['permissions'] = Permission.objects.count()
            
            # User profiles and organizations
            counts['user_profiles'] = UserProfile.objects.count()
            counts['user_organizations'] = UserOrganization.objects.count()
            counts['organizations'] = Organization.objects.count()
            
            # Auth tokens
            counts['refresh_tokens'] = RefreshToken.objects.count()
            counts['password_reset_tokens'] = PasswordResetToken.objects.count()
            counts['email_verification_tokens'] = EmailVerificationToken.objects.count()
            
            # Users (check if keeping superusers)
            if keep_superusers:
                counts['users'] = User.objects.filter(is_superuser=False).count()
                counts['superusers'] = User.objects.filter(is_superuser=True).count()
            else:
                counts['users'] = User.objects.count()
            
            # Delete in order (child models first)
            self.stdout.write('Deleting activities and notifications...')
            Activity.objects.all().delete()
            NotificationPreferences.objects.all().delete()
            Call.objects.all().delete()
            
            self.stdout.write('Deleting issues...')
            IssueComment.objects.all().delete()
            Issue.objects.all().delete()
            
            self.stdout.write('Deleting orders and payments...')
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            Payment.objects.all().delete()
            
            self.stdout.write('Deleting deals and leads...')
            Deal.objects.all().delete()
            LeadStageHistory.objects.all().delete()
            Lead.objects.all().delete()
            PipelineStage.objects.all().delete()
            Pipeline.objects.all().delete()
            
            self.stdout.write('Deleting customers...')
            Customer.objects.all().delete()
            
            self.stdout.write('Deleting employees and vendors...')
            Employee.objects.all().delete()
            Vendor.objects.all().delete()
            
            self.stdout.write('Deleting RBAC data...')
            UserRole.objects.all().delete()
            RolePermission.objects.all().delete()
            Role.objects.all().delete()
            Permission.objects.all().delete()
            
            self.stdout.write('Deleting user profiles and organizations...')
            UserProfile.objects.all().delete()
            UserOrganization.objects.all().delete()
            Organization.objects.all().delete()
            
            self.stdout.write('Deleting auth tokens...')
            RefreshToken.objects.all().delete()
            PasswordResetToken.objects.all().delete()
            EmailVerificationToken.objects.all().delete()
            
            self.stdout.write('Deleting users...')
            if keep_superusers:
                User.objects.filter(is_superuser=False).delete()
                self.stdout.write(self.style.SUCCESS(f'Kept {counts["superusers"]} superuser(s)'))
            else:
                User.objects.all().delete()
            
            # Summary
            self.stdout.write('\n' + '='*50)
            self.stdout.write(self.style.SUCCESS('Database cleared successfully!'))
            self.stdout.write('='*50)
            self.stdout.write('\nDeleted records:')
            for model_name, count in counts.items():
                if count > 0:
                    self.stdout.write(f'  - {model_name}: {count}')
            
            if keep_superusers and counts.get('superusers', 0) > 0:
                self.stdout.write(f'\n{counts["superusers"]} superuser(s) were kept.')
            
            self.stdout.write('\n' + self.style.SUCCESS('✅ Database is now empty and ready for a fresh start!'))

