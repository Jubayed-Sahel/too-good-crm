#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserRole, Role

# Get admin user and New Org
admin = User.objects.get(email='admin@crm.com')
new_org = Organization.objects.get(name='New Org')

print(f"User: {admin.email}")
print(f"Organization: {new_org.name}")

# Find the Support role
support_role = Role.objects.get(slug='support', organization=new_org)
print(f"\nAssigning role: {support_role.name} (ID: {support_role.id})")

# Check if role already assigned
existing = UserRole.objects.filter(
    user=admin,
    organization=new_org,
    role=support_role
).first()

if existing:
    print(f"✓ Role already assigned (UserRole ID: {existing.id})")
    if not existing.is_active:
        existing.is_active = True
        existing.save()
        print("  - Activated the role")
else:
    # Create new user role assignment
    user_role = UserRole.objects.create(
        user=admin,
        organization=new_org,
        role=support_role,
        is_active=True
    )
    print(f"✓ Role assigned successfully (UserRole ID: {user_role.id})")

# Verify
print("\n=== Verification ===")
user_roles = UserRole.objects.filter(user=admin, organization=new_org, is_active=True)
for ur in user_roles:
    print(f"- Role: {ur.role.name}")
    print(f"  Is Active: {ur.is_active}")
    print(f"  Permissions:")
    for rp in ur.role.role_permissions.all():
        print(f"    * {rp.permission.resource}:{rp.permission.action}")
