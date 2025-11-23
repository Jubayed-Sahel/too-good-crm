"""
Quick script to fix Telegram webhook
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

token = os.getenv('TG_BOT_TOKEN')

if not token:
    print("❌ TG_BOT_TOKEN not found in .env file")
    exit(1)

print("🤖 Telegram Bot Webhook Fixer\n")
print("=" * 50)

# Get current webhook info
print("\n📡 Current Webhook Status:")
info_response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
if info_response.status_code == 200:
    info = info_response.json().get('result', {})
    current_url = info.get('url', 'Not set')
    pending = info.get('pending_update_count', 0)
    last_error = info.get('last_error_message', 'None')
    
    print(f"URL: {current_url}")
    print(f"Pending updates: {pending}")
    print(f"Last error: {last_error}")
else:
    print("❌ Failed to get webhook info")
    exit(1)

# Options
print("\n" + "=" * 50)
print("Choose an option:")
print("1. Delete webhook (for local development)")
print("2. Update webhook URL (for ngrok/production)")
print("3. Keep current webhook")
print("4. Exit")

choice = input("\nEnter your choice (1-4): ").strip()

if choice == "1":
    # Delete webhook
    print("\n🗑️  Deleting webhook...")
    response = requests.post(f'https://api.telegram.org/bot{token}/deleteWebhook')
    result = response.json()
    
    if result.get('ok'):
        print("✅ Webhook deleted successfully!")
        print("\nBot is now in polling mode (not suitable for production)")
        print("You can test locally, but won't receive real-time updates")
    else:
        print(f"❌ Error: {result.get('description')}")

elif choice == "2":
    # Update webhook URL
    print("\n🔗 Enter new webhook URL:")
    print("Example: https://your-domain.ngrok-free.app/api/telegram/webhook/")
    new_url = input("URL: ").strip()
    
    if not new_url:
        print("❌ URL cannot be empty")
        exit(1)
    
    if not new_url.endswith('/api/telegram/webhook/'):
        print("⚠️  Adding /api/telegram/webhook/ to URL...")
        new_url = new_url.rstrip('/') + '/api/telegram/webhook/'
    
    print(f"\n📤 Setting webhook to: {new_url}")
    response = requests.post(
        f'https://api.telegram.org/bot{token}/setWebhook',
        json={'url': new_url}
    )
    result = response.json()
    
    if result.get('ok'):
        print("✅ Webhook updated successfully!")
        
        # Verify
        print("\n✓ Verifying...")
        verify_response = requests.get(f'https://api.telegram.org/bot{token}/getWebhookInfo')
        verify_info = verify_response.json().get('result', {})
        print(f"New URL: {verify_info.get('url')}")
        print(f"Pending updates: {verify_info.get('pending_update_count', 0)}")
    else:
        print(f"❌ Error: {result.get('description')}")

elif choice == "3":
    print("\n✅ Keeping current webhook configuration")

else:
    print("\n👋 Exiting...")

print("\n" + "=" * 50)
print("Done!")
print("\n💡 Tip: Make sure your backend server is running:")
print("   cd shared-backend")
print("   .\\venv\\Scripts\\Activate.ps1")
print("   python manage.py runserver")
