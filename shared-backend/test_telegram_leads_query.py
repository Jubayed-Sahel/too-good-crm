import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.viewsets.telegram import handle_telegram_message
from crmApp.utils.telegram_utils import parse_telegram_update

print("Testing 'Show my leads' query via Telegram bot...")
print("=" * 60)

# Simulate message
update = {
    "update_id": 999,
    "message": {
        "message_id": 999,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "Show my leads",
        "date": 1234567890
    }
}

parsed = parse_telegram_update(update)
handle_telegram_message(parsed)

print("\nMessage sent! Check your Telegram for the response.")
print("=" * 60)

