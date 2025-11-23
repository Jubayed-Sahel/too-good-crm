import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')
backend = 'http://localhost:8000/api/telegram/webhook/'

print("Fetching updates from Telegram...")
r = requests.get(f'https://api.telegram.org/bot{token}/getUpdates')
updates = r.json().get('result', [])

print(f"Found {len(updates)} updates to process\n")

for update in updates:
    update_id = update['update_id']
    text = update.get('message', {}).get('text', 'N/A')
    
    print(f"Processing update {update_id} (text: {text})...")
    
    try:
        response = requests.post(backend, json=update, timeout=10)
        if response.status_code == 200:
            print(f"  ✓ Sent to backend successfully")
        else:
            print(f"  ✗ Backend returned: {response.status_code}")
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  ✗ Error: {e}")
    
    # Mark as processed
    requests.get(f'https://api.telegram.org/bot{token}/getUpdates', 
                params={'offset': update_id + 1})
    print()

print("All updates processed!")
