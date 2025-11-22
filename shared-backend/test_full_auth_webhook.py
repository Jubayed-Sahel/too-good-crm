import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from crmApp.viewsets.telegram import handle_telegram_message
from crmApp.utils.telegram_utils import parse_telegram_update

# Reset user to unauthenticated
tu = TelegramUser.objects.first()
tu.is_authenticated = False
tu.conversation_state = 'waiting_for_email'
tu.pending_email = None
tu.user = None
tu.save()

print("=" * 60)
print("Testing Full Authentication Flow via Webhook")
print("=" * 60)

# Step 1: Send /start
print("\n1. Sending /start command...")
update1 = {
    "update_id": 1,
    "message": {
        "message_id": 1,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "/start",
        "date": 1234567890
    }
}
parsed1 = parse_telegram_update(update1)
handle_telegram_message(parsed1)
print("   Sent - check Telegram for welcome message")

# Step 2: Send email
print("\n2. Sending email...")
update2 = {
    "update_id": 2,
    "message": {
        "message_id": 2,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "sahel@gmail.com",
        "date": 1234567891
    }
}
parsed2 = parse_telegram_update(update2)
handle_telegram_message(parsed2)
print("   Sent - check Telegram for password prompt")

# Step 3: Send password
print("\n3. Sending password...")
update3 = {
    "update_id": 3,
    "message": {
        "message_id": 3,
        "from": {"id": 8557584544, "first_name": "Test"},
        "chat": {"id": 8557584544, "type": "private"},
        "text": "admin123",
        "date": 1234567892
    }
}
parsed3 = parse_telegram_update(update3)
handle_telegram_message(parsed3)
print("   Sent - check Telegram for success message")

# Check final state
tu.refresh_from_db()
print(f"\n4. Final state:")
print(f"   Authenticated: {tu.is_authenticated}")
print(f"   State: {tu.conversation_state}")
print(f"   User: {tu.user.email if tu.user else 'None'}")

print("\n" + "=" * 60)
print("Check your Telegram - you should see 3 messages!")
print("=" * 60)

