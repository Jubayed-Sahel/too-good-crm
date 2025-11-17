"""
Test vendor organization name serialization
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile
from crmApp.serializers import UserProfileSerializer

def test_vendor_orgs():
    """Test vendor organization name serialization"""
    # Test with jubayedsahel@gmail.com who owns an organization
    try:
        user = User.objects.get(email='jubayedsahel@gmail.com')
        print(f"\n{'='*80}")
        print(f"TESTING: {user.email} (owns organization)")
        print(f"{'='*80}\n")
        
        profiles = UserProfile.objects.filter(user=user, profile_type='vendor', status='active')
        for profile in profiles:
            serializer = UserProfileSerializer(profile)
            data = serializer.data
            
            print(f"Profile ID: {profile.id}")
            print(f"  Organization (direct): {profile.organization.name if profile.organization else 'None'}")
            print(f"  Organization Name (serialized): {data.get('organization_name', 'NOT FOUND')}")
            print(f"  Is Owner: {data.get('is_owner', False)}")
            print()
    except User.DoesNotExist:
        print("User jubayedsahel@gmail.com not found")
    
    # Test with dummy@gmail.com who doesn't own an organization
    try:
        user = User.objects.get(email='dummy@gmail.com')
        print(f"\n{'='*80}")
        print(f"TESTING: {user.email} (doesn't own organization)")
        print(f"{'='*80}\n")
        
        profiles = UserProfile.objects.filter(user=user, profile_type='vendor', status='active')
        for profile in profiles:
            serializer = UserProfileSerializer(profile)
            data = serializer.data
            
            print(f"Profile ID: {profile.id}")
            print(f"  Organization (direct): {profile.organization.name if profile.organization else 'None'}")
            print(f"  Organization Name (serialized): {data.get('organization_name', 'NOT FOUND')}")
            print(f"  Is Owner: {data.get('is_owner', False)}")
            print()
    except User.DoesNotExist:
        print("User dummy@gmail.com not found")

if __name__ == '__main__':
    test_vendor_orgs()

