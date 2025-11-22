#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile

# Find a vendor user
vendor_profile = UserProfile.objects.filter(profile_type='vendor').first()
vendor_user = vendor_profile.user if vendor_profile else None

# Find a customer user
customer_profile = UserProfile.objects.filter(profile_type='customer').first()
customer_user = customer_profile.user if customer_profile else None

print('\n' + '='*60)
print('VIDEO CALLING TEST ACCOUNTS')
print('='*60)

if vendor_user:
    print('\n🏢 VENDOR USER')
    print('-' * 60)
    print(f'Username:     {vendor_user.username}')
    print(f'Password:     password123')
    print(f'Full Name:    {vendor_user.full_name}')
    print(f'Email:        {vendor_user.email}')
    print(f'User ID:      {vendor_user.id}')
    print(f'Organization: {vendor_profile.organization.name if vendor_profile.organization else "None"}')

if customer_user:
    print('\n👤 CUSTOMER USER')
    print('-' * 60)
    print(f'Username:     {customer_user.username}')
    print(f'Password:     password123')
    print(f'Full Name:    {customer_user.full_name}')
    print(f'Email:        {customer_user.email}')
    print(f'User ID:      {customer_user.id}')
    print(f'Organization: {customer_profile.organization.name if customer_profile.organization else "None"}')

print('\n' + '='*60)
print('TESTING INSTRUCTIONS')
print('='*60)
print('\n1. Open two browsers:')
print('   - Regular browser: http://localhost:5173/')
print('   - Incognito/Private: http://localhost:5173/')
print('')
print('2. Login to both accounts:')
print(f'   - Browser 1: {vendor_user.username} / password123')
print(f'   - Browser 2: {customer_user.username} / password123')
print('')
print('3. Test video calling:')
print(f'   - From vendor account ({vendor_user.username}):')
print('     → Go to "Customers" page')
print(f'     → Find "{customer_user.full_name}"')
print('     → Click the phone icon to initiate call')
print('')
print(f'   - In customer account ({customer_user.username}):')
print('     → You should see an incoming call notification')
print('     → Click "Answer" to join the video call')
print('')
print('4. Backend API:')
print('   - Django server: http://localhost:8000/')
print('   - Must be running: python manage.py runserver')
print('')
print('='*60)
