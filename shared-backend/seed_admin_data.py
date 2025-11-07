#!/usr/bin/env python
"""
Seed Data Script for admin@crm.com
Creates comprehensive test data: customers, leads, deals, employees
Also sets up complete RBAC system with predefined permissions
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.utils import timezone
from django.contrib.auth.hashers import make_password
from crmApp.models import (
    User, Organization, UserOrganization, UserProfile,
    Employee, Vendor, Customer, Lead, Pipeline, PipelineStage, Deal,
    Order, OrderItem, Payment, Issue, Activity, NotificationPreferences,
    Permission, Role, UserRole, RolePermission
)

# Color codes for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def get_or_create_admin_user():
    """Get or create admin@crm.com user"""
    print_header("SETTING UP ADMIN USER")
    
    try:
        admin = User.objects.get(email='admin@crm.com')
        print_info(f"Found existing admin user: {admin.email}")
    except User.DoesNotExist:
        admin = User.objects.create(
            email='admin@crm.com',
            username='admin',
            first_name='Admin',
            last_name='User',
            phone='+1-555-0000',
            is_staff=True,
            is_superuser=True
        )
        admin.set_password('admin123')
        admin.save()
        print_success(f"Created admin user: {admin.email} (password: admin123)")
    
    return admin


def get_or_create_organization(admin):
    """Get or create organization for admin"""
    print_header("SETTING UP ORGANIZATION")
    
    org_name = 'CRM Admin Organization'
    org_slug = 'crm-admin-org'
    
    try:
        org = Organization.objects.get(slug=org_slug)
        print_info(f"Found existing organization: {org.name}")
    except Organization.DoesNotExist:
        org = Organization.objects.create(
            name=org_name,
            slug=org_slug,
            email='admin@crm.com',
            phone='+1-555-0000',
            website='https://crmadmin.com',
            address='123 Admin Street',
            city='San Francisco',
            state='CA',
            postal_code='94105',
            country='USA'
        )
        print_success(f"Created organization: {org.name}")
    
    # Link admin to organization
    user_org, created = UserOrganization.objects.get_or_create(
        user=admin,
        organization=org,
        defaults={
            'is_owner': True,
            'is_active': True
        }
    )
    if created:
        print_success(f"Linked admin to organization as owner")
    
    # Create profiles for admin
    for profile_type in ['vendor', 'employee', 'customer']:
        profile, created = UserProfile.objects.get_or_create(
            user=admin,
            organization=org,
            profile_type=profile_type,
            defaults={
                'is_primary': (profile_type == 'vendor'),
                'status': 'active',
                'activated_at': timezone.now()
            }
        )
        if created:
            print_success(f"Created {profile_type} profile for admin")
    
    return org


def create_predefined_permissions(org):
    """Create all predefined permissions for the organization"""
    print_header("CREATING PREDEFINED PERMISSIONS")
    
    # Define all available permissions by resource and action
    PREDEFINED_PERMISSIONS = [
        # Customer Management
        {'resource': 'customers', 'action': 'read', 'description': 'View customer list and details'},
        {'resource': 'customers', 'action': 'create', 'description': 'Create new customers'},
        {'resource': 'customers', 'action': 'update', 'description': 'Edit customer information'},
        {'resource': 'customers', 'action': 'delete', 'description': 'Delete customers'},
        {'resource': 'customers', 'action': 'export', 'description': 'Export customer data'},
        
        # Lead Management
        {'resource': 'leads', 'action': 'read', 'description': 'View lead list and details'},
        {'resource': 'leads', 'action': 'create', 'description': 'Create new leads'},
        {'resource': 'leads', 'action': 'update', 'description': 'Edit lead information'},
        {'resource': 'leads', 'action': 'delete', 'description': 'Delete leads'},
        {'resource': 'leads', 'action': 'convert', 'description': 'Convert leads to customers/deals'},
        {'resource': 'leads', 'action': 'assign', 'description': 'Assign leads to team members'},
        {'resource': 'leads', 'action': 'export', 'description': 'Export lead data'},
        
        # Deal Management
        {'resource': 'deals', 'action': 'read', 'description': 'View deal list and details'},
        {'resource': 'deals', 'action': 'create', 'description': 'Create new deals'},
        {'resource': 'deals', 'action': 'update', 'description': 'Edit deal information'},
        {'resource': 'deals', 'action': 'delete', 'description': 'Delete deals'},
        {'resource': 'deals', 'action': 'close', 'description': 'Close deals (won/lost)'},
        {'resource': 'deals', 'action': 'assign', 'description': 'Assign deals to team members'},
        {'resource': 'deals', 'action': 'export', 'description': 'Export deal data'},
        
        # Employee Management
        {'resource': 'employees', 'action': 'read', 'description': 'View employee list and details'},
        {'resource': 'employees', 'action': 'create', 'description': 'Add new employees'},
        {'resource': 'employees', 'action': 'update', 'description': 'Edit employee information'},
        {'resource': 'employees', 'action': 'delete', 'description': 'Remove employees'},
        {'resource': 'employees', 'action': 'invite', 'description': 'Send employee invitations'},
        
        # Order Management
        {'resource': 'orders', 'action': 'read', 'description': 'View order list and details'},
        {'resource': 'orders', 'action': 'create', 'description': 'Create new orders'},
        {'resource': 'orders', 'action': 'update', 'description': 'Edit order information'},
        {'resource': 'orders', 'action': 'delete', 'description': 'Cancel/delete orders'},
        {'resource': 'orders', 'action': 'complete', 'description': 'Mark orders as complete'},
        
        # Payment Management
        {'resource': 'payments', 'action': 'read', 'description': 'View payment records'},
        {'resource': 'payments', 'action': 'create', 'description': 'Record payments'},
        {'resource': 'payments', 'action': 'update', 'description': 'Edit payment information'},
        {'resource': 'payments', 'action': 'confirm', 'description': 'Confirm payments'},
        {'resource': 'payments', 'action': 'refund', 'description': 'Process refunds'},
        
        # Issue Management
        {'resource': 'issues', 'action': 'read', 'description': 'View issues/tickets'},
        {'resource': 'issues', 'action': 'create', 'description': 'Create new issues'},
        {'resource': 'issues', 'action': 'update', 'description': 'Edit issue information'},
        {'resource': 'issues', 'action': 'delete', 'description': 'Delete issues'},
        {'resource': 'issues', 'action': 'resolve', 'description': 'Resolve issues'},
        {'resource': 'issues', 'action': 'assign', 'description': 'Assign issues to team members'},
        
        # Analytics & Reports
        {'resource': 'analytics', 'action': 'read', 'description': 'View analytics and reports'},
        {'resource': 'analytics', 'action': 'export', 'description': 'Export reports'},
        
        # Dashboard
        {'resource': 'dashboard', 'action': 'read', 'description': 'View dashboard'},
        
        # Activities
        {'resource': 'activities', 'action': 'read', 'description': 'View activity timeline'},
        {'resource': 'activities', 'action': 'create', 'description': 'Log activities'},
        {'resource': 'activities', 'action': 'update', 'description': 'Edit activities'},
        {'resource': 'activities', 'action': 'delete', 'description': 'Delete activities'},
        
        # Settings
        {'resource': 'settings', 'action': 'read', 'description': 'View settings'},
        {'resource': 'settings', 'action': 'update', 'description': 'Modify settings'},
        
        # Roles & Permissions
        {'resource': 'roles', 'action': 'read', 'description': 'View roles'},
        {'resource': 'roles', 'action': 'create', 'description': 'Create roles'},
        {'resource': 'roles', 'action': 'update', 'description': 'Edit roles'},
        {'resource': 'roles', 'action': 'delete', 'description': 'Delete roles'},
        {'resource': 'roles', 'action': 'assign', 'description': 'Assign roles to users'},
        
        # Notifications
        {'resource': 'notifications', 'action': 'read', 'description': 'View notifications'},
        {'resource': 'notifications', 'action': 'create', 'description': 'Send notifications'},
        
        # Organization
        {'resource': 'organization', 'action': 'read', 'description': 'View organization details'},
        {'resource': 'organization', 'action': 'update', 'description': 'Edit organization settings'},
    ]
    
    created_permissions = []
    for perm_data in PREDEFINED_PERMISSIONS:
        perm, created = Permission.objects.get_or_create(
            organization=org,
            resource=perm_data['resource'],
            action=perm_data['action'],
            defaults={
                'description': perm_data['description'],
                'is_system_permission': True
            }
        )
        created_permissions.append(perm)
        if created:
            print_success(f"✓ {perm.resource}:{perm.action}")
    
    print_info(f"\nTotal permissions: {len(created_permissions)}")
    return created_permissions


def create_default_roles(org, permissions):
    """Create default roles with permission assignments"""
    print_header("CREATING DEFAULT ROLES")
    
    # Admin Role - All permissions
    admin_role, created = Role.objects.get_or_create(
        organization=org,
        slug='admin',
        defaults={
            'name': 'Administrator',
            'description': 'Full system access with all permissions',
            'is_system_role': True,
            'is_active': True
        }
    )
    if created:
        for perm in permissions:
            RolePermission.objects.get_or_create(role=admin_role, permission=perm)
        print_success(f"Created Admin role with {len(permissions)} permissions")
    
    # Manager Role - Management level access
    manager_role, created = Role.objects.get_or_create(
        organization=org,
        slug='manager',
        defaults={
            'name': 'Manager',
            'description': 'Team management and analytics access',
            'is_system_role': True,
            'is_active': True
        }
    )
    if created:
        manager_perms = [p for p in permissions if p.resource in [
            'customers', 'leads', 'deals', 'employees', 'orders', 'payments', 
            'issues', 'analytics', 'dashboard', 'activities', 'notifications'
        ] and p.action in ['read', 'create', 'update', 'assign', 'export']]
        for perm in manager_perms:
            RolePermission.objects.get_or_create(role=manager_role, permission=perm)
        print_success(f"Created Manager role with {len(manager_perms)} permissions")
    
    # Sales Representative Role
    sales_role, created = Role.objects.get_or_create(
        organization=org,
        slug='sales-representative',
        defaults={
            'name': 'Sales Representative',
            'description': 'Sales operations: customers, leads, deals',
            'is_system_role': True,
            'is_active': True
        }
    )
    if created:
        sales_perms = [p for p in permissions if p.resource in [
            'customers', 'leads', 'deals', 'dashboard', 'activities'
        ] and p.action in ['read', 'create', 'update', 'convert', 'close']]
        for perm in sales_perms:
            RolePermission.objects.get_or_create(role=sales_role, permission=perm)
        print_success(f"Created Sales Representative role with {len(sales_perms)} permissions")
    
    # Customer Support Role
    support_role, created = Role.objects.get_or_create(
        organization=org,
        slug='customer-support',
        defaults={
            'name': 'Customer Support',
            'description': 'Customer service and issue management',
            'is_system_role': True,
            'is_active': True
        }
    )
    if created:
        support_perms = [p for p in permissions if p.resource in [
            'customers', 'issues', 'orders', 'payments', 'dashboard', 'activities'
        ] and p.action in ['read', 'create', 'update', 'resolve', 'assign']]
        for perm in support_perms:
            RolePermission.objects.get_or_create(role=support_role, permission=perm)
        print_success(f"Created Customer Support role with {len(support_perms)} permissions")
    
    # Viewer Role - Read-only access
    viewer_role, created = Role.objects.get_or_create(
        organization=org,
        slug='viewer',
        defaults={
            'name': 'Viewer',
            'description': 'Read-only access to basic information',
            'is_system_role': True,
            'is_active': True
        }
    )
    if created:
        viewer_perms = [p for p in permissions if p.action == 'read']
        for perm in viewer_perms:
            RolePermission.objects.get_or_create(role=viewer_role, permission=perm)
        print_success(f"Created Viewer role with {len(viewer_perms)} permissions")
    
    return {
        'admin': admin_role,
        'manager': manager_role,
        'sales': sales_role,
        'support': support_role,
        'viewer': viewer_role
    }


def create_employees(org, admin, roles):
    """Create employee records"""
    print_header("CREATING EMPLOYEES")
    
    employees_data = [
        {
            'email': 'john.sales@crmadmin.com',
            'first_name': 'John',
            'last_name': 'Sales',
            'phone': '+1-555-1001',
            'role': roles['sales'],
            'title': 'Sales Representative',
            'department': 'Sales'
        },
        {
            'email': 'sarah.manager@crmadmin.com',
            'first_name': 'Sarah',
            'last_name': 'Manager',
            'phone': '+1-555-1002',
            'role': roles['manager'],
            'title': 'Sales Manager',
            'department': 'Sales'
        },
        {
            'email': 'mike.support@crmadmin.com',
            'first_name': 'Mike',
            'last_name': 'Support',
            'phone': '+1-555-1003',
            'role': roles['support'],
            'title': 'Customer Support Specialist',
            'department': 'Support'
        },
        {
            'email': 'lisa.sales@crmadmin.com',
            'first_name': 'Lisa',
            'last_name': 'Thompson',
            'phone': '+1-555-1004',
            'role': roles['sales'],
            'title': 'Senior Sales Representative',
            'department': 'Sales'
        },
    ]
    
    created_employees = []
    
    for emp_data in employees_data:
        # Create user if doesn't exist
        username = emp_data['email'].split('@')[0].replace('.', '_')
        user, user_created = User.objects.get_or_create(
            email=emp_data['email'],
            defaults={
                'username': username,
                'first_name': emp_data['first_name'],
                'last_name': emp_data['last_name'],
                'phone': emp_data['phone']
            }
        )
        
        if user_created:
            user.set_password('password123')
            user.save()
        
        # Link to organization
        UserOrganization.objects.get_or_create(
            user=user,
            organization=org,
            defaults={'is_active': True}
        )
        
        # Create profiles
        for profile_type in ['vendor', 'employee', 'customer']:
            UserProfile.objects.get_or_create(
                user=user,
                organization=org,
                profile_type=profile_type,
                defaults={
                    'is_primary': (profile_type == 'employee'),
                    'status': 'active',
                    'activated_at': timezone.now()
                }
            )
        
        # Create employee record
        employee, created = Employee.objects.get_or_create(
            user=user,
            organization=org,
            defaults={
                'first_name': emp_data['first_name'],
                'last_name': emp_data['last_name'],
                'code': f'EMP{user.id:04d}',
                'job_title': emp_data['title'],
                'department': emp_data['department'],
                'role': emp_data['role'],
                'status': 'active',
                'hire_date': timezone.now().date()
            }
        )
        
        if created:
            created_employees.append(employee)
            print_success(f"{employee.full_name} - {emp_data['title']} ({emp_data['role'].name})")
    
    return created_employees


def create_customers(org, admin):
    """Create customer records"""
    print_header("CREATING CUSTOMERS")
    
    customers_data = [
        {
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'email': 'alice.johnson@techstartup.com',
            'phone': '+1-555-2001',
            'company': 'Tech Startup Inc',
            'industry': 'Technology',
            'status': 'active'
        },
        {
            'first_name': 'Bob',
            'last_name': 'Williams',
            'email': 'bob.williams@retailco.com',
            'phone': '+1-555-2002',
            'company': 'Retail Co',
            'industry': 'Retail',
            'status': 'active'
        },
        {
            'first_name': 'Carol',
            'last_name': 'Martinez',
            'email': 'carol.martinez@healthcare.com',
            'phone': '+1-555-2003',
            'company': 'Healthcare Plus',
            'industry': 'Healthcare',
            'status': 'active'
        },
        {
            'first_name': 'David',
            'last_name': 'Brown',
            'email': 'david.brown@financegroup.com',
            'phone': '+1-555-2004',
            'company': 'Finance Group',
            'industry': 'Finance',
            'status': 'active'
        },
        {
            'first_name': 'Emma',
            'last_name': 'Davis',
            'email': 'emma.davis@educorp.com',
            'phone': '+1-555-2005',
            'company': 'EduCorp',
            'industry': 'Education',
            'status': 'active'
        },
    ]
    
    created_customers = []
    
    for cust_data in customers_data:
        customer, created = Customer.objects.get_or_create(
            email=cust_data['email'],
            organization=org,
            defaults={
                'first_name': cust_data['first_name'],
                'last_name': cust_data['last_name'],
                'name': f"{cust_data['first_name']} {cust_data['last_name']}",
                'phone': cust_data['phone'],
                'company_name': cust_data['company'],
                'industry': cust_data['industry'],
                'customer_type': 'business',
                'status': cust_data['status']
            }
        )
        
        if created:
            created_customers.append(customer)
            print_success(f"{customer.name} - {customer.company_name}")
    
    return created_customers


def create_leads(org, admin, employees):
    """Create lead records"""
    print_header("CREATING LEADS")
    
    leads_data = [
        {
            'first_name': 'Frank',
            'last_name': 'Miller',
            'email': 'frank.miller@prospect1.com',
            'phone': '+1-555-3001',
            'company': 'Prospect One LLC',
            'industry': 'Manufacturing',
            'source': 'website',
            'status': 'new'
        },
        {
            'first_name': 'Grace',
            'last_name': 'Wilson',
            'email': 'grace.wilson@prospect2.com',
            'phone': '+1-555-3002',
            'company': 'Prospect Two Inc',
            'industry': 'Logistics',
            'source': 'referral',
            'status': 'contacted'
        },
        {
            'first_name': 'Henry',
            'last_name': 'Moore',
            'email': 'henry.moore@prospect3.com',
            'phone': '+1-555-3003',
            'company': 'Prospect Three Corp',
            'industry': 'Consulting',
            'source': 'cold_call',
            'status': 'qualified'
        },
        {
            'first_name': 'Iris',
            'last_name': 'Taylor',
            'email': 'iris.taylor@prospect4.com',
            'phone': '+1-555-3004',
            'company': 'Prospect Four Ltd',
            'industry': 'Real Estate',
            'source': 'email_campaign',
            'status': 'proposal_sent'
        },
        {
            'first_name': 'Jack',
            'last_name': 'Anderson',
            'email': 'jack.anderson@prospect5.com',
            'phone': '+1-555-3005',
            'company': 'Prospect Five Group',
            'industry': 'Insurance',
            'source': 'linkedin',
            'status': 'negotiation'
        },
    ]
    
    created_leads = []
    
    for idx, lead_data in enumerate(leads_data):
        # Assign to different sales reps
        assigned_to = employees[idx % len(employees)] if employees else None
        
        lead, created = Lead.objects.get_or_create(
            email=lead_data['email'],
            organization=org,
            defaults={
                'name': f"{lead_data['first_name']} {lead_data['last_name']}",
                'phone': lead_data['phone'],
                'company': lead_data['company'],
                'source': lead_data['source'],
                'qualification_status': lead_data['status'],
                'status': 'active',
                'assigned_to': assigned_to
            }
        )
        
        if created:
            created_leads.append(lead)
            assigned_name = assigned_to.full_name if assigned_to else 'Unassigned'
            print_success(f"{lead.name} - {lead.company} ({lead.qualification_status}) → {assigned_name}")
    
    return created_leads


def create_pipeline_and_deals(org, admin, customers, employees):
    """Create pipeline, stages, and deals"""
    print_header("CREATING PIPELINE AND DEALS")
    
    # Create pipeline
    pipeline, created = Pipeline.objects.get_or_create(
        organization=org,
        name='Sales Pipeline',
        defaults={
            'description': 'Main sales pipeline',
            'is_default': True,
            'is_active': True
        }
    )
    
    if created:
        print_success(f"Created pipeline: {pipeline.name}")
    
    # Create pipeline stages
    stages_data = [
        {'name': 'Prospecting', 'order': 1, 'probability': 10},
        {'name': 'Qualification', 'order': 2, 'probability': 25},
        {'name': 'Proposal', 'order': 3, 'probability': 50},
        {'name': 'Negotiation', 'order': 4, 'probability': 75},
        {'name': 'Closed Won', 'order': 5, 'probability': 100},
    ]
    
    stages = []
    for stage_data in stages_data:
        stage, created = PipelineStage.objects.get_or_create(
            pipeline=pipeline,
            name=stage_data['name'],
            defaults={
                'order': stage_data['order'],
                'probability': stage_data['probability']
            }
        )
        stages.append(stage)
        if created:
            print_success(f"  Stage: {stage.name} ({stage.probability}%)")
    
    # Create deals
    print_info("\nCreating deals...")
    
    deals_data = [
        {
            'title': 'Enterprise Software License',
            'amount': Decimal('50000.00'),
            'stage_idx': 3,  # Negotiation
            'status': 'open'
        },
        {
            'title': 'Annual Support Contract',
            'amount': Decimal('25000.00'),
            'stage_idx': 2,  # Proposal
            'status': 'open'
        },
        {
            'title': 'Consulting Services Package',
            'amount': Decimal('75000.00'),
            'stage_idx': 4,  # Closed Won
            'status': 'won'
        },
        {
            'title': 'Cloud Infrastructure Setup',
            'amount': Decimal('35000.00'),
            'stage_idx': 1,  # Qualification
            'status': 'open'
        },
        {
            'title': 'Training & Implementation',
            'amount': Decimal('15000.00'),
            'stage_idx': 0,  # Prospecting
            'status': 'open'
        },
    ]
    
    created_deals = []
    
    for idx, deal_data in enumerate(deals_data):
        customer = customers[idx % len(customers)] if customers else None
        assigned_to = employees[idx % len(employees)] if employees else None
        stage = stages[deal_data['stage_idx']]
        
        deal, created = Deal.objects.get_or_create(
            organization=org,
            title=deal_data['title'],
            defaults={
                'customer': customer,
                'pipeline': pipeline,
                'stage': stage,
                'value': deal_data['amount'],
                'status': deal_data['status'],
                'probability': stage.probability,
                'expected_close_date': timezone.now().date() + timedelta(days=30),
                'assigned_to': assigned_to
            }
        )
        
        if created:
            created_deals.append(deal)
            assigned_name = assigned_to.full_name if assigned_to else 'Unassigned'
            print_success(f"{deal.title} - ${deal.value} ({stage.name}) → {assigned_name}")
    
    return created_deals


def create_activities(org, customers, leads, deals):
    """Create activity records"""
    print_header("CREATING ACTIVITIES")
    
    activities_count = 0
    
    # Activities for customers
    for customer in customers[:3]:
        activity = Activity.objects.create(
            organization=org,
            activity_type='call',
            title=f'Initial call with {customer.name}',
            description=f'Discussed requirements and potential solutions',
            customer=customer,
            status='completed',
            completed_at=timezone.now() - timedelta(days=random.randint(1, 10))
        )
        activities_count += 1
    
    # Activities for leads
    for lead in leads[:3]:
        activity = Activity.objects.create(
            organization=org,
            activity_type='email',
            title=f'Follow-up email to {lead.name}',
            description='Sent proposal and pricing information',
            lead=lead,
            status='completed',
            completed_at=timezone.now() - timedelta(days=random.randint(1, 7))
        )
        activities_count += 1
    
    # Activities for deals
    for deal in deals[:3]:
        activity = Activity.objects.create(
            organization=org,
            activity_type='meeting',
            title=f'Deal review: {deal.title}',
            description='Progress meeting with stakeholders',
            deal=deal,
            status='completed',
            completed_at=timezone.now() - timedelta(days=random.randint(1, 5))
        )
        activities_count += 1
    
    print_success(f"Created {activities_count} activities")
    return activities_count


def main():
    """Main execution function"""
    print_header("CRM ADMIN SEED DATA SCRIPT")
    print_info("This script will create comprehensive test data for admin@crm.com")
    print_info("Including: Customers, Leads, Deals, Employees, and RBAC setup\n")
    
    try:
        # Step 1: Setup admin user and organization
        admin = get_or_create_admin_user()
        org = get_or_create_organization(admin)
        
        # Step 2: Create RBAC structure
        permissions = create_predefined_permissions(org)
        roles = create_default_roles(org, permissions)
        
        # Step 3: Create employees
        employees = create_employees(org, admin, roles)
        
        # Step 4: Create customers
        customers = create_customers(org, admin)
        
        # Step 5: Create leads
        leads = create_leads(org, admin, employees)
        
        # Step 6: Create pipeline and deals
        deals = create_pipeline_and_deals(org, admin, customers, employees)
        
        # Step 7: Create activities
        activities_count = create_activities(org, customers, leads, deals)
        
        # Summary
        print_header("SEED DATA SUMMARY")
        print_success(f"Organization: {org.name}")
        print_success(f"Admin User: {admin.email} (password: admin123)")
        print_success(f"Permissions: {len(permissions)} predefined permissions")
        print_success(f"Roles: {len(roles)} default roles")
        print_success(f"Employees: {len(employees)} created")
        print_success(f"Customers: {len(customers)} created")
        print_success(f"Leads: {len(leads)} created")
        print_success(f"Deals: {len(deals)} created")
        print_success(f"Activities: {activities_count} created")
        
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ Seed data creation completed successfully!{Colors.ENDC}")
        print(f"\n{Colors.OKCYAN}Login credentials:{Colors.ENDC}")
        print(f"  Email: admin@crm.com")
        print(f"  Password: admin123")
        
        print(f"\n{Colors.OKCYAN}Employee credentials (all use password: password123):{Colors.ENDC}")
        for emp in employees:
            print(f"  - {emp.user.email}")
        
    except Exception as e:
        print_error(f"Error during seed data creation: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
