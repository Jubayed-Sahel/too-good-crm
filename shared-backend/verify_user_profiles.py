import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile
from crmApp.serializers import UserSerializer

print("=" * 80)
print("USER PROFILE VERIFICATION")
print("=" * 80)

users = User.objects.all()
print(f"\n📊 Total users in database: {users.count()}\n")

for user in users:
    print(f"\n{'='*80}")
    print(f"👤 User: {user.username} ({user.email})")
    print(f"{'='*80}")
    print(f"   Active: {user.is_active}")
    print(f"   Verified: {user.is_verified}")
    
    profiles = user.user_profiles.all().order_by('-is_primary', 'profile_type')
    print(f"\n   📋 Profiles: {profiles.count()}")
    
    if profiles.count() == 0:
        print(f"   ⚠️  WARNING: User has NO profiles! They won't be able to login properly.")
    else:
        for profile in profiles:
            primary_marker = "⭐ PRIMARY" if profile.is_primary else "  "
            status_emoji = "✅" if profile.status == 'active' else "❌"
            print(f"      {primary_marker} {status_emoji} {profile.profile_type.upper()}")
            print(f"         Organization: {profile.organization.name}")
            print(f"         Status: {profile.status}")
            print(f"         ID: {profile.id}")
    
    # Test serialization (what the API returns)
    print(f"\n   📦 API Response Preview:")
    serializer = UserSerializer(user)
    user_data = serializer.data
    print(f"      Email: {user_data['email']}")
    print(f"      Profiles count: {len(user_data.get('profiles', []))}")
    
    if user_data.get('profiles'):
        for profile in user_data['profiles']:
            primary = "PRIMARY" if profile.get('is_primary') else ""
            print(f"      • {profile.get('profile_type')} @ {profile.get('organization_name')} {primary}")

print("\n" + "=" * 80)
print("✅ Verification Complete")
print("=" * 80)

# Check for any users without profiles
users_without_profiles = User.objects.filter(user_profiles__isnull=True)
if users_without_profiles.exists():
    print(f"\n⚠️  WARNING: {users_without_profiles.count()} user(s) have NO profiles!")
    print("These users won't be able to login properly:")
    for user in users_without_profiles:
        print(f"   • {user.username} ({user.email})")
    print("\nRun fix_user_profiles.py to fix this issue.")
else:
    print("\n✅ All users have at least one profile!")
