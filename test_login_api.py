#!/usr/bin/env python
"""Test login API and fix user if needed"""
import requests
import json
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shared-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserProfile
from django.contrib.auth import authenticate

# Fix user
print("="*70)
print("FIXING ADMIN USER")
print("="*70)

# Get or create user
try:
    user = User.objects.get(email='admin@crm.com')
    print(f"✓ Found user: {user.email}")
except User.DoesNotExist:
    try:
        user = User.objects.get(email='admin@test.com')
        user.email = 'admin@crm.com'
        user.save()
        print(f"✓ Updated user email: {user.email}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            email='admin@crm.com',
            username=f'admin_{User.objects.count()}',
            password='admin123',
            first_name='Admin',
            last_name='User',
            is_active=True,
        )
        print(f"✓ Created user: {user.email}")

# Set password
user.set_password('admin123')
user.is_active = True
user.save()
print(f"✓ Password set to: admin123")

# Verify authentication
auth_user = authenticate(email='admin@crm.com', password='admin123')
if auth_user:
    print(f"✓ Authentication successful")
else:
    print(f"✗ Authentication failed")

# Ensure organization and profile
org, _ = Organization.objects.get_or_create(
    name='Admin Organization',
    defaults={'slug': 'admin-org'}
)
print(f"✓ Organization: {org.name}")

profile, created = UserProfile.objects.get_or_create(
    user=user,
    profile_type='vendor',
    defaults={
        'organization': org,
        'is_primary': True,
        'status': 'active'
    }
)
if not created:
    profile.organization = org
    profile.is_primary = True
    profile.status = 'active'
    profile.save()
print(f"✓ Profile: {profile.profile_type}")

print("\n" + "="*70)
print("TESTING LOGIN API")
print("="*70)

# Test login API
response = requests.post(
    'http://localhost:8000/api/auth/login/',
    json={
        'username': 'admin@crm.com',
        'password': 'admin123'
    },
    headers={'Content-Type': 'application/json'}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    data = response.json()
    print(f"\n✓ Login successful!")
    print(f"Token: {data.get('token', 'N/A')[:20]}...")
else:
    print(f"\n✗ Login failed")
    try:
        error_data = response.json()
        print(f"Error: {error_data}")
    except:
        print(f"Error: {response.text}")

print("="*70)

