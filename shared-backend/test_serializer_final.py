"""
Final test of serializer to verify organization_name is returned correctly
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

def test_serializer():
    """Test UserSerializer returns organization_name correctly"""
    # Test with jubayedsahel@gmail.com who owns an organization
    user = User.objects.get(email='jubayedsahel@gmail.com')
    serializer = UserSerializer(user)
    data = serializer.data
    
    print(f"\n{'='*80}")
    print(f"TESTING: {user.email}")
    print(f"{'='*80}\n")
    
    print("All Profiles:")
    for profile in data.get('profiles', []):
        print(f"  Profile ID: {profile.get('id')}")
        print(f"    Type: {profile.get('profile_type')}")
        print(f"    Organization Name: {profile.get('organization_name')}")
        print(f"    Organization ID: {profile.get('organization')}")
        print(f"    Is Owner: {profile.get('is_owner')}")
        print()
    
    # Check vendor profile specifically
    vendor_profiles = [p for p in data.get('profiles', []) if p.get('profile_type') == 'vendor']
    if vendor_profiles:
        vendor = vendor_profiles[0]
        print(f"Vendor Profile:")
        print(f"  Organization Name: '{vendor.get('organization_name')}'")
        if vendor.get('organization_name'):
            print(f"  ✅ Organization name is present")
        else:
            print(f"  ❌ Organization name is missing!")

if __name__ == '__main__':
    test_serializer()

