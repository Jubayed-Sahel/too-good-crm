import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print("Fetching recent updates...")
r = requests.get(f'https://api.telegram.org/bot{token}/getUpdates')
result = r.json()

if result.get('ok'):
    updates = result.get('result', [])
    print(f"\nTotal updates in queue: {len(updates)}\n")
    
    for update in updates[-5:]:
        print("=" * 60)
        print(f"Update ID: {update['update_id']}")
        if 'message' in update:
            msg = update['message']
            print(f"From: {msg.get('from', {}).get('first_name', 'N/A')}")
            print(f"Chat ID: {msg.get('chat', {}).get('id', 'N/A')}")
            print(f"Text: {msg.get('text', 'N/A')}")
            print(f"Date: {msg.get('date', 'N/A')}")
        else:
            print(f"Type: {list(update.keys())}")
            print(f"Content: {json.dumps(update, indent=2)[:200]}")
else:
    print(f"Error: {result}")
