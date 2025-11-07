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

# Fix users without profiles
print("\n" + "=" * 60)
print("🔧 Fixing users without profiles...")

for user in users:
    if user.user_profiles.count() == 0:
        print(f"\n👤 Fixing {user.username}...")
        
        # Get or create a default organization
        org, created = Organization.objects.get_or_create(
            slug=f"{user.username}-org",
            defaults={
                'name': f"{user.username}'s Organization",
                'email': user.email
            }
        )
        
        if created:
            print(f"   ✅ Created organization: {org.name}")
        else:
            print(f"   ℹ️  Using existing organization: {org.name}")
        
        # Create all three profiles
        profiles_to_create = [
            ('vendor', True),    # Primary
            ('employee', False),
            ('customer', False),
        ]
        
        for profile_type, is_primary in profiles_to_create:
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                organization=org,
                profile_type=profile_type,
                defaults={
                    'is_primary': is_primary,
                    'status': 'active',
                    'activated_at': timezone.now()
                }
            )
            
            if created:
                print(f"   ✅ Created {profile_type} profile (Primary: {is_primary})")
            else:
                print(f"   ℹ️  Profile already exists: {profile_type}")

print("\n" + "=" * 60)
print("✅ All users now have profiles!")

# Verify
print("\n📊 Final Status:")
for user in User.objects.all():
    profile_count = user.user_profiles.count()
    primary = user.user_profiles.filter(is_primary=True).first()
    status = "✅" if profile_count > 0 else "❌"
    primary_type = primary.profile_type if primary else "N/A"
    print(f"{status} {user.username}: {profile_count} profiles (Primary: {primary_type})")
