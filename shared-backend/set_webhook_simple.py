import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')
webhook_url = 'https://clifton-shopworn-unprecipitantly.ngrok-free.dev/api/telegram/webhook/'

print("Setting webhook...")
print(f"URL: {webhook_url}")

response = requests.post(
    f'https://api.telegram.org/bot{token}/setWebhook',
    json={'url': webhook_url}
)

result = response.json()
if result.get('ok'):
    print("SUCCESS! Webhook set successfully!")
    
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
            print(f"Name: {bot.get('first_name')}")
            print(f"\nYou can now test your bot in Telegram!")
            print(f"Search for @{bot.get('username')} and send /start")
else:
    print(f"ERROR: {result.get('description')}")

