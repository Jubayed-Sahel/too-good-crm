#!/usr/bin/env python
"""Create or update admin user for testing"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile
from django.contrib.auth import get_user_model

# Get or create admin user
admin_user, created = User.objects.get_or_create(
    email='admin@crm.com',
    defaults={
        'username': 'admin_crm',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_active': True,
        'is_staff': True,
    }
)

# Update password
admin_user.set_password('admin123')
admin_user.save()

print(f"✅ User {'created' if created else 'updated'}: {admin_user.email}")

# Get or create organization
org, org_created = Organization.objects.get_or_create(
    name='Admin Organization',
    defaults={'slug': 'admin-org'}
)

print(f"✅ Organization {'created' if org_created else 'found'}: {org.name}")

# Get or create profile
profile, profile_created = UserProfile.objects.get_or_create(
    user=admin_user,
    organization=org,
    profile_type='vendor',
    defaults={
        'is_primary': True,
        'status': 'active'
    }
)

print(f"✅ Profile {'created' if profile_created else 'found'}: {profile.profile_type}")

print("\n✅ Setup complete!")
print("Login credentials:")
print(f"  Email: {admin_user.email}")
print(f"  Password: admin123")

