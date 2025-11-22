import os
import sys
import django
import json

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.viewsets.telegram import handle_telegram_message
from crmApp.utils.telegram_utils import parse_telegram_update

# Simulate a /start command
test_update = {
    "update_id": 999999,
    "message": {
        "message_id": 123,
        "from": {
            "id": 8557584544,
            "first_name": "Test",
            "username": "testuser"
        },
        "chat": {
            "id": 8557584544,
            "type": "private"
        },
        "text": "Show my deals",
        "date": 1234567890
    }
}

print("Testing webhook handler with message: 'Show my deals'")
print("=" * 60)

# Parse the update
parsed = parse_telegram_update(test_update)
print(f"\nParsed update:")
print(f"  Type: {parsed.get('type')}")
print(f"  Chat ID: {parsed.get('chat_id')}")
print(f"  Text: {parsed.get('text')}")
print(f"  Is command: {parsed.get('is_command')}")

# Handle the message
print(f"\nCalling handle_telegram_message...")
try:
    handle_telegram_message(parsed)
    print("Handler completed successfully")
except Exception as e:
    print(f"ERROR in handler: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Check your Telegram for the bot's response!")

