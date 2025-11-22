import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from crmApp.services.telegram_service import TelegramService
from crmApp.services.telegram_auth_service import TelegramAuthService
from crmApp.viewsets.telegram import handle_unauthenticated_message

# Reset the user to waiting_for_password state
tu = TelegramUser.objects.first()
print(f"Current state: {tu.conversation_state}")
print(f"Authenticated: {tu.is_authenticated}")

# Set to waiting for password
tu.conversation_state = 'waiting_for_password'
tu.pending_email = 'sahel@gmail.com'
tu.is_authenticated = False
tu.save()

print(f"\nReset to waiting_for_password state")
print(f"Pending email: {tu.pending_email}")

# Test with a dummy password first
print(f"\nTesting with wrong password...")
ts = TelegramService()
try:
    handle_unauthenticated_message(tu, "wrongpassword", ts, None)
    print("Handler completed - check Telegram for response")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

# Now test with correct password
print(f"\nEnter your actual CRM password to test:")
password = input("Password: ")

tu.refresh_from_db()
print(f"\nTesting with provided password...")
try:
    handle_unauthenticated_message(tu, password, ts, None)
    print("Handler completed - check Telegram for response")
    
    tu.refresh_from_db()
    print(f"\nFinal state:")
    print(f"  Authenticated: {tu.is_authenticated}")
    print(f"  State: {tu.conversation_state}")
    if tu.user:
        print(f"  Linked to: {tu.user.email}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

