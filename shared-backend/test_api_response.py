"""
Test API response for user profiles
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer, UserProfileSerializer

def test_api_response():
    """Test what the API actually returns"""
    # Test with a vendor who owns an organization
    try:
        user = User.objects.get(email='jubayedsahel@gmail.com')
        print(f"\n{'='*80}")
        print(f"TESTING API RESPONSE FOR: {user.email}")
        print(f"{'='*80}\n")
        
        # Simulate what UserSerializer returns
        user_serializer = UserSerializer(user)
        user_data = user_serializer.data
        
        print("UserSerializer.profiles:")
        for profile in user_data.get('profiles', []):
            print(f"  Profile ID: {profile.get('id')}")
            print(f"    Type: {profile.get('profile_type')}")
            print(f"    Organization Name: {profile.get('organization_name', 'NOT FOUND')}")
            print(f"    Organization ID: {profile.get('organization')}")
            print(f"    Is Owner: {profile.get('is_owner')}")
            print()
        
        # Test direct UserProfileSerializer
        from crmApp.models import UserProfile
        vendor_profile = UserProfile.objects.filter(
            user=user,
            profile_type='vendor',
            status='active'
        ).first()
        
        if vendor_profile:
            print("Direct UserProfileSerializer:")
            profile_serializer = UserProfileSerializer(vendor_profile)
            profile_data = profile_serializer.data
            print(f"  Organization Name: {profile_data.get('organization_name', 'NOT FOUND')}")
            print(f"  Organization ID: {profile_data.get('organization')}")
            print()
            
    except User.DoesNotExist:
        print("User not found")

if __name__ == '__main__':
    test_api_response()

