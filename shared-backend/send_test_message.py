import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from crmApp.services.telegram_service import TelegramService

# Get the telegram user
tu = TelegramUser.objects.first()
if not tu:
    print("No Telegram users found")
    sys.exit(1)

print(f"Sending test message to chat_id: {tu.chat_id}")
print(f"Username: @{tu.telegram_username or 'N/A'}")
print(f"Current state: {tu.conversation_state}")

# Send message
ts = TelegramService()
result = ts.send_message(
    tu.chat_id,
    "✅ <b>Bot is working!</b>\n\nI can see you sent /start.\n\nPlease send your CRM email address to authenticate.\n\n<i>Example: john@company.com</i>"
)

print(f"Message sent: {result}")

