#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, User, UserProfile, Employee, UserOrganization, Role

# Get users
admin_user = User.objects.get(email='admin@crm.com')
me_user = User.objects.get(email='me@me.com')

# Get organizations
new_org = Organization.objects.get(name='New Org')

print(f"Admin User: {admin_user.id} - {admin_user.email}")
print(f"Me User: {me_user.id} - {me_user.email}")
print(f"New Org: {new_org.id} - {new_org.name}")

# Check if UserOrganization exists
user_org, created = UserOrganization.objects.get_or_create(
    user=admin_user,
    organization=new_org,
    defaults={'is_owner': False}
)
print(f"\nUserOrganization {'created' if created else 'already exists'}: {user_org.id}")

# Find existing employee profile and update it
try:
    employee_profile = UserProfile.objects.get(
        user=admin_user,
        profile_type='employee'
    )
    print(f"\nFound existing employee profile: {employee_profile.id}")
    print(f"  Current org: {employee_profile.organization.name}")
    
    # Update to point to New Org
    employee_profile.organization = new_org
    employee_profile.save()
    print(f"  Updated to: {employee_profile.organization.name}")
except UserProfile.DoesNotExist:
    # Create new employee profile
    employee_profile = UserProfile.objects.create(
        user=admin_user,
        organization=new_org,
        profile_type='employee',
        is_primary=False,
        status='active'
    )
    print(f"\nCreated new employee profile: {employee_profile.id}")

# Find or create Employee record
try:
    employee = Employee.objects.get(user=admin_user)
    print(f"\nFound existing Employee record: {employee.id}")
    print(f"  Current org: {employee.organization.name}")
    
    # Update to point to New Org
    employee.organization = new_org
    employee.save()
    print(f"  Updated to: {employee.organization.name}")
except Employee.DoesNotExist:
    # Create new Employee
    employee = Employee.objects.create(
        user=admin_user,
        organization=new_org,
        first_name=admin_user.first_name,
        last_name=admin_user.last_name,
        email=admin_user.email,
        status='active'
    )
    print(f"\nCreated new Employee record: {employee.id}")

print("\n=== FINAL STATE ===")
print(f"Admin's profiles:")
for p in admin_user.user_profiles.all():
    print(f"  - ID {p.id}: {p.profile_type} at {p.organization.name} (Primary: {p.is_primary})")

print(f"\nNew Org employees:")
for e in Employee.objects.filter(organization=new_org):
    print(f"  - {e.user.email} (ID: {e.id}, Role: {e.role.name if e.role else 'None'})")

print(f"\nAdmin's UserOrganizations:")
for uo in UserOrganization.objects.filter(user=admin_user):
    print(f"  - {uo.organization.name} (Owner: {uo.is_owner})")
