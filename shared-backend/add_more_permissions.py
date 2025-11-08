#!/usr/bin/env python
"""
Add more permissions to the Support role for admin@crm.com
This will make more menu items visible in the sidebar
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, Role, Permission, RolePermission

# Get the Support role in New Org
new_org = Organization.objects.get(name='New Org')
support_role = Role.objects.get(slug='support', organization=new_org)

print(f"Adding permissions to role: {support_role.name}\n")

# Define additional permissions to add
permissions_to_add = [
    # Dashboard
    ('dashboard', 'read'),
    
    # Deals
    ('deal', 'view'),
    ('deal', 'create'),
    ('deal', 'edit'),
    ('deal', 'delete'),
    
    # Leads
    ('lead', 'view'),
    ('lead', 'create'),
    ('lead', 'edit'),
    ('lead', 'delete'),
    
    # Activities
    ('activity', 'view'),
    ('activity', 'create'),
    ('activity', 'edit'),
    ('activity', 'delete'),
    
    # Analytics
    ('analytics', 'view'),
    
    # Settings
    ('settings', 'view'),
]

added_count = 0
skipped_count = 0

for resource, action in permissions_to_add:
    try:
        # Find the permission (get first if duplicates exist)
        perms = Permission.objects.filter(resource=resource, action=action)
        
        if not perms.exists():
            print(f"❌ {resource}:{action} - Permission not found in database")
            continue
            
        perm = perms.first()  # Use first if multiple exist
        
        # Check if already assigned
        existing = RolePermission.objects.filter(
            role=support_role,
            permission=perm
        ).first()
        
        if existing:
            print(f"⏭️  {resource}:{action} - Already assigned")
            skipped_count += 1
        else:
            # Add permission to role
            RolePermission.objects.create(
                role=support_role,
                permission=perm
            )
            print(f"✅ {resource}:{action} - Added")
            added_count += 1
            
    except Exception as e:
        print(f"❌ {resource}:{action} - Error: {e}")

print(f"\n{'='*50}")
print(f"Summary:")
print(f"  Added: {added_count}")
print(f"  Skipped: {skipped_count}")
print(f"{'='*50}\n")

# Show all current permissions
print("Current permissions for Support role:")
role_perms = RolePermission.objects.filter(role=support_role).select_related('permission')
for rp in role_perms.order_by('permission__resource', 'permission__action'):
    print(f"  - {rp.permission.resource}:{rp.permission.action}")

print(f"\nTotal: {role_perms.count()} permissions\n")
print("✅ Done! Logout and login as admin@crm.com to see the new menu items.")
