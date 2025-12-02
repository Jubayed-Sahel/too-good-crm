"""
Test the complete web request flow to see where audit logging breaks
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.test import RequestFactory, Client
from django.contrib.auth import get_user_model
from crmApp.models import Customer, AuditLog, UserProfile
from crmApp.middleware import OrganizationContextMiddleware

User = get_user_model()

print("=" * 80)
print("TESTING WEB REQUEST FLOW")
print("=" * 80)

# Get a vendor user
profile = UserProfile.objects.filter(
    profile_type='vendor',
    organization__isnull=False,
    status='active'
).select_related('user', 'organization').first()

if not profile:
    print("❌ No vendor profile found")
    exit(1)

user = profile.user
org = profile.organization

print(f"\nTest user: {user.email}")
print(f"Organization: {org.name}")
print(f"Profile type: {profile.profile_type}")

# Create a Django test client
client = Client()

# Login
login_success = client.login(username=user.username, password='rootroot')
if not login_success:
    print(f"\n⚠️  Could not login with credentials. Trying to set session manually...")
    from django.contrib.sessions.middleware import SessionMiddleware
    from django.contrib.auth.middleware import AuthenticationMiddleware
    
print(f"Login: {'✅' if login_success else '❌'}")

# Count audit logs before
before_count = AuditLog.objects.count()
print(f"\nAudit logs before: {before_count}")

# Try to create a customer via API
import json
import time
timestamp = int(time.time())

customer_data = {
    "name": f"Web Request Test {timestamp}",
    "email": f"webrequest{timestamp}@test.com",
    "phone": "123-456-7890",
    "status": "active",
    "organization": org.id
}

print(f"\nSending POST request to /api/customers/...")
print(f"Data: {customer_data}")

# Need to get a token first
from rest_framework.authtoken.models import Token
token, created = Token.objects.get_or_create(user=user)
print(f"Token: {token.key[:20]}...")

response = client.post(
    '/api/customers/',
    data=json.dumps(customer_data),
    content_type='application/json',
    HTTP_AUTHORIZATION=f'Token {token.key}'
)

print(f"\nResponse status: {response.status_code}")
if response.status_code == 201:
    response_data = response.json()
    print(f"✅ Customer created: {response_data.get('name')} (ID: {response_data.get('id')})")
    customer_id = response_data.get('id')
    
    # Check audit logs after
    after_count = AuditLog.objects.count()
    print(f"\nAudit logs after: {after_count}")
    print(f"New logs: {after_count - before_count}")
    
    if after_count > before_count:
        print("✅ AUDIT LOG WAS CREATED!")
        latest_log = AuditLog.objects.latest('created_at')
        print(f"   Log: {latest_log.user_email} {latest_log.action} {latest_log.resource_type} #{latest_log.resource_id}")
    else:
        print("❌ NO AUDIT LOG CREATED!")
        print("\n   Possible reasons:")
        print("   1. Middleware not setting current_user")
        print("   2. Signal not firing during web request")
        print("   3. Error being caught silently")
        
        # Check if customer exists
        if customer_id:
            customer = Customer.objects.filter(id=customer_id).first()
            if customer:
                print(f"\n   Customer exists in DB:")
                print(f"     ID: {customer.id}")
                print(f"     Name: {customer.name}")
                print(f"     Organization: {customer.organization}")
else:
    print(f"❌ Customer creation failed")
    print(f"Response: {response.content.decode()}")

print("\n" + "=" * 80)

