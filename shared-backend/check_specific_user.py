import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, TelegramUser
from crmApp.services.telegram_rbac_service import TelegramRBACService

print("=" * 80)
print("CHECK SPECIFIC USER PROFILES AND PERMISSIONS")
print("=" * 80)

# Ask user which email to check
import sys
if len(sys.argv) > 1:
    email = sys.argv[1]
else:
    print("\nUsage: python check_specific_user.py <email>")
    print("\nOr showing ALL vendor profiles with their permission status:\n")
    
    vendors = UserProfile.objects.filter(
        profile_type='vendor',
        status='active'
    ).select_related('user', 'organization')
    
    print(f"Total active vendor profiles: {vendors.count()}\n")
    
    for vendor in vendors:
        print(f"Email: {vendor.user.email}")
        print(f"  Profile ID: {vendor.id}")
        print(f"  Organization: {vendor.organization.name if vendor.organization else '❌ NO ORG'}")
        print(f"  Org ID: {vendor.organization_id if vendor.organization else 'None'}")
        
        # Check if has telegram
        tg_user = TelegramUser.objects.filter(user=vendor.user).first()
        if tg_user:
            print(f"  Telegram: Chat ID {tg_user.chat_id}")
            print(f"  Selected Profile: {tg_user.selected_profile_id if tg_user.selected_profile else 'None'}")
            
            # Get permissions
            perms = TelegramRBACService.get_user_permissions(tg_user)
            if perms:
                print(f"  ✅ Permissions: {len(perms)} resources")
            else:
                print(f"  ❌ Permissions: NONE")
                
                # Debug why
                if vendor.organization:
                    print(f"     ⚠️ HAS ORG BUT NO PERMISSIONS - THIS IS A BUG!")
                else:
                    print(f"     Reason: No organization assigned")
        else:
            print(f"  Telegram: Not linked")
        
        print()
    
    sys.exit(0)

# Check specific user
try:
    user = User.objects.get(email=email)
except User.DoesNotExist:
    print(f"\n❌ User {email} not found!")
    sys.exit(1)

print(f"\nUser: {user.email}")
print(f"Active: {user.is_active}")

# Get all profiles
profiles = UserProfile.objects.filter(user=user).select_related('organization')

print(f"\nProfiles ({profiles.count()}):")
for profile in profiles:
    primary = " ⭐" if profile.is_primary else ""
    active = " ✅" if profile.status == 'active' else f" ❌ {profile.status}"
    org = profile.organization.name if profile.organization else "NO ORG"
    
    print(f"  {profile.id}: {profile.profile_type} at {org}{primary}{active}")

# Check telegram
tg_user = TelegramUser.objects.filter(user=user).first()

if tg_user:
    print(f"\nTelegram Account:")
    print(f"  Chat ID: {tg_user.chat_id}")
    print(f"  Authenticated: {tg_user.is_authenticated}")
    print(f"  Selected Profile: {tg_user.selected_profile_id if tg_user.selected_profile else 'None'}")
    
    if tg_user.selected_profile:
        print(f"    Type: {tg_user.selected_profile.profile_type}")
        print(f"    Org: {tg_user.selected_profile.organization.name if tg_user.selected_profile.organization else 'None'}")
    
    print(f"\n  Permissions (via TelegramRBACService):")
    perms = TelegramRBACService.get_user_permissions(tg_user)
    if perms:
        for resource, actions in sorted(perms.items()):
            print(f"    • {resource}: {', '.join(actions)}")
    else:
        print(f"    ❌ NO PERMISSIONS")
else:
    print(f"\n❌ No Telegram account linked")

print("\n" + "=" * 80)

