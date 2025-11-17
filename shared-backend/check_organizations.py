"""
Script to check organization relationships
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Organization, UserOrganization, Employee, UserProfile

def check_organizations():
    """Check organization relationships for both users"""
    users_to_check = ['dummy@gmail.com', 'sahel@gmail.com']
    
    for email in users_to_check:
        try:
            user = User.objects.get(email=email)
            print(f"\n{'='*80}")
            print(f"USER: {email} (ID: {user.id})")
            print(f"{'='*80}")
            
            # Get all user organizations
            user_orgs = UserOrganization.objects.filter(user=user, is_active=True)
            print(f"\nUserOrganization records ({user_orgs.count()}):")
            for uo in user_orgs:
                print(f"  - Organization: {uo.organization.name} (ID: {uo.organization.id})")
                print(f"    Is Owner: {uo.is_owner}")
                print(f"    Is Active: {uo.is_active}")
            
            # Get employee records
            employees = Employee.objects.filter(user=user, status='active')
            print(f"\nEmployee records ({employees.count()}):")
            for emp in employees:
                print(f"  - Organization: {emp.organization.name} (ID: {emp.organization.id})")
                print(f"    Name: {emp.first_name} {emp.last_name}")
                print(f"    Status: {emp.status}")
            
            # Get user profiles
            profiles = UserProfile.objects.filter(user=user, status='active')
            print(f"\nUserProfile records ({profiles.count()}):")
            for profile in profiles:
                org_name = profile.organization.name if profile.organization else "None"
                org_id = profile.organization.id if profile.organization else "N/A"
                print(f"  - Type: {profile.profile_type}")
                print(f"    Organization: {org_name} (ID: {org_id})")
                print(f"    Is Primary: {profile.is_primary}")
                print(f"    Status: {profile.status}")
                
        except User.DoesNotExist:
            print(f"\nUser {email} not found")
        except Exception as e:
            print(f"\nError for {email}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Check for shared organizations
    print(f"\n{'='*80}")
    print(f"ORGANIZATION OVERLAP CHECK")
    print(f"{'='*80}")
    
    try:
        user1 = User.objects.get(email='dummy@gmail.com')
        user2 = User.objects.get(email='sahel@gmail.com')
        
        orgs1 = set(UserOrganization.objects.filter(user=user1, is_active=True).values_list('organization_id', flat=True))
        orgs2 = set(UserOrganization.objects.filter(user=user2, is_active=True).values_list('organization_id', flat=True))
        
        shared_orgs = orgs1 & orgs2
        
        if shared_orgs:
            print(f"\n⚠️  WARNING: Both users share {len(shared_orgs)} organization(s):")
            for org_id in shared_orgs:
                org = Organization.objects.get(id=org_id)
                print(f"  - {org.name} (ID: {org_id})")
                print(f"    Current name: {org.name}")
                
                # Check ownership
                uo1 = UserOrganization.objects.get(user=user1, organization=org)
                uo2 = UserOrganization.objects.get(user=user2, organization=org)
                print(f"    dummy@gmail.com: Owner={uo1.is_owner}, Active={uo1.is_active}")
                print(f"    sahel@gmail.com: Owner={uo2.is_owner}, Active={uo2.is_active}")
        else:
            print(f"\n✓ No shared organizations - users have separate organizations")
            
    except Exception as e:
        print(f"\nError checking overlap: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_organizations()

