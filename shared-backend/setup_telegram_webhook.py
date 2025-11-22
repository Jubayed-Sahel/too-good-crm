#!/usr/bin/env python
"""
Telegram Webhook Setup Script
Automates the process of setting up Telegram webhook for the CRM bot
"""
import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_env_var(var_name, required=True):
    """Get environment variable with error handling."""
    value = os.getenv(var_name)
    if required and not value:
        print(f"❌ Error: {var_name} not found in environment variables")
        print(f"   Please set {var_name} in your .env file")
        sys.exit(1)
    return value

def get_webhook_info(bot_token):
    """Get current webhook information."""
    url = f"https://api.telegram.org/bot{bot_token}/getWebhookInfo"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting webhook info: {str(e)}")
        return None

def set_webhook(bot_token, webhook_url, secret_token=None):
    """Set Telegram webhook URL."""
    url = f"https://api.telegram.org/bot{bot_token}/setWebhook"
    data = {"url": webhook_url}
    
    if secret_token:
        data["secret_token"] = secret_token
    
    try:
        response = requests.post(url, json=data, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error setting webhook: {str(e)}")
        return None

def delete_webhook(bot_token):
    """Delete Telegram webhook."""
    url = f"https://api.telegram.org/bot{bot_token}/deleteWebhook"
    try:
        response = requests.post(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error deleting webhook: {str(e)}")
        return None

def get_bot_info(bot_token):
    """Get bot information."""
    url = f"https://api.telegram.org/bot{bot_token}/getMe"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting bot info: {str(e)}")
        return None

def main():
    print("=" * 60)
    print("🤖 Telegram Bot Webhook Setup")
    print("=" * 60)
    print()
    
    # Get configuration
    bot_token = get_env_var('TG_BOT_TOKEN')
    backend_url = get_env_var('BACKEND_URL', required=False) or 'http://localhost:8000'
    webhook_secret = get_env_var('TG_WEBHOOK_SECRET', required=False)
    
    # Construct webhook URL
    webhook_url = f"{backend_url.rstrip('/')}/api/telegram/webhook/"
    
    print("📋 Configuration:")
    print(f"   Bot Token: {bot_token[:10]}...{bot_token[-10:]}")
    print(f"   Backend URL: {backend_url}")
    print(f"   Webhook URL: {webhook_url}")
    print(f"   Secret Token: {'✓ Set' if webhook_secret else '✗ Not set'}")
    print()
    
    # Get bot info
    print("🔍 Getting bot information...")
    bot_info = get_bot_info(bot_token)
    
    if bot_info and bot_info.get('ok'):
        result = bot_info.get('result', {})
        print(f"✅ Bot found: @{result.get('username')}")
        print(f"   Name: {result.get('first_name')}")
        print(f"   ID: {result.get('id')}")
        print()
    else:
        print("❌ Failed to get bot info. Check your bot token.")
        sys.exit(1)
    
    # Get current webhook info
    print("🔍 Checking current webhook status...")
    webhook_info = get_webhook_info(bot_token)
    
    if webhook_info and webhook_info.get('ok'):
        result = webhook_info.get('result', {})
        current_url = result.get('url', '')
        
        if current_url:
            print(f"ℹ️  Current webhook: {current_url}")
            print(f"   Pending updates: {result.get('pending_update_count', 0)}")
            
            if current_url == webhook_url:
                print("✅ Webhook is already set to the correct URL")
                
                # Ask if user wants to update
                response = input("\n❓ Do you want to update the webhook anyway? (y/N): ")
                if response.lower() != 'y':
                    print("✅ No changes made")
                    return
            else:
                print(f"⚠️  Webhook is set to a different URL")
                response = input(f"\n❓ Do you want to update to {webhook_url}? (Y/n): ")
                if response.lower() == 'n':
                    print("✅ No changes made")
                    return
        else:
            print("ℹ️  No webhook currently set")
        print()
    
    # Set webhook
    print(f"🔧 Setting webhook to: {webhook_url}")
    result = set_webhook(bot_token, webhook_url, webhook_secret)
    
    if result and result.get('ok'):
        print("✅ Webhook set successfully!")
        print()
        
        # Verify
        print("🔍 Verifying webhook...")
        webhook_info = get_webhook_info(bot_token)
        
        if webhook_info and webhook_info.get('ok'):
            result = webhook_info.get('result', {})
            print(f"✅ Webhook URL: {result.get('url')}")
            print(f"   Has custom certificate: {result.get('has_custom_certificate', False)}")
            print(f"   Pending updates: {result.get('pending_update_count', 0)}")
            
            if result.get('last_error_date'):
                print(f"   ⚠️  Last error: {result.get('last_error_message')}")
            else:
                print(f"   ✅ No errors")
        print()
        
        print("=" * 60)
        print("✅ Setup Complete!")
        print("=" * 60)
        print()
        print("📱 Next steps:")
        print("   1. Open Telegram")
        print(f"   2. Search for @{bot_info.get('result', {}).get('username')}")
        print("   3. Send /start to begin")
        print()
        print("💡 Tip: Use /help to see all available commands")
        print()
    else:
        print("❌ Failed to set webhook")
        if result:
            print(f"   Error: {result.get('description', 'Unknown error')}")
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

