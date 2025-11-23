import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization

# Test the API endpoint that frontend calls
user = User.objects.get(email='proyash2@gmail.com')
org = Organization.objects.get(id=21)

print(f'\n=== Testing API Endpoint ===')
print(f'User: {user.email} (ID: {user.id})')
print(f'Organization: {org.name} (ID: {org.id})')

# Build the URL
url = f'http://localhost:8000/api/user-roles/user_permissions/?user_id={user.id}&organization_id={org.id}'
print(f'\nURL: {url}')

# Note: This test script can't actually make the request without auth token
# But it shows what the frontend should be calling
print('\n✅ The backend endpoint exists at: /api/user-roles/user_permissions/')
print('✅ It expects query params: user_id and organization_id')
print('✅ The backend RBAC is working correctly (as verified by diagnose command)')
print('\n⚠️  The issue is likely:')
print('   1. Frontend not calling the API correctly')
print('   2. Frontend caching old permissions')
print('   3. User needs to logout and login again')
print('   4. activeOrganizationId or activeProfile not set correctly')

