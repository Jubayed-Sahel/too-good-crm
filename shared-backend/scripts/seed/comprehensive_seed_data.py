#!/usr/bin/env python
"""
Comprehensive Seed Data Script for TooGood CRM
Creates realistic test data for all entities in the system
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import random

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.utils import timezone
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
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text:^60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}+ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}i {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}! {text}{Colors.ENDC}")

def clear_existing_data():
    """Clear all existing data"""
    print_header("CLEARING EXISTING DATA")
    
    # Clear in reverse order of dependencies
    Activity.objects.all().delete()
    print_success("Cleared Activities")
    
    Issue.objects.all().delete()
    print_success("Cleared Issues")
    
    Payment.objects.all().delete()
    print_success("Cleared Payments")
    
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    print_success("Cleared Orders")
    
    Deal.objects.all().delete()
    print_success("Cleared Deals")
    
    Lead.objects.all().delete()
    print_success("Cleared Leads")
    
    PipelineStage.objects.all().delete()
    Pipeline.objects.all().delete()
    print_success("Cleared Pipelines")
    
    Customer.objects.all().delete()
    print_success("Cleared Customers")
    
    RolePermission.objects.all().delete()
    UserRole.objects.all().delete()
    Role.objects.all().delete()
    Permission.objects.all().delete()
    print_success("Cleared RBAC data")
    
    NotificationPreferences.objects.all().delete()
    print_success("Cleared Notification Preferences")
    
    Employee.objects.all().delete()
    Vendor.objects.all().delete()
    print_success("Cleared Employees and Vendors")
    
    UserProfile.objects.all().delete()
    UserOrganization.objects.all().delete()
    print_success("Cleared User Profiles and Organizations")
    
    # Keep superuser, delete others
    User.objects.filter(is_superuser=False).delete()
    print_success("Cleared Users (kept superuser)")
    
    Organization.objects.all().delete()
    print_success("Cleared Organizations")

def create_organizations():
    """Create organizations"""
    print_header("CREATING ORGANIZATIONS")
    
    orgs = [
        {
            'name': 'TechCorp Solutions',
            'slug': 'techcorp-solutions',
            'email': 'info@techcorp.com',
            'phone': '+1-555-0101',
            'website': 'https://techcorp.com',
            'address': '123 Tech Street',
            'city': 'San Francisco',
            'state': 'CA',
            'postal_code': '94105',
            'country': 'USA'
        },
        {
            'name': 'Global Marketing Inc',
            'slug': 'global-marketing-inc',
            'email': 'contact@globalmarketing.com',
            'phone': '+1-555-0202',
            'website': 'https://globalmarketing.com',
            'address': '456 Market Ave',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'USA'
        },
        {
            'name': 'CloudServe Enterprise',
            'slug': 'cloudserve-enterprise',
            'email': 'hello@cloudserve.io',
            'phone': '+1-555-0303',
            'website': 'https://cloudserve.io',
            'address': '789 Cloud Drive',
            'city': 'Austin',
            'state': 'TX',
            'postal_code': '78701',
            'country': 'USA'
        }
    ]
    
    created_orgs = []
    for org_data in orgs:
        org = Organization.objects.create(**org_data)
        created_orgs.append(org)
        print_success(f"Created organization: {org.name}")
    
    return created_orgs

def create_users_and_profiles(organizations):
    """Create users with all three profiles"""
    print_header("CREATING USERS AND PROFILES")
    
    users_data = [
        {
            'username': 'john.vendor',
            'email': 'john.vendor@techcorp.com',
            'first_name': 'John',
            'last_name': 'Vendor',
            'phone': '+1-555-1001',
            'password': 'password123',
            'org': organizations[0]
        },
        {
            'username': 'sarah.manager',
            'email': 'sarah.manager@globalmarketing.com',
            'first_name': 'Sarah',
            'last_name': 'Manager',
            'phone': '+1-555-1002',
            'password': 'password123',
            'org': organizations[1]
        },
        {
            'username': 'mike.employee',
            'email': 'mike.employee@cloudserve.io',
            'first_name': 'Mike',
            'last_name': 'Employee',
            'phone': '+1-555-1003',
            'password': 'password123',
            'org': organizations[2]
        },
        {
            'username': 'alice.customer',
            'email': 'alice.customer@example.com',
            'first_name': 'Alice',
            'last_name': 'Customer',
            'phone': '+1-555-1004',
            'password': 'password123',
            'org': organizations[0]
        },
        {
            'username': 'bob.sales',
            'email': 'bob.sales@techcorp.com',
            'first_name': 'Bob',
            'last_name': 'Sales',
            'phone': '+1-555-1005',
            'password': 'password123',
            'org': organizations[0]
        }
    ]
    
    created_users = []
    for user_data in users_data:
        org = user_data.pop('org')
        password = user_data.pop('password')
        
        user = User.objects.create_user(**user_data, password=password)
        user.is_verified = True
        user.email_verified_at = timezone.now()
        user.save()
        
        # Link to organization
        UserOrganization.objects.create(
            user=user,
            organization=org,
            is_owner=(user.username == 'john.vendor'),  # First user is owner
            is_active=True
        )
        
        # Create all three profiles
        profiles = []
        for profile_type in ['vendor', 'employee', 'customer']:
            is_primary = (profile_type == 'vendor' if 'vendor' in user.username
                         else profile_type == 'employee' if 'employee' in user.username or 'sales' in user.username
                         else profile_type == 'customer')
            
            profile = UserProfile.objects.create(
                user=user,
                organization=org,
                profile_type=profile_type,
                is_primary=is_primary,
                status='active',
                activated_at=timezone.now()
            )
            profiles.append(profile)
        
        created_users.append({'user': user, 'org': org, 'profiles': profiles})
        print_success(f"Created user: {user.full_name} with 3 profiles")
    
    return created_users

def create_permissions_and_roles():
    """Create permissions and roles"""
    print_header("CREATING RBAC STRUCTURE")
    
    # Get the first organization for system permissions
    org = Organization.objects.first()
    if not org:
        print_warning("No organization found, skipping RBAC setup")
        return {}
    
    # Define permissions (resource:action pairs)
    permissions_data = [
        # Customer permissions
        {'resource': 'customers', 'action': 'read', 'description': 'View customers'},
        {'resource': 'customers', 'action': 'create', 'description': 'Add customers'},
        {'resource': 'customers', 'action': 'update', 'description': 'Change customers'},
        {'resource': 'customers', 'action': 'delete', 'description': 'Delete customers'},
        
        # Lead permissions
        {'resource': 'leads', 'action': 'read', 'description': 'View leads'},
        {'resource': 'leads', 'action': 'create', 'description': 'Add leads'},
        {'resource': 'leads', 'action': 'update', 'description': 'Change leads'},
        {'resource': 'leads', 'action': 'delete', 'description': 'Delete leads'},
        
        # Deal permissions
        {'resource': 'deals', 'action': 'read', 'description': 'View deals'},
        {'resource': 'deals', 'action': 'create', 'description': 'Add deals'},
        {'resource': 'deals', 'action': 'update', 'description': 'Change deals'},
        {'resource': 'deals', 'action': 'delete', 'description': 'Delete deals'},
        
        # Analytics permissions
        {'resource': 'analytics', 'action': 'read', 'description': 'View analytics'},
        
        # Employee permissions
        {'resource': 'employees', 'action': 'read', 'description': 'View employees'},
        {'resource': 'employees', 'action': 'create', 'description': 'Add employees'},
        {'resource': 'employees', 'action': 'update', 'description': 'Change employees'},
        
        # Settings permissions
        {'resource': 'settings', 'action': 'read', 'description': 'View settings'},
        {'resource': 'settings', 'action': 'update', 'description': 'Change settings'},
        
        # Dashboard permission
        {'resource': 'dashboard', 'action': 'read', 'description': 'View dashboard'},
        
        # Activities permission
        {'resource': 'activities', 'action': 'read', 'description': 'View activities'},
        {'resource': 'activities', 'action': 'create', 'description': 'Create activities'},
        {'resource': 'activities', 'action': 'update', 'description': 'Update activities'},
    ]
    
    permissions = []
    for perm_data in permissions_data:
        perm, created = Permission.objects.get_or_create(
            organization=org,
            resource=perm_data['resource'],
            action=perm_data['action'],
            defaults={
                'description': perm_data['description'],
                'is_system_permission': True
            }
        )
        permissions.append(perm)
        if created:
            print_success(f"Created permission: {perm.resource}:{perm.action}")
    
    # Create roles
    print_info("\nCreating roles...")
    
    # Sales Representative role
    sales_role = Role.objects.create(
        organization=org,
        name='Sales Representative',
        slug='sales-representative',
        description='Can manage customers, leads, and deals',
        is_system_role=True
    )
    
    # Assign permissions to Sales role
    sales_perms = Permission.objects.filter(
        organization=org,
        resource__in=['customers', 'leads', 'deals', 'analytics', 'dashboard', 'activities'],
        action__in=['read', 'create', 'update']
    )
    for perm in sales_perms:
        RolePermission.objects.create(role=sales_role, permission=perm)
    
    print_success(f"Created role: {sales_role.name} with {sales_perms.count()} permissions")
    
    # Manager role
    manager_role = Role.objects.create(
        organization=org,
        name='Manager',
        slug='manager',
        description='Can view analytics and manage team',
        is_system_role=True
    )
    
    manager_perms = Permission.objects.filter(
        organization=org
    )
    for perm in manager_perms:
        RolePermission.objects.create(role=manager_role, permission=perm)
    
    print_success(f"Created role: {manager_role.name} with {manager_perms.count()} permissions")
    
    return {'sales': sales_role, 'manager': manager_role}

def assign_roles_to_users(users, roles):
    """Assign roles to employee users"""
    print_header("ASSIGNING ROLES TO USERS")
    
    for user_data in users:
        user = user_data['user']
        org = user_data['org']
        
        # Assign roles based on user type
        if 'sales' in user.username:
            UserRole.objects.create(
                user=user,
                role=roles['sales'],
                organization=org
            )
            print_success(f"Assigned Sales role to {user.full_name}")
        elif 'manager' in user.username:
            UserRole.objects.create(
                user=user,
                role=roles['manager'],
                organization=org
            )
            print_success(f"Assigned Manager role to {user.full_name}")

def create_employees_and_vendors(users):
    """Create employee and vendor records"""
    print_header("CREATING EMPLOYEES AND VENDORS")
    
    employees = []
    vendors = []
    
    for user_data in users:
        user = user_data['user']
        org = user_data['org']
        
        # Create vendor record for vendor users
        if 'vendor' in user.username:
            vendor = Vendor.objects.create(
                user=user,
                organization=org,
                name=f"{user.full_name}'s Business",
                company_name=f"{user.full_name}'s Company",
                vendor_type='service_provider',
                industry='Technology',
                website='https://example.com',
                rating=Decimal('4.5'),
                status='active'
            )
            vendors.append(vendor)
            print_success(f"Created vendor: {vendor.name}")
        
        # Create employee record for employee/sales users
        if 'employee' in user.username or 'sales' in user.username or 'manager' in user.username:
            emp = Employee.objects.create(
                user=user,
                organization=org,
                first_name=user.first_name,
                last_name=user.last_name,
                department='Sales' if 'sales' in user.username else 'Management',
                job_title='Sales Representative' if 'sales' in user.username else 'Manager',
                employment_type='full-time',
                hire_date=timezone.now().date() - timedelta(days=random.randint(30, 365)),
                salary=Decimal(random.randint(50000, 120000)),
                status='active'
            )
            employees.append(emp)
            print_success(f"Created employee: {emp.user.full_name}")
    
    return employees, vendors

def create_customers(users, organizations):
    """Create customer records"""
    print_header("CREATING CUSTOMERS")
    
    customers = []
    
    # Create customers for customer users
    for user_data in users:
        user = user_data['user']
        org = user_data['org']
        
        if 'customer' in user.username:
            customer = Customer.objects.create(
                user=user,
                organization=org,
                name=user.full_name,
                first_name=user.first_name,
                last_name=user.last_name,
                company_name=f"{user.full_name}'s Company",
                industry='Retail',
                customer_type='business',
                status='active',
                assigned_to=None
            )
            customers.append(customer)
            print_success(f"Created customer: {customer.company_name}")
    
    # Create additional customers without user accounts
    for i in range(5):
        org = random.choice(organizations)
        customer = Customer.objects.create(
            organization=org,
            name=f"Customer{i+1} LastName{i+1}",
            first_name=f"Customer{i+1}",
            last_name=f"LastName{i+1}",
            email=f"customer{i+1}@example.com",
            phone=f"+1-555-{2000+i}",
            company_name=f"Company {i+1}",
            industry=random.choice(['Technology', 'Retail', 'Healthcare', 'Finance']),
            customer_type=random.choice(['individual', 'business']),
            status='active'
        )
        customers.append(customer)
        print_success(f"Created customer: {customer.name}")
    
    return customers

def create_leads(customers, employees, organizations):
    """Create leads"""
    print_header("CREATING LEADS")
    
    leads = []
    
    for i in range(10):
        org = random.choice(organizations)
        assigned_to = random.choice(employees) if employees else None
        
        lead = Lead.objects.create(
            organization=org,
            name=f"Lead{i+1} Person{i+1}",
            email=f"lead{i+1}@example.com",
            phone=f"+1-555-{3000+i}",
            company=f"Lead Company {i+1}",
            job_title=random.choice(['CEO', 'CTO', 'Manager', 'Director']),
            source=random.choice(['website', 'referral', 'social_media', 'email', 'event']),
            status=random.choice(['new', 'contacted', 'qualified', 'unqualified']),
            assigned_to=assigned_to,
            estimated_value=Decimal(random.randint(5000, 50000))
        )
        leads.append(lead)
        print_success(f"Created lead: {lead.name}")
    
    return leads

def create_pipelines_and_stages(organizations):
    """Create sales pipelines and stages"""
    print_header("CREATING PIPELINES AND STAGES")
    
    pipelines = []
    
    for org in organizations:
        pipeline = Pipeline.objects.create(
            organization=org,
            name='Sales Pipeline',
            description='Standard sales pipeline',
            is_active=True
        )
        pipelines.append(pipeline)
        print_success(f"Created pipeline: {pipeline.name} for {org.name}")
        
        # Create stages
        stages_data = [
            {'name': 'Prospecting', 'order': 1, 'probability': 10},
            {'name': 'Qualification', 'order': 2, 'probability': 25},
            {'name': 'Proposal', 'order': 3, 'probability': 50},
            {'name': 'Negotiation', 'order': 4, 'probability': 75},
            {'name': 'Closed Won', 'order': 5, 'probability': 100},
            {'name': 'Closed Lost', 'order': 6, 'probability': 0},
        ]
        
        for stage_data in stages_data:
            PipelineStage.objects.create(
                pipeline=pipeline,
                **stage_data
            )
        
        print_info(f"  Created {len(stages_data)} stages for {pipeline.name}")
    
    return pipelines

def create_deals(customers, leads, employees, pipelines):
    """Create deals"""
    print_header("CREATING DEALS")
    
    deals = []
    
    for i in range(15):
        pipeline = random.choice(pipelines)
        stages = list(pipeline.stages.all().exclude(name__icontains='lost'))
        
        deal = Deal.objects.create(
            organization=pipeline.organization,
            pipeline=pipeline,
            stage=random.choice(stages),
            title=f"Deal {i+1}: {random.choice(['Website Redesign', 'CRM Implementation', 'Marketing Campaign', 'Consulting Services'])}",
            description=f"Description for deal {i+1}",
            value=Decimal(random.randint(10000, 100000)),
            expected_close_date=timezone.now().date() + timedelta(days=random.randint(30, 90)),
            probability=random.randint(10, 90),
            status=random.choice(['open', 'won', 'lost']),
            customer=random.choice(customers) if customers else None,
            lead=random.choice(leads) if random.random() > 0.5 and leads else None,
            assigned_to=random.choice(employees) if employees else None
        )
        deals.append(deal)
        print_success(f"Created deal: {deal.title}")
    
    return deals

def create_orders(customers, organizations):
    """Create orders"""
    print_header("CREATING ORDERS")
    
    orders = []
    
    for i in range(8):
        customer = random.choice(customers)
        org = customer.organization
        
        order = Order.objects.create(
            organization=org,
            customer=customer,
            order_number=f"ORD-{1000+i}",
            order_date=timezone.now().date() - timedelta(days=random.randint(0, 60)),
            status=random.choice(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            subtotal=Decimal('0'),
            tax=Decimal('0'),
            shipping=Decimal('50'),
            total=Decimal('0'),
            shipping_address=customer.address or '123 Main St',
            billing_address=customer.address or '123 Main St'
        )
        
        # Create order items
        num_items = random.randint(1, 4)
        for j in range(num_items):
            OrderItem.objects.create(
                order=order,
                product_name=f"Product {j+1}",
                product_sku=f"SKU-{j+1}",
                quantity=random.randint(1, 5),
                unit_price=Decimal(random.randint(100, 1000)),
                subtotal=Decimal(random.randint(100, 5000))
            )
        
        # Recalculate order totals
        order.subtotal = sum(item.subtotal for item in order.items.all())
        order.tax = order.subtotal * Decimal('0.08')
        order.total = order.subtotal + order.tax + order.shipping
        order.save()
        
        orders.append(order)
        print_success(f"Created order: {order.order_number} with {num_items} items")
    
    return orders

def create_payments(orders):
    """Create payments"""
    print_header("CREATING PAYMENTS")
    
    payments = []
    
    for order in orders:
        if order.status in ['processing', 'shipped', 'delivered']:
            payment = Payment.objects.create(
                organization=order.organization,
                customer=order.customer,
                order=order,
                payment_method=random.choice(['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
                amount=order.total,
                status=random.choice(['pending', 'completed', 'failed']),
                transaction_id=f"TXN-{random.randint(100000, 999999)}",
                payment_date=order.order_date + timedelta(days=random.randint(0, 5))
            )
            payments.append(payment)
            print_success(f"Created payment: {payment.transaction_id}")
    
    return payments

def create_issues(vendors, organizations):
    """Create issues/tickets"""
    print_header("CREATING ISSUES")
    
    issues = []
    
    for i in range(12):
        org = random.choice(organizations)
        vendor = random.choice(vendors) if vendors else None
        
        if not vendor:
            print_info(f"Skipping issue {i+1} - no vendors available")
            continue
        
        issue = Issue.objects.create(
            organization=org,
            vendor=vendor,
            issue_number=f"ISS-{1000+i}",
            title=f"Issue {i+1}: {random.choice(['Delivery Delay', 'Quality Problem', 'Billing Issue', 'Technical Problem'])}",
            description=f"Detailed description of issue {i+1}",
            priority=random.choice(['low', 'medium', 'high', 'urgent']),
            status=random.choice(['open', 'in_progress', 'resolved', 'closed']),
            category=random.choice(['general', 'delivery', 'quality', 'billing', 'technical'])
        )
        issues.append(issue)
        print_success(f"Created issue: {issue.title}")
    
    return issues

def create_activities(users, customers, deals, organizations):
    """Create activities"""
    print_header("CREATING ACTIVITIES")
    
    activities = []
    
    for i in range(20):
        org = random.choice(organizations)
        user = random.choice([u['user'] for u in users if u['org'] == org])
        
        activity = Activity.objects.create(
            organization=org,
            created_by=user,
            title=f"Activity {i+1}",
            description=f"Description for activity {i+1}",
            activity_type=random.choice(['call', 'meeting', 'email', 'task', 'note']),
            status=random.choice(['pending', 'completed', 'cancelled']),
            scheduled_at=timezone.now() + timedelta(days=random.randint(-30, 30)),
            customer=random.choice(customers) if random.random() > 0.5 and customers else None,
            deal=random.choice(deals) if random.random() > 0.5 and deals else None
        )
        activities.append(activity)
        print_success(f"Created activity: {activity.title}")
    
    return activities

def create_notification_preferences(users):
    """Create notification preferences"""
    print_header("CREATING NOTIFICATION PREFERENCES")
    
    for user_data in users:
        user = user_data['user']
        
        NotificationPreferences.objects.create(
            user=user,
            email_notifications=True,
            sms_notifications=False,
            push_notifications=True,
            notification_frequency='immediate',
            notify_new_lead=True,
            notify_deal_update=True,
            notify_task_assigned=True,
            notify_customer_message=True
        )
        print_success(f"Created notification preferences for {user.full_name}")

def print_summary(users, organizations, employees, customers, leads, deals, orders, payments, issues, activities):
    """Print summary of created data"""
    print_header("DATA CREATION SUMMARY")
    
    print(f"{Colors.OKGREEN}Organizations:{Colors.ENDC} {len(organizations)}")
    print(f"{Colors.OKGREEN}Users:{Colors.ENDC} {len(users)}")
    print(f"{Colors.OKGREEN}Employees:{Colors.ENDC} {len(employees)}")
    print(f"{Colors.OKGREEN}Customers:{Colors.ENDC} {len(customers)}")
    print(f"{Colors.OKGREEN}Leads:{Colors.ENDC} {len(leads)}")
    print(f"{Colors.OKGREEN}Deals:{Colors.ENDC} {len(deals)}")
    print(f"{Colors.OKGREEN}Orders:{Colors.ENDC} {len(orders)}")
    print(f"{Colors.OKGREEN}Payments:{Colors.ENDC} {len(payments)}")
    print(f"{Colors.OKGREEN}Issues:{Colors.ENDC} {len(issues)}")
    print(f"{Colors.OKGREEN}Activities:{Colors.ENDC} {len(activities)}")
    
    print_header("TEST USERS")
    print(f"\n{Colors.BOLD}Use these credentials to login:{Colors.ENDC}\n")
    
    for user_data in users:
        user = user_data['user']
        print(f"{Colors.OKCYAN}Email:{Colors.ENDC} {user.email}")
        print(f"{Colors.OKCYAN}Password:{Colors.ENDC} password123")
        print(f"{Colors.OKCYAN}Organization:{Colors.ENDC} {user_data['org'].name}")
        print(f"{Colors.OKCYAN}Profiles:{Colors.ENDC} Vendor, Employee, Customer\n")

def main():
    """Main execution"""
    try:
        print_header("COMPREHENSIVE SEED DATA SCRIPT")
        print_info("This will create realistic test data for the entire CRM system\n")
        
        # Step 1: Clear existing data
        clear_existing_data()
        
        # Step 2: Create organizations
        organizations = create_organizations()
        
        # Step 3: Create users and profiles
        users = create_users_and_profiles(organizations)
        
        # Step 4: Create RBAC structure
        roles = create_permissions_and_roles()
        
        # Step 5: Assign roles
        assign_roles_to_users(users, roles)
        
        # Step 6: Create employees and vendors
        employees, vendors = create_employees_and_vendors(users)
        
        # Step 7: Create customers
        customers = create_customers(users, organizations)
        
        # Step 8: Create leads
        leads = create_leads(customers, employees, organizations)
        
        # Step 9: Create pipelines
        pipelines = create_pipelines_and_stages(organizations)
        
        # Step 10: Create deals
        deals = create_deals(customers, leads, employees, pipelines)
        
        # Step 11: Create orders
        # orders = create_orders(customers, organizations)
        orders = []
        print_header("SKIPPING ORDERS")
        print_info("Order creation skipped - needs model review")
        
        # Step 12: Create payments
        # payments = create_payments(orders)
        payments = []
        print_header("SKIPPING PAYMENTS")
        print_info("Payment creation skipped - depends on orders")
        
        # Step 13: Create issues
        issues = create_issues(vendors, organizations)
        
        # Step 14: Create activities
        activities = create_activities(users, customers, deals, organizations)
        
        # Step 15: Create notification preferences
        # create_notification_preferences(users)
        print_header("SKIPPING NOTIFICATION PREFERENCES")
        print_info("Notification preferences skipped - needs model review")
        
        # Print summary
        print_summary(users, organizations, employees, customers, leads, deals, orders, payments, issues, activities)
        
        print(f"\n{Colors.OKGREEN}{Colors.BOLD}+ SEED DATA CREATION COMPLETED SUCCESSFULLY!{Colors.ENDC}\n")
        
    except Exception as e:
        print(f"\n{Colors.FAIL}X Error: {str(e)}{Colors.ENDC}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
