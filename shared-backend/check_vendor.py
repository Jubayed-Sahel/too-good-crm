import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization

vendor = User.objects.get(username='vendor_demo')
print(f'\n✅ Vendor User: {vendor.username} (ID: {vendor.id})')
print('='*60)

print('\nVendor Profiles:')
for profile in vendor.user_profiles.all():
    print(f'  - Organization: {profile.organization.name} (ID: {profile.organization.id})')
    print(f'    Profile Type: {profile.profile_type}')
    print(f'    Status: {profile.status}')
    print(f'    Is Primary: {profile.is_primary}')
    print()

vendor_org = Organization.objects.get(name='Demo Vendor Company')
print(f'Demo Vendor Company ID: {vendor_org.id}')
