import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import TelegramUser, User
from crmApp.services.telegram_auth_service import TelegramAuthService

# Get user
tu = TelegramUser.objects.first()
email = "sahel@gmail.com"

print("Testing authentication flow step by step...")
print("=" * 60)

# Step 1: Find user
print("\n1. Finding user by email...")
user = TelegramAuthService.find_user_by_email(email)
if user:
    print(f"   Found: {user.email} - {user.full_name}")
else:
    print(f"   NOT FOUND!")
    sys.exit(1)

# Step 2: Start auth flow
print("\n2. Starting auth flow...")
tu.conversation_state = 'waiting_for_email'
tu.is_authenticated = False
tu.save()

success, message = TelegramAuthService.start_auth_flow(tu, email)
print(f"   Success: {success}")
print(f"   Message length: {len(message)}")

tu.refresh_from_db()
print(f"   State after: {tu.conversation_state}")
print(f"   Pending email: {tu.pending_email}")
print(f"   Auth code: {tu.auth_code}")
print(f"   Expires: {tu.auth_code_expires_at}")

# Step 3: Verify password
print("\n3. Testing password verification...")
password = input("Enter password: ")

print(f"\n   Verifying password...")
print(f"   User email: {tu.pending_email}")
print(f"   Auth code: {tu.auth_code}")
print(f"   State: {tu.conversation_state}")

success, message, authenticated_user = TelegramAuthService.verify_password(tu, password)

print(f"\n   Result:")
print(f"   Success: {success}")
print(f"   Message: {message[:100]}...")
print(f"   User: {authenticated_user.email if authenticated_user else 'None'}")

tu.refresh_from_db()
print(f"\n   Final state:")
print(f"   Authenticated: {tu.is_authenticated}")
print(f"   State: {tu.conversation_state}")
print(f"   User: {tu.user.email if tu.user else 'None'}")

print("\n" + "=" * 60)

