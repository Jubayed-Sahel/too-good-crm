#!/usr/bin/env python
"""
Comprehensive database seeding script for Too Good CRM
Seeds dummy data for all entities in the system.
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction
from crmApp.models import (
    Organization, UserOrganization, UserProfile,
    Role, Permission, UserRole,
    Employee, Vendor, Customer, Lead,
    Pipeline, PipelineStage, Deal,
    Order, OrderItem, Payment,
    Issue, Activity, NotificationPreferences
)

User = get_user_model()


class DataSeeder:
    """Main data seeding class"""
    
    def __init__(self):
        self.users = []
        self.organizations = []
        self.employees = []
        self.vendors = []
        self.customers = []
        self.leads = []
        self.pipelines = []
        self.pipeline_stages = []
        self.deals = []
        self.orders = []
        self.issues = []
        self.activities = []
        
        # Sample data
        self.first_names = [
            'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
            'William', 'Jennifer', 'James', 'Mary', 'Richard', 'Patricia', 'Thomas', 'Linda',
            'Charles', 'Barbara', 'Daniel', 'Elizabeth', 'Matthew', 'Susan', 'Anthony', 'Jessica',
            'Mark', 'Karen', 'Donald', 'Nancy', 'Steven', 'Margaret', 'Paul', 'Betty',
            'Andrew', 'Sandra', 'Joshua', 'Ashley', 'Kenneth', 'Dorothy', 'Kevin', 'Kimberly'
        ]
        
        self.last_names = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
            'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
            'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
            'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
        ]
        
        self.company_names = [
            'TechCorp Solutions', 'Global Enterprises', 'Innovative Systems', 'Digital Dynamics',
            'Smart Solutions Inc', 'Future Technologies', 'Prime Ventures', 'Apex Industries',
            'Quantum Systems', 'NextGen Solutions', 'Elite Enterprises', 'Precision Tech',
            'Advanced Solutions', 'Strategic Partners', 'Premier Group', 'Unified Systems',
            'Integrated Solutions', 'Optimal Technologies', 'Superior Services', 'Excellence Corp',
            'Dynamic Enterprises', 'Progressive Solutions', 'Modern Systems', 'Professional Services',
            'Expert Consultants', 'Quality Assurance Inc', 'Reliable Solutions', 'Trusted Partners'
        ]
        
        self.industries = [
            'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
            'Real Estate', 'Consulting', 'Marketing', 'Legal', 'Construction', 'Hospitality'
        ]
        
        self.departments = [
            'Sales', 'Marketing', 'Engineering', 'Customer Support', 'Finance', 'HR',
            'Operations', 'IT', 'Product', 'Legal'
        ]
        
        self.designations = [
            'Sales Executive', 'Account Manager', 'Sales Director', 'Business Development Manager',
            'Customer Success Manager', 'Marketing Manager', 'Product Manager', 'Support Engineer',
            'Financial Analyst', 'HR Manager', 'Operations Manager', 'Team Lead'
        ]
        
        self.cities = [
            'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
            'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
            'Seattle', 'Denver', 'Boston', 'Portland', 'Miami', 'Atlanta'
        ]
        
        self.states = [
            'California', 'Texas', 'Florida', 'New York', 'Pennsylvania', 'Illinois',
            'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'Washington', 'Arizona'
        ]
    
    def clear_existing_data(self):
        """Clear existing data (optional - use with caution)"""
        print("\n[WARNING]  Warning: This will delete all existing data!")
        response = input("Do you want to continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Seeding cancelled.")
            sys.exit(0)
        
        print("\nClearing existing data...")
        with transaction.atomic():
            Activity.objects.all().delete()
            Issue.objects.all().delete()
            OrderItem.objects.all().delete()
            Order.objects.all().delete()
            Payment.objects.all().delete()
            Deal.objects.all().delete()
            PipelineStage.objects.all().delete()
            Pipeline.objects.all().delete()
            Lead.objects.all().delete()
            Customer.objects.all().delete()
            Vendor.objects.all().delete()
            Employee.objects.all().delete()
            UserRole.objects.all().delete()
            UserProfile.objects.all().delete()
            UserOrganization.objects.all().delete()
            # Don't delete Roles and Permissions as they might be system defaults
            Organization.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
        
        print("[OK] Existing data cleared")
    
    def create_permissions(self, organization):
        """Create system permissions for an organization"""
        permissions_data = [
            ('leads', 'read', 'View all leads in the system'),
            ('leads', 'create', 'Create new leads'),
            ('leads', 'update', 'Edit leads'),
            ('leads', 'delete', 'Delete leads'),
            ('deals', 'read', 'View all deals'),
            ('deals', 'create', 'Create new deals'),
            ('deals', 'update', 'Edit deals'),
            ('deals', 'delete', 'Delete deals'),
            ('customers', 'read', 'View all customers'),
            ('customers', 'create', 'Create new customers'),
            ('customers', 'update', 'Edit customers'),
            ('customers', 'delete', 'Delete customers'),
            ('vendors', 'read', 'View vendors'),
            ('vendors', 'create', 'Create vendors'),
            ('vendors', 'update', 'Edit vendors'),
            ('vendors', 'delete', 'Delete vendors'),
            ('employees', 'read', 'View employees'),
            ('employees', 'create', 'Create employees'),
            ('employees', 'update', 'Edit employees'),
            ('orders', 'read', 'View orders'),
            ('orders', 'create', 'Create orders'),
            ('orders', 'update', 'Edit orders'),
            ('issues', 'read', 'View issues'),
            ('issues', 'create', 'Create issues'),
            ('issues', 'update', 'Edit issues'),
            ('reports', 'read', 'View reports and analytics'),
            ('organization', 'manage', 'Manage organization settings'),
        ]
        
        org_permissions = []
        for resource, action, description in permissions_data:
            permission, created = Permission.objects.get_or_create(
                organization=organization,
                resource=resource,
                action=action,
                defaults={
                    'description': description,
                    'is_system_permission': True
                }
            )
            org_permissions.append(permission)
        
        return org_permissions
    
    def create_organizations(self, count=5):
        """Create sample organizations"""
        print(f"\nCreating {count} organizations...")
        
        org_names = [
            'Acme Corporation',
            'TechVentures Inc',
            'Global Solutions Ltd',
            'Innovation Partners',
            'Enterprise Systems Co'
        ]
        
        for i in range(count):
            org = Organization.objects.create(
                name=org_names[i] if i < len(org_names) else f"Organization {i+1}",
                description=f"Sample organization for testing and development",
                industry=random.choice(self.industries),
                website=f"https://org{i+1}.example.com",
                phone=f"+1-555-{random.randint(1000, 9999)}",
                email=f"contact@org{i+1}.example.com",
                address=f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Park', 'Maple'])} Street",
                city=random.choice(self.cities),
                state=random.choice(self.states),
                country='United States',
                postal_code=f"{random.randint(10000, 99999)}",
                subscription_plan=random.choice(['basic', 'professional', 'enterprise']),
                subscription_status='active',
                is_active=True
            )
            self.organizations.append(org)
        
        print(f"[OK] Created {len(self.organizations)} organizations")
        return self.organizations
    
    def create_users(self, count=30):
        """Create sample users"""
        print(f"\nCreating {count} users...")
        
        for i in range(count):
            first_name = random.choice(self.first_names)
            last_name = random.choice(self.last_names)
            username = f"{first_name.lower()}.{last_name.lower()}{i}"
            email = f"{username}@example.com"
            
            user = User.objects.create_user(
                email=email,
                username=username,
                password='password123',  # Default password for testing
                first_name=first_name,
                last_name=last_name,
                phone=f"+1-555-{random.randint(1000, 9999)}",
                is_active=True,
                is_verified=True
            )
            self.users.append(user)
        
        print(f"[OK] Created {len(self.users)} users")
        return self.users
    
    def create_roles(self, organization):
        """Create roles for an organization"""
        # Create permissions first
        org_permissions = self.create_permissions(organization)
        
        roles_data = [
            ('Admin', 'Full administrative access', False),
            ('Sales Manager', 'Manage sales team and deals', False),
            ('Sales Representative', 'Handle customer interactions', False),
            ('Support Staff', 'Customer support activities', False),
            ('Manager', 'Team management', False),
        ]
        
        org_roles = []
        for name, description, is_system in roles_data:
            # Create slug from name
            slug = name.lower().replace(' ', '-')
            role, created = Role.objects.get_or_create(
                organization=organization,
                slug=slug,
                defaults={
                    'name': name,
                    'description': description,
                    'is_system_role': is_system
                }
            )
            org_roles.append(role)
        
        return org_roles
    
    def link_users_to_organizations(self):
        """Link users to organizations and create profiles"""
        print("\nLinking users to organizations...")
        
        # Track which users have been assigned to prevent duplication
        # Since users can only be active employees in ONE organization
        assigned_users = set()
        available_users = list(self.users)
        random.shuffle(available_users)
        
        for org in self.organizations:
            # Create roles for this organization
            org_roles = self.create_roles(org)
            
            # Assign 5-10 users per organization (but only from unassigned users)
            org_user_count = random.randint(5, 10)
            
            # Get users that haven't been assigned yet
            remaining_users = [u for u in available_users if u not in assigned_users]
            selected_users = remaining_users[:org_user_count]
            
            for idx, user in enumerate(selected_users):
                # Create UserOrganization
                user_org, _ = UserOrganization.objects.get_or_create(
                    user=user,
                    organization=org,
                    defaults={
                        'is_active': True,
                        'is_owner': (idx == 0)  # First user is owner
                    }
                )
                
                # Assign a role
                role = random.choice(org_roles)
                UserRole.objects.get_or_create(
                    user=user,
                    organization=org,
                    role=role
                )
                
                # Create user profile (employee) - only if they don't already have one
                UserProfile.objects.get_or_create(
                    user=user,
                    profile_type='employee',
                    defaults={
                        'organization': org,
                        'is_primary': True,
                        'status': 'active'
                    }
                )
                
                # Mark this user as assigned
                assigned_users.add(user)
        
        print("[OK] Users linked to organizations")
    
    def create_employees(self):
        """Create employees for each organization"""
        print("\nCreating employees...")
        
        for org in self.organizations:
            user_orgs = UserOrganization.objects.filter(organization=org)
            
            for idx, user_org in enumerate(user_orgs):
                user = user_org.user
                
                # Get the user profile that was created earlier
                user_profile = UserProfile.objects.filter(
                    user=user,
                    profile_type='employee'
                ).first()
                
                employee = Employee.objects.create(
                    organization=org,
                    user=user,
                    user_profile=user_profile,
                    code=f"EMP-{org.id}-{idx+1:04d}",
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email,
                    phone=user.phone,
                    department=random.choice(self.departments),
                    job_title=random.choice(self.designations),
                    employment_type=random.choice(['full-time', 'part-time', 'contract']),
                    hire_date=date.today() - timedelta(days=random.randint(30, 730)),
                    status='active',
                    address=f"{random.randint(100, 9999)} {random.choice(['Main', 'Oak', 'Park'])} St",
                    city=random.choice(self.cities),
                    state=random.choice(self.states),
                    country='United States',
                    postal_code=f"{random.randint(10000, 99999)}"
                )
                self.employees.append(employee)
        
        print(f"[OK] Created {len(self.employees)} employees")
        return self.employees
    
    def create_vendors(self, count_per_org=5):
        """Create vendors for each organization"""
        print(f"\nCreating vendors ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_employees = [emp for emp in self.employees if emp.organization == org]
            
            for i in range(count_per_org):
                vendor = Vendor.objects.create(
                    organization=org,
                    code=f"VEN-{org.id}-{i+1:04d}",
                    name=random.choice(self.company_names),
                    company_name=random.choice(self.company_names),
                    contact_person=f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
                    email=f"vendor{i+1}@{org.slug}.example.com",
                    phone=f"+1-555-{random.randint(1000, 9999)}",
                    website=f"https://vendor{i+1}.example.com",
                    industry=random.choice(self.industries),
                    rating=Decimal(str(random.uniform(3.0, 5.0))),
                    status='active',
                    address=f"{random.randint(100, 9999)} Business Blvd",
                    city=random.choice(self.cities),
                    state=random.choice(self.states),
                    country='United States',
                    postal_code=f"{random.randint(10000, 99999)}",
                    payment_terms=random.choice(['Net 30', 'Net 60', 'COD', 'Prepaid']),
                    credit_limit=Decimal(random.randint(10000, 100000)),
                    assigned_employee=random.choice(org_employees) if org_employees else None
                )
                self.vendors.append(vendor)
        
        print(f"[OK] Created {len(self.vendors)} vendors")
        return self.vendors
    
    def create_customers(self, count_per_org=10):
        """Create customers for each organization"""
        print(f"\nCreating customers ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_employees = [emp for emp in self.employees if emp.organization == org]
            
            for i in range(count_per_org):
                is_business = random.choice([True, False])
                first_name = random.choice(self.first_names)
                last_name = random.choice(self.last_names)
                
                customer = Customer.objects.create(
                    organization=org,
                    code=f"CUST-{org.id}-{i+1:04d}",
                    name=f"{first_name} {last_name}",
                    company_name=random.choice(self.company_names) if is_business else None,
                    first_name=first_name,
                    last_name=last_name,
                    email=f"{first_name.lower()}.{last_name.lower()}.{i}@customer.example.com",
                    phone=f"+1-555-{random.randint(1000, 9999)}",
                    website=f"https://customer{i+1}.example.com" if is_business else None,
                    industry=random.choice(self.industries) if is_business else None,
                    customer_type='business' if is_business else 'individual',
                    status='active',
                    rating=Decimal(str(random.uniform(3.0, 5.0))),
                    credit_limit=Decimal(random.randint(5000, 50000)),
                    payment_terms=random.choice(['Net 30', 'Net 60', 'COD']),
                    address=f"{random.randint(100, 9999)} Customer Ave",
                    city=random.choice(self.cities),
                    state=random.choice(self.states),
                    country='United States',
                    postal_code=f"{random.randint(10000, 99999)}",
                    assigned_to=random.choice(org_employees) if org_employees else None
                )
                self.customers.append(customer)
        
        print(f"[OK] Created {len(self.customers)} customers")
        return self.customers
    
    def create_leads(self, count_per_org=15):
        """Create leads for each organization"""
        print(f"\nCreating leads ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_employees = [emp for emp in self.employees if emp.organization == org]
            
            for i in range(count_per_org):
                first_name = random.choice(self.first_names)
                last_name = random.choice(self.last_names)
                
                lead = Lead.objects.create(
                    organization=org,
                    code=f"LEAD-{org.id}-{i+1:04d}",
                    name=f"{first_name} {last_name}",
                    organization_name=random.choice(self.company_names),
                    email=f"{first_name.lower()}.{last_name.lower()}.lead{i}@example.com",
                    phone=f"+1-555-{random.randint(1000, 9999)}",
                    job_title=random.choice(self.designations),
                    source=random.choice(['website', 'referral', 'cold_call', 'social_media', 'event']),
                    qualification_status=random.choice(['new', 'contacted', 'qualified', 'unqualified']),
                    estimated_value=Decimal(random.randint(5000, 100000)),
                    address=f"{random.randint(100, 9999)} Lead Lane",
                    city=random.choice(self.cities),
                    state=random.choice(self.states),
                    country='United States',
                    postal_code=f"{random.randint(10000, 99999)}",
                    assigned_to=random.choice(org_employees) if org_employees else None
                )
                self.leads.append(lead)
        
        print(f"[OK] Created {len(self.leads)} leads")
        return self.leads
    
    def create_pipelines(self):
        """Create sales pipelines for each organization"""
        print("\nCreating sales pipelines...")
        
        for org in self.organizations:
            pipeline = Pipeline.objects.create(
                organization=org,
                name="Sales Pipeline",
                description="Main sales pipeline",
                is_default=True,
                is_active=True
            )
            self.pipelines.append(pipeline)
            
            # Create stages for this pipeline
            stages_data = [
                ('Qualification', 1, 10),
                ('Needs Analysis', 2, 25),
                ('Proposal', 3, 50),
                ('Negotiation', 4, 75),
                ('Closed Won', 5, 100),
                ('Closed Lost', 6, 0),
            ]
            
            for stage_name, order, probability in stages_data:
                stage = PipelineStage.objects.create(
                    pipeline=pipeline,
                    name=stage_name,
                    order=order,
                    probability=Decimal(probability),
                    is_closed_won=(stage_name == 'Closed Won'),
                    is_closed_lost=(stage_name == 'Closed Lost')
                )
                self.pipeline_stages.append(stage)
        
        print(f"[OK] Created {len(self.pipelines)} pipelines with {len(self.pipeline_stages)} stages")
        return self.pipelines
    
    def create_deals(self, count_per_org=20):
        """Create deals for each organization"""
        print(f"\nCreating deals ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_customers = [cust for cust in self.customers if cust.organization == org]
            org_leads = [lead for lead in self.leads if lead.organization == org]
            org_employees = [emp for emp in self.employees if emp.organization == org]
            org_pipeline = next((p for p in self.pipelines if p.organization == org), None)
            
            if not org_pipeline:
                continue
            
            org_stages = [stage for stage in self.pipeline_stages if stage.pipeline == org_pipeline]
            
            for i in range(count_per_org):
                stage = random.choice(org_stages)
                
                deal = Deal.objects.create(
                    organization=org,
                    code=f"DEAL-{org.id}-{i+1:04d}",
                    title=f"Deal - {random.choice(self.company_names)}",
                    customer=random.choice(org_customers) if org_customers else None,
                    lead=random.choice(org_leads) if org_leads and random.random() > 0.5 else None,
                    pipeline=org_pipeline,
                    stage=stage,
                    value=Decimal(random.randint(10000, 500000)),
                    expected_close_date=date.today() + timedelta(days=random.randint(1, 180)),
                    probability=stage.probability,
                    priority=random.choice(['low', 'medium', 'high', 'urgent']),
                    status='active',
                    assigned_to=random.choice(org_employees) if org_employees else None,
                    description=f"Sample deal for testing purposes",
                    notes=f"This is a test deal created for seeding data"
                )
                self.deals.append(deal)
        
        print(f"[OK] Created {len(self.deals)} deals")
        return self.deals
    
    def create_orders(self, count_per_org=10):
        """Create orders for each organization"""
        print(f"\nCreating orders ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_vendors = [v for v in self.vendors if v.organization == org]
            org_customers = [c for c in self.customers if c.organization == org]
            org_employees = [e for e in self.employees if e.organization == org]
            org_users = [e.user for e in org_employees if e.user]
            
            for i in range(count_per_org):
                order = Order.objects.create(
                    organization=org,
                    code=f"ORD-{org.id}-{i+1:04d}",
                    order_number=f"PO-{random.randint(10000, 99999)}",
                    title=f"Purchase Order {i+1}",
                    description=f"Sample order for testing",
                    vendor=random.choice(org_vendors) if org_vendors and random.random() > 0.3 else None,
                    customer=random.choice(org_customers) if org_customers and random.random() > 0.3 else None,
                    order_type=random.choice(['purchase', 'service', 'subscription']),
                    status=random.choice(['draft', 'pending', 'approved', 'in_progress', 'completed']),
                    total_amount=Decimal(random.randint(1000, 50000)),
                    currency='USD',
                    tax_amount=Decimal(random.randint(50, 5000)),
                    order_date=date.today() - timedelta(days=random.randint(0, 90)),
                    expected_delivery=date.today() + timedelta(days=random.randint(1, 60)),
                    assigned_to=random.choice(org_employees) if org_employees else None,
                    created_by=random.choice(org_users) if org_users else None
                )
                self.orders.append(order)
                
                # Create order items
                item_count = random.randint(1, 5)
                for j in range(item_count):
                    OrderItem.objects.create(
                        order=order,
                        product_name=f"Product {j+1}",
                        description=f"Sample product description",
                        sku=f"SKU-{random.randint(1000, 9999)}",
                        quantity=Decimal(random.randint(1, 100)),
                        unit_price=Decimal(random.randint(10, 1000)),
                        total_price=Decimal(random.randint(100, 10000))
                    )
        
        print(f"[OK] Created {len(self.orders)} orders")
        return self.orders
    
    def create_payments(self, count_per_org=8):
        """Create payments for each organization"""
        print(f"\nCreating payments ({count_per_org} per organization)...")
        
        created_count = 0
        for org in self.organizations:
            org_orders = [o for o in self.orders if o.organization == org]
            org_vendors = [v for v in self.vendors if v.organization == org]
            org_customers = [c for c in self.customers if c.organization == org]
            org_employees = [e for e in self.employees if e.organization == org]
            org_users = [e.user for e in org_employees if e.user]
            
            for i in range(count_per_org):
                payment = Payment.objects.create(
                    organization=org,
                    code=f"PAY-{org.id}-{i+1:04d}",
                    payment_number=f"PAY-{random.randint(10000, 99999)}",
                    invoice_number=f"INV-{random.randint(10000, 99999)}",
                    order=random.choice(org_orders) if org_orders and random.random() > 0.5 else None,
                    vendor=random.choice(org_vendors) if org_vendors and random.random() > 0.3 else None,
                    customer=random.choice(org_customers) if org_customers and random.random() > 0.3 else None,
                    payment_type=random.choice(['incoming', 'outgoing']),
                    payment_method=random.choice(['bank_transfer', 'credit_card', 'check', 'cash']),
                    amount=Decimal(random.randint(500, 50000)),
                    currency='USD',
                    payment_date=date.today() - timedelta(days=random.randint(0, 60)),
                    due_date=date.today() + timedelta(days=random.randint(1, 90)),
                    status='completed',
                    created_by=random.choice(org_users) if org_users else None
                )
                created_count += 1
        
        print(f"[OK] Created {created_count} payments")
    
    def create_issues(self, count_per_org=12):
        """Create issues for each organization"""
        print(f"\nCreating issues ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_vendors = [v for v in self.vendors if v.organization == org]
            org_orders = [o for o in self.orders if o.organization == org]
            org_employees = [e for e in self.employees if e.organization == org]
            org_users = [e.user for e in org_employees if e.user]
            
            for i in range(count_per_org):
                issue = Issue.objects.create(
                    organization=org,
                    code=f"ISS-{org.id}-{i+1:04d}",
                    issue_number=f"ISSUE-{random.randint(1000, 9999)}",
                    title=f"Issue: {random.choice(['Delayed Delivery', 'Quality Problem', 'Billing Error', 'Communication Issue', 'Technical Problem'])}",
                    description=f"Sample issue description for testing purposes. This is issue #{i+1}.",
                    vendor=random.choice(org_vendors) if org_vendors and random.random() > 0.5 else None,
                    order=random.choice(org_orders) if org_orders and random.random() > 0.5 else None,
                    priority=random.choice(['low', 'medium', 'high', 'urgent']),
                    category=random.choice(['delivery', 'quality', 'billing', 'communication', 'technical', 'other']),
                    status='open',
                    assigned_to=random.choice(org_employees) if org_employees else None,
                    created_by=random.choice(org_users) if org_users else None
                )
                self.issues.append(issue)
        
        print(f"[OK] Created {len(self.issues)} issues")
        return self.issues
    
    def create_activities(self, count_per_org=25):
        """Create activities for each organization"""
        print(f"\nCreating activities ({count_per_org} per organization)...")
        
        for org in self.organizations:
            org_customers = [c for c in self.customers if c.organization == org]
            org_leads = [l for l in self.leads if l.organization == org]
            org_deals = [d for d in self.deals if d.organization == org]
            org_employees = [e for e in self.employees if e.organization == org]
            org_users = [e.user for e in org_employees if e.user]
            
            for i in range(count_per_org):
                activity_type = random.choice(['call', 'email', 'meeting', 'note', 'task'])
                
                activity_data = {
                    'organization': org,
                    'activity_type': activity_type,
                    'title': f"{activity_type.title()} - {random.choice(['Follow up', 'Initial contact', 'Demo', 'Discussion', 'Review'])}",
                    'description': f"Sample {activity_type} activity for testing",
                    'customer': random.choice(org_customers) if org_customers and random.random() > 0.3 else None,
                    'lead': random.choice(org_leads) if org_leads and random.random() > 0.5 else None,
                    'deal': random.choice(org_deals) if org_deals and random.random() > 0.5 else None,
                    'status': random.choice(['scheduled', 'in_progress', 'completed']),
                    'scheduled_at': datetime.now() + timedelta(hours=random.randint(-100, 100)),
                    'assigned_to': random.choice(org_employees) if org_employees else None,
                    'created_by': random.choice(org_users) if org_users else None
                }
                
                # Add type-specific fields
                if activity_type == 'call':
                    activity_data['phone_number'] = f"+1-555-{random.randint(1000, 9999)}"
                    activity_data['call_duration'] = random.randint(60, 1800)
                elif activity_type == 'email':
                    activity_data['email_subject'] = f"Subject: {activity_data['title']}"
                    activity_data['email_body'] = f"Email body content for testing"
                    activity_data['email_to'] = f"recipient@example.com"
                elif activity_type == 'meeting':
                    activity_data['meeting_location'] = random.choice(['Office', 'Client Site', 'Virtual'])
                    activity_data['duration_minutes'] = random.choice([30, 60, 90, 120])
                elif activity_type == 'task':
                    activity_data['task_priority'] = random.choice(['low', 'medium', 'high'])
                    activity_data['task_due_date'] = date.today() + timedelta(days=random.randint(1, 30))
                
                activity = Activity.objects.create(**activity_data)
                self.activities.append(activity)
        
        print(f"[OK] Created {len(self.activities)} activities")
        return self.activities
    
    def create_notification_preferences(self):
        """Create notification preferences for users"""
        print("\nSkipping notification preferences (model structure different)...")
        # Skipping for now - model structure needs verification
        return
    
    def run(self, clear_data=False):
        """Run the complete seeding process"""
        print("\n" + "="*60)
        print("Too Good CRM - Database Seeding Script")
        print("="*60)
        
        if clear_data:
            self.clear_existing_data()
        
        try:
            with transaction.atomic():
                # Core setup
                self.create_organizations(count=3)
                self.create_users(count=25)
                self.link_users_to_organizations()
                
                # CRM entities
                self.create_employees()
                self.create_vendors(count_per_org=8)
                self.create_customers(count_per_org=15)
                self.create_leads(count_per_org=20)
                
                # Sales pipeline
                self.create_pipelines()
                self.create_deals(count_per_org=25)
                
                # Operations
                self.create_orders(count_per_org=12)
                self.create_payments(count_per_org=10)
                self.create_issues(count_per_org=15)
                self.create_activities(count_per_org=30)
                
                # Preferences
                self.create_notification_preferences()
            
            print("\n" + "="*60)
            print("[OK] Database seeding completed successfully!")
            print("="*60)
            print(f"\nSummary:")
            print(f"  - Organizations: {len(self.organizations)}")
            print(f"  - Users: {len(self.users)}")
            print(f"  - Employees: {len(self.employees)}")
            print(f"  - Vendors: {len(self.vendors)}")
            print(f"  - Customers: {len(self.customers)}")
            print(f"  - Leads: {len(self.leads)}")
            print(f"  - Deals: {len(self.deals)}")
            print(f"  - Orders: {len(self.orders)}")
            print(f"  - Issues: {len(self.issues)}")
            print(f"  - Activities: {len(self.activities)}")
            print(f"\nDefault login credentials:")
            print(f"  Email: (any user email from above)")
            print(f"  Password: password123")
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"\n[ERROR] Error during seeding: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Seed the CRM database with dummy data')
    parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')
    args = parser.parse_args()
    
    seeder = DataSeeder()
    seeder.run(clear_data=args.clear)

