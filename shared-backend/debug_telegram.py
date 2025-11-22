import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.services.telegram_service import TelegramService
from crmApp.models import TelegramUser

print("=" * 60)
print("Telegram Bot Debug")
print("=" * 60)

# Test TelegramService initialization
print("\n1. Testing TelegramService initialization...")
try:
    telegram_service = TelegramService()
    print(f"   Bot token configured: {'Yes' if telegram_service.bot_token else 'No'}")
    print(f"   Bot API URL: {telegram_service.bot_api_url[:50] if telegram_service.bot_api_url else 'None'}...")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

# Test getting bot info
print("\n2. Testing bot API connection...")
try:
    bot_info = telegram_service.get_me()
    if bot_info:
        print(f"   Bot username: @{bot_info.get('username')}")
        print(f"   Bot name: {bot_info.get('first_name')}")
        print(f"   Bot ID: {bot_info.get('id')}")
    else:
        print("   ERROR: Could not get bot info")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

# Test sending a message
print("\n3. Testing send message...")
test_chat_id = 123456789  # This will fail but we can see the error
try:
    result = telegram_service.send_message(test_chat_id, "Test message")
    print(f"   Result: {result}")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

# Check TelegramUser model
print("\n4. Checking TelegramUser model...")
try:
    count = TelegramUser.objects.count()
    print(f"   Total Telegram users: {count}")
    
    if count > 0:
        recent = TelegramUser.objects.order_by('-created_at').first()
        print(f"   Most recent user:")
        print(f"     Chat ID: {recent.chat_id}")
        print(f"     Username: @{recent.telegram_username or 'N/A'}")
        print(f"     Authenticated: {recent.is_authenticated}")
        print(f"     State: {recent.conversation_state}")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Debug complete")
print("=" * 60)

