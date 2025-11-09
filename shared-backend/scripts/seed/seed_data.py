#!/usr/bin/env python"""

"""Seed Data Script for CRM Application

Comprehensive Seed Data Script

Creates realistic test data to demonstrate the full CRM systemThis script populates the database with realistic sample data for development and testing.

"""Run with: python manage.py shell < seed_data.py

import osor: python seed_data.py

import sys"""

import django

from decimal import Decimalimport os

from datetime import datetime, timedeltaimport sys

import randomimport django

from datetime import datetime, timedelta

# Setup Djangofrom decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')import random

django.setup()

# Setup Django

from django.utils import timezoneos.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

from django.utils.text import slugifydjango.setup()

from crmApp.models import (

    User, Organization, UserOrganization, UserProfile,from django.contrib.auth import get_user_model

    Customer, Lead, Deal, Employee, Activity,from django.utils import timezone

    Role, Permission, UserRole, RolePermissionfrom crmApp.models import (

)    User, Organization, UserOrganization, Employee, Customer, Lead, Deal,

    Pipeline, PipelineStage, Vendor, Role, Permission, RolePermission, UserRole

def clear_existing_data():)

    """Clear existing test data"""

    print("🧹 Clearing existing data...")User = get_user_model()

    

    # Delete in correct order to avoid foreign key constraintsdef clear_existing_data():

    Activity.objects.all().delete()    """Clear existing data (optional - comment out if you want to keep existing data)"""

    Deal.objects.all().delete()    print("Clearing existing data...")

    Lead.objects.all().delete()    Deal.objects.all().delete()

    Customer.objects.all().delete()    Lead.objects.all().delete()

    Employee.objects.all().delete()    Customer.objects.all().delete()

        Vendor.objects.all().delete()

    UserRole.objects.all().delete()    Employee.objects.filter(user__email__contains='demo').delete()

    RolePermission.objects.all().delete()    PipelineStage.objects.all().delete()

    Role.objects.all().delete()    Pipeline.objects.all().delete()

    Permission.objects.all().delete()    UserOrganization.objects.all().delete()

        UserRole.objects.all().delete()

    UserProfile.objects.all().delete()    RolePermission.objects.all().delete()

    UserOrganization.objects.all().delete()    Permission.objects.all().delete()

    Organization.objects.all().delete()    Role.objects.all().delete()

    User.objects.all().delete()    # Don't delete superuser, but delete demo users

        User.objects.filter(email__contains='demo').delete()

    print("✅ Cleared existing data\n")    Organization.objects.filter(name__contains='Demo').delete()

    print("✓ Existing data cleared")

def create_organizations():

    """Create test organizations"""

    print("🏢 Creating organizations...")def create_organizations():

        """Create sample organizations"""

    orgs_data = [    print("\nCreating organizations...")

        {    

            'name': 'TechCorp Solutions',    orgs = [

            'email': 'info@techcorp.com',        {

            'phone': '+1-555-0100',            'name': 'TechCorp Solutions',

            'website': 'https://techcorp.com',            'slug': 'techcorp-solutions',

            'address': '123 Tech Street',            'industry': 'technology',

            'city': 'San Francisco',            'description': 'Leading technology solutions provider',

            'state': 'CA',            'website': 'https://techcorp.example.com',

            'country': 'USA',            'phone': '+1-555-0100',

            'zip_code': '94105',            'email': 'contact@techcorp.example.com',

        },            'address': '123 Tech Street',

        {            'city': 'San Francisco',

            'name': 'Global Enterprises',            'state': 'CA',

            'email': 'contact@globalent.com',            'postal_code': '94105',

            'phone': '+1-555-0200',            'country': 'USA',

            'website': 'https://globalent.com',        },

            'address': '456 Enterprise Ave',        {

            'city': 'New York',            'name': 'Global Marketing Inc',

            'state': 'NY',            'slug': 'global-marketing-inc',

            'country': 'USA',            'industry': 'marketing',

            'zip_code': '10001',            'description': 'Full-service marketing agency',

        },            'website': 'https://globalmarketing.example.com',

    ]            'phone': '+1-555-0200',

                'email': 'hello@globalmarketing.example.com',

    organizations = []            'address': '456 Marketing Ave',

    for org_data in orgs_data:            'city': 'New York',

        slug = slugify(org_data['name'])            'state': 'NY',

        org = Organization.objects.create(            'postal_code': '10001',

            name=org_data['name'],            'country': 'USA',

            slug=slug,        },

            email=org_data['email'],    ]

            phone=org_data.get('phone'),    

            website=org_data.get('website'),    created_orgs = []

            address=org_data.get('address'),    for org_data in orgs:

            city=org_data.get('city'),        # Use slug as the unique identifier for get_or_create

            state=org_data.get('state'),        slug = org_data.pop('slug')

            country=org_data.get('country'),        org, created = Organization.objects.get_or_create(

            zip_code=org_data.get('zip_code'),            slug=slug,

        )            defaults=org_data

        organizations.append(org)        )

        print(f"  ✓ Created: {org.name}")        created_orgs.append(org)

            print(f"  {'Created' if created else 'Found'}: {org.name}")

    print(f"✅ Created {len(organizations)} organizations\n")    

    return organizations    return created_orgs



def create_permissions():

    """Create RBAC permissions"""def create_users_and_employees(organizations):

    print("🔐 Creating permissions...")    """Create users and their employee profiles"""

        print("\nCreating users and employees...")

    permissions_data = [    

        ('view_dashboard', 'View Dashboard', 'dashboard'),    users_data = [

        ('view_customers', 'View Customers', 'customers'),        {

        ('create_customers', 'Create Customers', 'customers'),            'email': 'john.doe@demo.com',

        ('edit_customers', 'Edit Customers', 'customers'),            'username': 'john.doe',

        ('delete_customers', 'Delete Customers', 'customers'),            'first_name': 'John',

        ('view_leads', 'View Leads', 'leads'),            'last_name': 'Doe',

        ('create_leads', 'Create Leads', 'leads'),            'employee': {

        ('edit_leads', 'Edit Leads', 'leads'),                'job_title': 'Sales Manager',

        ('delete_leads', 'Delete Leads', 'leads'),                'department': 'sales',

        ('view_deals', 'View Deals', 'deals'),                'phone': '+1-555-1001',

        ('create_deals', 'Create Deals', 'deals'),                'organization': 0,  # Index in organizations list

        ('edit_deals', 'Edit Deals', 'deals'),            }

        ('delete_deals', 'Delete Deals', 'deals'),        },

        ('view_activities', 'View Activities', 'activities'),        {

        ('create_activities', 'Create Activities', 'activities'),            'email': 'sarah.johnson@demo.com',

        ('view_analytics', 'View Analytics', 'analytics'),            'username': 'sarah.johnson',

        ('view_employees', 'View Employees', 'employees'),            'first_name': 'Sarah',

        ('manage_employees', 'Manage Employees', 'employees'),            'last_name': 'Johnson',

        ('view_settings', 'View Settings', 'settings'),            'employee': {

        ('manage_settings', 'Manage Settings', 'settings'),                'job_title': 'Senior Sales Representative',

    ]                'department': 'sales',

                    'phone': '+1-555-1002',

    permissions = []                'organization': 0,

    for code, name, resource in permissions_data:            }

        perm = Permission.objects.create(        },

            name=name,        {

            code=code,            'email': 'mike.wilson@demo.com',

            resource=resource,            'username': 'mike.wilson',

            description=f'Permission to {name.lower()}'            'first_name': 'Mike',

        )            'last_name': 'Wilson',

        permissions.append(perm)            'employee': {

                    'job_title': 'Sales Representative',

    print(f"✅ Created {len(permissions)} permissions\n")                'department': 'sales',

    return permissions                'phone': '+1-555-1003',

                'organization': 0,

def create_roles(permissions):            }

    """Create RBAC roles"""        },

    print("👥 Creating roles...")        {

                'email': 'emily.brown@demo.com',

    # Vendor role (full access)            'username': 'emily.brown',

    vendor_role = Role.objects.create(            'first_name': 'Emily',

        name='Vendor',            'last_name': 'Brown',

        description='Organization owner with full access',            'employee': {

        is_system_role=True                'job_title': 'Marketing Director',

    )                'department': 'marketing',

    # Assign all permissions to vendor                'phone': '+1-555-2001',

    for perm in permissions:                'organization': 1,

        RolePermission.objects.create(role=vendor_role, permission=perm)            }

    print("  ✓ Created: Vendor (all permissions)")        },

            {

    # Sales Manager role            'email': 'david.garcia@demo.com',

    sales_manager_role = Role.objects.create(            'username': 'david.garcia',

        name='Sales Manager',            'first_name': 'David',

        description='Manages sales team and has access to all sales features',            'last_name': 'Garcia',

        is_system_role=False            'employee': {

    )                'job_title': 'Account Manager',

    manager_perms = [p for p in permissions if p.code in [                'department': 'sales',

        'view_dashboard', 'view_customers', 'create_customers', 'edit_customers',                'phone': '+1-555-2002',

        'view_leads', 'create_leads', 'edit_leads',                'organization': 1,

        'view_deals', 'create_deals', 'edit_deals',            }

        'view_activities', 'create_activities', 'view_analytics'        },

    ]]    ]

    for perm in manager_perms:    

        RolePermission.objects.create(role=sales_manager_role, permission=perm)    created_employees = []

    print("  ✓ Created: Sales Manager")    for user_data in users_data:

            employee_data = user_data.pop('employee')

    # Sales Rep role        org_index = employee_data.pop('organization')

    sales_rep_role = Role.objects.create(        

        name='Sales Representative',        user, created = User.objects.get_or_create(

        description='Basic sales access - can view and create leads/deals',            email=user_data['email'],

        is_system_role=False            defaults={**user_data, 'is_active': True}

    )        )

    rep_perms = [p for p in permissions if p.code in [        

        'view_dashboard', 'view_customers', 'create_customers',        if created:

        'view_leads', 'create_leads', 'edit_leads',            user.set_password('demo1234')  # Default password

        'view_deals', 'create_deals',            user.save()

        'view_activities', 'create_activities'            print(f"  Created user: {user.email}")

    ]]        

    for perm in rep_perms:        # Create employee profile

        RolePermission.objects.create(role=sales_rep_role, permission=perm)        employee, emp_created = Employee.objects.get_or_create(

    print("  ✓ Created: Sales Representative")            user=user,

                organization=organizations[org_index],

    # Customer role (read-only for client portal)            defaults=employee_data

    customer_role = Role.objects.create(        )

        name='Customer',        

        description='Client portal access',        # Create UserOrganization relationship

        is_system_role=True        UserOrganization.objects.get_or_create(

    )            user=user,

    print("  ✓ Created: Customer")            organization=organizations[org_index],

                defaults={'is_owner': False, 'is_active': True}

    print(f"✅ Created 4 roles\n")        )

    return {        

        'vendor': vendor_role,        created_employees.append(employee)

        'sales_manager': sales_manager_role,        print(f"  {'Created' if emp_created else 'Found'} employee: {employee.full_name}")

        'sales_rep': sales_rep_role,    

        'customer': customer_role,    return created_employees

    }



def create_users_and_profiles(organizations, roles):def create_pipelines(organizations):

    """Create users with multiple profiles"""    """Create sales pipelines and stages"""

    print("👤 Creating users and profiles...")    print("\nCreating pipelines and stages...")

        

    users_data = []    pipelines_data = [

    org = organizations[0]  # Use first organization for all test users        {

                'name': 'Standard Sales Pipeline',

    # Create main test users            'description': 'Default sales pipeline for all deals',

    test_users = [            'organization': 0,

        {            'stages': [

            'username': 'vendor',                {'name': 'Lead', 'order': 1, 'probability': 10},

            'email': 'vendor@test.com',                {'name': 'Qualified', 'order': 2, 'probability': 25},

            'password': 'vendor123',                {'name': 'Proposal', 'order': 3, 'probability': 50},

            'first_name': 'Vendor',                {'name': 'Negotiation', 'order': 4, 'probability': 75},

            'last_name': 'Owner',                {'name': 'Closed Won', 'order': 5, 'probability': 100},

            'primary_profile': 'vendor',                {'name': 'Closed Lost', 'order': 6, 'probability': 0},

            'role': roles['vendor'],            ]

            'is_owner': True        },

        },        {

        {            'name': 'Marketing Services Pipeline',

            'username': 'manager',            'description': 'Pipeline for marketing service deals',

            'email': 'manager@test.com',            'organization': 1,

            'password': 'manager123',            'stages': [

            'first_name': 'Sales',                {'name': 'Initial Contact', 'order': 1, 'probability': 10},

            'last_name': 'Manager',                {'name': 'Discovery', 'order': 2, 'probability': 30},

            'primary_profile': 'employee',                {'name': 'Proposal Sent', 'order': 3, 'probability': 50},

            'role': roles['sales_manager'],                {'name': 'Negotiating', 'order': 4, 'probability': 70},

            'is_owner': False                {'name': 'Won', 'order': 5, 'probability': 100},

        },                {'name': 'Lost', 'order': 6, 'probability': 0},

        {            ]

            'username': 'employee',        },

            'email': 'employee@test.com',    ]

            'password': 'employee123',    

            'first_name': 'Sales',    created_pipelines = []

            'last_name': 'Rep',    for pipeline_data in pipelines_data:

            'primary_profile': 'employee',        stages_data = pipeline_data.pop('stages')

            'role': roles['sales_rep'],        org_index = pipeline_data.pop('organization')

            'is_owner': False        

        },        pipeline, created = Pipeline.objects.get_or_create(

        {            name=pipeline_data['name'],

            'username': 'customer',            organization=organizations[org_index],

            'email': 'customer@test.com',            defaults=pipeline_data

            'password': 'customer123',        )

            'first_name': 'Test',        created_pipelines.append(pipeline)

            'last_name': 'Customer',        print(f"  {'Created' if created else 'Found'} pipeline: {pipeline.name}")

            'primary_profile': 'customer',        

            'role': roles['customer'],        # Create stages

            'is_owner': False        for stage_data in stages_data:

        },            stage, stage_created = PipelineStage.objects.get_or_create(

    ]                pipeline=pipeline,

                    name=stage_data['name'],

    for user_info in test_users:                defaults=stage_data

        user = User.objects.create_user(            )

            username=user_info['username'],            if stage_created:

            email=user_info['email'],                print(f"    Created stage: {stage.name}")

            password=user_info['password'],    

            first_name=user_info['first_name'],    return created_pipelines

            last_name=user_info['last_name'],

            is_active=True,

            is_verified=Truedef create_customers(organizations, employees):

        )    """Create sample customers"""

            print("\nCreating customers...")

        # Link to organization    

        UserOrganization.objects.create(    customers_data = [

            user=user,        {

            organization=org,            'name': 'Acme Corporation',

            is_owner=user_info['is_owner'],            'company_name': 'Acme Corp',

            is_active=True            'email': 'contact@acme.example.com',

        )            'phone': '+1-555-3001',

                    'customer_type': 'business',

        # Create all 3 profiles for each user            'industry': 'Manufacturing',

        profiles = []            'website': 'https://acme.example.com',

        for profile_type in ['vendor', 'employee', 'customer']:            'source': 'referral',

            is_primary = (profile_type == user_info['primary_profile'])            'credit_limit': Decimal('100000'),

            profile = UserProfile.objects.create(            'payment_terms': 'Net 30',

                user=user,            'address': '789 Industrial Blvd',

                organization=org,            'city': 'Chicago',

                profile_type=profile_type,            'state': 'IL',

                is_primary=is_primary,            'postal_code': '60601',

                status='active',            'country': 'USA',

                activated_at=timezone.now()            'organization': 0,

            )            'assigned_to': 0,

            profiles.append(profile)        },

                    {

            # Assign role to primary profile            'name': 'Stellar Enterprises',

            if is_primary:            'company_name': 'Stellar Enterprises LLC',

                UserRole.objects.create(            'email': 'info@stellar.example.com',

                    user=user,            'phone': '+1-555-3002',

                    role=user_info['role'],            'customer_type': 'business',

                    profile=profile,            'industry': 'Technology',

                    organization=org            'website': 'https://stellar.example.com',

                )            'source': 'website',

                    'credit_limit': Decimal('50000'),

        users_data.append({            'payment_terms': 'Net 30',

            'user': user,            'address': '321 Tech Park',

            'org': org,            'city': 'Austin',

            'role_name': user_info['role'].name,            'state': 'TX',

            'profiles': profiles,            'postal_code': '73301',

            'primary_profile': user_info['primary_profile']            'country': 'USA',

        })            'organization': 0,

        print(f"  ✓ Created: {user.email} ({user_info['primary_profile'].upper()} primary, 3 profiles total)")            'assigned_to': 1,

            },

    print(f"✅ Created {len(users_data)} users with profiles\n")        {

    return users_data            'name': 'Pinnacle Solutions',

            'company_name': 'Pinnacle Solutions Inc',

def create_employees(users_data):            'email': 'contact@pinnacle.example.com',

    """Create employee records"""            'phone': '+1-555-3003',

    print("👔 Creating employee records...")            'customer_type': 'business',

                'industry': 'Consulting',

    employees = []            'website': 'https://pinnacle.example.com',

    for user_data in users_data:            'source': 'cold_call',

        if user_data['primary_profile'] in ['vendor', 'employee']:            'credit_limit': Decimal('75000'),

            employee = Employee.objects.create(            'payment_terms': 'Net 15',

                user=user_data['user'],            'address': '555 Business Ave',

                organization=user_data['org'],            'city': 'Boston',

                employee_id=f"EMP{1000 + len(employees)}",            'state': 'MA',

                department='Sales',            'postal_code': '02101',

                position=user_data['role_name'],            'country': 'USA',

                hire_date=timezone.now().date() - timedelta(days=random.randint(30, 365)),            'organization': 0,

                salary=Decimal(random.randint(50000, 120000)),            'assigned_to': 2,

                status='active'        },

            )        {

            employees.append(employee)            'name': 'Quantum Marketing Group',

                'company_name': 'Quantum Marketing',

    print(f"✅ Created {len(employees)} employee records\n")            'email': 'hello@quantum.example.com',

    return employees            'phone': '+1-555-4001',

            'customer_type': 'business',

def create_customers(org, num=10):            'industry': 'Marketing',

    """Create customer records"""            'website': 'https://quantum.example.com',

    print(f"👥 Creating {num} customers...")            'source': 'social_media',

                'credit_limit': Decimal('25000'),

    companies = [            'payment_terms': 'Net 30',

        'Acme Corp', 'Widget Inc', 'Global Tech', 'Smart Solutions', 'Future Systems',            'address': '888 Creative St',

        'Prime Enterprises', 'Elite Services', 'Dynamic Group', 'Summit LLC', 'Pinnacle Co',            'city': 'Los Angeles',

    ]            'state': 'CA',

                'postal_code': '90001',

    customers = []            'country': 'USA',

    for i, company in enumerate(companies[:num]):            'organization': 1,

        email = f"contact@{slugify(company)}.com"            'assigned_to': 3,

        customer = Customer.objects.create(        },

            organization=org,        {

            company_name=company,            'name': 'Innovate Tech',

            first_name=f"Contact{i+1}",            'company_name': 'Innovate Tech Solutions',

            last_name=company.split()[0],            'email': 'contact@innovatetech.example.com',

            email=email,            'phone': '+1-555-4002',

            phone=f"+1-555-{1000+i:04d}",            'customer_type': 'business',

            website=f"https://{slugify(company)}.com",            'industry': 'Software',

            address=f"{100+i} Business St",            'website': 'https://innovatetech.example.com',

            city='San Francisco',            'source': 'website',

            state='CA',            'credit_limit': Decimal('150000'),

            country='USA',            'payment_terms': 'Net 45',

            zip_code='94105',            'address': '999 Innovation Dr',

            status='active',            'city': 'Seattle',

            customer_type='business',            'state': 'WA',

            industry=random.choice(['Technology', 'Finance', 'Healthcare', 'Retail']),            'postal_code': '98101',

            company_size=random.choice(['1-10', '11-50', '51-200', '201-1000']),            'country': 'USA',

        )            'organization': 1,

        customers.append(customer)            'assigned_to': 4,

            },

    print(f"✅ Created {len(customers)} customers\n")    ]

    return customers    

    created_customers = []

def create_leads(org, employees, customers, num=15):    for customer_data in customers_data:

    """Create lead records"""        org_index = customer_data.pop('organization')

    print(f"📋 Creating {num} leads...")        emp_index = customer_data.pop('assigned_to')

            

    statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']        customer, created = Customer.objects.get_or_create(

    sources = ['website', 'referral', 'cold_call', 'email', 'social_media']            email=customer_data['email'],

                organization=organizations[org_index],

    leads = []            defaults={

    for i in range(num):                **customer_data,

        customer = random.choice(customers)                'assigned_to': employees[emp_index],

        assigned_to = random.choice(employees) if employees else None                'status': 'active',

                    }

        lead = Lead.objects.create(        )

            organization=org,        created_customers.append(customer)

            customer=customer,        print(f"  {'Created' if created else 'Found'}: {customer.name}")

            title=f"{customer.company_name} - {random.choice(['Product Demo', 'Enterprise Plan', 'Upgrade'])}",    

            description=f"Lead for {customer.company_name}",    return created_customers

            status=random.choice(statuses),

            source=random.choice(sources),

            estimated_value=Decimal(random.randint(5000, 100000)),def create_leads(organizations, employees):

            probability=random.randint(10, 90),    """Create sample leads"""

            expected_close_date=(timezone.now() + timedelta(days=random.randint(7, 90))).date(),    print("\nCreating leads...")

            assigned_to=assigned_to,    

        )    leads_data = [

        leads.append(lead)        {

                'name': 'Jennifer Martinez',

    print(f"✅ Created {len(leads)} leads\n")            'company': 'NextGen Innovations',

    return leads            'job_title': 'VP of Sales',

            'email': 'j.martinez@nextgen.example.com',

def create_deals(org, employees, customers, num=20):            'phone': '+1-555-5001',

    """Create deal records"""            'source': 'website',

    print(f"💼 Creating {num} deals...")            'qualification_status': 'new',

                'lead_score': 45,

    stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']            'estimated_value': Decimal('75000'),

                'notes': 'Interested in our enterprise solution. Follow up next week.',

    deals = []            'organization': 0,

    for i in range(num):            'assigned_to': 0,

        customer = random.choice(customers)        },

        assigned_to = random.choice(employees) if employees else None        {

        stage = random.choice(stages)            'name': 'Robert Chen',

                    'company': 'DataFlow Systems',

        deal = Deal.objects.create(            'job_title': 'CTO',

            organization=org,            'email': 'r.chen@dataflow.example.com',

            customer=customer,            'phone': '+1-555-5002',

            title=f"{customer.company_name} - Deal #{1000+i}",            'source': 'referral',

            description=f"Sales deal for {customer.company_name}",            'qualification_status': 'contacted',

            stage=stage,            'lead_score': 65,

            amount=Decimal(random.randint(10000, 500000)),            'estimated_value': Decimal('120000'),

            probability=random.randint(20, 100),            'notes': 'Referred by Acme Corp. Very interested in our analytics platform.',

            expected_close_date=(timezone.now() + timedelta(days=random.randint(7, 180))).date(),            'organization': 0,

            assigned_to=assigned_to,            'assigned_to': 1,

            closed_at=timezone.now() if stage in ['closed_won', 'closed_lost'] else None,        },

        )        {

        deals.append(deal)            'name': 'Lisa Anderson',

                'company': 'GreenTech Solutions',

    print(f"✅ Created {len(deals)} deals\n")            'job_title': 'Director of Operations',

    return deals            'email': 'l.anderson@greentech.example.com',

            'phone': '+1-555-5003',

def create_activities(org, employees, customers, deals):            'source': 'social_media',

    """Create activity records"""            'qualification_status': 'qualified',

    print("📅 Creating activities...")            'lead_score': 80,

                'estimated_value': Decimal('95000'),

    activity_types = ['call', 'email', 'meeting', 'task', 'note']            'notes': 'Ready to discuss proposal. Schedule demo for next Tuesday.',

                'organization': 0,

    activities = []            'assigned_to': 2,

    for i in range(25):        },

        activity = Activity.objects.create(        {

            organization=org,            'name': 'Michael Thompson',

            activity_type=random.choice(activity_types),            'company': 'Urban Retail Co',

            title=f"Activity {i+1}",            'job_title': 'Marketing Manager',

            description=f"Activity description {i+1}",            'email': 'm.thompson@urbanretail.example.com',

            customer=random.choice(customers),            'phone': '+1-555-5004',

            deal=random.choice(deals) if random.random() > 0.5 else None,            'source': 'cold_call',

            assigned_to=random.choice(employees) if employees else None,            'qualification_status': 'new',

            due_date=(timezone.now() + timedelta(days=random.randint(-30, 30))).date(),            'lead_score': 30,

            completed=random.random() > 0.5,            'estimated_value': Decimal('45000'),

        )            'notes': 'Initial contact made. Need to send more information.',

        activities.append(activity)            'organization': 0,

                'assigned_to': 0,

    print(f"✅ Created {len(activities)} activities\n")        },

    return activities        {

            'name': 'Amanda White',

def print_summary(users_data, organizations):            'company': 'FutureBrand Agency',

    """Print summary of created data"""            'job_title': 'CEO',

    print("\n" + "="*70)            'email': 'a.white@futurebrand.example.com',

    print("📊 SEED DATA SUMMARY")            'phone': '+1-555-6001',

    print("="*70)            'source': 'event',

                'qualification_status': 'contacted',

    print(f"\n🏢 Organization: {organizations[0].name}")            'lead_score': 70,

                'estimated_value': Decimal('150000'),

    print(f"\n👤 Users: {len(users_data)}")            'notes': 'Met at Marketing Summit. Very interested in our services.',

    print("\n🔑 LOGIN CREDENTIALS:")            'organization': 1,

    print("="*70)            'assigned_to': 3,

            },

    for u in users_data:        {

        print(f"\n  📧 Email: {u['user'].email}")            'name': 'Christopher Lee',

        print(f"  🔒 Password: {u['user'].username}123")            'company': 'Velocity Startup',

        print(f"  👤 Role: {u['role_name']}")            'job_title': 'Founder',

        print(f"  ⭐ Primary Profile: {u['primary_profile'].upper()}")            'email': 'c.lee@velocity.example.com',

        print(f"  📋 All Profiles:")            'phone': '+1-555-6002',

        for profile in u['profiles']:            'source': 'website',

            marker = "⭐" if profile.is_primary else "  "            'qualification_status': 'qualified',

            print(f"     {marker} {profile.profile_type.upper()}")            'lead_score': 85,

                'estimated_value': Decimal('200000'),

    print(f"\n\n📈 DATA COUNTS:")            'notes': 'Hot lead. Ready to sign. Send contract this week.',

    print("="*70)            'organization': 1,

    print(f"  Customers: {Customer.objects.count()}")            'assigned_to': 4,

    print(f"  Leads: {Lead.objects.count()}")        },

    print(f"  Deals: {Deal.objects.count()}")        {

    print(f"  Activities: {Activity.objects.count()}")            'name': 'Patricia Davis',

    print(f"  Employees: {Employee.objects.count()}")            'company': 'Heritage Industries',

                'job_title': 'VP Marketing',

    print("\n" + "="*70)            'email': 'p.davis@heritage.example.com',

    print("✅ SEED DATA CREATION COMPLETE!")            'phone': '+1-555-6003',

    print("="*70)            'source': 'email_campaign',

    print("\n💡 TIP: All users have 3 profiles (Vendor, Employee, Customer)")            'qualification_status': 'unqualified',

    print("    Use 'Switch Role' button in sidebar to test profile switching")            'lead_score': 15,

    print("\n🎯 QUICK START:")            'estimated_value': Decimal('10000'),

    print("    1. Login as vendor@test.com / vendor123 (full access)")            'notes': 'Budget constraints. Not a good fit at this time.',

    print("    2. Click 'Switch Role' to test Customer UI")            'organization': 1,

    print("    3. Try employee@test.com / employee123 for limited access")            'assigned_to': 3,

    print("\n")        },

    ]

def main():    

    """Main seed data creation function"""    created_leads = []

    print("\n" + "="*70)    for lead_data in leads_data:

    print("🌱 CREATING SEED DATA FOR TOO-GOOD-CRM")        org_index = lead_data.pop('organization')

    print("="*70 + "\n")        emp_index = lead_data.pop('assigned_to', None)

            

    try:        lead, created = Lead.objects.get_or_create(

        # Clear existing data            email=lead_data['email'],

        clear_existing_data()            organization=organizations[org_index],

                    defaults={

        # Create organizations                **lead_data,

        organizations = create_organizations()                'assigned_to': employees[emp_index] if emp_index is not None else None,

                        'status': 'active',

        # Create permissions and roles            }

        permissions = create_permissions()        )

        roles = create_roles(permissions)        created_leads.append(lead)

                print(f"  {'Created' if created else 'Found'}: {lead.name}")

        # Create users and profiles    

        users_data = create_users_and_profiles(organizations, roles)    return created_leads

        

        # Create employees

        employees = create_employees(users_data)def create_deals(organizations, employees, customers, pipelines):

            """Create sample deals"""

        # Create business data    print("\nCreating deals...")

        org = organizations[0]    

        customers = create_customers(org)    # Get pipeline stages

        leads = create_leads(org, employees, customers)    tech_pipeline = pipelines[0]

        deals = create_deals(org, employees, customers)    marketing_pipeline = pipelines[1]

        activities = create_activities(org, employees, customers, deals)    

            tech_stages = list(tech_pipeline.stages.all().order_by('order'))

        # Print summary    marketing_stages = list(marketing_pipeline.stages.all().order_by('order'))

        print_summary(users_data, organizations)    

            deals_data = [

    except Exception as e:        {

        print(f"\n❌ Error creating seed data: {str(e)}")            'title': 'Enterprise Software License',

        import traceback            'description': 'Annual enterprise software license for 500 users',

        traceback.print_exc()            'value': Decimal('250000'),

        sys.exit(1)            'probability': 75,

            'expected_close_date': timezone.now() + timedelta(days=15),

if __name__ == '__main__':            'stage': tech_stages[3],  # Negotiation

    main()            'pipeline': tech_pipeline,

            'customer': 0,
            'organization': 0,
            'assigned_to': 0,
        },
        {
            'title': 'Cloud Migration Project',
            'description': 'Complete cloud infrastructure migration',
            'value': Decimal('180000'),
            'probability': 50,
            'expected_close_date': timezone.now() + timedelta(days=30),
            'stage': tech_stages[2],  # Proposal
            'pipeline': tech_pipeline,
            'customer': 1,
            'organization': 0,
            'assigned_to': 1,
        },
        {
            'title': 'Consulting Services Package',
            'description': '6-month consulting engagement',
            'value': Decimal('95000'),
            'probability': 25,
            'expected_close_date': timezone.now() + timedelta(days=45),
            'stage': tech_stages[1],  # Qualified
            'pipeline': tech_pipeline,
            'customer': 2,
            'organization': 0,
            'assigned_to': 2,
        },
        {
            'title': 'Annual Marketing Campaign',
            'description': 'Full-year integrated marketing campaign',
            'value': Decimal('320000'),
            'probability': 70,
            'expected_close_date': timezone.now() + timedelta(days=20),
            'stage': marketing_stages[3],  # Negotiating
            'pipeline': marketing_pipeline,
            'customer': 3,
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'title': 'Brand Refresh Project',
            'description': 'Complete brand identity redesign',
            'value': Decimal('125000'),
            'probability': 100,
            'expected_close_date': timezone.now() - timedelta(days=5),
            'stage': marketing_stages[4],  # Won
            'pipeline': marketing_pipeline,
            'customer': 4,
            'organization': 1,
            'assigned_to': 4,
            'actual_close_date': timezone.now() - timedelta(days=5),
        },
        {
            'title': 'SEO Optimization Services',
            'description': '3-month SEO and content marketing package',
            'value': Decimal('45000'),
            'probability': 30,
            'expected_close_date': timezone.now() + timedelta(days=60),
            'stage': marketing_stages[1],  # Discovery
            'pipeline': marketing_pipeline,
            'customer': 3,
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'title': 'Training & Implementation',
            'description': 'Staff training and system implementation',
            'value': Decimal('65000'),
            'probability': 100,
            'expected_close_date': timezone.now() - timedelta(days=15),
            'stage': tech_stages[4],  # Closed Won
            'pipeline': tech_pipeline,
            'customer': 0,
            'organization': 0,
            'assigned_to': 0,
            'actual_close_date': timezone.now() - timedelta(days=15),
        },
        {
            'title': 'Mobile App Development',
            'description': 'Custom mobile application for iOS and Android',
            'value': Decimal('450000'),
            'probability': 10,
            'expected_close_date': timezone.now() + timedelta(days=90),
            'stage': tech_stages[0],  # Lead
            'pipeline': tech_pipeline,
            'customer': 1,
            'organization': 0,
            'assigned_to': 1,
        },
    ]
    
    created_deals = []
    for deal_data in deals_data:
        org_index = deal_data.pop('organization')
        emp_index = deal_data.pop('assigned_to')
        customer_index = deal_data.pop('customer')
        
        # Create unique deal title with timestamp to avoid duplicates
        unique_title = f"{deal_data['title']}"
        
        deal, created = Deal.objects.get_or_create(
            title=unique_title,
            organization=organizations[org_index],
            defaults={
                **deal_data,
                'customer': customers[customer_index],
                'assigned_to': employees[emp_index],
                'status': 'active',
            }
        )
        created_deals.append(deal)
        print(f"  {'Created' if created else 'Found'}: {deal.title} - ${deal.value}")
    
    return created_deals


def create_vendors(organizations):
    """Create sample vendors"""
    print("\nCreating vendors...")
    
    vendors_data = [
        {
            'name': 'CloudHost Pro',
            'company_name': 'CloudHost Professional Services',
            'email': 'sales@cloudhost.example.com',
            'phone': '+1-555-7001',
            'vendor_type': 'service_provider',
            'industry': 'Cloud Hosting',
            'website': 'https://cloudhost.example.com',
            'payment_terms': 'Net 30',
            'address': '100 Cloud Drive',
            'city': 'Seattle',
            'state': 'WA',
            'postal_code': '98101',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'Office Supplies Plus',
            'company_name': 'Office Supplies Plus Inc',
            'email': 'orders@officesupplies.example.com',
            'phone': '+1-555-7002',
            'vendor_type': 'supplier',
            'industry': 'Office Supplies',
            'website': 'https://officesupplies.example.com',
            'payment_terms': 'Net 15',
            'address': '200 Supply Road',
            'city': 'Dallas',
            'state': 'TX',
            'postal_code': '75201',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'TechGear Solutions',
            'company_name': 'TechGear IT Solutions',
            'email': 'info@techgear.example.com',
            'phone': '+1-555-7003',
            'vendor_type': 'supplier',
            'industry': 'IT Equipment',
            'website': 'https://techgear.example.com',
            'payment_terms': 'Net 30',
            'address': '300 Tech Plaza',
            'city': 'Austin',
            'state': 'TX',
            'postal_code': '73301',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'Creative Print Co',
            'company_name': 'Creative Printing Company',
            'email': 'orders@creativeprint.example.com',
            'phone': '+1-555-8001',
            'vendor_type': 'service_provider',
            'industry': 'Printing Services',
            'website': 'https://creativeprint.example.com',
            'payment_terms': 'Due on Receipt',
            'address': '400 Print Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'USA',
            'organization': 1,
        },
        {
            'name': 'Marketing Analytics Pro',
            'company_name': 'Marketing Analytics Professional',
            'email': 'support@marketingpro.example.com',
            'phone': '+1-555-8002',
            'vendor_type': 'service_provider',
            'industry': 'Analytics Software',
            'website': 'https://marketingpro.example.com',
            'payment_terms': 'Monthly Subscription',
            'address': '500 Analytics Way',
            'city': 'San Jose',
            'state': 'CA',
            'postal_code': '95101',
            'country': 'USA',
            'organization': 1,
        },
    ]
    
    created_vendors = []
    for vendor_data in vendors_data:
        org_index = vendor_data.pop('organization')
        
        vendor, created = Vendor.objects.get_or_create(
            email=vendor_data['email'],
            organization=organizations[org_index],
            defaults={
                **vendor_data,
                'status': 'active',
            }
        )
        created_vendors.append(vendor)
        print(f"  {'Created' if created else 'Found'}: {vendor.name}")
    
    return created_vendors


def main():
    """Main execution function"""
    print("=" * 70)
    print("CRM SEED DATA GENERATOR")
    print("=" * 70)
    
    # Clear existing data (optional)
    # clear_existing_data()
    
    # Create data in order
    organizations = create_organizations()
    employees = create_users_and_employees(organizations)
    pipelines = create_pipelines(organizations)
    customers = create_customers(organizations, employees)
    leads = create_leads(organizations, employees)
    deals = create_deals(organizations, employees, customers, pipelines)
    vendors = create_vendors(organizations)
    
    print("\n" + "=" * 70)
    print("SEED DATA SUMMARY")
    print("=" * 70)
    print(f"Organizations: {len(organizations)}")
    print(f"Employees: {len(employees)}")
    print(f"Pipelines: {len(pipelines)}")
    print(f"Customers: {len(customers)}")
    print(f"Leads: {len(leads)}")
    print(f"Deals: {len(deals)}")
    print(f"Vendors: {len(vendors)}")
    print("=" * 70)
    print("✓ Seed data creation completed successfully!")
    print("\nDemo User Credentials:")
    print("Email: john.doe@demo.com")
    print("Password: demo1234")
    print("=" * 70)


if __name__ == '__main__':
    main()
