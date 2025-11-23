"""
Enhanced Telegram bot poller with better logging
"""
import os
import requests
import time
import sys
from datetime import datetime
from dotenv import load_dotenv

# Fix encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'backslashreplace')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'backslashreplace')

load_dotenv()

BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
BACKEND_URL = 'http://localhost:8000/api/telegram/webhook/'

def log(message):
    """Log with timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f'[{timestamp}] {message}', flush=True)

def get_updates(offset=None):
    """Get updates from Telegram"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/getUpdates'
    params = {'timeout': 30, 'offset': offset}
    try:
        response = requests.get(url, params=params, timeout=35)
        return response.json()
    except Exception as e:
        log(f'ERROR getting updates: {e}')
        return None

def forward_to_backend(update):
    """Forward update to Django backend"""
    try:
        response = requests.post(BACKEND_URL, json=update, timeout=10)
        if response.status_code == 200:
            log(f'OK - Processed update {update["update_id"]}')
            return True
        else:
            log(f'ERROR - Backend returned {response.status_code}')
            log(f'Response: {response.text[:200]}')
            return False
    except requests.exceptions.ConnectionError:
        log(f'ERROR - Backend not responding! Is it running?')
        return False
    except Exception as e:
        log(f'ERROR - {str(e)[:100]}')
        return False

def main():
    log('=' * 60)
    log('TELEGRAM BOT POLLER - Enhanced Version')
    log('=' * 60)
    log(f'Bot Token: {BOT_TOKEN[:20]}...')
    log(f'Backend URL: {BACKEND_URL}')
    log('=' * 60)
    
    # Test backend connection first
    log('Testing backend connection...')
    try:
        r = requests.post(BACKEND_URL, json={'test': 'connection'}, timeout=5)
        if r.status_code == 200:
            log('Backend is responding!')
        else:
            log(f'WARNING - Backend returned status {r.status_code}')
    except Exception as e:
        log(f'ERROR - Cannot connect to backend: {e}')
        log('Please start the backend server first!')
        return
    
    log('Waiting for messages... (Press Ctrl+C to stop)')
    log('')
    
    offset = None
    message_count = 0
    
    try:
        while True:
            result = get_updates(offset)
            
            if not result or not result.get('ok'):
                log('ERROR - Failed to get updates, retrying...')
                time.sleep(5)
                continue
            
            updates = result.get('result', [])
            
            for update in updates:
                message_count += 1
                update_id = update["update_id"]
                
                # Extract message info safely
                msg = update.get('message', {})
                text = msg.get('text', 'N/A')
                chat_id = msg.get('chat', {}).get('id', 'N/A')
                
                log(f'NEW UPDATE #{message_count}: ID={update_id}, Chat={chat_id}, Text={text[:50]}')
                
                success = forward_to_backend(update)
                if success:
                    log(f'SUCCESS - Message processed by backend')
                else:
                    log(f'FAILED - Backend did not process message')
                
                offset = update['update_id'] + 1
                log('')  # Empty line for readability
            
            if not updates:
                # No new messages, just waiting
                time.sleep(1)
                
    except KeyboardInterrupt:
        log('')
        log('Stopping poller...')
        log(f'Total messages processed: {message_count}')
    except Exception as e:
        log(f'FATAL ERROR: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
