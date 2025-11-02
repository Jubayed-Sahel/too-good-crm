"""
Management command to seed the database with sample data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from crmApp.models import (
    Organization, UserOrganization,
    Role, Permission,
    Employee, Customer, Lead, Deal, Pipeline, PipelineStage
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create superuser if not exists
        if not User.objects.filter(email='admin@crm.com').exists():
            user = User.objects.create_superuser(
                email='admin@crm.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created superuser: admin@crm.com'))
        else:
            user = User.objects.get(email='admin@crm.com')
            self.stdout.write('⚠ Superuser already exists')
        
        # Create organization
        org, created = Organization.objects.get_or_create(
            name='Demo Company',
            defaults={
                'industry': 'technology',
                'size': 'medium',
                'website': 'https://democompany.com'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created organization: Demo Company'))
            
            # Add user to organization as owner
            UserOrganization.objects.create(
                user=user,
                organization=org,
                is_owner=True,
                is_admin=True
            )
        else:
            self.stdout.write('⚠ Organization already exists')
        
        # Create permissions
        resources = ['customers', 'leads', 'deals', 'employees']
        actions = ['view', 'create', 'update', 'delete']
        
        created_count = 0
        for resource in resources:
            for action in actions:
                permission, created = Permission.objects.get_or_create(
                    organization=org,
                    resource=resource,
                    action=action,
                    defaults={'name': f'{action.title()} {resource.title()}'}
                )
                if created:
                    created_count += 1
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} permissions'))
        else:
            self.stdout.write('⚠ Permissions already exist')
        
        # Create roles
        admin_role, created = Role.objects.get_or_create(
            organization=org,
            name='Admin',
            defaults={'description': 'Full access to all resources'}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created role: Admin'))
            # Assign all permissions to admin role
            for permission in Permission.objects.filter(organization=org):
                admin_role.role_permissions.create(permission=permission)
        
        # Create sample customers
        customer_data = [
            {'name': 'John Smith', 'email': 'john@example.com', 'customer_type': 'individual'},
            {'name': 'Jane Doe', 'email': 'jane@example.com', 'customer_type': 'individual'},
            {'name': 'Acme Corp', 'email': 'contact@acme.com', 'customer_type': 'business'},
        ]
        
        created_count = 0
        for data in customer_data:
            customer, created = Customer.objects.get_or_create(
                organization=org,
                email=data['email'],
                defaults=data
            )
            if created:
                created_count += 1
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} customers'))
        
        # Create sample leads
        lead_data = [
            {
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'email': 'alice@company.com',
                'company': 'Johnson Industries',
                'source': 'website',
                'priority': 'high',
                'score': 85
            },
            {
                'first_name': 'Bob',
                'last_name': 'Williams',
                'email': 'bob@startup.io',
                'company': 'Startup Inc',
                'source': 'referral',
                'priority': 'medium',
                'score': 70
            },
        ]
        
        created_count = 0
        for data in lead_data:
            lead, created = Lead.objects.get_or_create(
                organization=org,
                email=data['email'],
                defaults=data
            )
            if created:
                created_count += 1
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} leads'))
        
        # Create pipeline
        pipeline, created = Pipeline.objects.get_or_create(
            organization=org,
            name='Sales Pipeline',
            defaults={'is_default': True}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created pipeline: Sales Pipeline'))
            
            # Create pipeline stages
            stages = [
                {'name': 'Qualified', 'order': 1, 'probability': 25},
                {'name': 'Proposal', 'order': 2, 'probability': 50},
                {'name': 'Negotiation', 'order': 3, 'probability': 75},
                {'name': 'Closed Won', 'order': 4, 'probability': 100},
            ]
            
            for stage_data in stages:
                PipelineStage.objects.create(
                    pipeline=pipeline,
                    **stage_data
                )
            
            self.stdout.write(self.style.SUCCESS('✓ Created 4 pipeline stages'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed!'))
        self.stdout.write(f'\nLogin credentials:')
        self.stdout.write(f'  Email: admin@crm.com')
        self.stdout.write(f'  Password: admin123')
