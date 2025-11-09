"""
Quick script to check user profile status
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
django.setup()

from crmApp.models import User, UserProfile

print("=" * 80)
print("User Profile Status Check")
print("=" * 80)

users = User.objects.all()
print(f"\nTotal users: {users.count()}\n")

required_types = {'vendor', 'employee', 'customer'}
all_good = True

for user in users:
    profiles = user.user_profiles.all()
    profile_types = set(profiles.values_list('profile_type', flat=True))
    missing_types = required_types - profile_types
    primary = profiles.filter(is_primary=True).first()
    
    if len(profile_types) == 3 and not missing_types:
        status = "[OK]"
    else:
        status = "[MISSING PROFILES]"
        all_good = False
    
    primary_type = primary.profile_type if primary else "NONE"
    print(f"{status} {user.username} ({user.email}):")
    print(f"  Profiles: {len(profile_types)}/3 - {', '.join(sorted(profile_types)) if profile_types else 'None'}")
    if missing_types:
        print(f"  Missing: {', '.join(missing_types)}")
    print(f"  Primary: {primary_type}")
    print()

print("=" * 80)
if all_good:
    print("All users have 3 profiles!")
else:
    print("Some users are missing profiles. Run: python manage.py ensure_all_profiles --fix-orgs")
print("=" * 80)

