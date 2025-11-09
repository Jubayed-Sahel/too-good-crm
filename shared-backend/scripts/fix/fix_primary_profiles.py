"""
Fix primary profiles - set vendor as primary for all users
"""
import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
django.setup()

from crmApp.models import User, UserProfile

print("=" * 80)
print("Fixing Primary Profiles")
print("=" * 80)

users = User.objects.all()
fixed_count = 0

for user in users:
    vendor_profile = user.user_profiles.filter(profile_type='vendor').first()
    
    if not vendor_profile:
        print(f"[SKIP] {user.username}: No vendor profile found")
        continue
    
    # Check if vendor is already primary
    if vendor_profile.is_primary:
        print(f"[OK] {user.username}: Vendor is already primary")
        continue
    
    # Set vendor as primary
    UserProfile.objects.filter(user=user).update(is_primary=False)
    vendor_profile.is_primary = True
    vendor_profile.save(update_fields=['is_primary'])
    
    print(f"[FIXED] {user.username}: Set vendor as primary")
    fixed_count += 1

print("=" * 80)
print(f"Fixed {fixed_count} users")
print("=" * 80)

