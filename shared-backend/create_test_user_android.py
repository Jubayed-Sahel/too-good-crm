#!/usr/bin/env python
"""
Create a test user for mobile app login testing
"""
import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User

# Create test user
username = "testuser"
email = "testuser@test.com"
password = "Test123456"

# Check if user exists
if User.objects.filter(email=email).exists():
    user = User.objects.get(email=email)
    print(f"✅ User already exists:")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Password: Test123456")
else:
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name="Test",
        last_name="User"
    )
    print(f"✅ Test user created successfully!")
    print(f"   Username: {username}")
    print(f"   Email: {email}")
    print(f"   Password: {password}")

print(f"\n📱 Use these credentials to login in the Android app")
