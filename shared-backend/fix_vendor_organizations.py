import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import UserProfile, Organization

print("=" * 60)
print("Fixing Vendor Profiles Without Organizations")
print("=" * 60)

# Get vendors without organizations
vendors_without_org = UserProfile.objects.filter(
    profile_type='vendor',
    status='active',
    organization__isnull=True
)

if not vendors_without_org.exists():
    print("\n✅ All vendor profiles have organizations!")
else:
    print(f"\nFound {vendors_without_org.count()} vendor(s) without organization\n")
    
    for vendor in vendors_without_org:
        print(f"Vendor: {vendor.user.email} (Profile ID: {vendor.id})")
        
        # Create organization for this vendor
        org_name = f"{vendor.user.email.split('@')[0]} Organization"
        
        org, created = Organization.objects.get_or_create(
            name=org_name,
            defaults={
                'description': f'Auto-generated organization for {vendor.user.email}'
            }
        )
        
        # Assign organization to vendor profile
        vendor.organization = org
        vendor.save()
        
        if created:
            print(f"  ✅ Created organization: {org.name} (ID: {org.id})")
        else:
            print(f"  ✅ Assigned existing organization: {org.name} (ID: {org.id})")
        
        print(f"  ✅ Vendor now has full permissions!")
        print()

print("=" * 60)
print("✅ All vendors now have organizations and full permissions!")
print("=" * 60)

