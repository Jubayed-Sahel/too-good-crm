"""
Quick script to add test employees for access control testing
Run: python add_test_employee.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.models import Organization, UserProfile, UserOrganization, Employee
from django.utils import timezone
from django.db import transaction

User = get_user_model()


def create_test_employee():
    """Create a test employee user"""
    
    print("=" * 60)
    print("EMPLOYEE ACCESS CONTROL SETUP")
    print("=" * 60)
    
    # Get existing organization (first one)
    org = Organization.objects.first()
    
    if not org:
        print("❌ No organization found. Please create a vendor account first.")
        return
    
    print(f"\n✓ Found organization: {org.name} (ID: {org.id})")
    
    # Create or get test employee user
    employee_email = "employee@test.com"
    employee_username = "employee_test"
    employee_password = "employee123"
    
    user, created = User.objects.get_or_create(
        email=employee_email,
        defaults={
            'username': employee_username,
            'first_name': 'Test',
            'last_name': 'Employee',
            'is_active': True,
            'is_verified': True
        }
    )
    
    if created:
        user.set_password(employee_password)
        user.save()
        print(f"\n✓ Created new user: {employee_email}")
    else:
        print(f"\n✓ Using existing user: {employee_email}")
    
    # Check if already has employee profile
    existing_profile = UserProfile.objects.filter(
        user=user,
        organization=org,
        profile_type='employee'
    ).first()
    
    if existing_profile and existing_profile.status == 'active':
        print(f"✓ User already has active employee profile")
    else:
        with transaction.atomic():
            # Create employee profile
            employee_profile = UserProfile.objects.create(
                user=user,
                organization=org,
                profile_type='employee',
                is_primary=True,  # Make it primary for this user
                status='active',
                activated_at=timezone.now()
            )
            
            # Link to organization
            UserOrganization.objects.get_or_create(
                user=user,
                organization=org,
                defaults={
                    'is_active': True,
                    'invitation_accepted_at': timezone.now()
                }
            )
            
            # Create Employee record
            Employee.objects.get_or_create(
                user=user,
                organization=org,
                defaults={
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'status': 'active'
                }
            )
            
            print(f"✓ Created employee profile for {user.email}")
    
    # Show all profiles for this user
    print(f"\n📋 User Profiles for {user.email}:")
    profiles = UserProfile.objects.filter(user=user, status='active')
    for profile in profiles:
        primary = " [PRIMARY]" if profile.is_primary else ""
        print(f"   - {profile.get_profile_type_display()} at {profile.organization.name}{primary}")
    
    print("\n" + "=" * 60)
    print("✅ EMPLOYEE SETUP COMPLETE!")
    print("=" * 60)
    print("\n🔐 Test Employee Credentials:")
    print(f"   Email: {employee_email}")
    print(f"   Password: {employee_password}")
    print(f"   Organization: {org.name}")
    print("\n📝 To test:")
    print("   1. Go to http://localhost:5173/login")
    print("   2. Login with employee credentials above")
    print("   3. You should see role selection showing 'Employee' role")
    print("   4. Select Employee role to access with limited permissions")
    print("\n" + "=" * 60)


if __name__ == '__main__':
    create_test_employee()
