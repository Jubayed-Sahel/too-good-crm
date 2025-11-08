#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile

# Get admin user
admin_user = User.objects.get(email='admin@crm.com')

print("=== Current Profile States ===\n")

profiles = UserProfile.objects.filter(user=admin_user).order_by('id')

for p in profiles:
    print(f"Profile ID: {p.id}")
    print(f"  Type: {p.profile_type}")
    print(f"  Organization: {p.organization.name} (ID: {p.organization.id})")
    print(f"  is_primary: {p.is_primary}")
    print(f"  status: {p.status}")
    print()

primary_profile = UserProfile.objects.filter(user=admin_user, is_primary=True).first()
print(f"PRIMARY PROFILE: {primary_profile.profile_type} at {primary_profile.organization.name}" if primary_profile else "NO PRIMARY PROFILE")
