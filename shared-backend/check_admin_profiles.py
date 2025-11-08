#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile

# Get admin user
admin_user = User.objects.get(email='admin@crm.com')

print(f"=== Profiles for {admin_user.email} ===\n")

profiles = admin_user.user_profiles.all().select_related('organization')

for profile in profiles:
    print(f"Profile ID: {profile.id}")
    print(f"  Type: {profile.profile_type}")
    print(f"  Organization: {profile.organization.name}")
    print(f"  Org ID: {profile.organization.id}")
    print(f"  Primary: {profile.is_primary}")
    print(f"  Status: {profile.status}")
    print()

print(f"Total profiles: {profiles.count()}")
print(f"\nPrimary profile: {admin_user.user_profiles.filter(is_primary=True).first().profile_type if admin_user.user_profiles.filter(is_primary=True).exists() else 'None'}")
