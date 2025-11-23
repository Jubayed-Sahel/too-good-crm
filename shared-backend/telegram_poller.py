"""
Simple Telegram bot poller for local development
This script polls for Telegram updates and forwards them to the Django backend
"""
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
BACKEND_URL = 'http://localhost:8000/api/telegram/webhook/'

def get_updates(offset=None):
    """Get updates from Telegram"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/getUpdates'
    params = {'timeout': 30, 'offset': offset}
    try:
        response = requests.get(url, params=params, timeout=35)
        return response.json()
    except Exception as e:
        print(f'Error getting updates: {e}')
        return None

def forward_to_backend(update):
    """Forward update to Django backend"""
    try:
        response = requests.post(BACKEND_URL, json=update, timeout=10)
        if response.status_code == 200:
            try:
                print(f'[OK] Processed update {update["update_id"]}')
            except UnicodeEncodeError:
                print(f'[OK] Processed update (encoding issue)')
        else:
            print(f'[ERROR] Backend returned: {response.status_code}')
            print(f'Response: {response.text[:200]}')
    except Exception as e:
        print(f'[ERROR] Failed to forward: {str(e)[:100]}')

def main():
    # Set UTF-8 encoding for console output
    import sys
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    
    print('=' * 60)
    print('TELEGRAM BOT POLLER - Local Development Mode')
    print('=' * 60)
    print(f'Bot Token: {BOT_TOKEN[:20]}...')
    print(f'Backend URL: {BACKEND_URL}')
    print('=' * 60)
    print('Waiting for messages... (Press Ctrl+C to stop)')
    print()
    
    offset = None
    
    try:
        while True:
            result = get_updates(offset)
            
            if not result or not result.get('ok'):
                print('Error getting updates, retrying...')
                time.sleep(5)
                continue
            
            updates = result.get('result', [])
            
            for update in updates:
                try:
                    print(f'\n[NEW] Update: {update["update_id"]}')
                    forward_to_backend(update)
                    offset = update['update_id'] + 1
                except UnicodeEncodeError:
                    print(f'\n[NEW] Update: {update["update_id"]} (encoding issue)')
                    forward_to_backend(update)
                    offset = update['update_id'] + 1
            
            if not updates:
                # No new messages, just waiting
                time.sleep(1)
                
    except KeyboardInterrupt:
        print('\n\nStopping poller...')
    except Exception as e:
        print(f'\nError: {e}')

if __name__ == '__main__':
    main()
