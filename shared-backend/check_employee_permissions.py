#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Employee, Organization, UserRole, Role, Permission

# Get admin user
admin = User.objects.get(email='admin@crm.com')
print(f"\n=== User: {admin.email} ===")

# Get all profiles
profiles = UserProfile.objects.filter(user=admin)
print(f"\nProfiles for admin@crm.com:")
for profile in profiles:
    print(f"  - ID: {profile.id}")
    print(f"    Type: {profile.profile_type}")
    print(f"    Org: {profile.organization.name if profile.organization else 'None'}")
    print(f"    Is Primary: {profile.is_primary}")
    
    # Check if employee
    if profile.profile_type == 'employee':
        try:
            employee = Employee.objects.get(user_profile=profile)
            print(f"    Employee ID: {employee.id}")
            print(f"    Organization: {employee.organization.name}")
            
            # Get user roles for this employee
            user_roles = UserRole.objects.filter(
                user=admin,
                organization=employee.organization,
                is_active=True
            )
            
            print(f"\n    Assigned Roles:")
            if user_roles.exists():
                for ur in user_roles:
                    print(f"      - Role: {ur.role.name} (ID: {ur.role.id})")
                    print(f"        Slug: {ur.role.slug}")
                    print(f"        Is Active: {ur.is_active}")
                    
                    # Get permissions for this role
                    role_perms = ur.role.role_permissions.all()
                    print(f"        Permissions ({role_perms.count()}):")
                    for rp in role_perms:
                        perm = rp.permission
                        print(f"          * {perm.resource}:{perm.action} - {perm.description}")
            else:
                print("      ⚠️ NO ROLES ASSIGNED!")
                
        except Employee.DoesNotExist:
            print(f"    ⚠️ No Employee record found!")

# List all available roles in the org
print("\n\n=== Available Roles in 'New Org' ===")
new_org = Organization.objects.get(name='New Org')
roles = Role.objects.filter(organization=new_org)
for role in roles:
    print(f"\nRole: {role.name} (ID: {role.id})")
    print(f"  Slug: {role.slug}")
    perms = role.role_permissions.all()
    print(f"  Permissions ({perms.count()}):")
    for rp in perms:
        perm = rp.permission
        print(f"    - {perm.resource}:{perm.action}")
