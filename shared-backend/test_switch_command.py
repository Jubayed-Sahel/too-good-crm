import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, TelegramUser

print("=" * 60)
print("Testing /switch Command Setup")
print("=" * 60)

# Find a user with multiple profiles
users_with_multiple_profiles = []

for user in User.objects.filter(is_active=True):
    profiles = UserProfile.objects.filter(user=user, status='active')
    if profiles.count() > 1:
        users_with_multiple_profiles.append((user, profiles))

if not users_with_multiple_profiles:
    print("\n❌ No users with multiple profiles found!")
    print("You need at least 2 active profiles to test profile switching.")
else:
    print(f"\n✅ Found {len(users_with_multiple_profiles)} user(s) with multiple profiles\n")
    
    for user, profiles in users_with_multiple_profiles[:3]:  # Show first 3
        print(f"User: {user.email}")
        print(f"Profiles ({profiles.count()}):")
        
        for profile in profiles:
            org_name = profile.organization.name if profile.organization else "No org"
            primary = " ⭐" if profile.is_primary else ""
            print(f"  - ID {profile.id}: {profile.profile_type} at {org_name}{primary}")
        
        # Check if user has Telegram account
        telegram_user = TelegramUser.objects.filter(user=user).first()
        if telegram_user:
            selected = telegram_user.selected_profile
            if selected:
                print(f"  Current: Profile {selected.id} ({selected.profile_type})")
            else:
                print(f"  Current: None selected")
            print(f"  Chat ID: {telegram_user.chat_id}")
            print(f"\n  To switch in Telegram:")
            print(f"  /switch {profiles[0].id}")
            print(f"  /switch {profiles[1].id if profiles.count() > 1 else profiles[0].id}")
        else:
            print(f"  ⚠️  No Telegram account linked")
        
        print()

print("=" * 60)
print("\nTo test /switch command:")
print("1. Send: /profiles")
print("   (See your available profiles)")
print("2. Send: /switch <profile_id>")
print("   (Switch to that profile)")
print("3. Send: /permissions")
print("   (Verify new permissions)")
print("=" * 60)

