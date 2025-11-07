import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from django.contrib.auth import authenticate

# Test user password
username = 'me'
password = 'me'

try:
    user = User.objects.get(username=username)
    print(f"✅ User found: {user.username} ({user.email})")
    print(f"   - Is active: {user.is_active}")
    print(f"   - Is verified: {user.is_verified}")
    print(f"   - Has usable password: {user.has_usable_password()}")
    print(f"   - Password field: {user.password[:50]}...")
    
    # Test password check
    password_correct = user.check_password(password)
    print(f"\n🔑 Password check for '{password}': {password_correct}")
    
    # Test authentication with email
    auth_user = authenticate(email=user.email, password=password)
    print(f"\n🔐 Authentication with email: {auth_user is not None}")
    
    # If password is wrong, reset it
    if not password_correct:
        print(f"\n⚠️  Password is incorrect. Setting password to '{password}'...")
        user.set_password(password)
        user.save()
        print(f"✅ Password reset successful")
        
        # Test again
        password_correct = user.check_password(password)
        print(f"🔑 Password check after reset: {password_correct}")
        
        auth_user = authenticate(email=user.email, password=password)
        print(f"🔐 Authentication after reset: {auth_user is not None}")
    
except User.DoesNotExist:
    print(f"❌ User '{username}' not found")
