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
email = tu.pending_email

print(f"Sending password prompt to chat {tu.chat_id}...")
print(f"Email: {email}")

# Start auth flow (this sets the state to waiting_for_password)
success, message = TelegramAuthService.start_auth_flow(tu, email)

# Send message
ts = TelegramService()
result = ts.send_message(tu.chat_id, message)

print(f"Message sent: {result}")

# Check state
tu.refresh_from_db()
print(f"New state: {tu.conversation_state}")

