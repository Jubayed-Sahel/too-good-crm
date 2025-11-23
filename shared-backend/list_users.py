import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Employee, Organization, UserProfile

print('\n=== USERS ===')
for u in User.objects.all():
    print(f'ID {u.id}: {u.email} - {u.first_name} {u.last_name}')

print('\n=== USER PROFILES ===')
for p in UserProfile.objects.all().select_related('user', 'organization'):
    org_name = p.organization.name if p.organization else 'None'
    print(f'User: {p.user.email}, Type: {p.profile_type}, Org: {org_name}, Status: {p.status}, Primary: {p.is_primary}')

print('\n=== EMPLOYEES ===')
for e in Employee.objects.all().select_related('organization', 'role', 'user'):
    role_name = e.role.name if e.role else 'NO ROLE'
    user_email = e.user.email if e.user else e.email
    print(f'Employee {e.id}: {user_email}, Org: {e.organization.name}, Role: {role_name}, Status: {e.status}')

print('\n=== ORGANIZATIONS ===')
for org in Organization.objects.all():
    print(f'ID {org.id}: {org.name}')

