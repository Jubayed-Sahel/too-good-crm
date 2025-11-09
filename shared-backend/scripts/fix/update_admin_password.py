#!/usr/bin/env python
import os
import sys
import django

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile

# Try to get or create admin user
try:
    admin_user = User.objects.get(email='admin@crm.com')
    print(f"Found existing user: {admin_user.email}")
except User.DoesNotExist:
    # Try to create with unique username
    admin_user = User.objects.create_user(
        email='admin@crm.com',
        username='admin_crm_user',
        first_name='Admin',
        last_name='User',
        is_active=True,
        is_staff=True,
    )
    print(f"Created new user: {admin_user.email}")

# Set password
admin_user.set_password('admin123')
admin_user.save()
print(f"Password set to: admin123")

# Get or create organization
org, _ = Organization.objects.get_or_create(
    name='Admin Organization',
    defaults={'slug': 'admin-org'}
)
print(f"Organization: {org.name}")

# Get or create profile
profile, _ = UserProfile.objects.get_or_create(
    user=admin_user,
    organization=org,
    profile_type='vendor',
    defaults={
        'is_primary': True,
        'status': 'active'
    }
)
print(f"Profile: {profile.profile_type}")

print("\n✅ Setup complete!")
print(f"Login with: {admin_user.email} / admin123")

