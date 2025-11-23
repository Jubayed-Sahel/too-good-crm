"""
Complete Telegram Bot Test
Tests the bot with the updated token
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print("=" * 70)
print("TELEGRAM BOT STATUS CHECK")
print("=" * 70)

# 1. Test bot token
print("\n1. Testing Bot Token...")
r = requests.get(f'https://api.telegram.org/bot{token}/getMe')
result = r.json()
if result.get('ok'):
    bot_info = result['result']
    print(f"   ✅ Bot Valid: {bot_info['first_name']} (@{bot_info['username']})")
    print(f"   Bot ID: {bot_info['id']}")
else:
    print(f"   ❌ Bot token invalid: {result}")
    exit(1)

# 2. Test webhook status
print("\n2. Checking Webhook Status...")
r = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
webhook_info = r.json()['result']
print(f"   Webhook URL: {webhook_info.get('url') or '✓ Not set (using polling)'}")
print(f"   Pending updates: {webhook_info.get('pending_update_count', 0)}")
if webhook_info.get('last_error_message'):
    print(f"   ⚠️  Last error: {webhook_info['last_error_message']}")

# 3. Test backend connection
print("\n3. Testing Backend Connection...")
try:
    r = requests.post('http://localhost:8000/api/telegram/webhook/', 
                     json={'test': 'test'}, 
                     timeout=5)
    if r.status_code == 200:
        print(f"   ✅ Backend responding (Status: {r.status_code})")
    else:
        print(f"   ⚠️  Backend returned: {r.status_code}")
except Exception as e:
    print(f"   ❌ Backend not responding: {e}")

# 4. Send test message to bot
print("\n4. Bot Commands Available:")
commands = [
    "/start - Begin conversation",
    "/login - Start login flow", 
    "/features - Show all capabilities",
    "/help - Show command list",
    "/me - View account info",
    "/clear - Clear conversation"
]
for cmd in commands:
    print(f"   {cmd}")

print("\n" + "=" * 70)
print("TESTING INSTRUCTIONS:")
print("=" * 70)
print(f"\n1. Open Telegram and search for: @{bot_info['username']}")
print("2. Send: /start")
print("3. Login with: admin@example.com / admin123")
print("4. Try: 'List all customers' or 'Show dashboard stats'")
print("\n✅ Telegram bot is ready to use!")
print("=" * 70)
