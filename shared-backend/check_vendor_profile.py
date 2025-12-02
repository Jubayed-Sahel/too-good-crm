import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserProfile, User

print("=" * 60)
print("Checking Vendor Profiles")
print("=" * 60)

vendors = UserProfile.objects.filter(profile_type='vendor', status='active')

if not vendors.exists():
    print("❌ No active vendor profiles found!")
else:
    for vendor in vendors:
        print(f"\nVendor Profile ID: {vendor.id}")
        print(f"User: {vendor.user.email}")
        print(f"Status: {vendor.status}")
        print(f"Organization: {vendor.organization}")
        
        if vendor.organization:
            print(f"✅ HAS ORGANIZATION: {vendor.organization.name} (ID: {vendor.organization.id})")
        else:
            print(f"❌ NO ORGANIZATION - This is why permissions are 0!")
            print(f"\nTo fix this, you need to:")
            print(f"1. Create an organization for this vendor")
            print(f"2. Or assign an existing organization to this profile")

print("\n" + "=" * 60)

