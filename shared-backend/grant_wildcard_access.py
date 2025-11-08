#!/usr/bin/env python
"""
Grant WILDCARD permissions to admin@crm.com to test if UI responds
This will make ALL menus visible if the permission system is working
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserRole, Role, Permission, RolePermission

# Get admin user and New Org
admin = User.objects.get(email='admin@crm.com')
new_org = Organization.objects.get(name='New Org')

print(f"User: {admin.email}")
print(f"Organization: {new_org.name}\n")

# Get the Support role
support_role = Role.objects.get(slug='support', organization=new_org)
print(f"Role: {support_role.name} (ID: {support_role.id})\n")

# Check current permissions
current_perms = RolePermission.objects.filter(role=support_role)
print(f"Current permissions: {current_perms.count()}")
for rp in current_perms[:5]:
    print(f"  - {rp.permission.resource}:{rp.permission.action}")
print()

# Create a wildcard permission if it doesn't exist
wildcard_perm, created = Permission.objects.get_or_create(
    resource='*',
    action='*',
    organization=new_org,
    defaults={
        'description': 'Wildcard permission for full access to all resources'
    }
)

if created:
    print(f"✅ Created wildcard permission: {wildcard_perm.id}")
else:
    print(f"ℹ️  Wildcard permission already exists: {wildcard_perm.id}")

# Add wildcard to Support role
rp, created = RolePermission.objects.get_or_create(
    role=support_role,
    permission=wildcard_perm
)

if created:
    print(f"✅ Added wildcard permission to Support role")
else:
    print(f"ℹ️  Wildcard permission already in Support role")

# Verify
print("\n=== VERIFICATION ===")
all_perms = RolePermission.objects.filter(role=support_role)
print(f"Total permissions for Support role: {all_perms.count()}")

has_wildcard = all_perms.filter(permission__resource='*', permission__action='*').exists()
print(f"Has wildcard (*:*): {has_wildcard}")

print("\n✅ Done! Logout and login as admin@crm.com")
print("   All menu items should now be visible!")
