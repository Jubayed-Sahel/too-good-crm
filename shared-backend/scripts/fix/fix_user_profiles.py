import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, Organization
from django.utils import timezone

print("🔍 Checking user profiles and organizations...")
print("=" * 60)

# Check all users
users = User.objects.all()
print(f"\n📊 Total Users: {users.count()}\n")

for user in users:
    print(f"👤 User: {user.username} ({user.email})")
    print(f"   Active: {user.is_active}, Verified: {user.is_verified}")
    
    # Check profiles
    profiles = user.user_profiles.all()
    print(f"   Profiles: {profiles.count()}")
    
    for profile in profiles:
        print(f"      • {profile.profile_type} @ {profile.organization.name}")
        print(f"        Primary: {profile.is_primary}, Status: {profile.status}")
    
    if profiles.count() == 0:
        print(f"   ⚠️  WARNING: User has no profiles!")
    
    print()

print("=" * 60)
print("\n🏢 Organizations in database:")
orgs = Organization.objects.all()
for org in orgs:
    print(f"   • {org.name} (ID: {org.id})")

# Fix users - ensure they all have 3 profiles
print("\n" + "=" * 60)
print("🔧 Ensuring all users have 3 profiles...")

from crmApp.models import UserOrganization, Vendor
from django.utils.text import slugify
from django.db import transaction

required_profile_types = ['vendor', 'employee', 'customer']

for user in users:
    existing_profiles = user.user_profiles.all()
    existing_types = set(existing_profiles.values_list('profile_type', flat=True))
    missing_types = set(required_profile_types) - existing_types
    
    # Skip if user already has all 3 profiles
    if not missing_types and len(existing_types) >= 3:
        continue
    
    print(f"\n👤 Fixing {user.username}...")
    print(f"   Existing profiles: {', '.join(existing_types) if existing_types else 'None'}")
    print(f"   Missing profiles: {', '.join(missing_types) if missing_types else 'None'}")
    
    with transaction.atomic():
        # Get or create organization
        user_org = user.user_organizations.filter(is_active=True).first()
        
        if user_org:
            org = user_org.organization
            print(f"   🏢 Using existing organization: {org.name}")
        else:
            # Create organization for user
            org_name = f"{user.first_name} {user.last_name}'s Organization" if (user.first_name and user.last_name) else f"{user.username}'s Organization"
            org_slug = slugify(org_name)
            
            # Ensure unique slug
            counter = 1
            base_slug = org_slug
            while Organization.objects.filter(slug=org_slug).exists():
                org_slug = f"{base_slug}-{counter}"
                counter += 1
            
            org = Organization.objects.create(
                name=org_name,
                slug=org_slug,
                email=user.email,
                is_active=True
            )
            print(f"   ✅ Created organization: {org.name}")
            
            # Create UserOrganization link
            UserOrganization.objects.create(
                user=user,
                organization=org,
                is_owner=True,
                is_active=True
            )
            print(f"   ✅ Created UserOrganization link")
        
        # Check if user has a primary profile
        has_primary = existing_profiles.filter(is_primary=True).exists()
        
        # Create missing profiles
        vendor_profile = None
        for profile_type in required_profile_types:
            if profile_type in missing_types:
                # Vendor is primary if no primary exists
                is_primary = (profile_type == 'vendor' and not has_primary)
                
                profile = UserProfile.objects.create(
                    user=user,
                    organization=org,
                    profile_type=profile_type,
                    is_primary=is_primary,
                    status='active',
                    activated_at=timezone.now()
                )
                print(f"   ✅ Created {profile_type} profile (Primary: {is_primary})")
                
                if profile_type == 'vendor':
                    vendor_profile = profile
                    has_primary = True
            else:
                # Profile exists, get it for vendor record creation
                if profile_type == 'vendor':
                    vendor_profile = existing_profiles.filter(profile_type='vendor').first()
                    # Ensure vendor is primary if no primary exists
                    if not has_primary:
                        # Remove primary from all profiles
                        UserProfile.objects.filter(user=user).update(is_primary=False)
                        vendor_profile.is_primary = True
                        vendor_profile.save(update_fields=['is_primary'])
                        print(f"   ✅ Set vendor profile as primary")
                        has_primary = True
        
        # Create Vendor record if vendor profile exists but no vendor record
        if vendor_profile:
            vendor_exists = Vendor.objects.filter(
                user=user,
                organization=org
            ).exists()
            
            if not vendor_exists:
                try:
                    vendor = Vendor.objects.create(
                        user=user,
                        organization=org,
                        user_profile=vendor_profile,
                        name=org.name,
                        email=user.email,
                        status='active'
                    )
                    print(f"   ✅ Created Vendor record")
                except Exception as e:
                    print(f"   ⚠️  Could not create Vendor record: {str(e)}")

print("\n" + "=" * 60)
print("✅ Profile fixing complete!")

# Verify
print("\n📊 Final Status:")
print("=" * 60)

required_types = {'vendor', 'employee', 'customer'}
all_good = True

for user in User.objects.all():
    profiles = user.user_profiles.all()
    profile_types = set(profiles.values_list('profile_type', flat=True))
    missing_types = required_types - profile_types
    primary = profiles.filter(is_primary=True).first()
    
    if len(profile_types) == 3 and not missing_types:
        status_icon = "✅"
        status_text = "OK"
    else:
        status_icon = "❌"
        status_text = f"Missing: {', '.join(missing_types) if missing_types else 'Too many profiles'}"
        all_good = False
    
    primary_type = primary.profile_type if primary else "NONE"
    print(f"{status_icon} {user.username}: {len(profile_types)}/3 profiles - {status_text}")
    print(f"   Profiles: {', '.join(sorted(profile_types))}")
    print(f"   Primary: {primary_type}")
    if user.user_organizations.filter(is_active=True).exists():
        org = user.user_organizations.filter(is_active=True).first().organization
        print(f"   Organization: {org.name}")
    print()

print("=" * 60)
if all_good:
    print("✅ All users have exactly 3 profiles!")
else:
    print("⚠️  Some users are missing profiles. Run the script again to fix them.")
print("=" * 60)
