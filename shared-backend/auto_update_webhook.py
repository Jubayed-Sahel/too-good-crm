import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print("=" * 60)
print("Auto-Update Telegram Webhook")
print("=" * 60)
print()

# Try to get ngrok URL from ngrok API
print("Checking for running ngrok tunnel...")
try:
    ngrok_api = requests.get('http://127.0.0.1:4040/api/tunnels', timeout=2)
    tunnels = ngrok_api.json().get('tunnels', [])
    
    # Find HTTPS tunnel
    https_tunnel = None
    for tunnel in tunnels:
        if tunnel.get('proto') == 'https':
            https_tunnel = tunnel.get('public_url')
            break
    
    if https_tunnel:
        print(f"Found ngrok tunnel: {https_tunnel}")
        new_url = https_tunnel.rstrip('/') + '/api/telegram/webhook/'
    else:
        print("ERROR: No HTTPS ngrok tunnel found")
        print("\nPlease make sure ngrok is running:")
        print("  ngrok http 8000")
        sys.exit(1)
        
except requests.exceptions.RequestException:
    print("ERROR: Could not connect to ngrok API")
    print("\nPlease make sure ngrok is running:")
    print("  ngrok http 8000")
    print("\nOr manually enter your ngrok URL:")
    print("  python update_webhook.py")
    sys.exit(1)

# Get current webhook
print("\nCurrent webhook status:")
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
if response.json().get('ok'):
    current = response.json().get('result', {})
    current_url = current.get('url', 'Not set')
    print(f"  URL: {current_url}")
    if current.get('last_error_message'):
        print(f"  Last error: {current.get('last_error_message')}")
    
    if current_url == new_url:
        print("\nWebhook is already set to the correct URL!")
        print("No update needed.")
        sys.exit(0)

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
        
        # Get bot info
        bot_response = requests.get(f'https://api.telegram.org/bot{token}/getMe')
        bot_info = bot_response.json()
        if bot_info.get('ok'):
            bot = bot_info.get('result', {})
            print(f"\nBot: @{bot.get('username')}")
            print(f"\nYou can now test your bot in Telegram!")
            print(f"Search for @{bot.get('username')} and send /start")
else:
    print(f"ERROR: {result.get('description')}")
    sys.exit(1)

