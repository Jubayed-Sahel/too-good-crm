import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserOrganization, Employee, UserProfile

print("\n" + "="*60)
print("ALL USERS")
print("="*60)
for user in User.objects.all():
    print(f"ID {user.id}: {user.email} - {user.full_name}")

print("\n" + "="*60)
print("ALL ORGANIZATIONS")
print("="*60)
for org in Organization.objects.all():
    print(f"ID {org.id}: {org.name}")

print("\n" + "="*60)
print("ORGANIZATION OWNERSHIP (Vendors)")
print("="*60)
for rel in UserOrganization.objects.select_related('user', 'organization').filter(is_owner=True):
    print(f"✅ {rel.user.email} OWNS '{rel.organization.name}' (org_id: {rel.organization.id})")

print("\n" + "="*60)
print("EMPLOYEE RELATIONSHIPS")
print("="*60)
for emp in Employee.objects.select_related('user', 'organization', 'role').filter(status='active'):
    role_name = emp.role.name if emp.role else "❌ NO ROLE"
    print(f"👤 {emp.user.email} is EMPLOYEE of '{emp.organization.name}' (org_id: {emp.organization.id})")
    print(f"   Role: {role_name}")

print("\n" + "="*60)
print("USER PROFILES")
print("="*60)
for profile in UserProfile.objects.select_related('user', 'organization').filter(status='active').order_by('user__email', '-is_primary'):
    org_name = profile.organization.name if profile.organization else "None"
    primary_flag = " [PRIMARY]" if profile.is_primary else ""
    print(f"{profile.user.email}: {profile.profile_type.upper()} in '{org_name}'{primary_flag}")

print("\n" + "="*60)

