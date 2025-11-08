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

# Check if Employee record exists
employee, created = Employee.objects.get_or_create(
    user=admin_user,
    organization=new_org,
    defaults={
        'first_name': admin_user.first_name,
        'last_name': admin_user.last_name,
        'email': admin_user.email,
        'status': 'active'
    }
)
print(f"Employee {'created' if created else 'already exists'}: {employee.id}")

# Check if employee UserProfile exists for New Org
employee_profile, created = UserProfile.objects.get_or_create(
    user=admin_user,
    organization=new_org,
    profile_type='employee',
    defaults={
        'is_primary': False,
        'status': 'active'
    }
)
print(f"Employee Profile {'created' if created else 'already exists'}: {employee_profile.id}")

print("\n=== FINAL CHECK ===")
print(f"Admin's profiles:")
for p in admin_user.userprofile_set.all():
    print(f"  - {p.profile_type} at {p.organization.name} (Primary: {p.is_primary})")

print(f"\nNew Org employees:")
for e in Employee.objects.filter(organization=new_org):
    print(f"  - {e.user.email} (Role: {e.role.name if e.role else 'None'})")
