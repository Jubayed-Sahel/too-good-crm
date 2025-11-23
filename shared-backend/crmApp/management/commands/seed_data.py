"""
Management command to seed the database with sample data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from crmApp.models import (
    Organization, UserOrganization,
    Role, Permission, RolePermission,
    Employee, Customer, Lead, Deal, Pipeline, PipelineStage, Activity
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'
    
    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Create superuser if not exists
        if not User.objects.filter(email='admin@crm.com').exists():
            user = User.objects.create_superuser(
                username='admin',
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
            slug='demo-company',
            defaults={
                'name': 'Demo Company',
                'industry': 'Technology',
                'website': 'https://democompany.com',
                'email': 'info@democompany.com',
                'phone': '+1-555-0100'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created organization: Demo Company'))
            
            # Add user to organization as owner
            UserOrganization.objects.create(
                user=user,
                organization=org,
                is_owner=True,
                is_active=True
            )
        else:
            self.stdout.write('⚠ Organization already exists')
        
        # Create permissions (using singular names for consistency)
        resources = ['customer', 'employee', 'vendor', 'activity', 'issue', 'order', 'payment']
        actions = ['read', 'create', 'update', 'delete']
        
        created_count = 0
        for resource in resources:
            for action in actions:
                permission, created = Permission.objects.get_or_create(
                    organization=org,
                    resource=resource,
                    action=action,
                    defaults={'description': f'{action.title()} {resource}'}
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
            slug='admin',
            defaults={
                'name': 'Admin',
                'description': 'Full access to all resources'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created role: Admin'))
            # Assign all permissions to admin role
            for permission in Permission.objects.filter(organization=org):
                RolePermission.objects.get_or_create(
                    role=admin_role,
                    permission=permission
                )
        
        sales_role, created = Role.objects.get_or_create(
            organization=org,
            slug='sales',
            defaults={
                'name': 'Sales',
                'description': 'Access to customers, orders, and activities'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created role: Sales'))
            # Assign relevant permissions to sales role (using singular names)
            sales_resources = ['customer', 'order', 'activity']
            for permission in Permission.objects.filter(organization=org, resource__in=sales_resources):
                RolePermission.objects.get_or_create(
                    role=sales_role,
                    permission=permission
                )
        
        # Create sample employees
        employee_users_data = [
            {
                'username': 'john.sales',
                'email': 'john.sales@democompany.com',
                'password': 'pass123',
                'first_name': 'John',
                'last_name': 'Smith',
                'employee': {
                    'code': 'EMP001',
                    'job_title': 'Sales Manager',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'sarah.sales',
                'email': 'sarah.sales@democompany.com',
                'password': 'pass123',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'employee': {
                    'code': 'EMP002',
                    'job_title': 'Sales Representative',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'michael.sales',
                'email': 'michael.sales@democompany.com',
                'password': 'pass123',
                'first_name': 'Michael',
                'last_name': 'Chen',
                'employee': {
                    'code': 'EMP003',
                    'job_title': 'Sales Representative',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'emily.account',
                'email': 'emily.account@democompany.com',
                'password': 'pass123',
                'first_name': 'Emily',
                'last_name': 'Davis',
                'employee': {
                    'code': 'EMP004',
                    'job_title': 'Account Manager',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'david.sales',
                'email': 'david.sales@democompany.com',
                'password': 'pass123',
                'first_name': 'David',
                'last_name': 'Wilson',
                'employee': {
                    'code': 'EMP005',
                    'job_title': 'Sales Representative',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'lisa.support',
                'email': 'lisa.support@democompany.com',
                'password': 'pass123',
                'first_name': 'Lisa',
                'last_name': 'Anderson',
                'employee': {
                    'code': 'EMP006',
                    'job_title': 'Support Specialist',
                    'department': 'Customer Support',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'robert.hr',
                'email': 'robert.hr@democompany.com',
                'password': 'pass123',
                'first_name': 'Robert',
                'last_name': 'Martinez',
                'employee': {
                    'code': 'EMP007',
                    'job_title': 'HR Manager',
                    'department': 'Human Resources',
                    'employment_type': 'full_time',
                    'status': 'active',
                }
            },
            {
                'username': 'jennifer.marketing',
                'email': 'jennifer.marketing@democompany.com',
                'password': 'pass123',
                'first_name': 'Jennifer',
                'last_name': 'Taylor',
                'employee': {
                    'code': 'EMP008',
                    'job_title': 'Marketing Specialist',
                    'department': 'Marketing',
                    'employment_type': 'part_time',
                    'status': 'active',
                }
            },
            {
                'username': 'james.intern',
                'email': 'james.intern@democompany.com',
                'password': 'pass123',
                'first_name': 'James',
                'last_name': 'Brown',
                'employee': {
                    'code': 'EMP009',
                    'job_title': 'Sales Intern',
                    'department': 'Sales',
                    'employment_type': 'intern',
                    'status': 'active',
                }
            },
            {
                'username': 'mary.leave',
                'email': 'mary.leave@democompany.com',
                'password': 'pass123',
                'first_name': 'Mary',
                'last_name': 'Garcia',
                'employee': {
                    'code': 'EMP010',
                    'job_title': 'Senior Sales Representative',
                    'department': 'Sales',
                    'employment_type': 'full_time',
                    'status': 'on-leave',
                }
            },
        ]
        
        employees_created = 0
        for emp_data in employee_users_data:
            # Create user if not exists
            emp_user, user_created = User.objects.get_or_create(
                email=emp_data['email'],
                defaults={
                    'username': emp_data['username'],
                    'first_name': emp_data['first_name'],
                    'last_name': emp_data['last_name'],
                }
            )
            
            if user_created:
                emp_user.set_password(emp_data['password'])
                emp_user.save()
            
            # Create employee if not exists
            employee, created = Employee.objects.get_or_create(
                organization=org,
                code=emp_data['employee']['code'],
                defaults={
                    'user': emp_user,
                    'first_name': emp_data['first_name'],
                    'last_name': emp_data['last_name'],
                    'email': emp_data['email'],  # Add email field
                    'phone': '+1-555-0' + emp_data['employee']['code'][-3:],  # Generate phone from code
                    'job_title': emp_data['employee']['job_title'],
                    'department': emp_data['employee']['department'],
                    'employment_type': emp_data['employee']['employment_type'],
                    'status': emp_data['employee']['status'],
                    'role': sales_role,
                }
            )
            
            if created:
                employees_created += 1
                
                # Create user-organization relationship
                UserOrganization.objects.get_or_create(
                    user=emp_user,
                    organization=org,
                    defaults={
                        'is_active': True,
                        'is_owner': False,
                    }
                )
        
        if employees_created > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {employees_created} employees'))
        else:
            self.stdout.write('⚠ Employees already exist')
        
        # Get employees for assigning to entities
        employees = list(Employee.objects.filter(organization=org))
        
        # Create sample customers
        customer_data = [
            {
                'code': 'CUST001',
                'name': 'John Smith',
                'first_name': 'John',
                'last_name': 'Smith',
                'email': 'john.smith@example.com',
                'phone': '+1-555-1001',
                'customer_type': 'individual',
                'status': 'active',
                'source': 'website'
            },
            {
                'code': 'CUST002',
                'name': 'Jane Doe',
                'first_name': 'Jane',
                'last_name': 'Doe',
                'email': 'jane.doe@example.com',
                'phone': '+1-555-1002',
                'customer_type': 'individual',
                'status': 'active',
                'source': 'referral'
            },
            {
                'code': 'CUST003',
                'name': 'Acme Corporation',
                'company_name': 'Acme Corporation',
                'email': 'contact@acme.com',
                'phone': '+1-555-1003',
                'customer_type': 'business',
                'status': 'vip',
                'industry': 'Manufacturing',
                'website': 'https://acme.com',
                'contact_person': 'Robert Johnson',
                'source': 'partner'
            },
            {
                'code': 'CUST004',
                'name': 'TechStart Inc',
                'company_name': 'TechStart Inc',
                'email': 'hello@techstart.io',
                'phone': '+1-555-1004',
                'customer_type': 'business',
                'status': 'active',
                'industry': 'Technology',
                'website': 'https://techstart.io',
                'contact_person': 'Sarah Williams',
                'source': 'social_media'
            },
            {
                'code': 'CUST005',
                'name': 'Emily Chen',
                'first_name': 'Emily',
                'last_name': 'Chen',
                'email': 'emily.chen@example.com',
                'phone': '+1-555-1005',
                'customer_type': 'individual',
                'status': 'prospect',
                'source': 'event'
            },
        ]
        
        created_count = 0
        for idx, data in enumerate(customer_data):
            # Assign employees in a round-robin fashion
            if employees:
                data['assigned_to'] = employees[idx % len(employees)]
            
            customer, created = Customer.objects.get_or_create(
                organization=org,
                code=data['code'],
                defaults=data
            )
            if created:
                created_count += 1
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} customers'))
        
        # Create sample leads
        lead_data = [
            {
                'code': 'LEAD001',
                'name': 'Alice Johnson',
                'email': 'alice.j@company.com',
                'phone': '+1-555-2001',
                'organization_name': 'Johnson Industries',
                'job_title': 'VP of Operations',
                'source': 'website',
                'qualification_status': 'qualified',
                'lead_score': 85,
                'estimated_value': 50000.00,
                'status': 'active'
            },
            {
                'code': 'LEAD002',
                'name': 'Bob Williams',
                'email': 'bob@startup.io',
                'phone': '+1-555-2002',
                'organization_name': 'Startup Inc',
                'job_title': 'CTO',
                'source': 'referral',
                'qualification_status': 'contacted',
                'lead_score': 70,
                'estimated_value': 35000.00,
                'status': 'active'
            },
            {
                'code': 'LEAD003',
                'name': 'Carol Martinez',
                'email': 'carol@bizgroup.com',
                'phone': '+1-555-2003',
                'organization_name': 'Business Group Ltd',
                'job_title': 'Director of Sales',
                'source': 'social_media',
                'qualification_status': 'new',
                'lead_score': 60,
                'estimated_value': 25000.00,
                'status': 'active'
            },
            {
                'code': 'LEAD004',
                'name': 'David Lee',
                'email': 'dlee@enterprise.com',
                'phone': '+1-555-2004',
                'organization_name': 'Enterprise Solutions',
                'job_title': 'CEO',
                'source': 'event',
                'qualification_status': 'qualified',
                'lead_score': 95,
                'estimated_value': 150000.00,
                'status': 'active'
            },
            {
                'code': 'LEAD005',
                'name': 'Eva Thompson',
                'email': 'eva.t@consulting.com',
                'phone': '+1-555-2005',
                'organization_name': 'Thompson Consulting',
                'job_title': 'Managing Partner',
                'source': 'partner',
                'qualification_status': 'contacted',
                'lead_score': 75,
                'estimated_value': 45000.00,
                'status': 'active'
            },
        ]
        
        created_count = 0
        for idx, data in enumerate(lead_data):
            # Assign employees in a round-robin fashion
            if employees:
                data['assigned_to'] = employees[idx % len(employees)]
            
            lead, created = Lead.objects.get_or_create(
                organization=org,
                code=data['code'],
                defaults=data
            )
            if created:
                created_count += 1
        
        if created_count > 0:
            self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} leads'))
        
        # Create pipeline
        pipeline, created = Pipeline.objects.get_or_create(
            organization=org,
            code='PIPE001',
            defaults={
                'name': 'Sales Pipeline',
                'description': 'Standard sales process pipeline',
                'is_default': True,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created pipeline: Sales Pipeline'))
            
            # Create pipeline stages
            stages = [
                {'name': 'Prospecting', 'order': 1, 'probability': 10.00, 'description': 'Initial contact and research'},
                {'name': 'Qualification', 'order': 2, 'probability': 25.00, 'description': 'Qualifying the opportunity'},
                {'name': 'Proposal', 'order': 3, 'probability': 50.00, 'description': 'Proposal submitted'},
                {'name': 'Negotiation', 'order': 4, 'probability': 75.00, 'description': 'Contract negotiation'},
                {'name': 'Closed Won', 'order': 5, 'probability': 100.00, 'is_closed_won': True, 'description': 'Deal won'},
                {'name': 'Closed Lost', 'order': 6, 'probability': 0.00, 'is_closed_lost': True, 'description': 'Deal lost'},
            ]
            
            for stage_data in stages:
                PipelineStage.objects.create(
                    pipeline=pipeline,
                    **stage_data
                )
            
            self.stdout.write(self.style.SUCCESS('✓ Created 6 pipeline stages'))
        else:
            self.stdout.write('⚠ Pipeline already exists')
        
        # Get stages for deals
        stages_list = list(pipeline.stages.filter(is_active=True).exclude(is_closed_won=True, is_closed_lost=True))
        customers_list = list(Customer.objects.filter(organization=org))
        
        # Create sample deals
        if stages_list and customers_list:
            from datetime import datetime, timedelta
            
            deal_data = [
                {
                    'code': 'DEAL001',
                    'title': 'Enterprise Software License',
                    'description': 'Annual subscription for 100 users',
                    'value': 125000.00,
                    'stage': stages_list[2] if len(stages_list) > 2 else stages_list[0],  # Proposal
                    'customer': customers_list[2] if len(customers_list) > 2 else customers_list[0],
                    'priority': 'high',
                    'expected_close_date': (datetime.now() + timedelta(days=30)).date(),
                    'status': 'active',
                    'source': 'referral'
                },
                {
                    'code': 'DEAL002',
                    'title': 'Cloud Migration Services',
                    'description': 'Complete cloud infrastructure migration',
                    'value': 250000.00,
                    'stage': stages_list[3] if len(stages_list) > 3 else stages_list[0],  # Negotiation
                    'customer': customers_list[3] if len(customers_list) > 3 else customers_list[0],
                    'priority': 'urgent',
                    'expected_close_date': (datetime.now() + timedelta(days=45)).date(),
                    'status': 'active',
                    'source': 'website'
                },
                {
                    'code': 'DEAL003',
                    'title': 'Consulting Package',
                    'description': '6-month strategic consulting engagement',
                    'value': 75000.00,
                    'stage': stages_list[1] if len(stages_list) > 1 else stages_list[0],  # Qualification
                    'customer': customers_list[0],
                    'priority': 'medium',
                    'expected_close_date': (datetime.now() + timedelta(days=60)).date(),
                    'status': 'active',
                    'source': 'partner'
                },
                {
                    'code': 'DEAL004',
                    'title': 'Training Program',
                    'description': 'Employee training and certification program',
                    'value': 30000.00,
                    'stage': stages_list[0],  # Prospecting
                    'customer': customers_list[1] if len(customers_list) > 1 else customers_list[0],
                    'priority': 'low',
                    'expected_close_date': (datetime.now() + timedelta(days=90)).date(),
                    'status': 'active',
                    'source': 'event'
                },
                {
                    'code': 'DEAL005',
                    'title': 'Mobile App Development',
                    'description': 'Custom mobile application for iOS and Android',
                    'value': 150000.00,
                    'stage': stages_list[2] if len(stages_list) > 2 else stages_list[0],  # Proposal
                    'customer': customers_list[4] if len(customers_list) > 4 else customers_list[0],
                    'priority': 'high',
                    'expected_close_date': (datetime.now() + timedelta(days=75)).date(),
                    'status': 'active',
                    'source': 'social_media'
                },
            ]
            
            created_count = 0
            for idx, data in enumerate(deal_data):
                # Get or create deal and set probability from stage
                stage = data['stage']
                data['probability'] = stage.probability
                
                # Assign employees in a round-robin fashion
                if employees:
                    data['assigned_to'] = employees[idx % len(employees)]
                
                deal, created = Deal.objects.get_or_create(
                    organization=org,
                    code=data['code'],
                    defaults={**data, 'pipeline': pipeline}
                )
                if created:
                    created_count += 1
            
            if created_count > 0:
                self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} deals'))
        
        # Create sample activities
        if customers_list:
            from datetime import timedelta
            from django.utils import timezone
            now = timezone.now()
            
            activity_data = [
                {
                    'activity_type': 'call',
                    'title': 'Initial consultation call',
                    'description': 'Discussed product requirements and pricing options',
                    'customer': customers_list[0],
                    'customer_name': customers_list[0].name,
                    'phone_number': '+1-555-1001',
                    'call_duration': 1800,  # 30 minutes in seconds
                    'status': 'completed',
                    'duration_minutes': 30,
                    'completed_at': now - timedelta(days=2),
                },
                {
                    'activity_type': 'email',
                    'title': 'Follow-up email with proposal',
                    'description': 'Sent detailed proposal and pricing breakdown',
                    'customer': customers_list[1],
                    'customer_name': customers_list[1].name,
                    'email_subject': 'Your Custom Proposal - CRM Solutions',
                    'email_body': 'Dear customer, please find attached our proposal...',
                    'status': 'completed',
                    'completed_at': now - timedelta(days=1),
                },
                {
                    'activity_type': 'telegram',
                    'title': 'Quick update via Telegram',
                    'description': 'Shared update about new features',
                    'customer': customers_list[2] if len(customers_list) > 2 else customers_list[0],
                    'customer_name': customers_list[2].name if len(customers_list) > 2 else customers_list[0].name,
                    'telegram_username': '@acme_contact',
                    'status': 'completed',
                    'completed_at': now,
                },
                {
                    'activity_type': 'meeting',
                    'title': 'Product demo meeting',
                    'description': 'Scheduled product demonstration and Q&A session',
                    'customer': customers_list[3] if len(customers_list) > 3 else customers_list[0],
                    'customer_name': customers_list[3].name if len(customers_list) > 3 else customers_list[0].name,
                    'meeting_location': 'Virtual - Zoom',
                    'meeting_url': 'https://zoom.us/j/example',
                    'status': 'scheduled',
                    'scheduled_at': now + timedelta(days=3),
                    'duration_minutes': 60,
                },
                {
                    'activity_type': 'task',
                    'title': 'Prepare contract documentation',
                    'description': 'Create and review contract for new client',
                    'customer': customers_list[4] if len(customers_list) > 4 else customers_list[0],
                    'customer_name': customers_list[4].name if len(customers_list) > 4 else customers_list[0].name,
                    'task_priority': 'high',
                    'task_due_date': (now + timedelta(days=5)).date(),
                    'status': 'in_progress',
                },
                {
                    'activity_type': 'note',
                    'title': 'Important client preference',
                    'description': 'Customer prefers email communication over phone calls',
                    'customer': customers_list[0],
                    'customer_name': customers_list[0].name,
                    'is_pinned': True,
                    'status': 'completed',
                    'completed_at': now,
                },
                {
                    'activity_type': 'call',
                    'title': 'Scheduled follow-up call',
                    'description': 'Discuss implementation timeline and next steps',
                    'customer': customers_list[1],
                    'customer_name': customers_list[1].name,
                    'phone_number': '+1-555-1002',
                    'status': 'scheduled',
                    'scheduled_at': now + timedelta(days=2),
                    'duration_minutes': 45,
                },
                {
                    'activity_type': 'email',
                    'title': 'Send onboarding documentation',
                    'description': 'Share getting started guide and training materials',
                    'customer': customers_list[2] if len(customers_list) > 2 else customers_list[0],
                    'customer_name': customers_list[2].name if len(customers_list) > 2 else customers_list[0].name,
                    'email_subject': 'Welcome to Our Platform - Getting Started',
                    'email_body': 'Welcome! Here are the resources to help you get started...',
                    'status': 'scheduled',
                    'scheduled_at': now + timedelta(days=1),
                },
            ]
            
            created_count = 0
            for data in activity_data:
                activity, created = Activity.objects.get_or_create(
                    organization=org,
                    title=data['title'],
                    activity_type=data['activity_type'],
                    defaults={**data, 'created_by': user}
                )
                if created:
                    created_count += 1
            
            if created_count > 0:
                self.stdout.write(self.style.SUCCESS(f'✓ Created {created_count} activities'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Database seeding completed!'))
        self.stdout.write(f'\nLogin credentials:')
        self.stdout.write(f'  Username: admin')
        self.stdout.write(f'  Email: admin@crm.com')
        self.stdout.write(f'  Password: admin123')
