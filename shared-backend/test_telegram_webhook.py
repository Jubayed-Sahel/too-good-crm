import requests
import json

# Test local Django
print("Testing Django backend...")
try:
    response = requests.get('http://localhost:8000/api/telegram/webhook/info/')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "="*60 + "\n")

# Test ngrok
print("Testing ngrok tunnel...")
try:
    response = requests.get('https://stephine-nonconfining-pseudotribally.ngrok-free.dev/api/telegram/webhook/info/')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"ERROR: {e}")

print("\n" + "="*60 + "\n")

# Check if Telegram is sending updates
print("Checking Telegram webhook status...")
import os
from dotenv import load_dotenv
load_dotenv()

token = os.getenv('TG_BOT_TOKEN')
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
webhook_info = response.json().get('result', {})

print(f"Webhook URL: {webhook_info.get('url')}")
print(f"Pending updates: {webhook_info.get('pending_update_count', 0)}")
if webhook_info.get('last_error_message'):
    print(f"Last error: {webhook_info.get('last_error_message')}")
    print(f"Last error date: {webhook_info.get('last_error_date')}")
else:
    print("No errors")

# Check if there are pending updates
if webhook_info.get('pending_update_count', 0) > 0:
    print(f"\nWARNING: There are {webhook_info.get('pending_update_count')} pending updates!")
    print("This means Telegram tried to send messages but couldn't deliver them.")

