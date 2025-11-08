"""
Test script to check employee invitation
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from crmApp.models import User, Organization, UserOrganization, Employee
from django.contrib.auth import get_user_model

# Get all users and organizations
users = User.objects.all()
orgs = Organization.objects.all()
employees = Employee.objects.all()

print("=" * 80)
print("CURRENT DATABASE STATE")
print("=" * 80)

print(f"\n📊 Users ({users.count()}):")
for user in users:
    print(f"  - {user.email} ({user.username})")

print(f"\n🏢 Organizations ({orgs.count()}):")
for org in orgs:
    print(f"  - {org.name} (ID: {org.id})")
    user_orgs = UserOrganization.objects.filter(organization=org)
    print(f"    Members: {user_orgs.count()}")
    for uo in user_orgs:
        print(f"      • {uo.user.email} (Owner: {uo.is_owner})")

print(f"\n👥 Employees ({employees.count()}):")
for emp in employees:
    print(f"  - {emp.full_name} ({emp.email}) - Org: {emp.organization.name}")
    if emp.user:
        print(f"    Linked to user: {emp.user.email}")
    else:
        print(f"    No user link")

print("\n" + "=" * 80)

# Test data
test_email = "newemployee@example.com"
test_existing_email = users.first().email if users.exists() else None

print("\n🧪 TEST SCENARIOS")
print("=" * 80)

print(f"\n1. Test inviting NEW user: {test_email}")
print(f"   User exists: {User.objects.filter(email=test_email).exists()}")

if test_existing_email:
    print(f"\n2. Test inviting EXISTING user: {test_existing_email}")
    existing_user = User.objects.get(email=test_existing_email)
    print(f"   User exists: True")
    print(f"   User: {existing_user.get_full_name() or existing_user.username}")
    
    # Check if already employee in first org
    if orgs.exists():
        first_org = orgs.first()
        is_employee = Employee.objects.filter(
            organization=first_org,
            user=existing_user
        ).exists()
        print(f"   Already employee in {first_org.name}: {is_employee}")

print("\n" + "=" * 80)
