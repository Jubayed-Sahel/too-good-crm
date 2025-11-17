"""
Test customer organization name returns "Independent Customer"
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

def test_customer_org_name():
    """Test customer profiles return 'Independent Customer'"""
    user = User.objects.get(email='jubayedsahel@gmail.com')
    serializer = UserSerializer(user)
    data = serializer.data
    
    print(f"\n{'='*80}")
    print(f"TESTING: {user.email}")
    print(f"{'='*80}\n")
    
    for profile in data.get('profiles', []):
        profile_type = profile.get('profile_type')
        org_name = profile.get('organization_name')
        print(f"{profile_type.upper()} Profile:")
        print(f"  Organization Name: '{org_name}'")
        
        if profile_type == 'customer':
            if org_name == 'Independent Customer':
                print("  OK - Customer shows 'Independent Customer'")
            else:
                print(f"  ERROR - Expected 'Independent Customer', got '{org_name}'")
        elif profile_type == 'vendor':
            if org_name and org_name != 'Independent Customer':
                print(f"  OK - Vendor shows organization: '{org_name}'")
            else:
                print(f"  ERROR - Vendor should show organization name, got '{org_name}'")
        elif profile_type == 'employee':
            if org_name and org_name != 'Independent Customer':
                print(f"  OK - Employee shows organization: '{org_name}'")
            else:
                print(f"  WARNING - Employee organization: '{org_name}'")
        print()

if __name__ == '__main__':
    test_customer_org_name()

