import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from crmApp.services.telegram_service import TelegramService

# Get telegram user
tu = TelegramUser.objects.first()

print(f"TelegramUser status:")
print(f"  Chat ID: {tu.chat_id}")
print(f"  Authenticated: {tu.is_authenticated}")
print(f"  Linked to: {tu.user.email if tu.user else 'None'}")

if tu.is_authenticated and tu.user:
    message = (
        f"[SUCCESS] Authentication complete!\n\n"
        f"Welcome, {tu.user.full_name}!\n\n"
        f"You can now use all CRM features via Telegram.\n\n"
        f"Try asking:\n"
        f"- \"Show my deals\"\n"
        f"- \"List my customers\"\n"
        f"- \"Create a new lead\"\n"
        f"- \"Show statistics\"\n\n"
        f"Type /help to see all available commands."
    )
    
    ts = TelegramService()
    result = ts.send_message(tu.chat_id, message)
    print(f"\nWelcome message sent: {result}")
    print("\nYou can now test the bot with natural language queries!")
else:
    print("\n[ERROR] User is not authenticated")

