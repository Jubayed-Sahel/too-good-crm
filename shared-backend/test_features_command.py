import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.viewsets.telegram import handle_telegram_message
from crmApp.utils.telegram_utils import parse_telegram_update

# Test /features command
print("Testing /features command...")
update = {
    "update_id": 999,
    "message": {
        "message_id": 999,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "/features",
        "date": 1234567890
    }
}

parsed = parse_telegram_update(update)
handle_telegram_message(parsed)
print("Features message sent! Check your Telegram.")

# Test /actions command
print("\nTesting /actions command...")
update2 = {
    "update_id": 1000,
    "message": {
        "message_id": 1000,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "/actions",
        "date": 1234567891
    }
}

parsed2 = parse_telegram_update(update2)
handle_telegram_message(parsed2)
print("Actions message sent! Check your Telegram.")

