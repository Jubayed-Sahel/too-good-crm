#!/usr/bin/env python
"""
Remove wildcard permission from Support role
This was only for testing - now we implement proper RBAC
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, Role, Permission, RolePermission

# Get New Org
new_org = Organization.objects.get(name='New Org')

# Get the Support role
support_role = Role.objects.get(slug='support', organization=new_org)
print(f"Role: {support_role.name} (ID: {support_role.id})\n")

# Find and remove wildcard permission
try:
    wildcard_perm = Permission.objects.get(resource='*', action='*', organization=new_org)
    
    # Remove from role
    RolePermission.objects.filter(role=support_role, permission=wildcard_perm).delete()
    
    print(f"✅ Removed wildcard permission from {support_role.name}")
    
    # Delete the wildcard permission itself
    wildcard_perm.delete()
    print(f"✅ Deleted wildcard permission from database")
    
except Permission.DoesNotExist:
    print("ℹ️  No wildcard permission found")

# Verify current permissions
print("\n=== CURRENT PERMISSIONS ===")
current_perms = RolePermission.objects.filter(role=support_role)
print(f"Total permissions for Support role: {current_perms.count()}")

for rp in current_perms:
    print(f"  - {rp.permission.resource}:{rp.permission.action}")

print("\n✅ Done! Employee will now have restricted access based on assigned permissions.")
