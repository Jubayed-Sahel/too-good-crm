"""
Test organization name in serializer
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile
from crmApp.serializers import UserProfileSerializer

def test_org_name():
    """Test organization name serialization"""
    user = User.objects.get(email='dummy@gmail.com')
    profiles = UserProfile.objects.filter(user=user, status='active')
    
    print(f"\n{'='*80}")
    print(f"TESTING ORGANIZATION NAME SERIALIZATION")
    print(f"{'='*80}\n")
    
    for profile in profiles:
        serializer = UserProfileSerializer(profile)
        data = serializer.data
        
        print(f"Profile ID: {profile.id}")
        print(f"  Type: {profile.profile_type}")
        print(f"  Organization (direct): {profile.organization.name if profile.organization else 'None'}")
        print(f"  Organization Name (serialized): {data.get('organization_name', 'NOT FOUND')}")
        print(f"  Is Owner: {data.get('is_owner', False)}")
        print()

if __name__ == '__main__':
    test_org_name()

