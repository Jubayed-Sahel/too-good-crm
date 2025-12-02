"""
Enhanced Telegram bot poller with detailed debugging
Use this to diagnose issues with the polling script
"""
import os
import sys
import requests
import time
from datetime import datetime
from dotenv import load_dotenv

# Force UTF-8 output on Windows
if sys.platform == 'win32':
    import codecs
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')

def log(message):
    """Print with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f'[{timestamp}] {message}', flush=True)

def main():
    log('='*60)
    log('🚀 TELEGRAM BOT POLLER - DEBUG MODE')
    log('='*60)
    
    # Load environment variables
    log('📂 Loading .env file...')
    env_loaded = load_dotenv()
    log(f'   .env loaded: {env_loaded}')
    
    # Get configuration
    BOT_TOKEN = os.getenv('TG_BOT_TOKEN')
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')
    WEBHOOK_ENDPOINT = f'{BACKEND_URL}/api/telegram/webhook/'
    
    log('⚙️  Configuration:')
    if BOT_TOKEN:
        log(f'   Bot Token: {BOT_TOKEN[:20]}...{BOT_TOKEN[-10:]}')
    else:
        log('   ❌ Bot Token: NOT FOUND!')
        log('   Please set TG_BOT_TOKEN in your .env file')
        return
    
    log(f'   Backend URL: {WEBHOOK_ENDPOINT}')
    log('')
    
    # Test bot token
    log('🔍 Testing bot token...')
    try:
        bot_info_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getMe'
        response = requests.get(bot_info_url, timeout=10)
        result = response.json()
        
        if result.get('ok'):
            bot = result.get('result', {})
            log(f'   ✅ Bot found: @{bot.get("username")}')
            log(f'   Name: {bot.get("first_name")}')
            log(f'   ID: {bot.get("id")}')
        else:
            log(f'   ❌ Bot token invalid!')
            log(f'   Error: {result.get("description")}')
            return
    except Exception as e:
        log(f'   ❌ Cannot connect to Telegram API: {e}')
        return
    
    log('')
    
    # Check webhook status
    log('🔍 Checking webhook status...')
    try:
        webhook_info_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo'
        response = requests.get(webhook_info_url, timeout=10)
        result = response.json()
        
        if result.get('ok'):
            webhook = result.get('result', {})
            webhook_url = webhook.get('url', '')
            pending = webhook.get('pending_update_count', 0)
            
            if webhook_url:
                log(f'   ⚠️  Webhook is SET: {webhook_url}')
                log(f'   You need to DELETE webhook to use polling!')
                log('')
                log('   Run this command to delete webhook:')
                log(f'   Invoke-RestMethod -Uri "https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook" -Method POST')
                return
            else:
                log(f'   ✅ Webhook not set (polling mode enabled)')
                if pending > 0:
                    log(f'   📨 {pending} pending update(s)')
                else:
                    log(f'   📭 No pending updates')
    except Exception as e:
        log(f'   ⚠️  Cannot check webhook: {e}')
    
    log('')
    
    # Test backend connection
    log('🔍 Testing backend connection...')
    try:
        test_url = f'{BACKEND_URL}/api/telegram/bot/info/'
        response = requests.get(test_url, timeout=5)
        
        if response.status_code == 200:
            log(f'   ✅ Backend is running!')
        else:
            log(f'   ⚠️  Backend returned: {response.status_code}')
    except requests.exceptions.ConnectionError:
        log(f'   ❌ Cannot connect to backend!')
        log(f'   Is Django running on {BACKEND_URL}?')
        log('')
        log('   Start Django with:')
        log('   cd shared-backend')
        log('   python manage.py runserver')
        return
    except Exception as e:
        log(f'   ⚠️  Backend error: {e}')
    
    log('')
    log('='*60)
    log('🎯 Starting to poll for messages...')
    log('='*60)
    log('Press Ctrl+C to stop')
    log('')
    
    offset = None
    message_count = 0
    
    try:
        while True:
            # Get updates from Telegram
            try:
                updates_url = f'https://api.telegram.org/bot{BOT_TOKEN}/getUpdates'
                params = {'timeout': 30, 'offset': offset}
                
                response = requests.get(updates_url, params=params, timeout=35)
                result = response.json()
                
                if not result.get('ok'):
                    log(f'❌ Telegram API error: {result.get("description")}')
                    time.sleep(5)
                    continue
                
                updates = result.get('result', [])
                
                if updates:
                    for update in updates:
                        update_id = update.get('update_id')
                        message_count += 1
                        
                        log(f'📨 [{message_count}] New update: #{update_id}')
                        
                        # Extract message info
                        if 'message' in update:
                            msg = update['message']
                            from_user = msg.get('from', {})
                            text = msg.get('text', '[no text]')
                            
                            log(f'   From: {from_user.get("first_name")} (@{from_user.get("username")})')
                            log(f'   Text: {text[:50]}')
                        
                        # Forward to backend
                        try:
                            backend_response = requests.post(
                                WEBHOOK_ENDPOINT,
                                json=update,
                                timeout=10
                            )
                            
                            if backend_response.status_code == 200:
                                log(f'   ✅ Forwarded to backend')
                            else:
                                log(f'   ⚠️  Backend returned: {backend_response.status_code}')
                                log(f'   Response: {backend_response.text[:200]}')
                        
                        except Exception as e:
                            log(f'   ❌ Forward failed: {e}')
                        
                        # Update offset
                        offset = update_id + 1
                        log('')
                
                else:
                    # No new messages
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                raise
            except Exception as e:
                log(f'❌ Error in polling loop: {e}')
                time.sleep(5)
    
    except KeyboardInterrupt:
        log('')
        log('='*60)
        log('🛑 Stopped by user')
        log(f'📊 Total messages processed: {message_count}')
        log('='*60)

if __name__ == '__main__':
    main()

