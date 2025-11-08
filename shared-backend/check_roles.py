import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Role, Organization, RolePermission

# Get the first organization
org = Organization.objects.first()
if not org:
    print("❌ No organization found in database")
    exit(1)

print(f"📊 Checking roles for organization: {org.name} (ID: {org.id})")
print("-" * 60)

# Get all roles for this organization
roles = Role.objects.filter(organization=org)
print(f"\n✅ Total roles in database: {roles.count()}")

if roles.count() == 0:
    print("\n⚠️  No roles found! Role creation might not be saving to database.")
else:
    print("\n📝 Roles found:")
    for role in roles:
        # Get permission count for this role
        perm_count = RolePermission.objects.filter(role=role).count()
        print(f"  • {role.name}")
        print(f"    - Slug: {role.slug}")
        print(f"    - ID: {role.id}")
        print(f"    - Permissions: {perm_count}")
        print(f"    - System Role: {role.is_system_role}")
        print(f"    - Created: {role.created_at}")
        print()

print("-" * 60)
print(f"🔍 Summary:")
print(f"  Organization: {org.name}")
print(f"  Total Roles: {roles.count()}")
print(f"  Status: {'✅ Roles are being saved' if roles.count() > 0 else '❌ No roles found - check role creation'}")
