#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

# Get admin user
admin_user = User.objects.get(email='admin@crm.com')

# Serialize as the API would
serializer = UserSerializer(admin_user)
data = serializer.data

print("=== API Response for admin@crm.com ===\n")
print(f"User ID: {data['id']}")
print(f"Email: {data['email']}")
print(f"\nProfiles ({len(data['profiles'])}):")

for profile in data['profiles']:
    print(f"\n  Profile ID: {profile['id']}")
    print(f"  Type: {profile['profile_type']} ({profile['profile_type_display']})")
    print(f"  Organization: {profile['organization_name']} (ID: {profile['organization']})")
    print(f"  Primary: {profile['is_primary']}")
    print(f"  Status: {profile['status']}")
    print(f"  Owner: {profile['is_owner']}")
    if profile['roles']:
        print(f"  Roles: {', '.join([r['name'] for r in profile['roles']])}")

print(f"\n\nOrganizations ({len(data['organizations'])}):")
for org in data['organizations']:
    print(f"  - {org['name']} (Owner: {org['is_owner']})")
