#!/usr/bin/env python
"""Test login functionality"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import authenticate
from crmApp.models import User

print("=== Testing Login ===\n")

# List all users
users = User.objects.all()
print(f"Total users in database: {users.count()}\n")

if users.exists():
    print("Users:")
    for user in users[:5]:
        print(f"  - Username: {user.username}")
        print(f"    Email: {user.email}")
        print(f"    Is active: {user.is_active}")
        print(f"    Has usable password: {user.has_usable_password()}")
        print()
    
    # Test authentication with first user
    test_user = users.first()
    print(f"\nTesting authentication with user: {test_user.username}")
    print(f"Email: {test_user.email}\n")
    
    # Try authenticating with email (USERNAME_FIELD)
    print("1. Authenticating with email and password 'password123':")
    auth_user = authenticate(email=test_user.email, password='password123')
    print(f"   Result: {'SUCCESS' if auth_user else 'FAILED'}")
    
    if not auth_user:
        print("   Trying 'admin123':")
        auth_user = authenticate(email=test_user.email, password='admin123')
        print(f"   Result: {'SUCCESS' if auth_user else 'FAILED'}")
    
    # Check what credentials work
    if not auth_user:
        print("\n   Note: Password might be different. Common passwords:")
        print("   - admin123")
        print("   - password123")
        print("   - test1234")
else:
    print("No users found in database!")
    print("\nCreating test user...")
    user = User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='password123'
    )
    print(f"Created user: {user.username} ({user.email})")
    print("Password: password123")
