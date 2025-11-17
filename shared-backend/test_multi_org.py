"""
Test that a user can be vendor of one org and employee of another
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, UserOrganization, Employee, Organization
from crmApp.serializers import UserSerializer

user = User.objects.get(email='dummy@gmail.com')
print(f'User: {user.email}\n')

print('Current Profiles:')
for profile in user.user_profiles.filter(status='active'):
    org_name = profile.organization.name if profile.organization else None
    print(f'  {profile.profile_type}: Org={org_name}')

print('\nOrganizations Owned (as vendor):')
owned = UserOrganization.objects.filter(user=user, is_owner=True, is_active=True)
if owned.exists():
    for uo in owned:
        print(f'  {uo.organization.name}')
else:
    print('  None')

print('\nOrganizations Worked For (as employee):')
employees = Employee.objects.filter(user=user, status='active')
if employees.exists():
    for e in employees:
        print(f'  {e.organization.name}')
else:
    print('  None')

print('\nSerialized Profiles (what frontend sees):')
serializer = UserSerializer(user)
data = serializer.data
for p in data.get('profiles', []):
    print(f'  {p.get("profile_type")}: org_name="{p.get("organization_name")}", org_id={p.get("organization")}')

