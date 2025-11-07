import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.test import RequestFactory
from rest_framework.test import force_authenticate
from crmApp.viewsets.auth import LoginViewSet
from crmApp.models import User

# Create a request factory
factory = RequestFactory()

# Test login
username = 'me'
password = 'me'

print(f"🧪 Testing login API for user: {username}")
print("=" * 60)

# Get the user
try:
    user = User.objects.get(username=username)
    print(f"✅ User found: {user.email}")
    print(f"   - Active: {user.is_active}")
    print(f"   - Verified: {user.is_verified}")
    print(f"   - Profiles: {user.user_profiles.count()}")
    
    # Show profiles
    for profile in user.user_profiles.all():
        print(f"      • {profile.profile_type} @ {profile.organization.name} (Primary: {profile.is_primary}, Status: {profile.status})")
    
    print("\n" + "=" * 60)
    
    # Create a POST request
    request = factory.post(
        '/api/auth/login/',
        data=json.dumps({
            'username': username,
            'password': password
        }),
        content_type='application/json'
    )
    
    # Create viewset and call create (which is the POST method)
    viewset = LoginViewSet()
    viewset.format_kwarg = None
    
    # Call the create method (login)
    response = viewset.create(request)
    
    print(f"\n📦 API Response:")
    print(f"   Status Code: {response.status_code}")
    print(f"\n   Response Data:")
    print(json.dumps(response.data, indent=2, default=str))
    
    if response.status_code == 200:
        print("\n✅ Login API working correctly!")
        print(f"\n🔑 Token: {response.data.get('token', 'N/A')}")
        print(f"👤 User ID: {response.data.get('user', {}).get('id', 'N/A')}")
        print(f"📧 Email: {response.data.get('user', {}).get('email', 'N/A')}")
        
        # Check profiles in response
        profiles = response.data.get('user', {}).get('profiles', [])
        print(f"\n📋 Profiles in response: {len(profiles)}")
        for profile in profiles:
            print(f"   • {profile.get('profile_type')} (Primary: {profile.get('is_primary')}, Status: {profile.get('status')})")
    else:
        print("\n❌ Login failed!")
        
except User.DoesNotExist:
    print(f"❌ User not found: {username}")
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
