import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser, User
from crmApp.services.telegram_service import TelegramService
from crmApp.services.telegram_auth_service import TelegramAuthService

print("=" * 60)
print("Testing Authentication Flow")
print("=" * 60)

# Get telegram user
tu = TelegramUser.objects.first()
print(f"\nTelegramUser:")
print(f"  Chat ID: {tu.chat_id}")
print(f"  Pending email: {tu.pending_email}")
print(f"  State: {tu.conversation_state}")

# Check if user exists
email = tu.pending_email
if email:
    print(f"\nLooking for user with email: {email}")
    user = TelegramAuthService.find_user_by_email(email)
    
    if user:
        print(f"  [OK] User found!")
        print(f"     Email: {user.email}")
        print(f"     Name: {user.full_name}")
        print(f"     Active: {user.is_active}")
        
        # Try to start auth flow
        print(f"\nStarting auth flow...")
        success, message = TelegramAuthService.start_auth_flow(tu, email)
        print(f"  Success: {success}")
        print(f"  Message: {message[:200]}...")
        
        # Send the message
        print(f"\nSending message to Telegram...")
        ts = TelegramService()
        result = ts.send_message(tu.chat_id, message)
        print(f"  Message sent: {result}")
        
        # Check updated state
        tu.refresh_from_db()
        print(f"\nUpdated state:")
        print(f"  State: {tu.conversation_state}")
        print(f"  Auth code: {tu.auth_code}")
        print(f"  Expires: {tu.auth_code_expires_at}")
    else:
        print(f"  [ERROR] User NOT found!")
        print(f"\nAvailable users:")
        for u in User.objects.filter(is_active=True)[:5]:
            print(f"    - {u.email} ({u.full_name})")
else:
    print("\n[ERROR] No pending email found")

print("\n" + "=" * 60)

