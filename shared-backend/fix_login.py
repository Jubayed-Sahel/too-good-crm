#!/usr/bin/env python
"""Fix login by updating admin user password"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile

# Try to get existing admin user or create new one
try:
    # Try admin@crm.com first
    admin_user = User.objects.get(email='admin@crm.com')
    print(f"Found existing user: {admin_user.email}")
except User.DoesNotExist:
    try:
        # Try admin@test.com
        admin_user = User.objects.get(email='admin@test.com')
        print(f"Found existing user: {admin_user.email}")
        # Update email if needed
        admin_user.email = 'admin@crm.com'
        admin_user.save()
        print(f"Updated email to: {admin_user.email}")
    except User.DoesNotExist:
        # Create new user with unique username
        admin_user = User.objects.create_user(
            email='admin@crm.com',
            username=f'admin_crm_{User.objects.count()}',
            first_name='Admin',
            last_name='User',
            is_active=True,
            is_staff=True,
        )
        print(f"Created new user: {admin_user.email}")

# Set password
admin_user.set_password('admin123')
admin_user.is_active = True
admin_user.save()
print(f"Password set to: admin123")

# Get or create organization
org, org_created = Organization.objects.get_or_create(
    name='Admin Organization',
    defaults={'slug': 'admin-org'}
)
print(f"Organization: {org.name} ({'created' if org_created else 'exists'})")

# Get or create profile - handle existing profiles
existing_profile = UserProfile.objects.filter(
    user=admin_user,
    profile_type='vendor'
).first()

if existing_profile:
    # Update existing profile
    existing_profile.organization = org
    existing_profile.is_primary = True
    existing_profile.status = 'active'
    existing_profile.save()
    profile = existing_profile
    print(f"Profile: {profile.profile_type} (updated)")
else:
    # Create new profile
    profile = UserProfile.objects.create(
        user=admin_user,
        organization=org,
        profile_type='vendor',
        is_primary=True,
        status='active'
    )
    print(f"Profile: {profile.profile_type} (created)")

print("\n" + "="*70)
print("✅ LOGIN SETUP COMPLETE!")
print("="*70)
print(f"Email: {admin_user.email}")
print(f"Password: admin123")
print(f"Username: {admin_user.username}")
print("="*70)

