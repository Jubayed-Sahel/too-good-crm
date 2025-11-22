import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print("=" * 60)
print("Update Telegram Webhook")
print("=" * 60)
print()

# Get current webhook
print("Current webhook status:")
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
if response.json().get('ok'):
    current = response.json().get('result', {})
    print(f"  URL: {current.get('url', 'Not set')}")
    if current.get('last_error_message'):
        print(f"  Last error: {current.get('last_error_message')}")
print()

# Ask for new URL
print("Enter your NEW ngrok URL (from 'ngrok http 8000' output)")
print("Example: https://abc-xyz-123.ngrok-free.app")
print()
new_url = input("New ngrok URL: ").strip()

if not new_url:
    print("ERROR: No URL provided")
    sys.exit(1)

# Ensure it has https
if not new_url.startswith('http'):
    new_url = 'https://' + new_url

# Add webhook path
if not new_url.endswith('/api/telegram/webhook/'):
    new_url = new_url.rstrip('/') + '/api/telegram/webhook/'

print()
print(f"Setting webhook to: {new_url}")

# Set webhook
response = requests.post(
    f'https://api.telegram.org/bot{token}/setWebhook',
    json={'url': new_url}
)

result = response.json()
if result.get('ok'):
    print("SUCCESS! Webhook updated!")
    
    # Verify
    print("\nVerifying...")
    info_response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
    info = info_response.json()
    
    if info.get('ok'):
        webhook_info = info.get('result', {})
        print(f"Webhook URL: {webhook_info.get('url')}")
        print(f"Pending updates: {webhook_info.get('pending_update_count', 0)}")
        print("\nYou can now test your bot in Telegram!")
        print("Send /start to @LeadGrid_bot")
else:
    print(f"ERROR: {result.get('description')}")

