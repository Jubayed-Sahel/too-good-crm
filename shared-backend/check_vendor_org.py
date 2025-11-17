"""
Check vendor organization relationships
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserProfile, UserOrganization

def check_vendor_orgs():
    """Check how vendor profiles get their organization"""
    users = User.objects.filter(user_profiles__profile_type='vendor', user_profiles__status='active').distinct()
    
    for user in users:
        print(f"\n{'='*80}")
        print(f"USER: {user.email} (ID: {user.id})")
        print(f"{'='*80}")
        
        # Get vendor profiles
        vendor_profiles = user.user_profiles.filter(profile_type='vendor', status='active')
        print(f"\nVendor Profiles ({vendor_profiles.count()}):")
        for profile in vendor_profiles:
            org_name = profile.organization.name if profile.organization else "None"
            org_id = profile.organization.id if profile.organization else "N/A"
            print(f"  Profile ID: {profile.id}")
            print(f"    Organization (from profile.organization): {org_name} (ID: {org_id})")
            print(f"    Is Primary: {profile.is_primary}")
        
        # Get UserOrganizations where user is owner
        user_orgs = user.user_organizations.filter(is_owner=True, is_active=True)
        print(f"\nUserOrganizations (as owner) ({user_orgs.count()}):")
        for uo in user_orgs:
            print(f"  Organization: {uo.organization.name} (ID: {uo.organization.id})")
            print(f"    Is Owner: {uo.is_owner}")
            print(f"    Is Active: {uo.is_active}")
        
        # Check if vendor profile organization matches UserOrganization
        for profile in vendor_profiles:
            if not profile.organization:
                print(f"\n⚠️  Profile {profile.id} has NO organization set!")
                # Find if user has an organization as owner
                owner_orgs = user.user_organizations.filter(is_owner=True, is_active=True)
                if owner_orgs.exists():
                    print(f"   But user IS owner of: {[uo.organization.name for uo in owner_orgs]}")
                    print(f"   This is the bug - vendor profile should have organization set!")

if __name__ == '__main__':
    check_vendor_orgs()

