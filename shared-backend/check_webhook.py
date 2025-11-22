import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print("Checking webhook status...\n")

# Get webhook info
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
result = response.json()

if result.get('ok'):
    webhook_info = result.get('result', {})
    print("=== WEBHOOK STATUS ===")
    print(f"URL: {webhook_info.get('url')}")
    print(f"Has custom certificate: {webhook_info.get('has_custom_certificate', False)}")
    print(f"Pending updates: {webhook_info.get('pending_update_count', 0)}")
    print(f"Max connections: {webhook_info.get('max_connections', 40)}")
    
    if webhook_info.get('last_error_date'):
        print(f"\nLAST ERROR:")
        print(f"  Date: {webhook_info.get('last_error_date')}")
        print(f"  Message: {webhook_info.get('last_error_message')}")
    else:
        print("\nNo errors reported")
    
    print("\n" + json.dumps(webhook_info, indent=2))
else:
    print(f"ERROR: {result.get('description')}")

