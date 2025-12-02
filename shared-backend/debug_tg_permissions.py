import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser, UserProfile
from crmApp.services.telegram_rbac_service import TelegramRBACService

print("=" * 80)
print("TELEGRAM BOT PERMISSIONS DEBUG")
print("=" * 80)

# Get all authenticated telegram users
telegram_users = TelegramUser.objects.filter(is_authenticated=True).select_related('user', 'selected_profile')

if not telegram_users.exists():
    print("\n❌ No authenticated Telegram users found!")
else:
    for tg_user in telegram_users:
        print(f"\n{'=' * 80}")
        print(f"Telegram User: {tg_user.chat_id}")
        print(f"User Email: {tg_user.user.email if tg_user.user else 'None'}")
        print(f"Authenticated: {tg_user.is_authenticated}")
        
        # Check selected profile
        print(f"\n--- SELECTED PROFILE ---")
        if tg_user.selected_profile:
            profile = tg_user.selected_profile
            print(f"Profile ID: {profile.id}")
            print(f"Profile Type: {profile.profile_type}")
            print(f"Profile Status: {profile.status}")
            print(f"Organization: {profile.organization.name if profile.organization else 'None'}")
            print(f"Organization ID: {profile.organization_id if profile.organization else 'None'}")
            print(f"Is Primary: {profile.is_primary}")
        else:
            print("❌ No selected profile!")
            # Check if there are available profiles
            if tg_user.user:
                profiles = UserProfile.objects.filter(user=tg_user.user, status='active')
                print(f"\nAvailable profiles: {profiles.count()}")
                for p in profiles:
                    print(f"  - ID {p.id}: {p.profile_type} at {p.organization.name if p.organization else 'No org'}")
        
        # Get permissions using the service
        print(f"\n--- PERMISSIONS (via TelegramRBACService) ---")
        try:
            permissions = TelegramRBACService.get_user_permissions(tg_user)
            
            if permissions:
                print(f"✅ Total resources with permissions: {len(permissions)}")
                for resource, actions in sorted(permissions.items()):
                    print(f"  • {resource}: {', '.join(actions)}")
            else:
                print("❌ NO PERMISSIONS FOUND!")
                
                # Debug why
                if not tg_user.is_authenticated or not tg_user.user:
                    print("  Reason: Not authenticated or no user linked")
                else:
                    profile = tg_user.selected_profile
                    if not profile:
                        profiles = UserProfile.objects.filter(user=tg_user.user, status='active')
                        if profiles.exists():
                            profile = profiles.first()
                            print(f"  Using first available profile: {profile.id}")
                    
                    if profile:
                        print(f"\n  Profile Details:")
                        print(f"    Type: {profile.profile_type}")
                        print(f"    Has Org: {profile.organization is not None}")
                        print(f"    Org ID: {profile.organization_id}")
                        print(f"    Status: {profile.status}")
                        
                        # Check the condition
                        if profile.profile_type == 'vendor' and profile.organization:
                            print(f"\n  ⚠️  SHOULD HAVE VENDOR PERMISSIONS BUT DOESN'T!")
                            print(f"     Condition met: profile_type=='vendor' and organization exists")
                        elif profile.profile_type == 'vendor' and not profile.organization:
                            print(f"\n  ❌ VENDOR WITHOUT ORGANIZATION")
                            print(f"     This vendor needs an organization assigned!")
                        elif profile.profile_type == 'employee' and profile.organization:
                            user_roles = profile.user.user_roles.filter(organization=profile.organization)
                            print(f"\n  Employee with {user_roles.count()} role(s)")
                            for ur in user_roles:
                                perms = ur.role.permissions.count()
                                print(f"    - {ur.role.name}: {perms} permissions")
                        elif profile.profile_type == 'customer':
                            print(f"\n  Customer profile - should have limited permissions")
                    else:
                        print(f"  Reason: No active profile found")
        
        except Exception as e:
            print(f"❌ ERROR getting permissions: {e}")
            import traceback
            traceback.print_exc()

print("\n" + "=" * 80)

