import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

print('Clearing pending updates...')
response = requests.get(f'https://api.telegram.org/bot{token}/getUpdates', params={'offset': -1})
result = response.json()

if result.get('ok'):
    updates = result.get('result', [])
    if updates:
        # Mark as processed by getting updates with offset
        last_update_id = updates[-1]['update_id']
        requests.get(f'https://api.telegram.org/bot{token}/getUpdates', params={'offset': last_update_id + 1})
        print(f'✅ Cleared {len(updates)} pending update(s)')
    else:
        print('✅ No pending updates')
else:
    print(f'❌ Error: {result}')

# Verify
response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
info = response.json()['result']
print(f'\nPending updates now: {info.get("pending_update_count", 0)}')
