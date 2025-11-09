"""
Create test users for issue tracking simulation.

This script creates:
1. A customer user who can raise issues
2. A vendor user who can view and update issues
3. An employee user who can view and update issues (with proper permissions)
4. Sample issues for testing

Usage:
    python manage.py shell < scripts/test/create_issue_test_users.py
    OR
    python manage.py runscript create_issue_test_users
"""

import os
import django
from django.utils import timezone
from django.db import transaction

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import (
    User, Organization, UserProfile, Customer, Vendor, Employee,
    Role, Permission, UserRole, Issue
)
from django.contrib.auth.hashers import make_password


@transaction.atomic
def create_test_users():
    """Create test users for issue tracking simulation."""
    
    print("=" * 70)
    print("Creating Test Users for Issue Tracking Simulation")
    print("=" * 70)
    
    # Get or create test organization
    test_org, org_created = Organization.objects.get_or_create(
        name='Test Organization',
        defaults={
            'slug': 'test-org',
            'email': 'test@testorg.com',
            'phone': '+1234567890',
            'is_active': True,
        }
    )
    
    if org_created:
        print(f"✅ Created organization: {test_org.name}")
    else:
        print(f"✅ Using existing organization: {test_org.name}")
    
    # ========================================================================
    # 1. CREATE CUSTOMER USER
    # ========================================================================
    print("\n" + "-" * 70)
    print("1. Creating Customer User")
    print("-" * 70)
    
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
    
    if customer_user_created:
        print(f"✅ Created customer user: {customer_user.email}")
    else:
        print(f"✅ Using existing customer user: {customer_user.email}")
        customer_user.password = make_password('customer123')
        customer_user.save()
    
    # Create customer profile
    customer_profile, customer_profile_created = UserProfile.objects.get_or_create(
        user=customer_user,
        profile_type='customer',
        defaults={
            'organization': test_org,
            'is_primary': True,
            'status': 'active',
            'activated_at': timezone.now(),
        }
    )
    
    if customer_profile_created:
        print(f"✅ Created customer profile for: {customer_user.email}")
    else:
        print(f"✅ Using existing customer profile for: {customer_user.email}")
        customer_profile.organization = test_org
        customer_profile.status = 'active'
        customer_profile.save()
    
    # Create customer record
    customer, customer_created = Customer.objects.get_or_create(
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
    
    if customer_created:
        print(f"✅ Created customer record: {customer.name}")
    else:
        print(f"✅ Using existing customer record: {customer.name}")
        customer.user_profile = customer_profile
        customer.save()
    
    # ========================================================================
    # 2. CREATE VENDOR USER
    # ========================================================================
    print("\n" + "-" * 70)
    print("2. Creating Vendor User")
    print("-" * 70)
    
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
    
    if vendor_user_created:
        print(f"✅ Created vendor user: {vendor_user.email}")
    else:
        print(f"✅ Using existing vendor user: {vendor_user.email}")
        vendor_user.password = make_password('vendor123')
        vendor_user.save()
    
    # Create vendor profile
    vendor_profile, vendor_profile_created = UserProfile.objects.get_or_create(
        user=vendor_user,
        profile_type='vendor',
        defaults={
            'organization': test_org,
            'is_primary': True,
            'status': 'active',
            'activated_at': timezone.now(),
        }
    )
    
    if vendor_profile_created:
        print(f"✅ Created vendor profile for: {vendor_user.email}")
    else:
        print(f"✅ Using existing vendor profile for: {vendor_user.email}")
        vendor_profile.organization = test_org
        vendor_profile.status = 'active'
        vendor_profile.save()
    
    # Create vendor record
    vendor, vendor_created = Vendor.objects.get_or_create(
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
    
    if vendor_created:
        print(f"✅ Created vendor record: {vendor.name}")
    else:
        print(f"✅ Using existing vendor record: {vendor.name}")
        vendor.user_profile = vendor_profile
        vendor.save()
    
    # ========================================================================
    # 3. CREATE EMPLOYEE USER
    # ========================================================================
    print("\n" + "-" * 70)
    print("3. Creating Employee User")
    print("-" * 70)
    
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
    
    if employee_user_created:
        print(f"✅ Created employee user: {employee_user.email}")
    else:
        print(f"✅ Using existing employee user: {employee_user.email}")
        employee_user.password = make_password('employee123')
        employee_user.save()
    
    # Create employee profile
    employee_profile, employee_profile_created = UserProfile.objects.get_or_create(
        user=employee_user,
        profile_type='employee',
        defaults={
            'organization': test_org,
            'is_primary': False,
            'status': 'active',
            'activated_at': timezone.now(),
        }
    )
    
    if employee_profile_created:
        print(f"✅ Created employee profile for: {employee_user.email}")
    else:
        print(f"✅ Using existing employee profile for: {employee_user.email}")
        employee_profile.organization = test_org
        employee_profile.status = 'active'
        employee_profile.save()
    
    # Create employee record
    employee, employee_created = Employee.objects.get_or_create(
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
    
    if employee_created:
        print(f"✅ Created employee record: {employee.first_name} {employee.last_name}")
    else:
        print(f"✅ Using existing employee record: {employee.first_name} {employee.last_name}")
        employee.user_profile = employee_profile
        employee.save()
    
    # ========================================================================
    # 4. CREATE ROLE AND PERMISSIONS FOR EMPLOYEE
    # ========================================================================
    print("\n" + "-" * 70)
    print("4. Creating Role and Permissions for Employee")
    print("-" * 70)
    
    # Create Support Manager role
    support_role, role_created = Role.objects.get_or_create(
        name='Support Manager',
        organization=test_org,
        defaults={
            'description': 'Can manage and resolve customer issues',
            'is_active': True,
        }
    )
    
    if role_created:
        print(f"✅ Created role: {support_role.name}")
    else:
        print(f"✅ Using existing role: {support_role.name}")
    
    # Assign role to employee
    employee.role = support_role
    employee.save()
    print(f"✅ Assigned role to employee: {employee.first_name} {employee.last_name}")
    
    # Create issue permissions
    from crmApp.models.rbac import RolePermission
    
    issue_permissions = [
        ('issue', 'read'),
        ('issue', 'update'),
        ('issue', 'delete'),
    ]
    
    for resource, action in issue_permissions:
        permission, perm_created = Permission.objects.get_or_create(
            organization=test_org,
            resource=resource,
            action=action,
            defaults={
                'description': f'Can {action} {resource}',
            }
        )
        
        if perm_created:
            print(f"✅ Created permission: {resource}:{action}")
        else:
            print(f"✅ Using existing permission: {resource}:{action}")
        
        # Add permission to role using RolePermission junction table
        role_permission, rp_created = RolePermission.objects.get_or_create(
            role=support_role,
            permission=permission
        )
        
        if rp_created:
            print(f"✅ Added permission {resource}:{action} to role {support_role.name}")
        else:
            print(f"✅ Permission {resource}:{action} already exists in role {support_role.name}")
    
    # ========================================================================
    # 5. CREATE SAMPLE ISSUES
    # ========================================================================
    print("\n" + "-" * 70)
    print("5. Creating Sample Issues")
    print("-" * 70)
    
    sample_issues = [
        {
            'title': 'Product delivery delayed',
            'description': 'My order was supposed to arrive yesterday but it hasn\'t been delivered yet.',
            'priority': 'high',
            'category': 'delivery',
            'status': 'open',
        },
        {
            'title': 'Quality issue with product',
            'description': 'The product I received has a defect. The packaging was damaged.',
            'priority': 'medium',
            'category': 'quality',
            'status': 'open',
        },
        {
            'title': 'Billing question',
            'description': 'I have a question about my recent invoice. Can someone clarify the charges?',
            'priority': 'low',
            'category': 'billing',
            'status': 'in_progress',
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
            print(f"⏭️  Skipping existing issue: {issue_data['title']}")
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
        )
        
        created_issues.append(issue)
        print(f"✅ Created issue: {issue.issue_number} - {issue.title}")
    
    # ========================================================================
    # SUMMARY
    # ========================================================================
    print("\n" + "=" * 70)
    print("✅ TEST USERS CREATION COMPLETE!")
    print("=" * 70)
    print("\n📋 Login Credentials:")
    print("-" * 70)
    print(f"Customer User:")
    print(f"  Email: {customer_user.email}")
    print(f"  Password: customer123")
    print(f"  Profile: Customer")
    print(f"  Can: Raise issues")
    print(f"\nVendor User:")
    print(f"  Email: {vendor_user.email}")
    print(f"  Password: vendor123")
    print(f"  Profile: Vendor")
    print(f"  Can: View and update customer-raised issues")
    print(f"\nEmployee User:")
    print(f"  Email: {employee_user.email}")
    print(f"  Password: employee123")
    print(f"  Profile: Employee")
    print(f"  Role: {support_role.name}")
    print(f"  Can: View and update customer-raised issues")
    print(f"\n📊 Sample Issues Created: {len(created_issues)}")
    print(f"📁 Organization: {test_org.name}")
    print("\n" + "=" * 70)
    print("🎯 Next Steps:")
    print("1. Login as customer@test.com to raise issues")
    print("2. Login as vendor@test.com to view and update issues")
    print("3. Login as employee@test.com to view and update issues")
    print("4. Test Linear integration (if configured)")
    print("=" * 70)


if __name__ == '__main__':
    create_test_users()

