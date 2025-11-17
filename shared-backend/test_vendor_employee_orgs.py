"""
Test vendor and employee organization names
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.serializers import UserSerializer

def test_vendor_employee_orgs():
    """Test vendor shows owned org, employee shows org they work for"""
    # Test with dummy@gmail.com who is an employee
    user = User.objects.get(email='dummy@gmail.com')
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
        
        if profile_type == 'vendor':
            if org_name and org_name != 'Independent Customer':
                print(f"  OK - Vendor shows their OWNED organization: '{org_name}'")
            else:
                print(f"  WARNING - Vendor should show owned organization, got '{org_name}'")
        elif profile_type == 'employee':
            if org_name and org_name != 'Independent Customer':
                print(f"  OK - Employee shows organization they WORK FOR: '{org_name}'")
            else:
                print(f"  WARNING - Employee should show organization they work for, got '{org_name}'")
        print()

if __name__ == '__main__':
    test_vendor_employee_orgs()

