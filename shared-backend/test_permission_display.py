import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from crmApp.services.telegram_rbac_service import TelegramRBACService

print("=" * 80)
print("TESTING PERMISSION DISPLAY (as shown in bot)")
print("=" * 80)

# Get all authenticated telegram users
telegram_users = TelegramUser.objects.filter(is_authenticated=True).select_related('user', 'selected_profile')

for tg_user in telegram_users:
    print(f"\n{'=' * 80}")
    print(f"Telegram User: {tg_user.chat_id}")
    print(f"User Email: {tg_user.user.email if tg_user.user else 'None'}")
    
    # Test get_permission_summary - this is what the bot displays
    print(f"\n--- WHAT THE BOT SHOWS ---")
    summary = TelegramRBACService.get_permission_summary(tg_user)
    print(summary)
    
    # Also show raw permissions
    print(f"\n--- RAW PERMISSIONS (for comparison) ---")
    perms = TelegramRBACService.get_user_permissions(tg_user)
    if perms:
        print(f"Total resources: {len(perms)}")
        for resource, actions in sorted(perms.items()):
            print(f"  • {resource}: {', '.join(actions)}")
    else:
        print("❌ NO PERMISSIONS")

print("\n" + "=" * 80)

