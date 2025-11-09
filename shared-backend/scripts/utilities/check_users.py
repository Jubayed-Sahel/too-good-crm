import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile

print("Checking existing users and their profiles...")
print("=" * 60)

users = User.objects.all()[:5]
for user in users:
    print(f"\nUser: {user.email} (ID: {user.id})")
    profiles = user.user_profiles.all()
    if profiles:
        for profile in profiles:
            print(f"  - {profile.profile_type}: primary={profile.is_primary}, status={profile.status}")
    else:
        print("  No profiles found!")

print("\n" + "=" * 60)
print(f"Total users: {User.objects.count()}")
