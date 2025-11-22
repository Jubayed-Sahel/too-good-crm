import os
import sys
import django
import json

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser
from dotenv import load_dotenv
import requests

load_dotenv()

print("=" * 60)
print("Checking Telegram Bot Status")
print("=" * 60)

# Get telegram user
tu = TelegramUser.objects.first()
if tu:
    print(f"\nTelegramUser Status:")
    print(f"  Chat ID: {tu.chat_id}")
    print(f"  Username: @{tu.telegram_username or 'N/A'}")
    print(f"  State: {tu.conversation_state}")
    print(f"  Pending email: {tu.pending_email or 'None'}")
    print(f"  Authenticated: {tu.is_authenticated}")
    print(f"  Last message: {tu.last_message_at}")
    print(f"  Last command: {tu.last_command_used or 'None'}")

# Check webhook for pending updates
token = os.getenv('TG_BOT_TOKEN')
print(f"\nChecking Telegram webhook...")
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
webhook_info = response.json().get('result', {})

print(f"  Webhook URL: {webhook_info.get('url')}")
print(f"  Pending updates: {webhook_info.get('pending_update_count', 0)}")

if webhook_info.get('last_error_message'):
    print(f"  Last error: {webhook_info.get('last_error_message')}")
    print(f"  Last error date: {webhook_info.get('last_error_date')}")

# Get recent updates
print(f"\nTrying to get updates manually...")
try:
    updates_response = requests.get(f'https://api.telegram.org/bot{token}/getUpdates')
    updates = updates_response.json()
    
    if updates.get('ok'):
        result = updates.get('result', [])
        print(f"  Total updates: {len(result)}")
        
        if result:
            print(f"\n  Recent updates:")
            for update in result[-3:]:  # Last 3 updates
                update_id = update.get('update_id')
                message = update.get('message', {})
                text = message.get('text', 'N/A')
                from_user = message.get('from', {})
                username = from_user.get('username', 'N/A')
                print(f"    Update {update_id}: @{username} - {text[:50]}")
    else:
        print(f"  Error: {updates.get('description')}")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 60)

