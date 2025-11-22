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

# Get telegram user
tu = TelegramUser.objects.first()

print("Current state:")
print(f"  Chat ID: {tu.chat_id}")
print(f"  Email: {tu.pending_email}")
print(f"  State: {tu.conversation_state}")
print(f"  Authenticated: {tu.is_authenticated}")
print(f"  Last message: {tu.last_message_at}")

# Ask for password
password = input("\nEnter your CRM password: ")

print("\nVerifying password...")
success, message, user = TelegramAuthService.verify_password(tu, password)

print(f"Success: {success}")
print(f"User: {user.email if user else 'None'}")

# Send message
print("\nSending response to Telegram...")
ts = TelegramService()
result = ts.send_message(tu.chat_id, message)
print(f"Message sent: {result}")

# Check final state
tu.refresh_from_db()
print(f"\nFinal state:")
print(f"  Authenticated: {tu.is_authenticated}")
print(f"  State: {tu.conversation_state}")
if tu.user:
    print(f"  Linked to: {tu.user.email}")

